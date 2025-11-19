interface CharacterRecentList {
  chats: Array<{
    chat_id: string;
    create_time: string;
    creator_id: string;
    character_id: string;
    state: string;
    type: string;
    visibility: string;
    character_name: string;
    character_avatar_uri: string;
    character_visibility: string;
    character_translations: object;
    default_voice_id: string | undefined;
    streak: {
      user_id: number;
      character_id: number;
      streak: number;
      last_chat_date: string;
      last_chat_timestamp: string;
      updated_at: string;
      updated_date: string;
    };
  }>;
}

export default CharacterRecentList;
