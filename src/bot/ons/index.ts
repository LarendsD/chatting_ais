import getGroupMessaging from './getGroupMessaging.js';
import getPrivateMessaging from './getPrivateMessaging.js';
import BotContext from '../types/BotContext.interface.js';
import OpenAI from 'openai';

export default (bot: BotContext, client: OpenAI) => {
  bot
    .chatType(['group', 'supergroup'])
    .on([':text', ':photo'], getGroupMessaging(client));

  bot.chatType('private').on('message', getPrivateMessaging(client));
};
