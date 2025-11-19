interface HistoryArchiveConversationInfo {
  chats: Array<{
    chat_id: string;
    create_time: string;
    creator_id: string;
    character_id: string;
    state: string;
    type: string;
    visibility: string;
    name: string;
  }>;
}

export default HistoryArchiveConversationInfo;
