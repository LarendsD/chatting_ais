import { Context, Filter, SessionFlavor } from "grammy";
import {CAINode} from 'cainode';
import voiceByBotId from "../utils/voiceByBotId.js";
import SessionData from "../types/SessionData.interface.js";
import replyByMessagingMode from "./utils/replyByMessagingType.js";

export default (client: CAINode) =>
  async (ctx: Filter<Context & SessionFlavor<SessionData>, "message">) => {
    console.log(ctx.message);
    const me = await ctx.api.getMe();
    if (
      ctx.message.text &&
      (ctx.message.text.includes(`@${me.username}`) ||
        ctx.message.reply_to_message?.from?.username === me.username)
    ) {
      try {
        const text = ctx.message.text.replace(`@${me.username}`, "");
     
        return replyByMessagingMode(ctx, client, {text});
      } catch (error) {
        console.error(error);

        return ctx.reply("Бля залагал чет, повтори плиз!", {
          reply_parameters: { message_id: ctx.message.message_id },
        }).catch((error) => console.error(error));
      }
    }
  };
