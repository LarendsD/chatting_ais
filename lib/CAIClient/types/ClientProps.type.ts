import { AxiosInstance } from 'axios';
import JoinType from '../enums/JoinType.enum.js';
import UserInfo from '../modules/User/types/UserInfo.type.js';
import UserSettings from '../modules/User/types/UserSettings.type.js';
import { WebSocketClient } from '../modules/WebSocket/index.js';
import ChatModel from '../modules/WebSocket/enums/ChatModel.enum.js';

type ClientProps = {
  ws: WebSocketClient[];
  token: string;
  user_data: UserInfo | null;
  current_chat_id: string;
  current_char_id_chat: string;
  edge_rollout: string | null;
  user_settings: UserSettings | null;
  join_type: JoinType;
  chat_model: ChatModel;
  is_connected_livekit_room: number[];
  httpCAIInstance: AxiosInstance;
  httpCAIPlusInstance: AxiosInstance;
  httpCAINeoInstance: AxiosInstance;
}

export default ClientProps;
