import { Api, Bot, Context, RawApi } from "grammy";
import getGroupMessaging from "./getGroupMessaging.js";
import getPrivateMessaging from "./getPrivateMessaging.js";

export default (bot: Bot<Context, Api<RawApi>>, characterAiChat: any) => {
  bot
    .chatType(["group", "supergroup"])
    .on(["message"], getGroupMessaging(characterAiChat));

  bot.chatType("private").on("message", getPrivateMessaging(characterAiChat));
};
