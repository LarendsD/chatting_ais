import { Context, CommandContext } from 'grammy';
import { writeFileSync } from 'fs';
import { scenarioPath } from '../../workers/index.js';

export default () => async (ctx: CommandContext<Context>) => {
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

  writeFileSync('context.json', JSON.stringify([]));
  writeFileSync(scenarioPath, JSON.stringify([]));

  return ctx.reply('Новый чат начат!');
};
