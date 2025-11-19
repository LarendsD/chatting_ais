import { CommandContext, Context } from 'grammy';
import CAINode from 'lib/CAIClient/index.js';

export default (client: CAINode) => async (ctx: CommandContext<Context>) => {
  if (!ctx.message) {
    return;
  }

  const adminId = Number(process.env.TG_ADMIN_ID);
  const zaharId = Number(process.env.TG_ZAHAR_ID);

  if (![adminId, zaharId].includes(ctx.message.from.id)) {
    return ctx.reply('Пиздец чел ты кто? Не имеешь права историю мою удалять', {
      reply_parameters: { message_id: ctx.message.message_id },
    });
  }

  await ctx.reply('Перезапуск...')

  const zaharCharacterAiChatToken = process.env.ZAHAR_CHARACTER_AI_CHAT_TOKEN;

  const characterAiUserToken = process.env.CHARACTER_AI_USER_TOKEN;

  if (
    !characterAiUserToken ||
    !zaharCharacterAiChatToken
  ) {
    return ctx.reply('Не хватает данных для перезапуска!');
  }

  await client.logout();

  await client.login(characterAiUserToken);

  await client.character.connect(zaharCharacterAiChatToken);

  return ctx.reply('Успешно перезапущен!');
};