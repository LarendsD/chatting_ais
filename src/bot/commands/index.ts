import getClear from './getClear.js';
import getStart from './getStart.js';
import getNew from './getNew.js';
import { CAINode } from 'cainode';
import BotContext from '../types/BotContext.interface.js';
import getChangeMode from './getChangeMode..js';
import BotMessagingMode from '../enums/botMessagingMode.js';
import getHelp from './getHelp.js';
import getReconnect from './getReconnect.js';

export default (bot: BotContext, client: CAINode) => {
  bot.command('start', getStart());

  bot.chatType('private').command('new', getNew(client));
  bot.chatType('private').command('clear', getClear(client));
  bot.chatType('private').command('reconnect', getReconnect(client));

  bot.command('voiceMode', getChangeMode(BotMessagingMode.VOICE));
  bot.command('textMode', getChangeMode(BotMessagingMode.TEXT));
  bot.command(
    'voiceAndTextMode',
    getChangeMode(BotMessagingMode.TEXT_AND_VOICE),
  );

  bot.chatType('private').command('help', getHelp());
};
