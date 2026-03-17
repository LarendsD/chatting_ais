import cron from 'node-cron';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, existsSync } from 'fs';
import BotContext from 'src/bot/types/BotContext.interface.js';
import OpenAI from 'openai';
import getRandomMessageToGroup from './getRandomMessageToGroup.js';
import getRunScenario from './getRunScenario.js';

export const scenarioPath = join(tmpdir(), 'scenario.json');

export default (
  bot1: BotContext,
  bot2: BotContext,
  client: OpenAI
) => {
  if (!existsSync(scenarioPath)) {
    writeFileSync(scenarioPath, '[]');
  }

  // Run building scenario
  // cron.schedule(
  //  '*/5 * * * *',
  //  getBuildScenario(bot1, bot2, client1, client2),
  //  {
  //    runOnInit: true,
  //  }
  // );

  // Run scenario
  // cron.schedule('*/60 * * * *', getRunScenario(client, bot1, bot2), {
  //  runOnInit: true,
  // });

  // НЕ ВКЛЮЧАЙ, ПРОСИЛИ ЖЕ!
  // cron.schedule('*/85 * * * *', getRandomMessageToGroup(bot1, client), {
  //  runOnInit: true,
  // });

  // cron.schedule('*/30 * * * *', getReconnect(client1, client2));

  console.log('Workers started!');
};
