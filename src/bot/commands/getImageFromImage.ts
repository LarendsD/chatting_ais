import { Context, CommandContext, SessionFlavor, InputFile, Filter } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import OpenAI from 'openai';
import { generateImage, generatePrompt, determineDenoiseStrength } from './utils/generateImageByPromt.js';
import { PhotoSize } from 'grammy/types';

const getImage = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  data: PhotoSize[],
) => {
  if (data) {
    const maxAllowedFileSize = 100_000;

    const leastDetailedImage = data.reduce<typeof data[0] | null>((prev, curr) => {
      if (!curr.file_size) {
        return prev;
      }

      if (curr.file_size <= maxAllowedFileSize) {
        return curr;
      }

      return prev;
    }, null);

    if (!leastDetailedImage) {
      return;
    }

    const { file_path } = await ctx.api.getFile(leastDetailedImage.file_id);

    const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;

    const url = `https://api.telegram.org/file/bot${zaharBotToken}/${file_path}`;

    const imageBuffer = await fetch(url).then((r) => r.arrayBuffer());

    // Для Ollama нужен формат data:image/jpeg;base64,{base64Image}
    return {
      value: imageBuffer,
      height: leastDetailedImage.height,
      width: leastDetailedImage.width,
    };
  }
};

export default (client: OpenAI) => async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
  if (!ctx.message) {
    return ctx.reply('А промт где бля?');
  }

  if (!ctx.message?.reply_to_message) {
    return ctx.reply('А промт где бля?');
  }

  if (!ctx.message.reply_to_message.photo?.length) {
    return ctx.reply('А промт где бля?');
  }

  const [, ...description] = ctx.message.text.split(' ');
  const promptText = description.join(' ');

  if (!promptText) {
    return ctx.reply('А промт где бля?');
  }

  const img = ctx.message.reply_to_message.photo;

  const file = await getImage(ctx, img);

  if (!file) {
    return ctx.reply('А промт где бля?');
  }

  // Определяем denoise на основе промпта через нейронку
  const denoiseStrength = await determineDenoiseStrength(client, promptText);

  const { model, style, prompt } = await generatePrompt(client, promptText);

  const image = await generateImage(prompt, model, style, Buffer.from(file.value), denoiseStrength);

  return ctx.replyWithPhoto(new InputFile(new Uint8Array(image)), {
    reply_parameters: { message_id: ctx.message.message_id },
  });
};
