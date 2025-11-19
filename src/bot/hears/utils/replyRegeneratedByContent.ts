import { Context, HearsContext } from 'grammy';
import CAINode from 'lib/CAIClient/index.js';
import voiceByBotId from 'src/bot/utils/voiceByBotId.js';

const getRegenerated = async (
  client: CAINode,
  data: Data,
) => {
  return new Promise<Awaited<ReturnType<typeof client['character']['generate_turn_candidate']>>>((resolve, reject) => {
    setTimeout(() => reject('Timeout exceeded'), 15000);

    return client.character.generate_turn_candidate(data.externalMessageId).then((result) => {
      return resolve(result);
    });
  })
};

const getVoiceLink = async (
  botId: number,
  client: CAINode,
  response: Awaited<ReturnType<CAINode['character']['send_message']>>,
) => {
  const firstCandidate = response.turn.candidates[0];

  const result = await client.character.replay_tts(
    response.turn.turn_key.turn_id,
    firstCandidate.candidate_id,
    voiceByBotId[botId],
  );

  return result.replayUrl;
};

const textReplyRegenerated = async (
  ctx: HearsContext<Context>,
  client: CAINode,
  data: Data,
) => {
  const response = await getRegenerated(client, data);

  const firstMessage = response.turn.candidates[0].raw_content;

  console.log(firstMessage);

  const replied = await ctx.reply(firstMessage, {
    reply_parameters: { message_id: ctx.message!.reply_to_message!.message_id }
  });

  return {
    messageId: replied.message_id,
    externalMessageId: response.turn.turn_key.turn_id,
  }
};

const voiceReplyRegenerated = async (
  ctx: HearsContext<Context>,
  client: CAINode,
  data: Data,
  withText: boolean,
) => {
  const response = await getRegenerated(client, data);

  const voiceLink = await getVoiceLink(ctx.me.id, client, response);

  const firstMessage = response.turn.candidates[0].raw_content;

  console.log(firstMessage);

  const replied = await ctx.replyWithVoice(voiceLink, {
    reply_parameters: { message_id: ctx.message!.reply_to_message!.message_id },
    caption: withText ? firstMessage : '',
  });

  return {
    messageId: replied.message_id,
    externalMessageId: response.turn.turn_key.turn_id,
  }
};

interface Data {
  externalMessageId: string;
}

interface ReplyByMessagingModeResult {
  messageId: number;
  externalMessageId: string;
}

const replyRegeneratedByContent = async (
  ctx: HearsContext<Context>,
  client: CAINode,
  data: Data,
): Promise<ReplyByMessagingModeResult> => {
  if (ctx.message?.reply_to_message?.text) {
    return textReplyRegenerated(ctx, client, data);
  }

  if (ctx.message?.reply_to_message?.audio) {
    return voiceReplyRegenerated(ctx, client, data, !!ctx.message.reply_to_message.caption);
  }

  throw new Error('Unknown message!');
};

export default replyRegeneratedByContent;
