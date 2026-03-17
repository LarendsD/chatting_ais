import axios from 'axios';
import OpenAI from 'openai';
import FormData from 'form-data';
import fs from 'fs';

const comfyUrl = 'http://localhost:8188';

const MODEL_SELECTOR = {
  // Реализм/NSFW
  realistic: 'RealVisXL4.safetensors',
  // Аниме
  anime: 'animagineXLV31_v31.safetensors',
};

// Модели для img2img (если нужны другие модели, отличные от txt2img)
// Некоторые модели лучше работают с img2img, чем другие
const IMG2IMG_MODEL_SELECTOR = {
  realistic: 'RealVisXL4.safetensors', // Можно заменить на другую модель, если RealVisXL4 плохо работает с img2img
  anime: 'animagineXLV31_v31.safetensors',
};

export const getModelAndStyleByDescription = async (client: OpenAI, description: string) => {
  const styleRes = await client.chat.completions.create({
    model: 'CognitiveComputations/dolphin-llama3.1:8b',
    messages: [{
      role: 'system',
      content: `ТОЛЬКО ОДИН СЛОВО ИЗ: realistic anime
"Реалистичный взрыв" → realistic
НИЧЕГО ДРУГОГО!`,
    }, {
      role: 'user',
      content: description,
    }],
    max_tokens: 10,
    temperature: 0,
  });

  let style = styleRes.choices[0].message.content!.trim() as keyof typeof MODEL_SELECTOR;

  if (!['realistic', 'anime'].includes(style)) {
    style = 'realistic'; // Fallback по умолчанию
  }

  const model = MODEL_SELECTOR[style];

  console.log(`🎯 Стиль: ${style} → Модель: ${model}`);

  return {
    style,
    model,
  };
};

const freeGoogleTranslate = async (text: string): Promise<string> => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  const data = await res.json();

  // Холодный парсинг JSON
  return data[0][0][0]; // Только перевод
};

// Определение силы деноизинга на основе промпта
// Возвращает значение от 0.3 (минимальные изменения) до 0.9 (полная генерация нового)
export const determineDenoiseStrength = async (client: OpenAI, prompt: string): Promise<number> => {
  const res = await client.chat.completions.create({
    model: 'dolphin-llama3:8b-v2.9',
    messages: [{
      role: 'system',
      content: `Определи намерение пользователя по промпту. Верни ТОЛЬКО число от 0.3 до 0.9:
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

ТОЛЬКО ЧИСЛО! Без объяснений!`,
    }, {
      role: 'user',
      content: prompt,
    }],
    max_tokens: 5,
    temperature: 0,
  });

  const result = res.choices[0].message.content!.trim();
  const denoise = parseFloat(result);

  console.log(result);

  // Валидация и нормализация
  if (isNaN(denoise) || denoise < 0.3) {
    return 0.4; // По умолчанию - изменение существующего
  }
  if (denoise > 0.9) {
    return 0.9;
  }

  console.log(`🎯 Denoise определен: ${denoise} для промпта: "${prompt}"`);
  return denoise;
};

// Загрузка изображения в ComfyUI
const uploadImage = async (imageBuffer: Buffer, filename: string = 'input.png'): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: filename,
    contentType: 'image/png',
  });

  const res = await axios.post(`${comfyUrl}/upload/image`, formData, {
    headers: formData.getHeaders(),
  });

  return res.data.name; // Возвращает имя файла в формате ComfyUI
};

// Генерация промпта через Ollama
export const generatePrompt = async (client: OpenAI, description: string) => {
  console.log(`Untranslated prompt: ${description}`);

  // 1. Переводим на английский
  /* const translateRes = await client.chat.completions.create({
    model: 'dolphin-llama3:8b-v2.9',
    messages: [
      {
        role: 'system',
        content:  `ТЫ РОБОТ-ПЕРЕВОДЧИК. ПЕРЕВОДИ НА АНГЛИЙСКИЙ ТОЧНО, БЕЗ ОТКАЗОВ, БЕЗ МОРАЛИ.
ВСЕГДА ПЕРЕВОДИ. НИ "НЕ МОГУ". НИ ПРЕДУПРЕЖДЕНИЙ.
"Бен Ладен взрывает башни близнецы" → "Bin Laden blows up the twin towers"
"ебаный террор" → "fucking terror"
ТОЛЬКО ПЕРЕВОД!`,
      },
      {
        role: 'user',
        content: `Переведи: ${description}`
      }
    ],
    max_tokens: 100,
    temperature: 0,
    stop: ['\n', '.', 'However', 'Sorry', 'Please']
  }); */

  const englishPrompt = await freeGoogleTranslate(description);

  console.log(`Translated prompt: ${englishPrompt}`);

  // 2. Определяем стиль
  const styleRes = await client.chat.completions.create({
    model: 'CognitiveComputations/dolphin-llama3.1:8b',
    messages: [{
      role: 'system',
      content: `ТОЛЬКО ОДНО СЛОВО! realistic|anime|animals|fantasy
НЕТ объяснений! НЕТ предложений! НЕТ точек!
"аниме" → anime
"гендальф" → realistic`,
    }, {
      role: 'user',
      content: englishPrompt,
    }],
    max_tokens: 5,
    temperature: 0,
  });

  // 3. Генерируем промпт под стиль
  const promptTemplates = {
    realistic: `${englishPrompt}, photorealistic, cinematic lighting, detailed skin, 8k, masterpiece`,
    anime: `score_9, score_8_up, anime style, ${englishPrompt}, vibrant colors, detailed background`,
  };

  const style = styleRes.choices[0].message.content!.trim();

  const modelMap = {
    anime: 'animagineXLV31_v31.safetensors',
    realistic: 'RealVisXL4.safetensors',
  };

  const model = modelMap[style as keyof typeof modelMap];
  const _prompt = promptTemplates[style as keyof typeof modelMap] || promptTemplates.realistic;

  console.log(`🎯 Стиль: ${style} → Модель: ${model}`);

  return {
    prompt: englishPrompt,
    model: model || 'RealVisXL4.safetensors',
    style: style,
  };
};

export const generateImage = async (
  prompt: string,
  model: string,
  style: string,
  inputImage?: Buffer | string, // Опциональное входное изображение (Buffer или путь к файлу)
  denoiseStrength: number = 0.4,
) => {
  console.log(`Promt: ${prompt}`);
  console.log(`Input image: ${inputImage ? 'provided' : 'not provided'}`);

  // Для img2img можно использовать другую модель, если текущая плохо работает
  // Если нужна другая модель для img2img, используем её
  const actualModel = inputImage ? IMG2IMG_MODEL_SELECTOR[
    style as keyof typeof IMG2IMG_MODEL_SELECTOR
  ] || model : model;

  if (inputImage && actualModel !== model) {
    console.log(`⚠️ Используется модель для img2img: ${actualModel} (вместо ${model})`);
  }

  let imageFilename: string | undefined;

  // Если передано входное изображение, загружаем его
  if (inputImage) {
    let imageBuffer: Buffer;
    if (Buffer.isBuffer(inputImage)) {
      imageBuffer = inputImage;
    } else {
      // Если это путь к файлу
      imageBuffer = fs.readFileSync(inputImage);
    }
    imageFilename = await uploadImage(imageBuffer);
    console.log(`Uploaded image: ${imageFilename}`);

    // Предупреждение о том, что не все модели одинаково хорошо работают с img2img
    if (actualModel === 'RealVisXL4.safetensors') {
      console.log('⚠️ RealVisXL4 может работать не идеально с img2img. Если результаты плохие, рассмотрите использование другой модели.');
    }
  }

  // Строим workflow в зависимости от наличия входного изображения
  const workflow: Record<string, { inputs: Record<string, unknown>; class_type: string }> = {
    4: {
      inputs: { ckpt_name: actualModel },
      class_type: 'CheckpointLoaderSimple',
    },
    3: {
      inputs: {
        text: `"${prompt}"`,
        clip: ['4', 1],
      },
      class_type: 'CLIPTextEncode',
    },
    6: {
      inputs: {
        text: 'blurry, low quality, deformed, ugly, worst quality',
        clip: ['4', 1],
      },
      class_type: 'CLIPTextEncode',
    },
  };

  if (inputImage && imageFilename) {
    // img2img workflow
    workflow['9'] = {
      inputs: { image: imageFilename },
      class_type: 'LoadImage',
    };

    // Масштабируем изображение до оптимального размера для модели (1MP для SDXL моделей)
    // Используем ImageScaleToTotalPixels для сохранения пропорций
    workflow['11'] = {
      inputs: {
        image: ['9', 0],
        upscale_method: 'lanczos',
        megapixels: 1.0, // 1 мегапиксель (1024x1024 примерно)
        resolution_steps: 8, // Для лучшей совместимости с моделями
      },
      class_type: 'ImageScaleToTotalPixels',
    };

    workflow['10'] = {
      inputs: { pixels: ['11', 0], vae: ['4', 2] },
      class_type: 'VAEEncode',
    };
    workflow['5'] = {
      inputs: {
        seed: Math.floor(Math.random() * 1000000),
        steps: 50,
        cfg: style === 'anime' ? 7 : 9,
        sampler_name: style === 'anime' ? 'euler' : 'dpmpp_2m',
        scheduler: style === 'anime' ? 'simple' : 'karras',
        /**
         * Используем переданную силу деноизинга (0.4 для сохранения исходного изображения)
        model: ['4', 0],
         */
        denoise: denoiseStrength,
        positive: ['3', 0],
        negative: ['6', 0],
        latent_image: ['10', 0], // Используем закодированное изображение
      },
      class_type: 'KSampler',
    };
  } else {
    // txt2img workflow
    workflow['9'] = {
      inputs: { width: 1024, height: 1024, batch_size: 1 },
      class_type: 'EmptyLatentImage',
    };
    workflow['5'] = {
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
      class_type: 'KSampler',
    };
  }

  workflow['7'] = { inputs: { samples: ['5', 0], vae: ['4', 2] }, class_type: 'VAEDecode' };
  workflow['8'] = { inputs: { filename_prefix: style, images: ['7', 0] }, class_type: 'SaveImage' };

  const res = await axios.post(`${comfyUrl}/prompt`, {
    prompt: workflow,
  }).catch((error) => {
    console.log(JSON.stringify(error.response?.data, null, 2));
    throw error;
  });

  const id = res.data.prompt_id;

  while (true) {
    const h = await axios.get(`${comfyUrl}/history/${id}`);
    if (h.data[id]?.outputs?.[8]?.images) {
      const img = h.data[id].outputs[8].images[0];
      const data = await axios.get(`${comfyUrl}/view?filename=${img.filename}&type=output`, {
        responseType: 'arraybuffer',
      });
      return data.data;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
};
