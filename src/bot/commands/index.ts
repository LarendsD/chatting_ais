import { Api, Bot, Context, RawApi } from "grammy";
import getClear from "./getClear.js";
import getStart from "./getStart.js";
import getNew from "./getNew.js";
import {CAINode} from 'cainode';

export default (bot: Bot<Context, Api<RawApi>>, client: CAINode) => {
  bot.command("start", getStart());

  bot.chatType('private').command("new", getNew(client));
  bot.chatType("private").command("clear", getClear(client))
};
