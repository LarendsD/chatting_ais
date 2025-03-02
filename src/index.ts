/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Bot } from "grammy";
// import {CAINode} from 'cainode';
import {CAINode} from 'cainode';
import runWorkers from "./workers/index.js";
import runBot from "./bot/index.js";
import { config } from "dotenv";
import BotContext from "./bot/types/BotContext.interface.js";

config();

const run = async () => {
  const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;
  const timyrBotToken = process.env.TIMYR_TG_BOT_TOKEN;

  if (!zaharBotToken || !timyrBotToken) {
    throw new Error('Bot tokens not provided!');
  }

  const zaharCharacterAiChatToken = process.env.ZAHAR_CHARACTER_AI_CHAT_TOKEN;
  const timyrCharacterAiChatToken = process.env.TIMYR_CHARACTER_AI_CHAT_TOKEN;

  if (!zaharCharacterAiChatToken || !timyrCharacterAiChatToken) {
    throw new Error('character.ai chat tokens not provided!');
  }

  const characterAiUserToken = process.env.CHARACTER_AI_USER_TOKEN;

  if (!characterAiUserToken) {
    throw new Error('character.ai user token not provided!');
  }

  const characterAiTimyr = new CAINode();
  const characterAiZahar = new CAINode();

  await characterAiTimyr.login(characterAiUserToken);
  await characterAiZahar.login(characterAiUserToken);

  const zaharBot = new Bot(zaharBotToken) as BotContext;
  const timyrBot = new Bot(timyrBotToken) as BotContext;

  await characterAiZahar.character.connect(zaharCharacterAiChatToken);
  await characterAiTimyr.character.connect(timyrCharacterAiChatToken);

  await runBot(timyrBot, characterAiTimyr);
  await runBot(zaharBot, characterAiZahar);

  runWorkers(timyrBot, zaharBot, characterAiTimyr, characterAiZahar);
};

run();
