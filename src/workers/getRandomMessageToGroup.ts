import {CAINode} from 'cainode';
import BotContext from 'src/bot/types/BotContext.interface.js';

export default (
    bot2: BotContext,
    client2: CAINode,
  ) =>
  async () => {
    console.log("Скучно нахуй, надо чета напиздеть");

    const randomMessageGroupId = Number(process.env.RANDOM_MESSAGE_GROUP_ID);
    const zaharBotToken = process.env.ZAHAR_TG_BOT_TOKEN;

    if (!randomMessageGroupId || !zaharBotToken) {
      console.log(`Random message group id not provided!`);

      return;
    }

    const response1 = await client2.character.generate_turn();

    const firstResponse1Candidate = response1.turn.candidates[0];

    console.log(firstResponse1Candidate);

    return bot2.api.sendMessage(randomMessageGroupId, firstResponse1Candidate.raw_content);
  };
