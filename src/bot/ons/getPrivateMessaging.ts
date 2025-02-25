// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Context, Filter, InputFile } from "grammy";
// import { readFileSync } from "fs";
import gTTS from "gtts";
import { join } from "path";
import { tmpdir } from "os";
import { createReadStream } from "fs";
import {CAINode} from 'cainode';
import voiceByBotId from "../utils/voiceByBotId.js";

export default (client: CAINode) =>
  async (ctx: Filter<Context, "message">) => {
    console.log(ctx.message);
    if (ctx.message.text) {
      try {
        // console.log('До');
        // console.log(client.user.info.user.user);
        // client.user.info.user.user.id = ctx.from.id;
        // client.user.info.user.user.username = ctx.from.username;
        // console.log('После');
        // console.log(client.user.info.user.user)

        const response = await client.character.send_message(ctx.message.text);

        const result = await client.character.replay_tts(
          response.turn.turn_key.turn_id, 
          response.turn.candidates[0].candidate_id,
          voiceByBotId[ctx.me.id],
        );

        console.log(JSON.stringify(response, null, 2));

        const firstMessage = response.turn.candidates[0].raw_content;

        return ctx.replyWithAudio(result.replayUrl, {
          reply_parameters: { message_id: ctx.message.message_id },
          thumbnail: 'test',
          caption: firstMessage,
        }) 
      } catch (error) {
        console.error(error);

        return ctx.reply("Бля залагал чет, повтори плиз!", {
          reply_parameters: { message_id: ctx.message.message_id },
        });
      }
    }

    return ctx.reply("Ты мне хуйню не шли да?", {
      reply_parameters: { message_id: ctx.message.message_id },
    });
  };
