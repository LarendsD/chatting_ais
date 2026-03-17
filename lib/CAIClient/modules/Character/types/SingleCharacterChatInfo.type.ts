interface SingleCharacterChatInfo {
  turn: {
    turn_key: {
      chat_id: string;
      turn_id: string;
    };
    create_time: string;
    last_update_time: string;
    state: string;
    author: {
      author_id: string;
      name: string;
    };
    candidates: Array<{
      candidate_id: string;
      create_time: string;
      raw_content: string;
      tti_image_rel_path: string;
      editor: {
        author_id: string;
        name: string;
      };
      is_final: boolean;
      base_candidate_id: string;
    }>;
    primary_candidate_id: string;
  };
}

export default SingleCharacterChatInfo;
