import { Context, Filter, SessionFlavor } from 'grammy';
import { writeFileSync } from 'fs';
import BotMessagingMode from 'src/bot/enums/botMessagingMode.js';
import SessionData from 'src/bot/types/SessionData.interface.js';
import { PhotoSize } from 'grammy/types';
import AIClient from 'lib/AiClient/index.js';

export const messagesData = new Map<number, string>();

export const getImage = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  data: Data,
) => {
  if (data.photo) {
    const maxAllowedFileSize = 100_000;

    const leastDetailedImage = data.photo.reduce<typeof data.photo[0] | null>((prev, curr) => {
      if (!curr.file_size) {
        return prev;
      }

      if (curr.file_size <= maxAllowedFileSize) {
        return curr;
      }

      return prev;
    }, null);

    if (!leastDetailedImage) {
      return;
    }

    const { file_path } = await ctx.api.getFile(leastDetailedImage.file_id);

    const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;

    const url = `https://api.telegram.org/file/bot${zaharBotToken}/${file_path}`;

    const imageBuffer = await fetch(url).then((r) => r.arrayBuffer());
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    writeFileSync('image.png', Buffer.from(imageBuffer) as NodeJS.ArrayBufferView);

    // Для Ollama нужен формат data:image/jpeg;base64,{base64Image}
    return {
      value: `data:image/jpeg;base64,${base64Image}`,
      height: leastDetailedImage.height,
      width: leastDetailedImage.width,
    };
  }
};

const getResponse = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: AIClient,
  data: Data,
) => {
  const image = await getImage(ctx, data);

  const senderInfo = {
    firstName: ctx.message.from.first_name,
    lastName: ctx.message.from.last_name,
    username: ctx.message.from.username,
  };

  const message = {
    text: data.text,
    images: image ? [image.value] : [],
  };

  const response = await client.chats.messaging.getAnswer(
    senderInfo,
    message,
  );

  return response;
};

const textReply = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: AIClient,
  data: Data,
) => {
  const response = await getResponse(ctx, client, data);

  if (!response.text) {
    throw new Error('WTF???');
  }

  console.log(response.text);

  const replied = await ctx.reply(response.text, {
    reply_parameters: { message_id: ctx.message.message_id },
  });

  return {
    messageId: replied.message_id,
  };
};

interface Data {
  text?: string;
  photo?: PhotoSize[];
}

interface ReplyByMessagingModeResult {
  messageId: number;
}

const replyByMessagingMode = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: AIClient,
  data: Data,
): Promise<ReplyByMessagingModeResult> => {
  const messagingMode = ctx.session.messagingMode;

  switch (messagingMode) {
    case BotMessagingMode.TEXT:
      return textReply(ctx, client, data);
    default:
      throw new Error(`Unknown messagingMode: ${messagingMode}`);
  }
};

export default replyByMessagingMode;
