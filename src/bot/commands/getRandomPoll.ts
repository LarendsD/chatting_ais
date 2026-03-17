import { Context, CommandContext, SessionFlavor } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import OpenAI from 'openai';
import { generateRandomPoll } from './utils/generateRandomPoll.js';

export default (client: OpenAI) =>
  async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
    const response = await generateRandomPoll(client);

    if (!response) {
      return ctx.reply('Каво');
    }

    return ctx.replyWithPoll(response.question, response.answers, {
      is_anonymous: false,
    });
};
