import { Context, Filter, SessionFlavor } from 'grammy';
import { PhotoSize } from 'grammy/types';
import CAINode from 'lib/CAIClient/index.js';
import BotMessagingMode from 'src/bot/enums/botMessagingMode.js';
import SessionData from 'src/bot/types/SessionData.interface.js';
import voiceByBotId from 'src/bot/utils/voiceByBotId.js';

export const messagesData = new Map<number, string>();

const getImageLink = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  data: Data,
) => {
  if (data.photo) {
    const mostDetailedImage = data.photo.at(-1);

    if (!mostDetailedImage) {
      return;
    }

    const { file_path } = await ctx.api.getFile(mostDetailedImage.file_id);

    const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;

    const url = `https://api.telegram.org/file/bot${zaharBotToken}/${file_path}`;

    return url;
  }
};

const getResponse = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: CAINode,
  data: Data,
) => {
  const link = await getImageLink(ctx, data);

  return client.character.send_message(data.text, link, {
    timeout_ms: 30_000,
  });
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

const textReply = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: CAINode,
  data: Data,
) => {
  const response = await getResponse(ctx, client, data);

  const firstMessage = response.turn.candidates[0].raw_content;

  console.log(firstMessage);

  const replied = await ctx.reply(firstMessage, {
    reply_parameters: { message_id: ctx.message.message_id },
  });

  return {
    messageId: replied.message_id,
    externalMessageId: response.turn.turn_key.turn_id,
  }
};

const voiceReply = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: CAINode,
  data: Data,
  withText: boolean,
) => {
  const response = await getResponse(ctx, client, data);

  const voiceLink = await getVoiceLink(ctx.me.id, client, response);

  const firstMessage = response.turn.candidates[0].raw_content;

  console.log(firstMessage);

  const replied = await ctx.replyWithVoice(voiceLink, {
    reply_parameters: { message_id: ctx.message.message_id },
    caption: withText ? firstMessage : '',
  });

  return {
    messageId: replied.message_id,
    externalMessageId: response.turn.turn_key.turn_id,
  }
};

interface Data {
  text?: string;
  photo?: PhotoSize[];
}

interface ReplyByMessagingModeResult {
  messageId: number;
  externalMessageId: string;
}

const replyByMessagingMode = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: CAINode,
  data: Data,
): Promise<ReplyByMessagingModeResult> => {
  const messagingMode = ctx.session.messagingMode;

  switch (messagingMode) {
    case BotMessagingMode.TEXT:
      return textReply(ctx, client, data);
    case BotMessagingMode.VOICE:
      return voiceReply(ctx, client, data, false);
    case BotMessagingMode.TEXT_AND_VOICE:
      return voiceReply(ctx, client, data, true);
    default:
      throw new Error(`Unknown messagingMode: ${messagingMode}`);
  }
};

export default replyByMessagingMode;
