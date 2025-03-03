import getGroupMessaging from './getGroupMessaging.js';
import getPrivateMessaging from './getPrivateMessaging.js';
import BotContext from '../types/BotContext.interface.js';
import { CAINode } from 'cainode';

export default (bot: BotContext, client: CAINode) => {
  bot
    .chatType(['group', 'supergroup'])
    .on(['message'], getGroupMessaging(client));

  bot.chatType('private').on('message', getPrivateMessaging(client));
};
