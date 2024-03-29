import { Context, Filter } from "grammy";

export default (characterAiChat: any) =>
  async (ctx: Filter<Context, "message">) => {
    console.log(ctx.message);
    if (ctx.message.text) {
      try {
        const response = await characterAiChat.sendAndAwaitResponse(
          ctx.message.text,
          true,
        );

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

    return ctx.reply("Ты мне хуйню не шли да?", {
      reply_parameters: { message_id: ctx.message.message_id },
    });
  };
