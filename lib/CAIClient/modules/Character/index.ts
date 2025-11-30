import FormData from 'form-data';
import ClientProps from 'lib/CAIClient/types/ClientProps.type.js';
import CharacterInformation from './types/CharacterInformation.type.js';
import CharacterRecentList from './types/CharacterRecentList.type.js';
import JoinType from 'lib/CAIClient/enums/JoinType.enum.js';
import CharacterAbout from './types/CharacterAbout.type.js';
import CharacterDetailedInfo from './types/CharacterDetailedInfo.type.js';
import generateRandomUUID from 'lib/CAIClient/utils/generateRandomUUID.js';
import axios from 'axios';
import Command from '../WebSocket/enums/Command.enum.js';
import ChatType from '../WebSocket/enums/ChatType.enum.js';
import ChatVisibility from '../WebSocket/enums/ChatVisibility.enum.js';
import AttachmentType from '../WebSocket/enums/AttachmentType.js';
import ConversationInfo from '../Chat/types/ConversationInfo.type.js';

class Character {
  private prop: ClientProps

  constructor(prop: ClientProps) {
    this.prop = prop
  }

  /**
   * Get character vote information.  
   *   
   * Example: `await library_name.character.votes("Character ID")`
  */
  async votes(character_id: string): Promise<{ status: string, votes: number }> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAIPlusInstance.get(`/chat/character/${character_id}/votes`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  /**
   * Get character vote information in array.  
   *   
   * Example: `await library_name.character.votes_array("Character ID")`
  */
  async votes_array(character_id: string): Promise<{status: string, upvotes_per_character: Record<string, number>}> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAIPlusInstance.post('/chat/characters/votes', {
      character_ids: character_id,
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  /**
   * Used for vote the character.  
   *   
   * Example  
   * - Like: `await library_name.character.vote("Character ID", true)`  
   * - Dislike: `await library_name.character.vote("Character ID", false)`  
   * - Cancel (neither both): `await library_name.character.vote("Character ID", null)` or `library_name.character.vote("Character ID")`
  */
  async vote(character_id: string, vote = null): Promise<void> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAIPlusInstance.post('/chat/character/vote', {
      external_id: character_id,
      vote,
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  /**
   * Get detailed information about characters.  
   *   
   * Example: `await library_name.character.info("Character ID")`
  */
  async info(char_id: string): Promise<CharacterInformation> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAIPlusInstance.post<CharacterInformation>('/chat/character/info', {
      external_id: char_id
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data;
  }

  /**
   * Get tags info by Character ID (i guess?)  
   *   
   * Example: `await library_name.character.tags_info()`
   */
  async tags_info(char_ids: string | string[]): Promise<{ranked_tags: string[], character_id_to_tags: string[]}> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.post('/character/v1/characters_tags_info', {
      'external_ids': Array.isArray(char_ids) ? char_ids : [char_ids],
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data;
  }

  /**
   * Get a list of recent chat activity.  
   *   
   * Example: `await library_name.character.recent_list()`  
  */
  async recent_list(): Promise<CharacterRecentList> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.get('/chats/recent', {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  private async getRecentChats(char_id: string) {
    const response = await this.prop.httpCAINeoInstance.get<CharacterRecentList>(`/chats/recent/${char_id}`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }

  /**
   * Connect client to character chat.  
   *   
   * Example  
   * - Connect to character you already talk or new character: `await library_name.character.connect("Character ID")`  
   * - Connect to the new character and without greeting: `await library_name.character.connect("Character ID", false)`  
  */
  async connect(char_id: string, is_greeting = true): Promise<CharacterRecentList> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    if (this.prop.join_type) {
      throw 'You\'re already connectetd to another chat or group chat, please disconnect first';
    };

    let data = await this.getRecentChats(char_id);

    if (!data.chats.length) {
      await this.prop.ws[1].send({
        command: Command.CreateChat,
        request_id: generateRandomUUID().slice(0, -12) + char_id.slice(char_id.length - 12),
        payload: {
          chat_type: ChatType.OneToOne,
          chat: {
            preferred_model_type: this.prop.chat_model,
            chat_id: this.prop.current_chat_id,
            creator_id: `${this.prop.user_data!.user.user.id}`,
            visibility: ChatVisibility.Private,
            character_id: char_id,
            type: ChatType.OneToOne,
          },
          with_greeting: is_greeting
        },
        origin_id: 'web-next',
      })

      data = await this.getRecentChats(char_id);
    }

    const mostRecentChat = data.chats[0];

    const chatResponse = await this.prop.httpCAINeoInstance.get<ConversationInfo>(`/chat/${mostRecentChat.chat_id}`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    await this.prop.httpCAINeoInstance.get(`/chat/${mostRecentChat.chat_id}/resurrect`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    this.prop.current_chat_id = mostRecentChat.chat_id
    this.prop.join_type = JoinType.PRIVATE;
    this.prop.current_char_id_chat = char_id;
    this.prop.chat_model = chatResponse.data.chat.preferred_model_type;

    return data;
  }

  /**
   * Disconnecting client from character chat.  
   *   
   * Example: `await library_name.character.disconnect()`
   * 
   * @returns {Promise<boolean>}
  */
  async disconnect(): Promise<boolean> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }
  
    if (!this.prop.join_type || this.prop.join_type != 1) {
      throw 'This function only works when you\'re connected on Single Character Chat.';
    }

    this.prop.current_chat_id = '';
    this.prop.current_char_id_chat = '';
    this.prop.join_type = 0;

    return true;
  }

  private get defaultOptsOnSend() {
    return {
      char_id: this.prop.current_char_id_chat,
      chat_id: this.prop.current_chat_id,
      timeout_ms: 0
    }
  }

  private async uploadPrivateImage(url: string): Promise<{ status: string; value: string }> {
    const imageResponse = await axios.get(url, {responseType: 'arraybuffer'})

    const formData = new FormData();
    formData.append('image', imageResponse.data, {
      filename: 'blob',
      contentType: 'image/jpeg'
    });

    const response = await this.prop.httpCAINeoInstance.post('/image/upload_private_image', formData, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        ...formData.getHeaders(),
      },
    });

    return response.data;
  }

  /**
   * Send message to character.  
   *   
   * - Example (Default and if you're using `character.connect()` to connect to the Single Character.)  
   *      - Without manual turn
   *          ```js
   *          await library_name.character.send_message("Your Message", false, "URL Link (you can empty it if you don't want to send it)")
   *          ```  
   *      - With manual turn
   *          ```
   *          await library_name.character.send_message("Your Message", true, "URL Link (you can empty it if you don't want to send it)")
   *          ```
   *   
   * - Example (Manual input Character ID and Chat ID)  
   *      - Wtihout manual turn  
   *          ```js
   *          await library_name.character.send_message("Your Message", false, "URL Link (you can empty it if you don't want to send it)", {
   *              char_id: "Input your Character ID here.",
   *              chat_id: "Input your Chat ID here."
   *              timeout_ms: 0 // if you wanna using timeout. (default 0: no timeout)
   *          })
   *          ```  
   *      - With manual turn  
   *          ```js
   *          await library_name.character.send_message("Your Message", true, "URL Link (you can empty it if you don't want to send it)", {
   *              char_id: "Input your Character ID here.",
   *              chat_id: "Input your Chat ID here."
   *              timeout_ms: 0 // if you wanna using timeout. (default 0: no timeout)
   *          })
   *          ```
   * 
  */
  async send_message(
    message = '', 
    image_url_path = '', 
    manual_opt: {
      char_id?: string;
      chat_id?: string;
      timeout_ms?: number;
    } = this.defaultOptsOnSend
  ) {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const opts = {
      ...this.defaultOptsOnSend,
      ...manual_opt,
    };

    if (!opts.char_id) {
      throw 'Character ID cannot be empty! please input Character ID correctly, or connect to the character by using character.connect() function.';
    }

    if (!opts.chat_id) {
      throw 'Chat ID cannot be empty! please input Chat ID correctly, or connect to the character by using character.connect() function.';
    }

    if (opts.timeout_ms < 0) {
      opts.timeout_ms = 0;
    };

    const attachments = [];

    if (image_url_path) {
      const { value } = await this.uploadPrivateImage(image_url_path);

      attachments.push({
        type: AttachmentType.Image,
        url: value,
      })
    }

    const turn_key = this.prop.join_type ? generateRandomUUID() : '';

    return this.prop.ws[1].send({
      command: Command.CreateAndGenerateTurn,
      request_id: generateRandomUUID().slice(0, -12) + this.prop.current_char_id_chat.slice(this.prop.current_char_id_chat.length - 12),
      payload: {
        chat_type: ChatType.OneToOne,
        num_candidates: 1,
        tts_enabled: true,
        selected_language: '',
        character_id: opts.char_id,
        user_name: this.prop.user_data!.user.user.username,
        turn: {
          turn_key: {
            turn_id: turn_key,
            chat_id: opts.chat_id
          },
          author: {
            author_id: this.prop.user_data!.user.user.id.toString(),
            is_human: true,
            name: this.prop.user_data!.user.user.username
          },
          candidates: [{
            candidate_id: turn_key,
            raw_content: message,
          }],
          primary_candidate_id: turn_key
        },
        generate_comparison: false, // Чета перегенеривает каждый раз сообщение но нахуя
        attachments,
        previous_annotations: {
          boring: 0,
          not_boring: 0,
          inaccurate: 0,
          not_inaccurate: 0,
          repetitive: 0,
          not_repetitive: 0,
          out_of_character: 0,
          not_out_of_character: 0,
          bad_memory: 0,
          not_bad_memory: 0,
          long: 0,
          not_long: 0,
          short: 0,
          not_short: 0,
          ends_chat_early: 0,
          not_ends_chat_early: 0,
          funny: 0,
          not_funny: 0,
          interesting: 0,
          not_interesting: 0,
          helpful: 0,
          not_helpful: 0
        }
      },
      origin_id: 'web-next',
    })
  }

  /**
   * Чет хуйня какая-то
   * Generating message response from character.  
   *   
   * Example: `await library_name.character.generate_turn()`
  */
  /* async generate_turn(manual_opt: {
    char_id?: string;
    chat_id?: string;
    timeout_ms?: number;
  } = this.defaultOptsOnSend) {
    return await this.send_message('', '', manual_opt);
  } */

  /**
   * Regenerate character message.  
   *   
   * Example: `await library_name.character.generate_turn_candidate("Turn ID")`
  */
  async generate_turn_candidate(turn_id: string, manual_opt: {
    char_id?: string;
    chat_id?: string;
    timeout_ms?: number;
  } = this.defaultOptsOnSend) {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const opts = {
      ...this.defaultOptsOnSend,
      ...manual_opt,
    };

    if (!opts.char_id) {
      throw 'Character ID cannot be empty! please input Character ID correctly, or connect to the character by using character.connect() function.'
    }
  
    if (!opts.chat_id) {
      throw 'Chat ID cannot be empty! please input Chat ID correctly, or connect to the character by using character.connect() function.'
    }

    if (opts.timeout_ms < 0) {
      manual_opt.timeout_ms = 0;
    }

    return await this.prop.ws[1].send({
      command: Command.GenerateTurn,
      request_id: generateRandomUUID().slice(0, -12) + this.prop.current_char_id_chat.slice(this.prop.current_char_id_chat.length - 12),
      payload: {
        tts_enabled: this.prop.is_connected_livekit_room[0] ? true : false,
        selected_language: '',
        character_id: opts.char_id,
        user_name: this.prop.user_data!.user.user.username,
        turn_key: {
          turn_id: turn_id,
          chat_id: opts.chat_id
        },
        chat_type: ChatType.OneToOne,
        previous_annotations: {
          boring: 0,
          not_boring: 0,
          inaccurate: 0,
          not_inaccurate: 0,
          repetitive: 0,
          not_repetitive: 0,
          out_of_character: 0,
          not_out_of_character: 0,
          bad_memory: 0,
          not_bad_memory: 0,
          long: 0,
          not_long: 0,
          short: 0,
          not_short: 0,
          ends_chat_early: 0,
          not_ends_chat_early: 0,
          funny: 0,
          not_funny: 0,
          interesting: 0,
          not_interesting: 0,
          helpful: 0,
          not_helpful: 0
        }
      },
      origin_id: 'web-next',
    });
  }

  /**
   * it will create a new conversation and your current conversation will save on the history.  
   *   
   * Example  
   * - With greeting: `await library_name.character.create_new_conversation()`  
   * - Without greeting: `await library_name.character.create_new_conversation(false)`
  */
  async create_new_conversation(with_greeting = true, manual_opt?: {
    char_id: string;
  }) {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const opts = {
      ...manual_opt,
      char_id: this.prop.current_char_id_chat,
    };

    if (!opts.char_id) {
      throw 'Character ID cannot be empty! please input Character ID correctly, or connect to the character by using character.connect() function.'
    }

    const result = await this.prop.ws[1].send({
      command: Command.CreateChat,
      request_id: generateRandomUUID().slice(0, -12) + opts.char_id.slice(opts.char_id.length - 12),
      payload: {
        chat_type: ChatType.OneToOne,
        chat: {
          chat_id: generateRandomUUID(),
          creator_id: `${this.prop.user_data!.user.user.id}`,
          visibility: ChatVisibility.Private,
          character_id: opts.char_id,
          type: ChatType.OneToOne,
          preferred_model_type: this.prop.chat_model,
        },
        with_greeting: with_greeting
      },
      origin_id: 'web-next'
    })

    if (this.prop.join_type === JoinType.PRIVATE) {
      this.prop.current_chat_id = result.chat.chat_id;
    }

    this.prop.chat_model = result.chat.preferred_model_type;

    return result
  }

  /**
   * Delete character message.  
   *   
   * Example: `await library_name.character.delete_message("Turn ID")`
  */
  async delete_message(turn_id: string | string[], manual_opt?: {
    chat_id?: string;
    char_id?: string | string[];
  }): Promise<boolean> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const opts = {
      ...manual_opt,
      chat_id: this.prop.current_chat_id,
      char_id: this.prop.current_char_id_chat
    }

    if (!opts.char_id) {
      throw 'Character ID cannot be empty! please input Character ID correctly, or connect to the character by using character.connect() function.'
    }
    if (!opts.chat_id) {
      throw 'Chat ID cannot be empty! please input Chat ID correctly, or connect to the character by using character.connect() function.'
    }

    await this.prop.httpCAINeoInstance.post(`/turns/${opts.chat_id}/remove`, {
      turn_ids: Array.isArray(turn_id) ? turn_id : [turn_id],
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return true;
  }

  /**
   * Edit the character message.  
   *   
   * Example: `await library_name.character.edit_message("Candidate ID", "Turn ID", "New Message")`
  */
  async edit_message(candidate_id: string, turn_id: string, new_message: string, manual_opt?: {
    chat_id?: string,
    char_id?: string;
  }) {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const opts = {
      ...manual_opt,
      chat_id: this.prop.current_chat_id,
      char_id: this.prop.current_char_id_chat
    }

    if (!opts.char_id) {
      throw 'Character ID cannot be empty! please input Character ID correctly, or connect to the character by using character.connect() function.'
    }

    if (!opts.chat_id) {
      throw 'Chat ID cannot be empty! please input Chat ID correctly, or connect to the character by using character.connect() function.'
    }

    const requestId = generateRandomUUID().slice(0, -12) + opts.char_id.slice(opts.char_id.length - 12);

    const result = await this.prop.ws[1].send({
      command: Command.EditTurn,
      request_id: requestId,
      payload: {
        chat_type: ChatType.OneToOne,
        turn_key: {
          chat_id: opts.chat_id,
          turn_id: turn_id
        },
        current_candidate_id: candidate_id,
        new_candidate_raw_content: new_message
      },
      origin_id: 'web-next',
    })

    if (!result.turn.author.is_human) {
      await this.prop.ws[1].send({
        command: Command.UpdatePrimary,
        request_id: requestId,
        payload: {
          chat_type: ChatType.OneToOne,
          candidate_id,
          turn_key: {
            chat_id: opts.chat_id,
            turn_id,
          }
        },
        origin_id: 'web-next',
      })
    }

    return result;
  }

  /**
   * Generate text messages from character to voice audio.  
   *   
   * Example:
   * - if you have Voice ID: `await library_name.character.replay_tts("Turn ID", "Candidate ID", "fill the Voice Character ID here")`  
   * - if you don't have Voice ID and want to use Voice Query instead: `await library_name.character.replay_tts("Turn ID", "Candidate ID", "fill the Voice Query here", true)`
  */
  async replay_tts(turn_id: string, candidate_id: string , voice_id_or_query: string, using_voice_query = false, manual_opt?: {
    chat_id?: string;
  }): Promise<{ replayUrl: string }> {
    if (!this.prop.token) {
      throw 'Please login first.'
    }

    const opts = {
      ...manual_opt,
      chat_id: this.prop.current_chat_id,
    }

    if (!opts.chat_id) {
      throw 'Chat ID cannot be empty! please input Chat ID correctly, or connect to the character by using character.connect() function.'
    }

    const response = await this.prop.httpCAINeoInstance.post<{ replayUrl: string }>('/multimodal/api/v1/memo/replay', {
      roomId: opts.chat_id,
      turnId: turn_id,
      candidateId: candidate_id,
      ...(using_voice_query ? {
        voiceQuery: voice_id_or_query
      } : {
        voiceId: voice_id_or_query
      }),
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  /**
   * Get character current voice info.  
   *   
   * Example:  
   * - Auto (you must already connected with character): `await library_name.character.current_voice()`  
   * - Manual: `await library_name.character.current_voice("Character ID")`
  */
  async current_voice(character_id = this.prop.current_char_id_chat): Promise<{character_external_id: string, voice_id: string}> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    if (!character_id) {
      throw 'Please input character ID.';
    };

    const response = await this.prop.httpCAIPlusInstance.get(`/chat/character/${character_id}/voice_override`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }

  /**
   * Get category used of the character.  
   *   
   * Example: `await library_name.character.get_category("Character ID")`
  */
  async get_category(character_id: string): Promise<{ categories: [] }> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.get(`/character/v1/categories/${character_id}`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }

  /**
   * Get detailed information of the character about.  
   * REMEMBER: Specific Character only. if the character have an "about" feature, then you can use this function.  
   * Otherwise, it return noindex: true, or it means it empty.
   *   
   * Example: `await library_name.character.about("Short Hash of the character")`
   */
  async about(short_hash: string): Promise<CharacterAbout> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAINeoInstance.get<CharacterAbout>(`/character/v1/character/about/${short_hash}`, {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }

  /**
   * Get detailed of the character. but, it will give you a FULL detailed of the Character, including character definition.  
   * REMMEBER: If the character defined turned to public, then you can use this function.  
   * Otherwise, it return an empty character data and the status says "do not have permission to view this Character".  
  */
  async info_detailed(char_id: string): Promise<CharacterDetailedInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAIPlusInstance.post<CharacterDetailedInfo>('/chat/character', {
      external_id: char_id,
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data;
  }
}

export default Character;
