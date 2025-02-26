import {CAINode} from 'cainode';
import { setTimeout } from "timers/promises";
import voiceByBotId from "src/bot/utils/voiceByBotId.js";
import BotContext from "src/bot/types/BotContext.interface.js";

export default (
    client1: CAINode,
    client2: CAINode,
    bot1: BotContext,
    bot2: BotContext,
  ) =>
  async () => {
    console.log("Скучно нахуй, надо чета напиздеть");

    const response1 = await client1.character.generate_turn();

    const firstResponse1Candidate = response1.turn.candidates[0];

    console.log(firstResponse1Candidate);

    const tts1 = await client1.character.replay_tts(
      response1.turn.turn_key.turn_id,
      firstResponse1Candidate.candidate_id,
      voiceByBotId[bot1.botInfo.id],
    );

    const response2 = await client2.character.send_message(
      firstResponse1Candidate.raw_content,
    );

    const firstResponse2Candidate = response2.turn.candidates[0];

    console.log(firstResponse2Candidate);

    const tts2 = await client2.character.replay_tts(
      response2.turn.turn_key.turn_id,
      firstResponse2Candidate.candidate_id,
      voiceByBotId[bot2.botInfo.id],
    );

    await bot1.api.sendAudio(
      Number(process.env.RANDOM_MESSAGE_GROUP_ID),
      tts1.replayUrl,
      {caption: firstResponse1Candidate.raw_content},
    );

    await setTimeout(10000);
    await bot2.api.sendAudio(
      Number(process.env.RANDOM_MESSAGE_GROUP_ID),
      tts2.replayUrl,
      {caption: firstResponse2Candidate.raw_content},
    );

    console.log("Job building scenario success!");
  };
