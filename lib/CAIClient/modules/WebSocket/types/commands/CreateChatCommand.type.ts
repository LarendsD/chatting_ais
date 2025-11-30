import ChatType from '../../enums/ChatType.enum.js';
import ChatVisibility from '../../enums/ChatVisibility.enum.js';
import ChatModel from '../../enums/ChatModel.enum.js';

type CreateChatCommand = {
  payload: {
    chat_type: ChatType,
    chat: {
      chat_id: string,
      creator_id: string,
      visibility: ChatVisibility,
      character_id: string,
      type: ChatType,
      preferred_model_type: ChatModel
    },
    with_greeting: boolean
  },
  origin_id: 'web-next',
}

export default CreateChatCommand;
