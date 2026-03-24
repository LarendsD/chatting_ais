import OpenAI from 'openai';

export class VisionModule {
  private prompt = `Тебе переданы изображения в том же порядке, что и во входном сообщении (первое в списке — первое изображение).
Для каждого изображения сформируй краткое текстовое описание для ассистента в чате: что на снимке, важные детали, текст на картинке если есть.
Ответ верни ТОЛЬКО как валидный JSON-массив строк — без пояснений до или после, без markdown, без комментариев. Длина массива должна совпадать с числом переданных изображений. Порядок элементов массива строго соответствует порядку изображений.
Пример формата для двух изображений:
["описание первого","описание второго"]`;

  private model = 'frob/qwen3.5-instruct';

  constructor(private client: OpenAI) {}

  async getImageDescriptions(images: string[]): Promise<string[]> {
    const res = await this.client.responses.create({
      model: this.model,
      instructions: this.prompt,
      temperature: 0.1,
      input: [
        {
          role: 'user',
          content: images.map((image) => ({
            type: 'input_image',
            image_url: image,
            detail: 'auto',
          })),
        },
      ],
    });

    return res.output.flatMap((res) => {
      if (res.type !== 'message') {
        return [];
      }

      if (res.status !== 'completed') {
        return [];
      }

      const firstContent = res.content.find((content) => content.type === 'output_text');

      if (!firstContent || firstContent.type !== 'output_text') {
        return [];
      }

      try {
        return JSON.parse(firstContent.text) as string[];
      } catch {
        console.error(`Failed to parse JSON: ${firstContent.text}`);

        return [];
      }
    });
  }
}
