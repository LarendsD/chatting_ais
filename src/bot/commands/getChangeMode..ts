import { Context, CommandContext, SessionFlavor } from 'grammy';
import BotMessagingMode from '../enums/botMessagingMode.js';
import SessionData from '../types/SessionData.interface.js';

const changePrivate = (
  ctx: CommandContext<Context & SessionFlavor<SessionData>>,
  mode: BotMessagingMode,
) => {
  ctx.session.messagingMode = mode;

  return ctx.reply('Режим применен!');
};

const changePublic = (
  ctx: CommandContext<Context & SessionFlavor<SessionData>>,
  mode: BotMessagingMode,
) => {
  if (!ctx.message) {
    return;
  }

  if (ctx.message.reply_to_message?.from?.username === ctx.me.username) {
    const adminId = Number(process.env.TG_ADMIN_ID);
    const zaharId = Number(process.env.TG_ZAHAR_ID);

    if (![adminId, zaharId].includes(ctx.message.from.id)) {
      return ctx.reply('Пиздец чел ты кто? Не имеешь права менять режим!', {
        reply_parameters: { message_id: ctx.message.message_id },
      });
    }

    ctx.session.messagingMode = mode;

    return ctx.reply('Режим применен!');
  }
};

export default (
  mode: BotMessagingMode
) => async (ctx: CommandContext<Context & SessionFlavor<SessionData>>) => {
  switch (ctx.chat.type) {
    case 'private':
      return changePrivate(ctx, mode);
    case 'group':
      return changePublic(ctx, mode);
    case 'supergroup':
      return changePublic(ctx, mode);
    default:
      return ctx.reply(
        `Данная команда недоступна для типа чата: ${ctx.chat.type}`,
      );
  }
};
