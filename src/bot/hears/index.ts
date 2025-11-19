import CAINode from 'lib/CAIClient/index.js';
import BotContext from '../types/BotContext.interface.js';
import getRegenerate from './getRegenerate.js';

export default (bot: BotContext, client: CAINode) => {
  bot.hears(/^не$/gmi, getRegenerate(client));
};
