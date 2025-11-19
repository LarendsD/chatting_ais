import getGroupMessaging from './getGroupMessaging.js';
import getPrivateMessaging from './getPrivateMessaging.js';
import BotContext from '../types/BotContext.interface.js';
import CAINode from 'lib/CAIClient/index.js';

export default (bot: BotContext, client: CAINode) => {
  bot
    .chatType(['group', 'supergroup'])
    .on([':text', 'message:photo', ':caption'], getGroupMessaging(client));

  bot.chatType('private').on('message', getPrivateMessaging(client));
};
