import { readFileSync, writeFileSync } from "fs";
import { scenarioPath } from ".";

export default (characterAiChat1: any, characterAiChat2: any) => async () => {
  const scenario = readFileSync(scenarioPath, "utf-8");
  const parsedScenario = JSON.parse(scenario);
  const newScenario = [];

  let lastResponse: string =
    parsedScenario[parsedScenario.length - 1] || "Привет! Как дела?)";

  const scenarioRounds = Number(process.env.WORKER_BUILD_SCENARIO_ROUNDS);

  for (let i = 0; i < scenarioRounds; i++) {
    const response1 = await characterAiChat1.sendAndAwaitResponse(
      lastResponse,
      true,
    );
    const response2 = await characterAiChat2.sendAndAwaitResponse(
      response1.text,
      true,
    );
    lastResponse = response2.text;

    newScenario.push(response1.text, response2.text);
  }

  writeFileSync(scenarioPath, JSON.stringify(newScenario, null, 2));

  console.log("Job building scenario success!");
};
