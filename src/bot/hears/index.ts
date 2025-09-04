import BotContext from '../types/BotContext.interface.js';
import { CAINode } from 'cainode';
import getRegenerate from './getRegenerate.js';

export default (bot: BotContext, client: CAINode) => {
  bot.hears(/^не$/gmi, getRegenerate(client));
};
