/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Bot } from "grammy";
// import {CAINode} from 'cainode';
import {CAINode} from 'cainode';
import runWorkers from "./workers/index.js";
import runBot from "./bot/index.js";
import { config } from "dotenv";

config();

const run = async () => {
  const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;
  const timyrBotToken = process.env.TIMYR_TG_BOT_TOKEN;

  const zaharCharacterAiChatToken = process.env.ZAHAR_CHARACTER_AI_CHAT_TOKEN;
  const timyrCharacterAiChatToken = process.env.TIMYR_CHARACTER_AI_CHAT_TOKEN;

  const characterAiUserToken = process.env.CHARACTER_AI_USER_TOKEN;

  const characterAiTimyr = new CAINode();
  const characterAiZahar = new CAINode();

  await characterAiTimyr.login(characterAiUserToken);
  await characterAiZahar.login(characterAiUserToken);

  const zaharBot = new Bot(zaharBotToken);
  const timyrBot = new Bot(timyrBotToken);

  await characterAiZahar.character.connect(zaharCharacterAiChatToken);
  await characterAiTimyr.character.connect(timyrCharacterAiChatToken);

  // runWorkers(timyrBot, zaharBot, characterAiTimyr, characterAiZahar);

  runBot(timyrBot, characterAiTimyr);
  runBot(zaharBot, characterAiZahar);
};

run();
