import { session } from "grammy";
import initCommands from "./commands/index.js";
import initOns from "./ons/index.js";
import {CAINode} from 'cainode';
import BotMessagingMode from "./enums/botMessagingMode.js";
import BotContext from "./types/BotContext.interface.js";
import SessionData from "./types/SessionData.interface.js";

export default async (bot: BotContext, client: CAINode) => {
  const initial = (): SessionData => {
    return { messagingMode: BotMessagingMode.TEXT };
  }
  bot.use(session({ initial }));

  initCommands(bot, client);
  initOns(bot, client);

  bot.start({
    onStart: (botInfo) => console.log(`Bot ${botInfo.username} started!`),
  });

  bot.catch((error) => {
    console.error(error)

    const {ctx} = error;

    if (ctx.message) {
      return ctx.reply("Бля залагал чет, повтори плиз!", {
        reply_parameters: { message_id: ctx.message.message_id },
      });
    }
  });
};
