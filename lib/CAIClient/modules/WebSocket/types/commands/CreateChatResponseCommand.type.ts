import ChatModel from '../../enums/ChatModel.enum.js';
import ChatState from '../../enums/ChatState.enum.js';
import ChatType from '../../enums/ChatType.enum.js';
import ChatVisibility from '../../enums/ChatVisibility.enum.js';

type CreateChatResponseCommand = {
  chat: {
    chat_id: string,
    create_time: string,
    creator_id: string,
    character_id: string,
    state: ChatState,
    type: ChatType,
    visibility: ChatVisibility,
    preferred_model_type: ChatModel,
    model_preference_version: string
  }
}

export default CreateChatResponseCommand;
