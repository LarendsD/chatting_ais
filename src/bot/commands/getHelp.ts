import { Context, CommandContext } from "grammy";

export default () =>
  async (ctx: CommandContext<Context>) => {
    if (!ctx.message) {
      return;
    }

    if (ctx.message.reply_to_message?.from?.username === ctx.me.username) {
      return ctx.reply(`
        Доступные команды (только для администраторов):
/textMode - текстовый режим
/voiceMode - голосовой режим
/voiceAndTextMode - голосовой режим с субтитрами
/new - начать новый диалог
/clear - очистить историю сообщений
      `);
    }
  };
