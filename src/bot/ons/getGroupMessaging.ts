import { Context, Filter, SessionFlavor } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import replyByMessagingMode from './utils/replyByMessagingType.js';
import AIClient from 'lib/AiClient/index.js';

export default (client: AIClient) => async (ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>) => {
  console.log(ctx.message);
  const me = await ctx.api.getMe();
  if (
    // eslint-disable-next-line @stylistic/no-mixed-operators
    ctx.message.text?.includes(`@${me.username}`) ||
    // eslint-disable-next-line @stylistic/no-mixed-operators
    ctx.message.caption?.includes(`@${me.username}`) &&
    ctx.message.photo ||
    ctx.message.reply_to_message?.from?.username === me.username
  ) {
    try {
      const rawText = ctx.message.text ?? ctx.message.caption;

      const text = rawText?.replace(`@${me.username}`, '');

      const replied = await replyByMessagingMode(ctx, client, {
        text,
        photo: ctx.message.photo,
      });

      // messagesData.set(replied.messageId, replied.externalMessageId);

      return replied;
    } catch (error) {
      console.error(error);

      return ctx
        .reply('Бля залагал чет, повтори плиз!', {
          reply_parameters: { message_id: ctx.message.message_id },
        })
        .catch((error) => console.error(error));
    }
  }
};
