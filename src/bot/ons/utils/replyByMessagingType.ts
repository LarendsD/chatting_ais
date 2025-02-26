import { CAINode } from "cainode";
import { Context, Filter, SessionFlavor } from "grammy";
import BotMessagingMode from "src/bot/enums/botMessagingMode.js";
import SessionData from "src/bot/types/SessionData.interface.js";
import voiceByBotId from "src/bot/utils/voiceByBotId.js";

const getVoiceLink = async (
  botId: number,
  client: CAINode, 
  response: Awaited<ReturnType<CAINode['character']['send_message']>>
) => {
  const firstCandidate = response.turn.candidates[0];

  const result = await client.character.replay_tts(
    response.turn.turn_key.turn_id, 
    firstCandidate.candidate_id,
    voiceByBotId[botId],
  );

  return result.replayUrl;
}

const textReply = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, "message">,
  client: CAINode,
  data: Data,
) => {
  const response = await client.character.send_message(data.text);

  const firstMessage = response.turn.candidates[0].raw_content;

  console.log(firstMessage);

  return ctx.reply(firstMessage, {
    reply_parameters: { message_id: ctx.message.message_id },
  });
}

const voiceReply = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, "message">,
  client: CAINode,
  data: Data,
  withText: boolean,
) => {
  const response = await client.character.send_message(data.text);

  const voiceLink = await getVoiceLink(ctx.me.id, client, response);

  const firstMessage = response.turn.candidates[0].raw_content;

  console.log(firstMessage);

  return ctx.replyWithVoice(voiceLink, {
    reply_parameters: { message_id: ctx.message.message_id },
    caption: withText ? firstMessage : '',
  });
}

interface Data {
  text: string,
}

const replyByMessagingMode = (
  ctx: Filter<Context & SessionFlavor<SessionData>, "message">,
  client: CAINode,
  data: Data,
) => {
  const messagingMode = ctx.session.messagingMode;

  switch(messagingMode) {
    case BotMessagingMode.TEXT:
      return textReply(ctx, client, data);
    case BotMessagingMode.VOICE:
      return voiceReply(ctx, client, data, false);
    case BotMessagingMode.TEXT_AND_VOICE:
      return voiceReply(ctx, client, data, true);
    default:
      throw new Error(`Unknown messagingMode: ${messagingMode}`);
  }
}

export default replyByMessagingMode;
