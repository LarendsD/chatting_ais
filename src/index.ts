/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Bot } from "grammy";
import CharacterAI from "node_characterai";
import runWorkers from "./workers";
import runBot from "./bot";
import { config } from "dotenv";

config();

const run = async () => {
  const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;
  const timyrBotToken = process.env.TIMYR_TG_BOT_TOKEN;

  const zaharCharacterAiChatToken = process.env.ZAHAR_CHARACTER_AI_CHAT_TOKEN;
  const timyrCharacterAiChatToken = process.env.TIMYR_CHARACTER_AI_CHAT_TOKEN;

  const characterAiUserToken = process.env.CHARACTER_AI_USER_TOKEN;

  const characterAi = new CharacterAI();
  await characterAi.authenticateWithToken(characterAiUserToken);

  const zaharBot = new Bot(zaharBotToken);
  const timyrBot = new Bot(timyrBotToken);

  const zaharCharacterAiChat = await characterAi.createOrContinueChat(
    zaharCharacterAiChatToken,
  );
  const timyrCharacterAiChat = await characterAi.createOrContinueChat(
    timyrCharacterAiChatToken,
  );

  runWorkers(timyrBot, zaharBot, timyrCharacterAiChat, zaharCharacterAiChat);

  runBot(timyrBot, timyrCharacterAiChat);
  runBot(zaharBot, zaharCharacterAiChat);
};

run();
