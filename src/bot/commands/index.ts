import getNew from './getNew.js';
import getClear from './getClear.js';
import getStart from './getStart.js';
import BotContext from '../types/BotContext.interface.js';
import getChangeMode from './getChangeMode..js';
import BotMessagingMode from '../enums/botMessagingMode.js';
import getHelp from './getHelp.js';
import OpenAI from 'openai';
import getImage from './getImage.js';
import getVideo from './getVideo.js';
import getOutOfContext from './getOutOfContext.js';
import getImageFromImage from './getImageFromImage.js';
import getRandomPoll from './getRandomPoll.js';

export default (bot: BotContext, client: OpenAI) => {
  bot.command('start', getStart());

  bot.chatType('private').command('new', getNew());
  bot.chatType('private').command('clear', getClear());

  bot.command('voiceMode', getChangeMode(BotMessagingMode.VOICE));
  bot.command('textMode', getChangeMode(BotMessagingMode.TEXT));
  bot.command(
    'voiceAndTextMode',
    getChangeMode(BotMessagingMode.TEXT_AND_VOICE),
  );

  bot.command('image', getImage(client));
  bot.command('video', getVideo(client));
  bot.command('imageFromImage', getImageFromImage(client));
  bot.command('randomPoll', getRandomPoll(client));

  bot.command('outOfContext', getOutOfContext());

  bot.chatType('private').command('help', getHelp());
};
