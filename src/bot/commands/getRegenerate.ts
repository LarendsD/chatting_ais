import { CAINode } from "cainode";
import { CommandContext, Context } from "grammy";

export default (client: CAINode) =>
  async (ctx: CommandContext<Context>) => {
    if (
      !ctx.message || 
      !ctx.message.reply_to_message || 
      ctx.message.reply_to_message.from?.id !== ctx.me.id
    ) {
      return;
    }

    return ctx.reply("TBD");
  };