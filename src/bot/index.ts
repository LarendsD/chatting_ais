import { session } from 'grammy';
import initCommands from './commands/index.js';
import initOns from './ons/index.js';
import BotMessagingMode from './enums/botMessagingMode.js';
import BotContext from './types/BotContext.interface.js';
import SessionData from './types/SessionData.interface.js';
import OpenAI from 'openai';
import { autoRetry } from '@grammyjs/auto-retry';
import { stream } from '@grammyjs/stream';

export default async (bot: BotContext, client: OpenAI) => {
  const initial = (): SessionData => {
    return { messagingMode: BotMessagingMode.TEXT };
  };

  bot.api.config.use(autoRetry());
  bot.use(stream());

  bot.use(session({ initial }));

  // initHears(bot, client);
  initCommands(bot, client);
  initOns(bot, client);

  void bot.start({
    onStart: (botInfo) => console.log(`Bot ${botInfo.username} started!`),
  });

  bot.catch((error) => {
    console.error(error);

    const { ctx } = error;

    return ctx
      .reply(
        'Бля залагал чет, повтори плиз!',
        ctx.message ? {
          reply_parameters: { message_id: ctx.message.message_id },
        } : {},
      )
      .catch((error) => console.error(error));
  });
};
