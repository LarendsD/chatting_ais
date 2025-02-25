import { Api, Bot, Context, RawApi } from "grammy";
import cron from "node-cron";
import {CAINode} from 'cainode';
import getBuildScenario from "./getBuildScenario.js";
import getRunScenario from "./getRunScenario.js";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, existsSync } from "fs";
import getRandomMessageToGroup from "./getRandomMessageToGroup.js";
// import getRandomMessageToGroup from "./getRandomMessageToGroup.js";

export const scenarioPath = join(tmpdir(), "scenario.json");

export default (
  bot1: Bot<Context, Api<RawApi>>,
  bot2: Bot<Context, Api<RawApi>>,
  client1: CAINode,
  client2: CAINode,
) => {
  if (!existsSync(scenarioPath)) {
    writeFileSync(scenarioPath, "[]");
  }

  // Run building scenario
  cron.schedule(
   "*/5 * * * *",
    getBuildScenario(bot1, bot2, client1, client2),
  );

  // Run scenario
  cron.schedule("*/5 * * * *", getRunScenario(bot1, bot2));

  cron.schedule(
    "*/1 * * * *",
    getRandomMessageToGroup(
      client1, 
      client2, 
      bot1, 
      bot2,
    ),
    { runOnInit: true },
  );

  console.log("Workers started!");
};
