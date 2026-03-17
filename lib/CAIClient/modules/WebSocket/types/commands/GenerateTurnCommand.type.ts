import ChatType from '../../enums/ChatType.enum.js';
import Annotations from '../annotations.type.js';

type GenerateTurnCommand = {
  payload: {
    chat_type: ChatType;
    tts_enabled: boolean;
    selected_language: string;
    character_id: string;
    user_name: string;
    turn_key: {
      turn_id: string;
      chat_id: string;
    };
    previous_annotations: Annotations;
  },
  origin_id: 'web-next';
}

export default GenerateTurnCommand;
