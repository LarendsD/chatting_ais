import { Context, CommandContext } from 'grammy';
import AIClient from 'lib/AiClient/index.js';

export default (client: AIClient) => async (ctx: CommandContext<Context>) => {
  if (!ctx.message) {
    return;
  }

  const adminId = Number(process.env.TG_ADMIN_ID);
  const zaharId = Number(process.env.TG_ZAHAR_ID);

  if (![adminId, zaharId].includes(ctx.message.from.id)) {
    return ctx.reply('Пиздец чел ты кто? Не имеешь права новый чат начинать', {
      reply_parameters: { message_id: ctx.message.message_id },
    });
  }

  client.chats.clear();

  return ctx.reply('Новый чат начат!');
};
