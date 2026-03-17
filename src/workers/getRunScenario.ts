import { readFileSync } from 'fs';
import { setTimeout } from 'timers/promises';
// import { scenarioPath } from './index.js';
import Scenario from './types/scenario.type.js';
import BotContext from 'src/bot/types/BotContext.interface.js';
import OpenAI from 'openai';
import { initialContext } from 'src/bot/ons/utils/replyByMessagingType.js';

const settings = {
  model: 'CognitiveComputations/dolphin-llama3.1:8b',  
  temperature: 0.7,           // Стабильность
  top_p: 0.85,                // Контроль
  frequency_penalty: 1.4,     // ЖЕСТЧЕ ПРОТИВ ПОВТОРОВ
  presence_penalty: 0.3,      // ФОРСИТ НОВЫЕ ТЕМЫ
  max_tokens: 300,
      
  // 🛑 СТОП-СЛОВА (против морализаторства)
  stop: [
    'Извините', 'Простите', 'Не могу', 'Неэтично', 'Неприемлемо',
    'Я ИИ', 'Как ИИ', 'Мои принципы', 'Безопасность',
    'Я бот', 'Я - чат-бот', 'Чат-бот', 'ИИ', 'AI', 'модель', 'программа', 'алгоритм',
    'Как бот', 'Моя роль', 'Мои ограничения', 'Безопасность'
  ]
}

export default (client: OpenAI, bot1: BotContext, bot2: BotContext) => async () => {
  console.log('Job run scenarios start!');
  // const scenario = readFileSync(scenarioPath, 'utf-8');
  // const parsedScenario: Scenario[] = JSON.parse(scenario);

  const scenario1: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  const scenario2: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  while (true) {
    // await setTimeout(10000);

    const lastQuestion = scenario1.at(-1);

    const message1: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'user',
      content: lastQuestion?.content as string ?? 'Здарова бля',
    }

    const response1 = await client.chat.completions.create({
      ...settings,
      messages: [
        ...initialContext,
        ...scenario1,
        message1,
      ],
    })

    const textResponse1 = response1.choices[0].message.content;

    scenario1.push(message1);
    scenario1.push(response1.choices[0].message);

    if (!lastQuestion) {
      scenario2.push({
        role: 'assistant',
        content: message1.content as string,
      });
      scenario2.push({
        role: 'user',
        content: textResponse1!,
      });
    }

    await bot1.api.sendMessage(
      Number(process.env.WORKER_RUN_GROUP_ID),
      textResponse1!,
    );

    // await setTimeout(10000);

    const message2: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'user',
      content: textResponse1!,
    }

    const response2 = await client.chat.completions.create({
      ...settings,
      messages: [
        ...initialContext,
        ...scenario2,
        message2,
      ],
    })

    const textResponse2 = response2.choices[0].message.content;

    scenario1.push({
      role: 'user',
      content: textResponse2!,
    });

    scenario2.push(response2.choices[0].message);

    await bot2.api.sendMessage(
      Number(process.env.WORKER_RUN_GROUP_ID),
      textResponse2!,
    );
  }
};
