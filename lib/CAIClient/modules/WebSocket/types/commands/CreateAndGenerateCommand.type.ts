import AttachmentType from '../../enums/AttachmentType.js';
import ChatType from '../../enums/ChatType.enum.js';
import Annotations from '../annotations.type.js';

type CreateAndGenerateTurnCommand = {
  payload: {
    chat_type: ChatType;
    num_candidates: number;
    tts_enabled: boolean;
    selected_language: string;
    character_id: string;
    user_name: string;
    turn: {
      turn_key: {
        turn_id: string;
        chat_id: string;
      },
      author: {
        author_id: string;
        is_human: boolean;
        name: string;
      },
      candidates: Array<{
        candidate_id: string;
        raw_content: string;
      }>,
      primary_candidate_id: string;
    },
    attachments: Array<{
      type: AttachmentType,
      url: string,
    }>,
    previous_annotations: Annotations;
    generate_comparison: boolean;
  },
  origin_id: 'web-next'
}

export default CreateAndGenerateTurnCommand;
