import { Context, Filter } from "grammy";
import {CAINode} from 'cainode';
import voiceByBotId from "../utils/voiceByBotId.js";

export default (client: CAINode) =>
  async (ctx: Filter<Context, "message">) => {
    console.log(ctx.message);
    const me = await ctx.api.getMe();
    if (
      ctx.message.text &&
      (ctx.message.text.includes(`@${me.username}`) ||
        ctx.message.reply_to_message?.from?.username === me.username)
    ) {
      try {
        const text = ctx.message.text.replace(`@${me.username}`, "");
  
        const response = await client.character.send_message(text);

        const result = await client.character.replay_tts(
          response.turn.turn_key.turn_id, 
          response.turn.candidates[0].candidate_id,
          voiceByBotId[ctx.me.id],
        );

        console.log(JSON.stringify(response, null, 2));

        const firstMessage = response.turn.candidates[0].raw_content;
     
        return ctx.replyWithVoice(result.replayUrl, {
          reply_parameters: { message_id: ctx.message.message_id },
          caption: firstMessage,
        });

        /* return ctx.reply(firstMessage, {
          reply_parameters: { message_id: ctx.message.message_id },
        }); */
      } catch (error) {
        console.error(error);

        return ctx.reply("Бля залагал чет, повтори плиз!", {
          reply_parameters: { message_id: ctx.message.message_id },
        });
      }
    }
  };
