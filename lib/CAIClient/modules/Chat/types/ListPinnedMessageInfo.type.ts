interface ListPinnedMessageInfo {
  turns: Array<{
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
      is_final: boolean;
    }>;
    primary_candidate_id: string;
    is_pinned: boolean;
  }>;
  meta: {
    next_token: string;
  };
}

export default ListPinnedMessageInfo;
