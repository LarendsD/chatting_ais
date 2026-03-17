import { Context, Filter, SessionFlavor } from 'grammy';
import SessionData from '../types/SessionData.interface.js';
import replyByMessagingMode from './utils/replyByMessagingType.js';
import OpenAI from 'openai';
import { StreamFlavor } from '@grammyjs/stream';

export default (client: OpenAI) =>
  async (ctx: Filter<StreamFlavor<Context> & SessionFlavor<SessionData>, 'message'>) => {
    console.log('АЛЕ НАХУЙ!!!');

    if ((ctx.message.text || ctx.message.caption) || ctx.message.photo) {
      try {
        console.log(ctx.message);

        const replied = await replyByMessagingMode(ctx, client, {
          text: ctx.message.text ?? ctx.message.caption,
          photo: ctx.message.photo,
        });

        console.log(replied);

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

    console.log('АЛЕ НАХУЙ 2!!!');

    console.log(ctx);

    return ctx
      .reply('Ты мне хуйню не шли да?', {
        reply_parameters: { message_id: ctx.update.message.message_id },
      })
      .catch((err) => console.error(err));
  };
