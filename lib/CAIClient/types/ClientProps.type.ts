import WebSocket from 'ws';
import { AxiosInstance } from 'axios';
import JoinType from '../enums/JoinType.enum.js';
import UserInfo from '../modules/User/types/UserInfo.type.js';
import UserSettings from '../modules/User/types/UserSettings.type.js';

type ClientProps = {
  ws: WebSocket[];
  token: string;
  user_data: UserInfo | null;
  current_chat_id: string;
  current_char_id_chat: string;
  edge_rollout: string | null;
  user_settings: UserSettings | null;
  join_type: JoinType;
  is_connected_livekit_room: number[];
  httpCAIInstance: AxiosInstance;
  httpCAIPlusInstance: AxiosInstance;
  httpCAINeoInstance: AxiosInstance;
  sendWs: <T = unknown>(
    ws_con: WebSocket,
    data: unknown,
    using_json: boolean,
    wait_json_prop_type: JoinType,
    wait_ai_response: boolean,
    append_array?: boolean,
    timeout_ms?: number,
  ) => Promise<T>;
}

export default ClientProps;
