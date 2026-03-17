import { Bot } from 'grammy';
import runBot from './bot/index.js';
import { config } from 'dotenv';
import BotContext from './bot/types/BotContext.interface.js';
import OpenAI from 'openai';

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

  const zaharBot = new Bot(zaharBotToken) as BotContext;

  const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama', // любой ключ
  });

  await runBot(zaharBot, client);
};

void run();
