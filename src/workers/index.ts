import cron from 'node-cron';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, existsSync } from 'fs';
import getRandomMessageToGroup from './getRandomMessageToGroup.js';
import BotContext from 'src/bot/types/BotContext.interface.js';
import getReconnect from './getReconnect.js';
import getBuildScenario from './getBuildScenario.js';
import getRunScenario from './getRunScenario.js';
import CAINode from 'lib/CAIClient/index.js';

export const scenarioPath = join(tmpdir(), 'scenario.json');

export default (
  bot1: BotContext,
  bot2: BotContext,
  client1: CAINode,
  client2: CAINode,
) => {
  if (!existsSync(scenarioPath)) {
    writeFileSync(scenarioPath, '[]');
  }

  // Run building scenario
   cron.schedule(
    '*/5 * * * *',
    getBuildScenario(bot1, bot2, client1, client2),
    {
      runOnInit: true,
    }
  );

  // Run scenario
  cron.schedule('*/5 * * * *', getRunScenario(bot1, bot2));

  cron.schedule('*/85 * * * *', getRandomMessageToGroup(bot2, client2), {
    runOnInit: true,
  });

  cron.schedule('*/30 * * * *', getReconnect(client1, client2));

  console.log('Workers started!');
};
