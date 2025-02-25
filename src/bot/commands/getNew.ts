import { Context, CommandContext } from "grammy";
import {CAINode} from 'cainode';
import { writeFileSync } from "fs";
import { scenarioPath } from "../../workers/index.js";

export default (client: CAINode) =>
  async (ctx: CommandContext<Context>) => {
    if (!ctx.message) {
      return;
    }

    const adminId = Number(process.env.TG_ADMIN_ID);

    if (ctx.message.from.id !== adminId) {
      return ctx.reply(
        "Пиздец чел ты кто? Не имеешь права новый чат начинать",
        {
          reply_parameters: { message_id: ctx.message.message_id },
        },
      );
    }

    await client.character.create_new_conversation(true);

    writeFileSync(scenarioPath, JSON.stringify([], null, 2));

    return ctx.reply("Новый чат начат!");
  };
