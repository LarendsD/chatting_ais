import { readFileSync } from 'fs';
import { setTimeout } from 'timers/promises';
import { scenarioPath } from './index.js';
import Scenario from './types/scenario.type.js';
import BotContext from 'src/bot/types/BotContext.interface.js';

export default (bot1: BotContext, bot2: BotContext) => async () => {
  console.log('Job run scenarios start!');
  const scenario = readFileSync(scenarioPath, 'utf-8');
  const parsedScenario: Scenario[] = JSON.parse(scenario);

  for (let i = 0; i < parsedScenario.length; i += 2) {
    const question = parsedScenario[i];
    const answer = parsedScenario[i + 1];

    await setTimeout(10000);

    await bot1.api.sendMessage(
      Number(process.env.WORKER_RUN_GROUP_ID),
      question.text,
    );

    await setTimeout(10000);

    await bot2.api.sendMessage(
      Number(process.env.WORKER_RUN_GROUP_ID),
      answer.text,
    );
  }

  console.log('Job run scenarios success!');
};
