import { Api, Bot, Context, RawApi } from "grammy";
import cron from "node-cron";
import getBuildScenario from "./getBuildScenario";
import getRunScenario from "./getRunScenario";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, existsSync } from "fs";

export const scenarioPath = join(tmpdir(), "scenario.json");

export default (
  bot1: Bot<Context, Api<RawApi>>,
  bot2: Bot<Context, Api<RawApi>>,
  characterAiChat1: any,
  characterAiChat2: any,
) => {
  if (!existsSync(scenarioPath)) {
    writeFileSync(scenarioPath, "[]");
  }

  // Run building scenario
  cron.schedule(
    "*/4 * * * *",
    getBuildScenario(characterAiChat1, characterAiChat2),
  );

  // Run scenario
  cron.schedule("*/4 * * * *", getRunScenario(bot1, bot2));

  console.log("Workers started!");
};
