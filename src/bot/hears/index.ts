import BotContext from '../types/BotContext.interface.js';
import getRegenerate from './getRegenerate.js';
import OpenAI from 'openai';

export default (bot: BotContext, client: OpenAI) => {
  bot.hears(/^не$/gmi, getRegenerate(client));
};
