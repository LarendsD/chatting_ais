import { Context, CommandContext, SessionFlavor } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import AIClient from 'lib/AiClient/index.js';

export default (client: AIClient) => async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
  const response = await client.chats.messaging.getRandomPoll();

  if (!response) {
    return ctx.reply('Каво');
  }

  console.log(response);

  return ctx.replyWithPoll(response.question, response.answers, {
    is_anonymous: false,
  });
};
