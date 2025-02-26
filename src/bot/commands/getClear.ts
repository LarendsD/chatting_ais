import { Context, CommandContext } from "grammy";
import {CAINode} from 'cainode';
import { writeFileSync } from "fs";
import { scenarioPath } from "../../workers/index.js";

const deleteMessages = async (client: CAINode, nextToken?: string) => {
  const {meta, turns} = await client.chat.history_chat_turns(undefined, nextToken);

  console.log(`Messages to delete: ${turns.length}`);

  for (const turn of turns) {
    console.log(`Message id: ${turn.turn_key.turn_id}`);
    await client.character.delete_message(turn.turn_key.turn_id);
  }

  // await Promise.all(turns.map((turn) => client.character.delete_message(turn.turn_key.turn_id)));

  if (turns.length >= 50) {
    await deleteMessages(client, meta.next_token);
  }
}

export default (client: CAINode) =>
  async (ctx: CommandContext<Context>) => {
    if (!ctx.message) {
      return;
    }

    const adminId = Number(process.env.TG_ADMIN_ID);
    const zaharId = Number(process.env.TG_ZAHAR_ID);

    if (![adminId, zaharId].includes(ctx.message.from.id)) {
      return ctx.reply(
        "Пиздец чел ты кто? Не имеешь права историю мою удалять",
        {
          reply_parameters: { message_id: ctx.message.message_id },
        },
      );
    }

    await deleteMessages(client);

    writeFileSync(scenarioPath, JSON.stringify([], null, 2));

    return ctx.reply("История удалена!");
  };
