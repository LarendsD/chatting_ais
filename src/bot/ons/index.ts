import getGroupMessaging from './getGroupMessaging.js';
import getPrivateMessaging from './getPrivateMessaging.js';
import BotContext from '../types/BotContext.interface.js';
import AIClient from 'lib/AiClient/index.js';

export default (bot: BotContext, client: AIClient) => {
  bot
    .chatType(['group', 'supergroup'])
    .on([':text', ':photo'], getGroupMessaging(client));

  bot.chatType('private').on('message', getPrivateMessaging(client));
};
