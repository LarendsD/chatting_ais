import ChatType from '../../enums/ChatType.enum.js'

type EditTurnCandidateCommand = {
  payload: {
    chat_type: ChatType;
    turn_key: {
      chat_id: string;
      turn_id: string;
    };
    current_candidate_id: string;
    new_candidate_raw_content: string;
  },
  origin_id: 'web-next';
}

export default EditTurnCandidateCommand;