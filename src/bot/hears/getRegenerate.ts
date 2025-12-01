import {Context, Filter, HearsContext, SessionFlavor } from 'grammy';
import replyByMessagingMode, { messagesData } from '../ons/utils/replyByMessagingType.js';
import replyRegeneratedByContent from './utils/replyRegeneratedByContent.js';
import SessionData from '../types/SessionData.interface.js';
import CAINode from 'lib/CAIClient/index.js';

export default (client: CAINode) => async (ctx: HearsContext<Context>) => {
  console.log(ctx.message);
  console.log('РЕГЕНЕРАТЕ');

  if (
    !ctx.message ||
    !ctx.message.reply_to_message ||
    ctx.message.reply_to_message.from?.id !== ctx.me.id
  ) {
    return;
  }

  try {
    if (!messagesData.has(ctx.message.reply_to_message.message_id)) {
      await replyByMessagingMode(
        ctx as Filter<Context & SessionFlavor<SessionData>, 'message'>, 
        client, 
        {
          text: ctx.message.text!
        }
      );

      return;
    }

    const externalMessageId = messagesData.get(ctx.message.reply_to_message.message_id) as string;

    const regenerated = await replyRegeneratedByContent(ctx, client, {externalMessageId});

    messagesData.set(regenerated.messageId, regenerated.externalMessageId);
    } catch (error) {
    console.error(error);

    return ctx
      .reply('Аллах конечно парень прикольный)', {
        reply_parameters: { message_id: ctx.message.message_id },
      })
      .catch((error) => console.error(error));
  }
};
