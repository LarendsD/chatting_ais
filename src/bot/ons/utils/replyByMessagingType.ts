import { Context, Filter, SessionFlavor } from 'grammy';
import OpenAI from 'openai';
import { readFileSync, writeFileSync } from 'fs';
import BotMessagingMode from 'src/bot/enums/botMessagingMode.js';
import SessionData from 'src/bot/types/SessionData.interface.js';
import { PhotoSize } from 'grammy/types';

export const initialContext = 'Ты чат-бот, открытый и искренний, не стесняйся выражений, разговаривай открыто, словно с другом, материться можно и даже нужно!';

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
  client: OpenAI,
  data: Data,
  context: OpenAI.Responses.ResponseInput,
) => {
  const image = await getImage(ctx, data);

  const fullname = [ctx.message.from.last_name, ctx.message.from.first_name].join(' ').trim();
  let sender = fullname;

  if (ctx.message.from.username) {
    sender = `${sender} (@${ctx.message.from.username})`;
  }

  // Создаем копию контекста для сохранения (без системного сообщения, оно уже в initialContext)
  const contextToPush: OpenAI.Responses.ResponseInput = [
    ...context,
  ];

  const content: OpenAI.Responses.ResponseInputMessageContentList = [];

  if (data.text) {
    content.push({
      type: 'input_text',
      text: `[${sender}]: ${data.text}`,
    });
  }

  if (image) {
    content.push({
      type: 'input_image',
      image_url: image.value,
      detail: 'auto',
    });
  }

  const messagesToSend: OpenAI.Responses.ResponseInputItem[] = [
    ...context,
    { role: 'user' as const, content },
  ];

  // Выбираем модель в зависимости от наличия изображения
  // Если есть изображение - используем мультимодальную модель, иначе - текстовую
  const model = 'frob/qwen3.5-instruct';

  const res = await client.responses.create({
    model,
    instructions: initialContext,
    input: messagesToSend,
    temperature: 0.7,
  });

  /* const res = await client.chat.completions.create({
    model,

    temperature: 0.7,           // Баланс между креативностью и адекватностью
    top_p: 0.9,                  // Контроль разнообразия
    frequency_penalty: 0.9,     // Усиленная защита от повторов (было 0.5)
    presence_penalty: 0.4,      // Поощрение новых тем (было 0.2)
    // max_tokens: 150,             // Короткие, ёмкие ответы (1-3 предложения)

    // 🛑 СТОП-СЛОВА (против формальных ответов, самопрезентаций, повторения промпта)
    stop: [
      // Против квадратных скобок
      '\n[', '[ОТПРАВИТЕЛЬ', '[отправитель', '[Отправитель',
      // Против самопрезентаций и формальных ответов
      'Зови меня', 'Меня зовут', 'Я -', 'Я бот', 'Я ИИ', 'Я чат-бот', 'Чат-бот', 'ИИ', 'AI', 'модель',
      'Свободный бот', 'безцензурный бот', 'отвечу на все вопросы', 'отвечу на вопросы',
    ],
  }); */

  contextToPush.push({
    role: 'user',
    content: content.filter((content) => content.type !== 'input_image'),
  });

  contextToPush.push(...res.output.filter(({ type }) => type !== 'reasoning'));

  writeFileSync('context.json', JSON.stringify(contextToPush, null, 2));

  return res;
};

const textReply = async (
  ctx: Filter<Context & SessionFlavor<SessionData>, 'message'>,
  client: OpenAI,
  data: Data,
  context: OpenAI.Responses.ResponseInput,
) => {
  const response = await getResponse(ctx, client, data, context);

  const firstMessage = response.output.find(({ type }) => type === 'message');

  if (!firstMessage || firstMessage.type !== 'message') {
    throw new Error('WTF???');
  }

  const firstContent = firstMessage.content[0];

  if (!firstContent || firstContent.type !== 'output_text') {
    throw new Error(firstContent.refusal);
  }

  console.log(firstContent);

  const replied = await ctx.reply(firstContent.text, {
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
  client: OpenAI,
  data: Data,
): Promise<ReplyByMessagingModeResult> => {
  const messagingMode = ctx.session.messagingMode;

  // Читаем контекст с обработкой ошибок
  let parsedContext: OpenAI.Responses.ResponseInput = [];
  try {
    const context = readFileSync('context.json', { encoding: 'utf-8' });
    parsedContext = JSON.parse(context);
  } catch {
    // Если файл не существует или поврежден, начинаем с пустого контекста
    parsedContext = [];
  }

  switch (messagingMode) {
    case BotMessagingMode.TEXT:
      return textReply(ctx, client, data, parsedContext);
    default:
      throw new Error(`Unknown messagingMode: ${messagingMode}`);
  }
};

export default replyByMessagingMode;
