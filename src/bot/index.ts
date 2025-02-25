import { Api, Bot, Context, RawApi } from "grammy";
import initCommands from "./commands/index.js";
import initOns from "./ons/index.js";
import {CAINode} from 'cainode';

export default async (bot: Bot<Context, Api<RawApi>>, client: CAINode) => {
  initCommands(bot, client);
  initOns(bot, client);

  bot.start({
    onStart: (botInfo) => console.log(`Bot ${botInfo.username} started!`),
  });

  bot.catch((error) => console.error(error));
};
