import { Context, CommandContext, SessionFlavor, InputFile } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import AIClient from 'lib/AiClient/index.js';

export default (client: AIClient) => async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
  if (!ctx.message) {
    return ctx.reply('А промт где бля?');
  }

  const [, ...description] = ctx.message.text.split(' ');

  console.log(ctx.message);

  const image = await client.art.images.get({
    text: description.join(' '),
  });

  if (!image) {
    throw new Error(`Image not found!`);
  }

  return ctx.replyWithPhoto(new InputFile(new Uint8Array(image as ArrayBuffer)), {
    reply_parameters: { message_id: ctx.message.message_id },
  });
};
