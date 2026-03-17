import { CommandContext, Context } from 'grammy';
import { readFileSync } from 'fs';
import { faker } from '@faker-js/faker';

export const pathToContext = 'src/bot/commands/helpers/randomMessageContext.json';

export default () => async (ctx: CommandContext<Context>) => {
  const messageContext: string[] = JSON.parse(readFileSync(pathToContext, { encoding: 'utf-8' }));

  console.log(ctx.message);

  const randomMessage = faker.helpers.arrayElement(messageContext);

  console.log(randomMessage);

  return ctx.reply(randomMessage);
};
