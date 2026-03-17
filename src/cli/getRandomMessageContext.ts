import { readFileSync, writeFileSync } from 'fs';
import { pathToContext } from 'src/bot/commands/getOutOfContext.js';

interface TgMessage {
  id: number;
  type: string;
  date: string;
  date_unixtime: string;
  from: string;
  forwarded_from?: string;
  from_id: string;
  reply_to_message_id: number;
  text: string;
  text_entities: [
    {
      type: string;
      text: string;
    },
  ];
}

interface TgMessages {
  name: string;
  type: string;
  id: number;
  messages: TgMessage[];
}

const userId = 'user1988339284';

const run = () => {
  const data = readFileSync('./messages.json', { encoding: 'utf-8' });

  const parsedData: TgMessages = JSON.parse(data);

  const result = [];

  for (const message of parsedData.messages) {
    if (
      message.type === 'message' &&
      message.text &&
      typeof message.text === 'string' &&
      !message.forwarded_from
    ) {
      const from = message.from_id;

      if (from === userId) {
        result.push(message.text);
      }
    }
  }

  writeFileSync(pathToContext, JSON.stringify(result, null, 2));
};

run();
