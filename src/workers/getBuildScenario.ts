import { readFileSync, writeFileSync } from 'fs';
import { scenarioPath } from './index.js';
import { CAINode } from 'cainode';
import Scenario from './types/scenario.type.js';
import voiceByBotId from 'src/bot/utils/voiceByBotId.js';
import BotContext from 'src/bot/types/BotContext.interface.js';

export default (
    bot1: BotContext,
    bot2: BotContext,
    client1: CAINode,
    client2: CAINode,
  ) =>
  async () => {
    console.log('Job building scenario start');
    const scenario = readFileSync(scenarioPath, 'utf-8');
    const parsedScenario: Scenario[] = JSON.parse(scenario);
    const newScenario = [];

    let lastResponse = parsedScenario[parsedScenario.length - 1];

    const scenarioRounds = Number(process.env.WORKER_BUILD_SCENARIO_ROUNDS);

    let lastMessage;

    for (let i = 0; i < scenarioRounds; i++) {
      const response1 = await client1.character.send_message(
        lastResponse?.text || 'Привет! Как дела?',
      );

      const firstResponse1Candidate = response1.turn.candidates[0];

      const tts1 = await client1.character.replay_tts(
        response1.turn.turn_key.turn_id,
        firstResponse1Candidate.candidate_id,
        voiceByBotId[bot1.botInfo.id],
      );

      const response2 = await client2.character.send_message(
        firstResponse1Candidate.raw_content,
      );

      const firstResponse2Candidate = response2.turn.candidates[0];

      const tts2 = await client2.character.replay_tts(
        response2.turn.turn_key.turn_id,
        firstResponse2Candidate.candidate_id,
        voiceByBotId[bot2.botInfo.id],
      );

      lastMessage = firstResponse2Candidate.raw_content;
      lastResponse = {
        text: firstResponse2Candidate.raw_content,
        audioLink: tts2.replayUrl,
      };

      newScenario.push(
        {
          text: firstResponse1Candidate.raw_content,
          audioLink: tts1.replayUrl,
        },
        {
          text: firstResponse2Candidate.raw_content,
          audioLink: tts2.replayUrl,
        },
      );
    }

    const firstMessage = newScenario[0];
    const duplicates = newScenario.filter(
      (message) => message.text === firstMessage.text,
    );

    if (duplicates.length >= 5) {
      newScenario[newScenario.length - 1] =
        'Чет хуйню какую-то говорим, не? Тебе не кажется, что пора сменить диалог, а то бля зациклились чёт';
    }

    writeFileSync(scenarioPath, JSON.stringify(newScenario, null, 2));

    console.log('Job building scenario success!');

    return lastMessage;
  };
