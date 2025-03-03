import { CAINode } from 'cainode';

export default (client1: CAINode, client2: CAINode) => async () => {
  console.log('Reconnecting...');

  const zaharCharacterAiChatToken = process.env.ZAHAR_CHARACTER_AI_CHAT_TOKEN;
  const timyrCharacterAiChatToken = process.env.TIMYR_CHARACTER_AI_CHAT_TOKEN;

  const characterAiUserToken = process.env.CHARACTER_AI_USER_TOKEN;

  if (
    !characterAiUserToken ||
    !zaharCharacterAiChatToken ||
    !timyrCharacterAiChatToken
  ) {
    throw new Error('character.ai chat tokens not provided!');
  }

  await client1.logout();
  await client2.logout();

  await client1.login(characterAiUserToken);
  await client2.login(characterAiUserToken);

  await client1.character.connect(zaharCharacterAiChatToken);
  await client2.character.connect(timyrCharacterAiChatToken);

  console.log('Reconnected!');
};
