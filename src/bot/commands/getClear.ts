import { Context, CommandContext } from "grammy";
import { writeFileSync } from "fs";
import { scenarioPath } from "../../workers";

export default (characterAiChat: any) =>
  async (ctx: CommandContext<Context>) => {
    if (!ctx.message) {
      return;
    }

    const adminId = Number(process.env.TG_ADMIN_ID);

    if (ctx.message.from.id !== adminId) {
      return ctx.reply(
        "Пиздец чел ты кто? Не имеешь права историю мою удалять",
        {
          reply_parameters: { message_id: ctx.message.message_id },
        },
      );
    }

    await characterAiChat.deleteMessagesBulk(
      Number(process.env.DELETE_CHARACTER_AI_CHAT_HISTORY_BATCH),
      false,
      true,
    );

    writeFileSync(scenarioPath, JSON.stringify([], null, 2));

    return ctx.reply("История удалена!");
  };
