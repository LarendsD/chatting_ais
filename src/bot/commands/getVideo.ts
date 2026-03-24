import { Context, CommandContext, SessionFlavor, InputFile } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import AIClient from 'lib/AiClient/index.js';

export default (client: AIClient) => async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
  console.log(ctx);

  if (!ctx.message) {
    return ctx.reply('А промт где бля?');
  }

  const [, ...description] = ctx.message.text.split(' ');

  const prompt = description.join(' ');

  if (!prompt) {
    return ctx.reply('Где промпт долбаеб??', {
      reply_parameters: { message_id: ctx.msgId },
    });
  }

  const video = await client.art.videos.get({
    text: prompt,
  });

  if (!video) {
    throw new Error(`Video not found!`);
  }

  return ctx.replyWithVideo(new InputFile(new Uint8Array(video)), {
    reply_parameters: { message_id: ctx.message.message_id },
  });
};
