import { Context, CommandContext } from "grammy";

export default () => async (ctx: CommandContext<Context>) =>
  await ctx.reply("Ну привет");
