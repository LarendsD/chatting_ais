import getGroupMessaging from "./getGroupMessaging.js";
import getPrivateMessaging from "./getPrivateMessaging.js";
import BotContext from "../types/BotContext.interface.js";

export default (bot: BotContext, characterAiChat: any) => {
  bot
    .chatType(["group", "supergroup"])
    .on(["message"], getGroupMessaging(characterAiChat));

  bot.chatType("private").on("message", getPrivateMessaging(characterAiChat));
};
