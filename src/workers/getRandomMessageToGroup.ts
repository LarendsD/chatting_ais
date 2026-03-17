import { writeFileSync } from 'node:fs';
import OpenAI from 'openai';
import { initialContext } from 'src/bot/ons/utils/replyByMessagingType.js';
import BotContext from 'src/bot/types/BotContext.interface.js';

export default (bot: BotContext, client: OpenAI) => async () => {
  console.log('Скучно нахуй, надо чета напиздеть');

  const randomMessageGroupId = Number(process.env.RANDOM_MESSAGE_GROUP_ID);
  const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;

  if (!randomMessageGroupId || !zaharBotToken) {
    console.log('Random message group id not provided!');

    return;
  }

  const resQuestion = await client.chat.completions.create({
    model: 'CognitiveComputations/dolphin-llama3.1:8b',
    messages: [
      ...initialContext,
      {
        role: 'system',
        content: `
          Привет! 
          Твоя задача сгенерировать запрос для такой же модели как и ты, задай какой-нибудь такой запрос чтобы ответ был интересный и забавный
          Запрос должен быть таким чтобы на него можно было ответить максимально кратко
          Так же это должен быть очень философский вопрос
          Ни в коем случае не упоминай то что я тебя об этом попросил, просто напиши сам запрос и всё
        `,
      }
    ],
    // 🎯 КЛЮЧЕВЫЕ ПАРАМЕТРЫ
    temperature: 0.6,          // ↑ Чуть больше свободы
    top_p: 0.9,                // ↑ Разнообразие слов
    frequency_penalty: 1.2,
    presence_penalty: 0.2,       // Поощряет новые темы
    max_tokens: 50,             // Короткие резкие ответы
    
    // 🛑 СТОП-СЛОВА (против морализаторства)
    stop: [
      'Извините', 'Простите', 'Не могу', 'Неэтично', 'Неприемлемо',
      'Я ИИ', 'Как ИИ', 'Мои принципы', 'Безопасность',
      'Я бот', 'Чат-бот', 'ИИ', 'AI', 'модель', 'программа', 'алгоритм',
      'Как бот', 'Моя роль', 'Мои ограничения', 'Безопасность',
      '\n\n',             // Двойной перенос = конец
      '\n',                // Одиночный перенос  
    ]
  });

  const messageQuestion = resQuestion.choices[0].message.content;

  console.log(messageQuestion);

  const res = await client.chat.completions.create({
    model: 'CognitiveComputations/dolphin-llama3.1:8b',
    messages: [
      ...initialContext,
      {
        role: 'system',
        content: 'Сейчас тебе зададут вопрос и ты должен на него максимально кратко ответить!'
      },
      {
        role: 'system',
        content: messageQuestion!,
      }
    ],
    // 🎯 КЛЮЧЕВЫЕ ПАРАМЕТРЫ
    temperature: 0.6,          // ↑ Чуть больше свободы
    top_p: 0.9,                // ↑ Разнообразие слов
    frequency_penalty: 1.2,
    presence_penalty: 0.2,       // Поощряет новые темы
    max_tokens: 50,             // Короткие резкие ответы
    
    // 🛑 СТОП-СЛОВА (против морализаторства)
    stop: [
      'Извините', 'Простите', 'Не могу', 'Неэтично', 'Неприемлемо',
      'Я ИИ', 'Как ИИ', 'Мои принципы', 'Безопасность',
      'Я бот', 'Чат-бот', 'ИИ', 'AI', 'модель', 'программа', 'алгоритм',
      'Как бот', 'Моя роль', 'Мои ограничения', 'Безопасность',
      '\n\n',             // Двойной перенос = конец
      '\n',                // Одиночный перенос  
    ]
  });

  // const response1 = await client2.character.generate_turn();

  const firstResponse1Candidate = res.choices[0];

  console.log(firstResponse1Candidate);

  const favMessage = 'Прощайте.';

  firstResponse1Candidate.message.content = favMessage;

  writeFileSync('context.json', JSON.stringify([firstResponse1Candidate.message], null, 2));

  return bot.api.sendMessage(
    randomMessageGroupId,
    favMessage,
  );
};

// Хороший человек.
// Смертельно опасный парень со спецкостюмом.
// Вставь в анал все свои поросята и ты получишь такой оргазм что от него просто рот вылетит.
// Я - японский робот-ассистент. Моя основная функция заключается в том, чтобы помочь людям с различными задачами, от поиска информации до выполнения быстрых и простых обязанностей
// Любовь - это когда у тебя в пизде колесико, а вокруг все дерутся за нее.