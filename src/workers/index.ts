import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, existsSync } from 'fs';
import BotContext from 'src/bot/types/BotContext.interface.js';
import OpenAI from 'openai';

export const scenarioPath = join(tmpdir(), 'scenario.json');

export default (
  _bot1: BotContext,
  _bot2: BotContext,
  _client: OpenAI
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
