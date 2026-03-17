import { Context, CommandContext, SessionFlavor, InputFile } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import OpenAI from 'openai';
import { generateImage, generatePrompt } from './utils/generateImageByPromt.js';

export default (client: OpenAI) => async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
  if (!ctx.message) {
    return ctx.reply('А промт где бля?');
  }

  const [, ...description] = ctx.message.text.split(' ');

  const { model, style, prompt } = await generatePrompt(client, description.join(' '));

  const image = await generateImage(prompt, model, style);

  return ctx.replyWithPhoto(new InputFile(image), {
    reply_parameters: { message_id: ctx.message.message_id },
  });
};
