import { Api, Bot, Context, RawApi } from "grammy";
import getClear from "./getClear";
import getStart from "./getStart";

export default (bot: Bot<Context, Api<RawApi>>, characterAiChat: any) => {
  bot.command("start", getStart());

  bot.chatType("private").command("clear", getClear(characterAiChat));
};
