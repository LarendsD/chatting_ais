import axios, { AxiosError, AxiosInstance } from 'axios';
import FormData from 'form-data';
import OpenAI from 'openai';
import { Workflow } from './types/workflow/Workflow.type.js';
import { WorkflowElementType } from './enums/workflowElementType.enum.js';
import { PromptResponse } from './types/responses/Prompt.response.type.js';
import { PromptRequest } from './types/requests/Prompt.request.type.js';
import { setInterval } from 'node:timers/promises';
import { HistoryResponse } from './types/responses/History.response.type.js';

interface Prompt {
  text: string;
  image?: Buffer;
}

export class ImageModule {
  constructor(
    private client: OpenAI,
    private connectionInstance: AxiosInstance,
  ) {}

  private async translatePromptToEnglish(text: string): Promise<string> {
    const translationUrl = 'https://translate.googleapis.com/translate_a/single';

    const { data } = await axios.get(translationUrl, {
      params: {
        client: 'gtx',
        sl: 'ru',
        tl: 'en',
        dt: 't',
        q: text,
      },
    });

    return data[0][0][0];
  }

  private async getDenoise(prompt: Prompt) {
    const denoiseInstruction = `Определи намерение пользователя по промпту. Верни ТОЛЬКО число от 0.3 до 0.9:
- 0.3-0.5: изменить существующее фото (ярче, темнее, добавить эффект, изменить цвет, улучшить качество)
- 0.6-0.7: умеренные изменения (стилизация, фильтры, частичная перерисовка)
- 0.8-0.9: создать новое на основе фото (фантастический пейзаж, новый стиль, полностью перерисовать)

Примеры:
"сделать ярче" → 0.4
"добавить эффект размытия" → 0.4
"создать фантастический пейзаж на основе этого" → 0.85
"перерисовать в стиле аниме" → 0.7
"генерировать новое изображение" → 0.9
"изменить цвет на красный" → 0.4

ТОЛЬКО ЧИСЛО! Без объяснений!`;
    const denoiseModel = 'frob/qwen3.5-instruct';

    const res = await this.client.responses.create({
      model: denoiseModel,
      instructions: denoiseInstruction,
      input: [{
        role: 'user',
        type: 'message',
        content: prompt.text,
      }],
      temperature: 0.1,
    });

    const result = res.output_text.trim();
    const denoise = parseFloat(result);

    // Валидация и нормализация
    if (isNaN(denoise) || denoise < 0.3) {
      return 0.4; // По умолчанию - изменение существующего
    }
    if (denoise > 0.9) {
      return 0.9;
    }

    console.log(`🎯 Denoise определен: ${denoise} для промпта: "${prompt}"`);
    return denoise;
  }

  private async getPromptAdditionalInfo(prompt: Prompt) {
    const styleModel = 'frob/qwen3.5-instruct';
    const styleInstruction = `Твоя задача: определять стиль для генерации изображения, на вход к тебе приходит промт и ты на его основе определяешь стиль.
    Ты пишешь только одно слово со стилем, одно из вариантов: anime или realistic!`;

    const styleRes = await this.client.responses.create({
      model: styleModel,
      instructions: styleInstruction,
      input: [{
        role: 'user',
        type: 'message',
        content: prompt.text,
      }],
      temperature: 0.1,
    });

    const modelMap = {
      anime: 'animagineXLV31_v31.safetensors',
      realistic: 'RealVisXL4.safetensors',
    } as const;

    const style = styleRes.output_text.trim() as keyof typeof modelMap;

    const model = modelMap[style];

    return {
      model,
      style,
    };
  }

  private async upload(image: Buffer) {
    const formData = new FormData();
    formData.append('image', image);

    const res = await this.connectionInstance.post(`/upload/image`, formData, {
      headers: formData.getHeaders(),
    });

    return res.data.name;
  }

  private async getExtendedWorkflow(
    prompt: Prompt,
    workflow: Workflow,
    style: string,
    imageFilename?: string,
  ): Promise<Workflow> {
    const resultWorkflow = { ...workflow };

    if (imageFilename) {
      const denoiseStrength = await this.getDenoise(prompt);

      resultWorkflow[9] = {
        class_type: WorkflowElementType.LoadImage,
        inputs: {
          image: imageFilename,
        },
      };

      workflow[11] = {
        class_type: WorkflowElementType.ImageScaleToTotalPixels,
        inputs: {
          image: ['9', 0],
          upscale_method: 'lanczos',
          megapixels: 1.0,
          resolution_steps: 8,
        },
      };

      workflow[10] = {
        class_type: WorkflowElementType.VaeEncode,
        inputs: { pixels: ['11', 0], vae: ['4', 2] },
      };

      workflow[5] = {
        class_type: WorkflowElementType.KSampler,
        inputs: {
          seed: Math.floor(Math.random() * 1000000),
          steps: 50,
          cfg: style === 'anime' ? 7 : 9,
          sampler_name: style === 'anime' ? 'euler' : 'dpmpp_2m',
          scheduler: style === 'anime' ? 'simple' : 'karras',
          denoise: denoiseStrength,
          positive: ['3', 0],
          negative: ['6', 0],
          latent_image: ['10', 0],
        },
      };
    } else {
      workflow['9'] = {
        class_type: WorkflowElementType.EmptyLatentImage,
        inputs: {
          width: 1024,
          height: 1024,
          batch_size: 1,
        },
      };

      workflow['5'] = {
        class_type: WorkflowElementType.KSampler,
        inputs: {
          seed: Math.floor(Math.random() * 1000000),
          steps: 50,
          cfg: style === 'anime' ? 7 : 9,
          sampler_name: style === 'anime' ? 'euler' : 'dpmpp_2m',
          scheduler: style === 'anime' ? 'simple' : 'karras',
          denoise: 1,
          model: ['4', 0],
          positive: ['3', 0],
          negative: ['6', 0],
          latent_image: ['9', 0],
        },
      };
    }

    workflow[7] = {
      class_type: WorkflowElementType.VaeDecode,
      inputs: {
        samples: ['5', 0],
        vae: ['4', 2],
      },
    };

    workflow[8] = {
      class_type: WorkflowElementType.SaveImage,
      inputs: {
        filename_prefix: style,
        images: ['7', 0],
      },
    };

    return workflow;
  }

  async get(prompt: Prompt): Promise<ArrayBuffer | undefined> {
    const translatedPrompt = await this.translatePromptToEnglish(prompt.text);

    console.log(`Translated prompt: ${translatedPrompt}`);

    const additionalInfo = await this.getPromptAdditionalInfo({
      ...prompt,
      text: translatedPrompt,
    });

    let imageName: string | undefined;

    if (prompt.image) {
      imageName = await this.upload(prompt.image);
    }

    const baseWorkflow: Workflow = {
      4: {
        inputs: { ckpt_name: additionalInfo.model },
        class_type: WorkflowElementType.CheckpointLoaderSimple,
      },
      3: {
        inputs: {
          text: `"${translatedPrompt}"`,
          clip: ['4', 1],
        },
        class_type: WorkflowElementType.ClipTextEncode,
      },
      6: {
        inputs: {
          text: 'blurry, low quality, deformed, ugly, worst quality',
          clip: ['4', 1],
        },
        class_type: WorkflowElementType.ClipTextEncode,
      },
    };

    const workflow = await this.getExtendedWorkflow(
      prompt,
      baseWorkflow,
      additionalInfo.style,
      imageName,
    );

    let response;

    try {
      const request: PromptRequest = {
        prompt: workflow,
      };

      response = await this.connectionInstance.post<PromptResponse>('/prompt', request);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(JSON.stringify(error.response?.data, null, 2));
      }

      throw error;
    }

    const id = response.data.prompt_id;

    for await (const _ of setInterval(1000)) {
      const history = await this.connectionInstance.get<HistoryResponse>(`/history/${id}`);

      if (history.data[id]?.outputs?.[8]?.images) {
        const img = history.data[id].outputs[8].images[0];

        const { data } = await this.connectionInstance.get(`/view`, {
          params: {
            filename: img.filename,
            type: 'output',
            subfolder: img.subfolder,
          },
          responseType: 'arraybuffer',
        });

        return data;
      }
    }
  }
}
