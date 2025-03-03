import { Context, CommandContext } from 'grammy';

export default () => async (ctx: CommandContext<Context>) => {
  if (!ctx.message) {
    return;
  }

  return ctx.reply(`
        Доступные команды:
/textMode - текстовый режим
/voiceMode - голосовой режим
/voiceAndTextMode - голосовой режим с субтитрами
/new - начать новый диалог
/clear - очистить историю сообщений
      `);
};
