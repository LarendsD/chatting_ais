import { Context, CommandContext, SessionFlavor, InputFile } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import OpenAI from 'openai';
import { generateVideo, freeGoogleTranslate } from './utils/generateVideoByPromt.js';

export default (_client: OpenAI) =>
  async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
    console.log(ctx);

    if (!ctx.message) {
      return ctx.reply('А промт где бля?');
    }

    const [, ...description] = ctx.message.text.split(' ');

    const prompt = description.join(' ');

    if (!prompt) {
      return ctx.reply('Где промпт долбаеб??', {
        reply_parameters: {message_id: ctx.msgId},
      });
    }
    
    // Переводим промпт на английский (CLIP лучше понимает английский)
    const englishPrompt = await freeGoogleTranslate(prompt);
    console.log(`Русский промпт: ${prompt}`);
    console.log(`Английский промпт: ${englishPrompt}`);
    
    const video = await generateVideo(englishPrompt);

    return ctx.replyWithVideo(new InputFile(new Uint8Array(video)), {
      reply_parameters: { message_id: ctx.message.message_id },
    });
};
