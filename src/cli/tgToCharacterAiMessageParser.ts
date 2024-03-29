import { readFileSync, writeFileSync } from "fs";

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

const mapping: {
  [key: string]: string;
} = {
  user1988339284: "{{user}}",
  user1881370456: "{{char}}",
};

const run = () => {
  const data = readFileSync("./messages.json", { encoding: "utf-8" });

  const parsedData: TgMessages = JSON.parse(data);

  const result = [];
  const resultMessage = [];

  const dataToFor = Object.entries(parsedData.messages);

  for (const [index, message] of dataToFor) {
    if (
      message.type === "message" &&
      message.text &&
      typeof message.text === "string" &&
      !message.forwarded_from
    ) {
      const from = message.from_id;
      resultMessage.push(message.text);

      if (parsedData.messages[Number(index) + 1].from_id !== from) {
        result.push(`${mapping[from]}: ${resultMessage.join(" ")}`);
        resultMessage.splice(0);
      }
    }
  }

  writeFileSync("result", result.join("\n"));
};

run();
