import axios from 'axios';
import WebSocket from 'ws';
import EventEmitter from 'node:events';
import ClientProp from './types/ClientProps.type.js';
import Search from './modules/Search/index.js';
import User from './modules/User/index.js';
import Persona from './modules/Persona/index.js';
import Explore from './modules/Explore/index.js';
import Character from './modules/Character/index.js';
import GroupChat from './modules/GroupChat/index.js';
import Image from './modules/Image/index.js';
import Notification from './modules/Notification/index.js';
import Voice from './modules/Voice/index.js';
import Chat from './modules/Chat/index.js';
import JoinType from './enums/JoinType.enum.js';
import UserInfo from './modules/User/types/UserInfo.type.js';
import PinMessageInfo from './modules/Chat/types/PinMessageInfo.type.js';
import GroupChatInfo from './modules/GroupChat/types/GroupChatInfo.type.js';

/* async function https_fetch(url: string | URL | Request, method: string | undefined, headers = {}, body_data = '') {
    if (body_data) headers['Content-Length'] = body_data.length
    return await fetch(url, {
        method: method,
        headers: {
            'User-Agent': 'Character.AI',
            'DNT': '1',
            'Sec-GPC': '1',
            'Connection': 'close',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'TE': 'trailers',
            ...headers
        },
        body: body_data ? body_data : undefined
    })
} */

function send_ws<T = unknown>(
  ws_con: WebSocket,
  data: unknown,
  using_json: boolean,
  wait_json_prop_type: JoinType,
  wait_ai_response: boolean,
  append_array = false,
  timeout_ms = 0,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const temp_res: unknown[] = []

    let inc;
    let timeout: NodeJS.Timeout;
    ws_con.on('message', inc = function incoming(message: PinMessageInfo | GroupChatInfo) {
      message = using_json ? JSON.parse(message.toString()) : message.toString()
      if (using_json && wait_json_prop_type) {
        try {
          switch (Number(wait_json_prop_type)) {
            case JoinType.PRIVATE: {
              const privateMessage = message as PinMessageInfo;

              const resolveCondition = wait_ai_response ? 
                !privateMessage.turn.author.is_human && privateMessage.turn.candidates[0].is_final :
                privateMessage.turn.candidates[0].is_final

              if (resolveCondition) {
                  if (timeout_ms != 0) {
                    clearTimeout(timeout)
                  };

                  ws_con.removeListener('message', incoming);

                  if (append_array) {
                    resolve(temp_res.concat(privateMessage) as T);
                  } else {
                    resolve(privateMessage as T);
                  };
                }
                break;
            }
            case JoinType.GROUP: {
              const groupMessage = message as GroupChatInfo;

              const resolveCondition = wait_ai_response ? 
                !groupMessage.push.pub.data.turn.author.is_human && groupMessage.push.pub.data.turn.candidates[0].is_final :
                groupMessage.push.pub.data.turn.candidates[0].is_final

              if (resolveCondition) {
                  if (timeout_ms != 0) {
                    clearTimeout(timeout);
                  };

                  ws_con.removeListener('message', incoming);
      
                  if (append_array) {
                    resolve(temp_res.concat(groupMessage) as T);
                  } else {
                    resolve(message as T);
                  };
                }
                break;
            }
          }
        } catch (_) {
          if (append_array) {
            temp_res.push(message)
          };
        }
      } else {
        if (timeout_ms != 0) {
          clearTimeout(timeout);
        };

        ws_con.removeListener('message', incoming);
        resolve(message as T)
      }
    })

    ws_con.send(data)
    if (timeout_ms != 0) timeout = setTimeout(() => {
      ws_con.removeListener('message', inc);
      reject('Timeout exceeded!')
    }, timeout_ms)
  })
}

const initialProp: ClientProp = {
  ws: [],
  token: '',
  user_data: null,
  current_chat_id: '',
  current_char_id_chat: '',
  edge_rollout: '',
  user_settings: null,
  join_type: JoinType.NONE,
  is_connected_livekit_room: [0],
  httpCAIInstance: axios.create({
    baseURL: 'https://character.ai',
  }),
  httpCAINeoInstance: axios.create({
    baseURL: 'https://neo.character.ai',
  }),
  httpCAIPlusInstance: axios.create({
    baseURL: 'https://plus.character.ai',
  }),
  sendWs: send_ws,
}

class CAINode extends EventEmitter {
  private prop = {
    ...initialProp,
  }; // Property

  /**
   * Search function list  
   *   
   * - `list_tags()`: Get list of tags.  
   * - `users()`: Search users by name.  
   * - `scenes()`: Search scenes by query.  
   * - `characters()`: Search for a characters by name.  
   * - `voices()`: Search for a voices by name.  
   * - `popular()`: Get popular search.  
   * - `trending()`: Get trending search.  
   * - `autocomplete()`: Get autocomplete search.  
  */
  search = new Search(this.prop) // Search Class

  /**
   * User variables list  
   *   
   * - `info`: contains of your current information account.  
   * - `settings`: contains of your current user settings account.  
   *   
   * User function list  
   *   
   * - `change_info()`: Change current information account.  
   * - `refresh_settings()`: Refresh current user settings.  
   * - `update_settings()`: Update user settings by your own settings.
   * - `public_following_list()`: Get public user following list.  
   * - `public_followers_list()`: Get public user followers list.  
   * - `following_check()`: Check are you following this user account or not.  
   * - `following_list_name()`: Get account following name list.  
   * - `followers_list_name()`: Get account followers name list.  
   * - `follow()`: Follow user account.  
   * - `unfollow()`: Unfollow user account.  
   * - `public_info()`: Get user public information account.  
   * - `public_info_array()`: Get user public information account. same like `public_info()`, but this function have less information.  
   * - `liked_character_list()`: Get account liked character list.  
   * - `add_muted_words()`: Add muted words.
   * - `remove_muted_words()`: Remove muted words.
   * - `clear_muted_words()`: Clear muted words.
  */
  user = new User(this.prop) // User Class

  /**
   * Image function list  
   *   
   * - `generate_avatar()`: Generate avatar image using prompt.  
   * - `generate_image()`: Generate image using prompt.
  */
  image = new Image(this.prop); // Image Class

  /**
   * Persona function list  
   *   
   * - `create()`: Create your personality for your character.  
   * - `info()`: Get your personality information.  
   * - `set_default()`: Set your default personality specifically.  
   * - `list()`: Get all your personality data.  
   * - `update()`: Update your personality specifically.  
   * - `delete()`: Delete your personality spesifically.  
   * - `set_character()`: Set a custom personality for your character specifically.
  */
  persona = new Persona(this.prop); // Persona Class

  /**
   * Explore function list  
   *   
   * - `featured()`: Get the list of characters displayed by the Character.AI server.  
   * - `for_you()`: Get a list of characters recommended by the Character.AI server.  
   * - `character_categories()`: Get the list of characters from the character category exploration.  
   * - `featured_voices()`: Get a list of featured voices.  
   * - `simillar_char()`: Get a list of simillar character from ID character.  
   * - `discovery_tags()`: Get a list of discovery tags by the Character.AI server.  
   * - `characters_with_tag()`: Get a list of characters by tags.
  */
  explore = new Explore(this.prop); // Explore Class

  /**
   * Character function list  
   *   
   * - `votes()`: Get character vote information.  
   * - `votes_array()`: Get character vote information in array.  
   * - `vote()`: Used for vote the character.  
   * - `info()`: Get detailed information about characters.  
   * - `tags_info()`: et tags info by Character ID. (i guess?)  
   * - `recent_list()`: Get a list of recent chat activity.  
   * - `connect()`: Connect client to character chat.  
   * - `disconnect()`: Disconnecting client from character chat.  
   * - `send_message()`: Send message to character.  
   * - `generate_turn()`: Generating message response from character.  
   * - `generate_turn_candidate()`: Regenerate character message.  
   * - `create_new_conversation()`: it will create a new conversation and your current conversation will save on the history.  
   * - `delete_message()`: Delete character message.  
   * - `edit_message()`: Edit the character message.  
   * - `replay_tts()`: Generate text messages from character to voice audio.  
   * - `current_voice()`: Get character current voice info.  
   * - `get_category()`: Get category used of the character.  
   * - `about()`: Get detailed information of the character about.  
   * - `info_detailed()`: Get detailed of the character. but, it will give you a FULL detailed of the Character, including character definition.
  */
  character = new Character(this.prop); // Character Class

  /**
   * Group chat function list  
   *   
   * - `list()`: Get all list available group chat in account.  
   * - `connect()`: Connecting to group chat by the Room ID.  
   * - `disconnect()`: Disconnecting from group chat by the Room ID.  
   * - `create()`: Create group chat.  
   * - `delete()`: Delete group chat.  
   * - `rename()`: Rename group chat.  
   * - `join_group_invite()`: Joining group chat using invite code.  
   * - `char_add()`: Add a character with Character ID to the group chat.  
   * - `char_remove()`: Remove a character with character_id from the group chat.  
   * - `send_message()`: Send message to group chat.  
   * - `generate_turn()`: Generating message response character from group chat.  
   * - `generate_turn_candidate()`: Regenerate character message.  
   * - `reset_conversation()`: Reset conversation in group chat.  
   * - `delete_message()`: Delete user/character message.  
   * - `edit_message()`: Edit user/character message.  
   * - `select_turn()`: Select the turn of character chat by yourself.
  */
  group_chat = new GroupChat(this.prop); // Group Chat Class

  /**
   * Chat function list  
   *   
   * - `history_chat_turns()`: Get a history chat from Group or Single chat.  
   * - `conversation_info()`: Get conversation info.  
   * - `history_conversation_list()`: Get list of your history conversation, and this function is for Single character only.  
   * - `set_conversation_chat()`: Set conversation chat, and bring the history chat into current chat.  
   * - `pin_message()`: Pin message, and this function works only for Single character chat.  
   * - `list_pinned_message()`: Get list pinned message from chat, and this function works only for Single character chat.  
   * - `archive_conversation()`: Archive your conversation, and this function works only for Single character chat.  
   * - `duplicate_conversation()`: Duplicate your conversation, and this function works only for Single character chat.  
   * - `rename_conversation()`: Rename your conversation, and this function works only for Single character chat.
  */
  chat = new Chat(this.prop) // Chat Class

  /**
   * Notification function list  
   *   
   * - `history()`: Get all of the history notification.
   */
  notification = new Notification(this.prop) // Notification Class

  /**
   * Voice function list  
   *   
   * - `user_list()`: Get your own voice creation list information.  
   * - `info()`: Get voice information.  
   * - `connect()`: Connect to voice character chat.  
   *   
   * Livekit variable list (when you're connected to the character voice)
   * - `is_character_speaking`: Check is Character is speaking or not.  
   *    
   * Livekit function list (when you're connected to the character voice)  
   *   
   * - `on()` event:  
   *   - "dataReceived": Receive Character.AI Livekit data events.  
   *   - "frameReceived": Receive audio stream from Livekit Server.  
   *   - "disconnected": Notify when the Voice is disconnect.  
   * - `input_write()`: Send audio PCM raw data to the Livekit Server.  
   * - `is_speech()`: this function checking is the PCM buffer frame is silence or not.  
   * - `interrupt_call()`: Interrupt while character talking.  
   * - `disconnect()`: Disconnect from voice character.
  */
  voice = new Voice(this.prop); // Voice Class


  private async getEdgeRollout() {
    const response = await this.prop.httpCAIInstance.get('/');

    const cookies = response.headers['set-cookie'];

    if (!cookies) {
      return null;
    }

    const matches = cookies.flatMap((cookie) => cookie.match(/edge_rollout=(\d+)/) ?? []);

    if (!matches.length) {
      return null;
    }

    // Ватафак это
    return matches[1];
  }

  private async getUserData(token: string) {
    const response = await this.prop.httpCAIPlusInstance.get<UserInfo>('/chat/user/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })

    if (response.status === 403) {
      throw 'Not a valid Character.AI Token.'
    }

    return response.data;
  }

  private async getConnectionCookies(token: string) {
    const cookies = {
      // edge_rollout: this.prop.edge_rollout ?? '',
      HTTP_AUTHORIZATION: `Token ${token}`,
    }

    return Object.entries(cookies)
      .map(([key, value]) => `${encodeURIComponent(key)}="${value}"`)
      .join('; ');
  }

  private openWsConnections(cookies: string) {
    const connections = [
      { url: 'wss://neo.character.ai/connection/websocket', cookies, userId: this.prop.user_data?.user.user.id, instance: this },
      { url: 'wss://neo.character.ai/ws/', cookies, userId: 0, instance: this },
    ]

    return Promise.all(connections.map(({ url, cookies, userId, instance }) => {
      return new Promise((resolve) => {
        const ws_con = new WebSocket(url, [], {
          headers: {
            Cookie: cookies,
          },
        })

        ws_con.once('open', () => {
          if (userId) {
            ws_con.send(`{"connect":{"name":"js"},"id":1}{"subscribe":{"channel":"user#${userId}"},"id":1}`)
          }
          resolve(ws_con)
        })
        ws_con.on('message', (message) => {
          message = message.toString()

          if (message === '{}') {
            ws_con.send('{}') // Ping
          } else {
            instance.emit('message', message)
          }
        });
      })
    })) as Promise<WebSocket[]>;
  }

  /**
    * Start client initialization with login.  
    *   
    * Example: `await library_name.login("Character.AI Token")`
  */
  async login(token: string): Promise<boolean> {
    this.prop.edge_rollout = await this.getEdgeRollout();

    this.prop.user_data = await this.getUserData(token);

    if (!this.prop.user_data.user) {
      throw 'Not a valid Character.AI Token.';
    }

    const cookies = await this.getConnectionCookies(token);

    this.prop.token = token
    this.prop.ws = await this.openWsConnections(cookies);

    await this.user.refresh_settings();

    return true;
  }

  /**
    * Pings the Character AI server's health check endpoint.  
  */
  async ping() {
    const response = await this.prop.httpCAINeoInstance.get<{ status: string }>('/ping');

    return response.data;
  }

  /**
   * Logout from the Character.AI.  
   *   
   * Example: `library_name.logout()`
  */
  async logout(): Promise<boolean> {
    if (!this.prop.ws[0] && !this.prop.ws[1]) return false;

    switch (this.prop.join_type) {
      case JoinType.PRIVATE:
        await this.character.disconnect();
        break;
      case JoinType.GROUP:
        await this.group_chat.disconnect();
        break;
      default:
        break;
    }

    await this.prop.httpCAIPlusInstance.post('/chat/user/logout/', {}, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json',
      }
    });

    await this.prop.ws[0].close()
    await this.prop.ws[1].close()
    this.prop.ws = []
    this.prop.token = ''
    this.prop.user_data = null;

    this.removeAllListeners()
    return true;
  }
}

export default CAINode;