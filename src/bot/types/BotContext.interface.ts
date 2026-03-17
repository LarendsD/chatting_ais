import { Bot, Context, SessionFlavor } from 'grammy';
import { type StreamFlavor } from '@grammyjs/stream';
import SessionData from './SessionData.interface.js';

interface BotContext extends Bot<StreamFlavor<Context> & SessionFlavor<SessionData>> {}

export default BotContext;
