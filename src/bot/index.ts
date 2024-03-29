import { Api, Bot, Context, RawApi } from "grammy";
import initCommands from "./commands";
import initOns from "./ons";

export default async (bot: Bot<Context, Api<RawApi>>, characterAiChat: any) => {
  initCommands(bot, characterAiChat);
  initOns(bot, characterAiChat);

  bot.start({
    onStart: (botInfo) => console.log(`Bot ${botInfo.username} started!`),
  });

  bot.catch((error) => console.error(error));
};
