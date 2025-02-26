// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { Context, Filter, SessionFlavor } from "grammy";
import {CAINode} from 'cainode';
import SessionData from "../types/SessionData.interface.js";
import replyByMessagingMode from "./utils/replyByMessagingType.js";

export default (client: CAINode) =>
  async (ctx: Filter<Context & SessionFlavor<SessionData>, "message">) => {
    console.log(ctx.message);
    if (ctx.message.text) {
      try {
        // console.log('До');
        // console.log(client.user.info.user.user);
        // client.user.info.user.user.id = ctx.from.id;
        // client.user.info.user.user.username = ctx.from.username;
        // console.log('После');
        // console.log(client.user.info.user.user)

        return replyByMessagingMode(ctx, client, {text: ctx.message.text});
      } catch (error) {
        console.error(error);

        return ctx.reply("Бля залагал чет, повтори плиз!", {
          reply_parameters: { message_id: ctx.message.message_id },
        });
      }
    }

    return ctx.reply("Ты мне хуйню не шли да?", {
      reply_parameters: { message_id: ctx.message.message_id },
    });
  };
