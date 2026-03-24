import { Bot } from 'grammy';
import runBot from './bot/index.js';
import { config } from 'dotenv';
import BotContext from './bot/types/BotContext.interface.js';
import AIClient from 'lib/AiClient/index.js';

config();

const run = async () => {
  const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;
  const timyrBotToken = process.env.TIMYR_TG_BOT_TOKEN;

  if (!zaharBotToken || !timyrBotToken) {
    throw new Error('Bot tokens not provided!');
  }

  const zaharBot = new Bot(zaharBotToken) as BotContext;

  const client = new AIClient();

  await runBot(zaharBot, client);
};

void run();
