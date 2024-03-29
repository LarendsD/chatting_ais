import { Context, Filter } from "grammy";

export default (characterAiChat: any) =>
  async (ctx: Filter<Context, "message">) => {
    console.log(ctx.message);
    const me = await ctx.api.getMe();
    if (
      ctx.message.text &&
      (ctx.message.text.includes(`@${me.username}`) ||
        ctx.message.reply_to_message?.from?.username === me.username)
    ) {
      try {
        const text = ctx.message.text.replace(`@${me.username}`, "");
        const response = await characterAiChat.sendAndAwaitResponse(text, true);

        console.log(response.text);
        return ctx.reply(response.text, {
          reply_parameters: { message_id: ctx.message.message_id },
        });
      } catch (error) {
        console.error(error);

        return ctx.reply("Бля залагал чет, повтори плиз!", {
          reply_parameters: { message_id: ctx.message.message_id },
        });
      }
    }
  };
