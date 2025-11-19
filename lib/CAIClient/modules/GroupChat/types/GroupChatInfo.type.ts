interface GroupChatInfo {
  push: {
    channel: string;
    pub: {
      data: {
        turn: {
          turn_key: {
            chat_id: string;
            turn_key: string;
          };
          create_time: string;
          last_update_time: string;
          state: string;
          author: {
            author_id: string;
            is_human: string;
            name: string;
          };
          candidates: Array<{
            candidate_id: string;
            create_time: string;
            raw_content: string;
            tti_image_rel_path: string;
            base_candidate_id: string;
            editor: {
              author_id: string;
            };
            is_final: boolean;
          }>;
          primary_candidate_id: string;
        };
        chat_info: {
          type: string;
        };
        command: string;
        request_id: string;
      };
      offset: number;
    };
  };
}

export default GroupChatInfo;
