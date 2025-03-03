import { Bot, Context, SessionFlavor } from 'grammy';
import SessionData from './SessionData.interface.js';

interface BotContext extends Bot<Context & SessionFlavor<SessionData>> {}

export default BotContext;
