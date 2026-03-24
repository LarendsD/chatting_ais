import { AxiosError, AxiosInstance } from 'axios';
import OpenAI from 'openai';
import { Workflow } from './types/workflow/Workflow.type.js';
import { WorkflowElementType } from './enums/workflowElementType.enum.js';
import { PromptResponse } from './types/responses/Prompt.response.type.js';
import { PromptRequest } from './types/requests/Prompt.request.type.js';
import { setInterval } from 'node:timers/promises';
import { HistoryResponse } from './types/responses/History.response.type.js';

interface Prompt {
  text: string;
}

export class VideoModule {
  constructor(
    private client: OpenAI,
    private connectionInstance: AxiosInstance,
  ) {}

  async get(prompt: Prompt): Promise<ArrayBuffer | undefined> {
    const width = 768; // Максимальное разрешение для качества
    const height = 512; // Сохраняем пропорции
    const frames = 32; // Больше кадров с context window
    const steps = 30; // Максимум шагов для максимального качества
    const cfg = 7.5; // Оптимальный CFG для баланса качества и плавности
    const fps = 16; // Плавный FPS
    const seed = Math.floor(Math.random() * 1000000000);

    // Context window параметры для поддержки большего количества кадров
    const contextLength = 16; // Длина контекстного окна
    const contextStride = 1; // Шаг контекста
    const contextOverlap = 4; // Перекрытие контекста

    const workflow: Workflow = {
      10: {
        class_type: WorkflowElementType.SaveVideo,
        inputs: {
          filename_prefix: 'video/AnimateDiff',
          format: 'mp4',
          codec: 'h264',
          fps: fps,
          video: [
            '11',
            0,
          ],
        },
        _meta: {
          title: 'Сохранить видео',
        },
      },
      1: {
        class_type: WorkflowElementType.CheckpointLoaderSimple,
        inputs: {
          ckpt_name: 'v1-5-pruned-emaonly.safetensors',
        },
        _meta: {
          title: 'Загрузить чекпоинт',
        },
      },
      2: {
        class_type: WorkflowElementType.ClipTextEncode,
        inputs: {
          text: `${prompt}, masterpiece, best quality, ultra detailed, 8k, photorealistic, cinematic, professional, smooth motion, fluid movement, gradual action, natural movement, realistic, detailed, clear, visible, coherent, stable, consistent, well-composed, perfect lighting, well-lit, sharp focus, high resolution, excellent quality, perfect anatomy, perfect proportions, beautiful, stunning, amazing`,
          clip: [
            '1',
            1,
          ],
        },
        _meta: {
          title: 'CLIP Text Encode (Positive)',
        },
      },
      3: {
        class_type: WorkflowElementType.ClipTextEncode,
        inputs: {
          text: 'texture, textures, fabric, cloth, material, surface, pattern, patterns, woven, carpet, rug, textile, diagonal lines, parallel lines, wavy lines, lines, stripes, corrugated, ribbed, brushed, etched, mesh, grid, diamond, geometric, repeating, abstract, abstract art, abstract patterns, texture only, background only, surface only, material only, fabric only, cloth only, no subject, no content, no action, no movement, no objects, no people, no characters, no humans, no person, no scene, no action, no motion, no movement, empty, blank, pattern only, texture only, surface pattern, repeating texture, geometric texture, wavy texture, line texture, diagonal texture, parallel texture, corrugated texture, ribbed texture, brushed texture, etched texture, mesh texture, grid texture, diamond texture, woven texture, fabric texture, cloth texture, material texture, carpet texture, rug texture, textile texture, surreal, random patterns, sparkles, glitters, flashes, light effects, blurry, distorted, deformed, grainy, noisy, pixelated, artifacts, glitch, incoherent, inconsistent, unstable, flickering, jittery, chaotic, nonsensical, distorted motion, broken animation, frame skipping, temporal artifacts, out of focus, grain, noise, static, compression, watermark, text, signature, jerky motion, abrupt movement, sudden movement, rapid movement, fast motion, quick motion, stuttering, choppy, jittery motion, shaky, unstable motion, erratic movement, twitching, spasmodic',
          clip: [
            '1',
            1,
          ],
        },
        _meta: {
          title: 'CLIP Text Encode (Negative)',
        },
      },
      4: {
        class_type: WorkflowElementType.EmptyLatentImage,
        inputs: {
          width: width,
          height: height,
          batch_size: frames,
        },
        _meta: {
          title: 'Пустой Latent',
        },
      },
      5: {
        class_type: WorkflowElementType.ADELoadAnimateDiffModel,
        inputs: {
          model_name: 'mm_sd_v15_v2.ckpt',
        },
        _meta: {
          title: 'Загрузить AnimateDiff Model',
        },
      },
      6: {
        class_type: WorkflowElementType.ADEApplyAnimateDiffModelSimple,
        inputs: {
          motion_model: [
            '5',
            0,
          ],
          start_percent: 0.0,
          end_percent: 1.0,
          scale_multival: null,
          effect_multival: null,
          ad_keyframes: null,
          prev_m_models: null,
          per_block: null,
        },
        _meta: {
          title: 'Применить AnimateDiff Model',
        },
      },
      12: {
        class_type: WorkflowElementType.ADEStandardUniformContextOptions,
        inputs: {
          context_length: contextLength,
          context_stride: contextStride,
          context_overlap: contextOverlap,
          closed_loop: false,
          fuse_method: 'pyramid',
          use_on_equal_length: false,
          start_percent: 0.0,
          guarantee_steps: 1,
        },
        _meta: {
          title: 'Context Options',
        },
      },
      7: {
        class_type: WorkflowElementType.ADEUseEvolvedSampling,
        inputs: {
          model: [
            '1',
            0,
          ],
          beta_schedule: 'sqrt_linear (AnimateDiff)',
          m_models: [
            '6',
            0,
          ],
          context_options: [
            '12',
            0,
          ],
        },
        _meta: {
          title: 'Use Evolved Sampling',
        },
      },
      8: {
        class_type: WorkflowElementType.KSampler,
        inputs: {
          seed: seed,
          steps: steps,
          cfg: cfg,
          sampler_name: 'dpmpp_2m',
          scheduler: 'karras',
          denoise: 1,
          model: [
            '7',
            0,
          ],
          positive: [
            '2',
            0,
          ],
          negative: [
            '3',
            0,
          ],
          latent_image: [
            '4',
            0,
          ],
        },
        _meta: {
          title: 'KSampler',
        },
      },
      9: {
        class_type: WorkflowElementType.VaeDecode,
        inputs: {
          samples: [
            '8',
            0,
          ],
          vae: [
            '1',
            2,
          ],
        },
        _meta: {
          title: 'VAE Decode',
        },
      },
      11: {
        class_type: WorkflowElementType.CreateVideo,
        inputs: {
          fps: fps,
          images: [
            '9',
            0,
          ],
        },
        _meta: {
          title: 'Создать видео',
        },
      },
    };

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

      if (history.data[id]?.outputs?.[10]?.images) {
        const video = history.data[id].outputs[10].images[0];

        const { data } = await this.connectionInstance.get(`/view`, {
          params: {
            filename: video.filename,
            type: 'output',
            subfolder: video.subfolder,
          },
          responseType: 'arraybuffer',
        });

        return data;
      }
    }
  }
}
