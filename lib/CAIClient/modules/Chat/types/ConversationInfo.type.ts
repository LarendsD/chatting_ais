import ChatModel from '../../WebSocket/enums/ChatModel.enum.js';

interface ConversationInfo {
  chat: {
    chat_id: string;
    create_time: string;
    creator_id: string;
    character_id: string;
    state: string;
    type: string;
    visibility: string;
    preferred_model_type: ChatModel,
  };
}

export default ConversationInfo;
