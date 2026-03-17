import ChatType from '../../enums/ChatType.enum.js'

type UpdatePrimaryCandidateCommand = {
  payload: {
    chat_type: ChatType;
    candidate_id: string;
    turn_key: {
      chat_id: string;
      turn_id: string;
    }
  }, 
  origin_id: 'web-next';
}

export default UpdatePrimaryCandidateCommand;
