import { v4 as uuidv4 } from 'uuid';
import ClientProps from 'lib/CAIClient/types/ClientProps.type.js';
import HistoryChatTurnsInfo from './types/HistoryChatTurnsInfo.type.js';
import ConversationInfo from './types/ConversationInfo.type.js';
import HistoryArchiveConversationInfo from './types/HistoryArchiveConversationInfo.type.js';
import PinMessageInfo from './types/PinMessageInfo.type.js';
import ListPinnedMessageInfo from './types/ListPinnedMessageInfo.type.js';

class Chat {
  private prop: ClientProps;
  constructor(prop: ClientProps) {
    this.prop = prop;
  }

  /**
   * Get a history chat from group or single chat.  
   *   
   * Character.AI history chat loads 50 message, so if you want to load the previous 50 message, you must fill next_token (in the second parameter)  
   * 
   * Example  
   * - Already connected to the Group/Single chat: `await library_name.chat.history_chat_turns()`  
   * - Manual: `await library_name.chat.history_chat_turns("Chat ID")`  
   *   
   * Example (if you want to load previous 50 message)  
   * - Already connected to the Group/Single chat: `await library_name.chat.history_chat_turns("", "fill your next_token here")`  
   * - Manual: `await library_name.chat.history_chat_turns("Chat ID", "fill your next_token here")`
  */
  async history_chat_turns(chat_id = this.prop.current_chat_id, next_token?: string): Promise<HistoryChatTurnsInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAINeoInstance.get<HistoryChatTurnsInfo>(`/turns/${chat_id}`, {
      params: {
        next_token,
      },
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  /**
   * Get converastion information.  
   *   
   * Example: `await library_name.chat.conversation_info("Chat ID")`
  */
  async conversation_info(chat_id: string): Promise<ConversationInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.get<ConversationInfo>(`/chat/${chat_id}`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }

  /**
   * Get list of your history conversation from character. This function is for Single character only.  
   *   
   * Example
   * - Auto (Already connected to the Single character chat): `await library_name.chat.history_conversation_list()`  
   * - Manual: `await library_name.chat.history_conversation_list("Character ID")`
  */
  async history_conversation_list(character_id = this.prop.current_char_id_chat): Promise<HistoryArchiveConversationInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    if (!character_id) {
      throw 'Please input the Character ID, or you must connected to the single character chat.';
    };

    const response = await this.prop.httpCAINeoInstance.get<HistoryArchiveConversationInfo>('/chats', {
      params: {
        character_id,
      },
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }

  /**
   * Set conversation chat, and bring the history chat into current chat. This function is for Single character only.  
   *   
   * Example: `await library_name.chat.set_conversation_chat("Chat ID")`
   */
  async set_conversation_chat(chat_id: string): Promise<void> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const { data } = await this.prop.httpCAINeoInstance.get(`/chat/${chat_id}/resurrect`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    // Ват?
    if (data.comment === 'neo_error') {
      console.error(data);
      throw data.comment;
    }

    const conversationInfo = await this.conversation_info(chat_id);

    if (this.prop.current_char_id_chat && conversationInfo.chat.character_id === this.prop.current_char_id_chat) {
      this.prop.current_chat_id = chat_id;
    }
  }

  /**
   * Pin message. This function is for Single character only.  
   *   
   * - if you set the second parameter false, it will unpin the message.  
   * - if you set the second parameter true, it will pin the message.  
   *   
   * Example  
   * - Auto (if your're already connected to the single character): `await library_name.chat.pin_message("turn ID")`  
   * - Manual: `await library_name.chat.pin_message("turn ID", true, "Chat ID")`
  */
  async pin_message(turn_id: string, pinned = true, chat_id = this.prop.current_chat_id): Promise<PinMessageInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    if (!chat_id) {
      throw 'Please fill the chat_id or you must connected to the single character.';
    };

    return await this.prop.sendWs(this.prop.ws[1], JSON.stringify({
      'command': 'set_turn_pin',
      'request_id': uuidv4().slice(0, -12) + chat_id.slice(this.prop.current_char_id_chat.length - 12),
      'payload': {
        'turn_key': {
          'chat_id': chat_id ? chat_id : this.prop.current_chat_id,
          'turn_id': turn_id
        },
        'is_pinned': pinned
      }
    }), true, 0, false)
  }

  /**
   * Get list pinned message from chat. This function works only for single character chat.  
   *   
   * Example: `await library_name.chat.list_pinned_message("Chat ID")`
  */
  async list_pinned_message(chat_id = this.prop.current_chat_id): Promise<ListPinnedMessageInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    if (!chat_id) {
      throw 'Please input the Chat ID, or you must connected to the single character chat.';
    }

    const response = await this.prop.httpCAINeoInstance.get<ListPinnedMessageInfo>(`/turns/${chat_id}`, {
      params: {
        pinned_only: 'true',
      },
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }

  /**
   * Archive your conversation. This function works only for single character chat.  
   *   
   * Example  
   * - If you want archive the conversation: `await library_name.chat.archive_conversation("Chat ID", true)`  
   * - If you want unarchive the conversation: `await library_name.chat.archive_conversation("Chat ID", false)`
  */
  async archive_conversation(chat_id: string, set_archive = true): Promise<object> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.patch(`/chat/${chat_id}/${set_archive ? 'archive' : 'unarchive'}`, {}, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  /**
   * Duplicate your conversation. This function works only for single character chat.  
   *   
   * Example: `await library_name.chat.duplicate_conversation("Chat ID", "Turn ID")`
   */
  async duplicate_conversation(chat_id: string, turn_id: string): Promise<{new_chat_id: string}> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.post(`/chat/${chat_id}/copy`, {
      end_turn_id: turn_id
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data;
  }

  /**
   * Rename your conversation title. This function works only for single character chat.  
   *   
   * Example: `await library_name.chat.rename_conversation("Chat ID", "Custom Name")`
   * 
   * @param {string} chat_id
   * @param {string} name
   * @returns {Promise<void>}
   */
  async rename_conversation(chat_id: string, name: string): Promise<void> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    await this.prop.httpCAINeoInstance.patch(`/chat/${chat_id}/update_name`, {
      name,
    }, {
      headers: {
        'Authorization': `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * i dont know what is this. but maybe this is for getting the facts of your conversation, i guess...?  
   * if you know this thing, please lemme know or you can do pull request if you want to.  
   *   
   * Example: `await library_name.chat.conversation_facts("Chat ID")`
   */
  async conversation_facts(chat_id: string): Promise<unknown> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.get(`/chat/${chat_id}/conversation-facts`, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
      }
    })

    return response.data;
  }
}

export default Chat;
