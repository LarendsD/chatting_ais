import { Api, Bot, Context, RawApi } from "grammy";
import { readFileSync } from "fs";
import { setTimeout } from "timers/promises";
import { scenarioPath } from "./index.js";
import Scenario from "./types/scenario.type.js";

export default (
  bot1: Bot<Context, Api<RawApi>>,
  bot2: Bot<Context, Api<RawApi>>,
) =>
  async () => {
    console.log("Job run scenarios start!");
    const scenario = readFileSync(scenarioPath, "utf-8");
    const parsedScenario: Scenario[] = JSON.parse(scenario);

    for (let i = 0; i < parsedScenario.length; i += 2) {
      const question = parsedScenario[i];
      const answer = parsedScenario[i + 1];

      await setTimeout(10000);

      await bot1.api.sendAudio(
        Number(process.env.WORKER_RUN_GROUP_ID),
        question.audioLink,
        {caption: question.text}
      )

      await setTimeout(10000);

      await bot2.api.sendAudio(
        Number(process.env.WORKER_RUN_GROUP_ID),
        answer.audioLink,
        {caption: answer.text}
      )
    }

    console.log("Job run scenarios success!");
  };
