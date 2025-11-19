class GroupChat {
    /**
     * @typedef {Object} GroupChatListInfo
     * @property {Object[]} rooms
     * @property {string} rooms[].id
     * @property {string} rooms[].title
     * @property {string} rooms[].description
     * @property {string} rooms[].visibility
     * @property {string} rooms[].picture
     * @property {Object[]} rooms[].characters
     * @property {string} rooms[].characters[].id
     * @property {string} rooms[].characters[].name
     * @property {string} rooms[].characters[].url
     * @property {Object[]} rooms[].users
     * @property {string} rooms[].users[].id
     * @property {string} rooms[].users[].username
     * @property {string} rooms[].users[].avatar_url
     * @property {string} rooms[].users[].role
     * @property {string} rooms[].users[].state
     * @property {[]} rooms[].permissions
     * @property {Object} rooms[].preview_turns
     * @property {[]} rooms[].preview_turns.turns
     * @property {Object} rooms[].preview_turns.meta
     * @property {string} rooms[].preview_turns.meta.next_token
     * @property {Object} rooms[].settings
     * @property {boolean} rooms[].settings.anyone_can_join
     * @property {boolean} rooms[].settings.require_approval
     * @property {boolean} rooms[].settings.auto_smart_reply
     * @property {boolean} rooms[].settings.smart_reply_timer
     * @property {string} rooms[].settings.join_token
     * @property {number} rooms[].settings.user_limit
     * @property {number} rooms[].settings.character_limit
     * @property {string} rooms[].settings.push_notification_mode
    */

    /**
     * @typedef {Object} GroupChatConnectInfo
     * @property {number} id
     * @property {string} error
     * @property {Object} subscribe
     * @property {boolean} subscribe.recoverable
     * @property {string} subscribe.epoch
     * @property {boolean} subscribe.positioned
    */

    /**
     * @typedef {Object} GroupChatDisconnectInfo
     * @property {number} id
     * @property {Object} subscribe
    */

    /**
     * @typedef {Object} GroupChatCreateInfo
     * @property {string} id
     * @property {string} title
     * @property {string} description
     * @property {string} visibility
     * @property {string} picture
     * @property {number} last_updated
     * @property {Object[]} characters
     * @property {string} characters[].id
     * @property {string} characters[].name
     * @property {string} characters[].avatar_url
     * @property {Object[]} users
     * @property {string} users[].id
     * @property {string} users[].username
     * @property {string} users[].name
     * @property {string} users[].avatar_url
     * @property {string} users[].role
     * @property {string} users[].state
     * @property {[]} permissions
     * @property {Object[]} preview_turns
     * @property {Object} preview_turns[].turns
     * @property {Object} preview_turns[].turns.turn_key
     * @property {string} preview_turns[].turns.turn_key.chat_id
     * @property {string} preview_turns[].turns.turn_key.turn_id
     * @property {string} preview_turns[].turns.create_time
     * @property {string} preview_turns[].turns.last_update_time
     * @property {string} preview_turns[].turns.state
     * @property {Object} preview_turns[].turns.author
     * @property {string} preview_turns[].turns.author.author_id
     * @property {string} preview_turns[].turns.author.name
     * @property {Object[]} preview_turns[].turns.candidates
     * @property {string} preview_turns[].turns.candidates[].candidate_id
     * @property {string} preview_turns[].turns.candidates[].create_time
     * @property {string} preview_turns[].turns.candidates[].raw_content
     * @property {Object} preview_turns[].turns.candidates[].editor
     * @property {string} preview_turns[].turns.candidates[].editor.author_id
     * @property {string} preview_turns[].turns.candidates[].editor.name
     * @property {boolean} preview_turns[].turns.candidates[].is_final
     * @property {string} preview_turns[].turns.primary_candidate_id
     * @property {string} preview_turns[].turns.primary_candidate_id
     * @property {Object} preview_turns[].meta
     * @property {string} preview_turns[].meta.next_token
     * @property {Object} settings
     * @property {boolean} settings.anyone_can_join
     * @property {boolean} settings.require_approval
     * @property {boolean} settings.auto_smart_reply
     * @property {boolean} settings.smart_reply_timer
     * @property {string} settings.join_token
     * @property {number} settings.user_limit
     * @property {number} settings.character_limit
     * @property {string} settings.push_notification_mode
    */

    /**
     * @typedef {Object} GroupChatDeleteInfo
     * @property {string} id
     * @property {string} command
    */

    /**
     * @typedef {Object} GroupChatActivityInfo
     * @property {string} id
     * @property {Object} users
     * @property {[]} users.added
     * @property {[]} users.removed
     * @property {Object} characters
     * @property {[]} characters.removed
     * @property {[]} characters.removed
     * @property {string} title
     * @property {string} command
    */

    #prop;
    constructor(prop) {
        this.#prop = prop;
    }

    /**
     * Get all list available group chat in account.  
     *   
     * Example: `await library_name.group_chat.list()`
     * 
     * @returns {Promise<GroupChatListInfo>}
    */
    async list() {
        if (!this.#prop.token) throw 'Please login first.'
        return await (await https_fetch('https://neo.character.ai/murooms/?include_turns=false', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Connecting to group chat by the Room ID.  
     *   
     * Example: `await library_name.group_chat.connect("Room ID")`
     * 
     * @param {string} room_id
     * @returns {Promise<GroupChatConnectInfo>}
    */
    async connect(room_id) {
        if (!this.#prop.token) throw 'Please login first.'
        if (this.#prop.join_type == 2) throw 'You are already connected from the room'

        const res = await send_ws(this.#prop.ws[0], `{"subscribe":{"channel":"room:${room_id}"},"id":1}`, true, 0, false)
        if (res.error) return res;
        this.#prop.current_chat_id = room_id;
        this.#prop.join_type = 2;
        return res;
    }

    /**
     * Disconnecting from group chat by the Room ID.  
     *   
     * Example: `await library_name.group_chat.disconnect()`
     * 
     * @returns {Promise<GroupChatDisconnectInfo>}
    */
    async disconnect() {
        if (!this.#prop.token) throw 'Please login first.'
        if (!this.#prop.join_type || this.#prop.join_type != 2) throw 'This function only works when you\'re connected on Group Chat.'
        
        const res = await send_ws(this.#prop.ws[0], `{"unsubscribe":{"channel":"room:${this.#prop.current_chat_id}"},"id":1}`, true, 0, false)

        this.#prop.join_type = 0;
        this.#prop.current_chat_id = '';
        return res;
    }

    /**
     * Create group chat.  
     *   
     * Example  
     * - 1 character: `await library_name.group_chat.create("Title Room", "Character ID")`  
     * - more than 1 character: `await library_name.group_chat.create("Title Room", ["Character ID 1", "Character ID 2", ...])`
     * 
     * @param {string} title_room
     * @param {string | string[]} char_id
     * @returns {Promise<GroupChatCreateInfo>}
    */
    async create(title_room, char_id) {
        if (!this.#prop.token) throw 'Please login first.'
        return await (await https_fetch('https://neo.character.ai/muroom/create', 'POST', {'Authorization': `Token ${this.#prop.token}`}, JSON.stringify({
            'characters': Array.isArray(char_id) ? char_id : [char_id],
            'title': title_room,
            'settings': {
                'anyone_can_join': true,
                'require_approval': false
            },
            'visibility': 'VISIBILITY_UNLISTED',
            'with_greeting': true
        }))).json()
    }

    /**
     * Delete group chat.  
     *   
     * Example: `await library_name.group_chat.delete("Room ID")`
     * 
     * @param {string} room_id 
     * @returns {Promise<GroupChatDeleteInfo>}
    */
    async delete(room_id) {
        if (!this.#prop.token) throw 'Please login first.'
        if (this.#prop.join_type == 2) await send_ws(this.#prop.ws[0], `{"unsubscribe":{"channel":"room:${this.#prop.current_chat_id}"},"id":1}`, true, 0, false)
        return await (await https_fetch(`https://neo.character.ai/muroom/${this.#prop.join_type == 2 ? this.#prop.current_chat_id : room_id}/`, 'DELETE', {'Authorization': `Token ${this.#prop.token}`})).json()
    }
    
    /**
     * Rename group chat.  
     *   
     * Example: 
     * - Automatic (must be connected to the group chat): `await library_name.group_chat.rename("New Name")`  
     * - Input group_id manually: `await library_name.group_chat.rename("New Name", "Room ID")`  
     *   
     * NOTE: You can also rename another group chat if you're already connected to the current group chat. (group_id prioritize)
     * 
     * @param {string} new_name
     * @param {string | undefined} group_id
     * @returns {Promise<GroupChatActivityInfo>}
    */
    async rename(new_name, group_id = this.#prop.current_chat_id) {
        if (!this.#prop.token) throw 'Pleae login first'

        if (!group_id && !this.#prop.current_chat_id) {
            if (!this.#prop.current_candidate_id) throw 'Please at least input group_id or connect to the group chat first.';
            else group_id = this.#prop.current_chat_id
        }

        return await (await https_fetch(`https://neo.character.ai/muroom/${group_id}/`, 'PATCH', {'Authorization': `Token ${this.#prop.token}`}, JSON.stringify([
            {
                'op': 'replace',
                'path': `/muroom/${group_id}`,
                'value': {
                    'title': `${new_name}`
                }
            }
        ]))).json()
    }

    /**
     * Joining group chat using invite code.  
     *   
     * Example: `await library_name.group_chat.join_group_invite("Group Chat Invite Code")`
     * 
     * @param {string} invite_code
     * @returns {Promise<GroupChatCreateInfo & {command: string}>}
    */
    async join_group_invite(invite_code) {
        if (!this.#prop.token) throw 'Please login first.'
        await https_fetch(`https://neo.character.ai/muroom/?join_token=${invite_code}`, 'GET', {'Authorization': `Token ${this.#prop.token}`})
        return await (await https_fetch('https://neo.character.ai/muroom/join', 'POST', {'Authorization': `Token ${this.#prop.token}`}, `{"join_token":"${invite_code}"}`)).json()
    }

    /**
     * Add a character with Character ID to the group chat.  
     *   
     * Example (Connected to current Group Chat): `await library_name.group_chat.char_add("Character ID")`  
     * Example (targeting to another Group chat): `await library_name.group_chat.char_add("Character ID", {groupchat_id: "Group Chat ID"})`  
     *   
     * NOTE: You can also add a character to another group chat even if you're already connected to the current group chat. (group_id prioritize)
     * 
     * @param {string} char_id
     * @param {{groupchat_id: string, timeout_ms: number} | undefined} manual_opt
     * @returns {Promise<GroupChatActivityInfo>}
    */
    async char_add(char_id, manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'

        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        if (Array.isArray(char_id)) {
            return await (await https_fetch(`https://neo.character.ai/muroom/${manual_opt.groupchat_id}/`, 'PATCH', {
                'Authorization': `Token ${this.#prop.token}`
            }, JSON.stringify(char_id.map(id => {
                return {
                    'op': 'add',
                    'path': `/muroom/${manual_opt.groupchat_id}/characters`,
                    'value': {
                        'id': id
                    }
                };
            })))).json()
        } else {
            if (typeof char_id !== 'string') throw 'Please provide a valid character id.'
            return await (await https_fetch(`https://neo.character.ai/muroom/${manual_opt.groupchat_id}/`, 'PATCH', {
                'Authorization': `Token ${this.#prop.token}`
            }, JSON.stringify([{
                'op': 'add',
                'path': `/muroom/${manual_opt.groupchat_id}/characters`,
                'value': {
                    'id': char_id
                }
            }]))).json()
        }
    }

    /**
     * Remove a character with Character ID from the group chat.  
     *   
     * Example  
     * Example (Connected to current Group Chat): `await library_name.group_chat.char_remove("Character ID")`  
     * Example (targeting to another Group chat): `await library_name.group_chat.char_remove("Character ID", {groupchat_id: "Group Chat ID"})`  
     *   
     * NOTE: You can also remove the character to another group chat even if you're already connected to the current group chat. (group_id prioritize)
     * 
     * @param {string} char_id
     * @param {{groupchat_id: string, timeout_ms: number} | undefined} manual_opt
     * @returns {Promise<GroupChatActivityInfo>}
    */
    async char_remove(char_id, manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'

        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        if (Array.isArray(char_id)) {
            return await (await https_fetch(`https://neo.character.ai/muroom/${manual_opt.groupchat_id}/`, 'PATCH', {
                'Authorization': `Token ${this.#prop.token}`
            }, JSON.stringify(char_id.map(id => {
                return {
                    'op': 'remove',
                    'path': `/muroom/${manual_opt.groupchat_id}/characters`,
                    'value': {
                        'id': id
                    }
                };
            })))).json()
        } else {
            return await (await https_fetch(`https://neo.character.ai/muroom/${manual_opt.groupchat_id}/`, 'PATCH', {
                'Authorization': `Token ${this.#prop.token}`
            }, JSON.stringify([{
                'op': 'remove',
                'path': `/muroom/${manual_opt.groupchat_id}/characters`,
                'value': {
                    'id': char_id
                }
            }]))).json()
        }
    }

    /**
     * Send message to group chat.  
     *   
     * Example (Connected to the Group chat)  
     * - Default (Without Image): `await library_name.group_chat.send_message("Your Message")`  
     * - With Image: `await library_name.group_chat.send_message("Your Message", "URL Image")`  
     *   
     * Example (Manually connect to the Group chat)  
     * - Default (Without Image)
     * ```
     * await library_name.group_chat.send_message("Your Message", null, {
     *     groupchat_id: "Group Chat ID"
     * })
     * ```  
     * - With Image
     * ```
     * await library_name.group_chat.send_message("Your Message", "URL Image", {
     *      groupchat_id: "Group Chat ID"
     * })
     * ```
     * 
     * @param {string} message
     * @param {string | undefined} image_url_path
     * @param {{groupchat_id: string, timeout_ms: number} | undefined} manual_opt
     * @returns {Promise<GroupChatInfo>}
    */
    async send_message(message, image_url_path = '', manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'

        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        const turn_key = generateRandomUUID();
        return await send_ws(this.#prop.ws[0], JSON.stringify({
            'rpc': {
                'method': 'unused_command',
                'data': {
                    'command': 'create_turn',
                    'request_id': generateRandomUUID().slice(0, -12) + manual_opt.groupchat_id.split('-')[4],
                    'payload': {
                        'chat_type': 'TYPE_MU_ROOM',
                        'num_candidates': 1,
                        'user_name': this.#prop.user_data.user.user.username,
                        'turn': {
                            'turn_key': {
                                'turn_id': turn_key,
                                'chat_id': manual_opt.groupchat_id
                            },
                            'author': {
                                'author_id': `${this.#prop.user_data.user.user.id}`,
                                'is_human': true,
                                'name': this.#prop.user_data.user.user.username
                            },
                            'candidates': [{
                                'candidate_id': turn_key,
                                'raw_content': message,
                                ...image_url_path ? { tti_image_rel_path: image_url_path } : {}
                            }],
                            'primary_candidate_id': turn_key
                        }
                    }
                }
            },
            'id': 1
        }), true, 2, false, null, manual_opt.timeout_ms)
    }

    /**
     * Generating message response character from group chat.  
     *   
     * Example (Connected to the Group Chat): `await library_name.group_chat.generate_turn()`  
     * Example (Manually connect to the Group chat)  
     * ```
     * await library_name.group_chat.generate_turn({
     *      groupchat_id: "Your Group Chat ID"
     * })
     * ```
     * 
     * @param {{groupchat_id: string, timeout_ms: number} | undefined} manual_opt
     * @returns {Promise<GroupChatInfo>}
    */
    async generate_turn(manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'
        if (!this.#prop.join_type || this.#prop.join_type != 2) throw 'This function only works when you\'re connected on Group Chat.'
        
        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        return await send_ws(this.#prop.ws[0], JSON.stringify({
            'rpc': {
                'method': 'unused_command',
                'data': {
                    'command': 'generate_turn',
                    'request_id': generateRandomUUID().slice(0, -12) + manual_opt.groupchat_id.split('-')[4],
                    'payload': {
                        'chat_type': 'TYPE_MU_ROOM',
                        'chat_id': manual_opt.groupchat_id,
                        'user_name': this.#prop.user_data.user.user.username,
                        'smart_reply': 'CHARACTERS',
                        'smart_reply_delay': 0
                    },
                    'origin_id':'Android'
                }
            },
            'id': 1
        }), true, 2, true, null, manual_opt.timeout_ms)
    }

    /**
     * Regenerate character message.  
     *   
     * Example (Connected to current Group Chat): `await library_name.group_chat.generate_turn_candidate("Turn ID", "Character ID")`  
     * Example (targeting to another Group chat)  
     * ```
     * await library_name.group_chat.generate_turn_candidate("Turn ID", "Character ID", {
     *      groupchat_id: "Your Group Chat ID"
     * })
     * ```
     * 
     * @param {string} turn_id
     * @param {string} char_id
     * @param {{groupchat_id: string, timeout_ms: number} | undefined} manual_opt
     * @returns {Promise<GroupChatInfo>}
    */
    async generate_turn_candidate(turn_id, char_id, manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'
        if (!this.#prop.join_type || this.#prop.join_type != 2) throw 'This function only works when you\'re connected on Group Chat.'
        
        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        return await send_ws(this.#prop.ws[0], JSON.stringify({
            'rpc': {
                'method': 'unused_command',
                'data': {
                    'command': 'generate_turn_candidate',
                    'request_id': generateRandomUUID().slice(0, -12) + manual_opt.groupchat_id.split('-')[4],
                    'payload': {
                        'chat_type': 'TYPE_MU_ROOM',
                        'character_id': char_id,
                        'user_name': this.#prop.user_data.user.user.username,
                        'turn_key': {
                            'turn_id': turn_id,
                            'chat_id': manual_opt.groupchat_id
                        }
                    }
                }
            },
            'id': 1
        }), true, 2, true, null, manual_opt.timeout_ms)
    }

    /**
     * Reset conversation in group chat.  
     *   
     * Example (Connected to current Group Chat): `await library_name.group_chat.reset_conversation()`  
     * Example (targeting to another Group chat): `await library_name.group_chat.reset_conversation({groupchat_id: "Group Chat ID"})`
     * 
     * @param {{groupchat_id: string, timeout_ms: number}} manual_opt
     * @returns {Promise<GroupChatInfo>}
    */
    async reset_conversation(manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'

        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        const turn_key = generateRandomUUID()
        return await send_ws(this.#prop.ws[0], JSON.stringify({
            'rpc': {
                'method': 'unused_command',
                'data': {
                    'command': 'create_turn',
                    'request_id': generateRandomUUID().slice(0, -12) + manual_opt.groupchat_id.split('-')[4],
                    'payload': {
                        'chat_type': 'TYPE_MU_ROOM',
                        'num_candidates': 1,
                        'user_name': this.#prop.user_data.user.user.username,
                        'turn': {
                            'context_reset': true,
                            'turn_key': {
                                'turn_id': turn_key,
                                'chat_id': manual_opt.groupchat_id
                            },
                            'author': {
                                'author_id': `${this.#prop.user_data.user.user.id}`,
                                'is_human': true,
                                'name': this.#prop.user_data.user.user.username
                            },
                            'candidates': [{
                                'candidate_id': turn_key,
                                'raw_content': 'restart'
                            }],
                            'primary_candidate_id': turn_key
                        }
                    }
                }
            },
            'id': 1
        }), true, 2, false, false, manual_opt.timeout_ms)
    }

    /**
     * Delete user/character message.  
     *   
     * Example (Connected to current Group Chat): `await library_name.group_chat.delete_message("Turn ID")`  
     * Example (targeting to another Group chat): `await library_name.group_chat.delete_message("Turn ID", {groupchat_id: "Group Chat ID"})`
     * 
     * @param {string} turn_id
     * @param {{groupchat_id: string, timeout_ms: number}} manual_opt
     * @returns {Promise<boolean>}
    */
    async delete_message(turn_id, manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'

        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';
        if (typeof turn_id !== 'string') throw 'Please provide a valid turn_id.';

        await send_ws(this.#prop.ws[1], JSON.stringify({
            'command': 'remove_turns',
            'request_id': generateRandomUUID().slice(0, -12) + manual_opt.groupchat_id.split('-')[4],
            'payload': {
                'chat_id': manual_opt.groupchat_id,
                'turn_ids': Array.isArray(turn_id) ? turn_id : [turn_id]
            },
            'origin_id': 'Android'
        }), false, 0, false, false, manual_opt.timeout_ms)
        return true;
    }

    /**
     * Edit user/character message.  
     *   
     * Example (Connected to current Group Chat): `await library_name.group_chat.edit_message("Candidate ID", "Turn ID", "New Message")`  
     * Example (targeting to another Group chat): `await library_name.group_chat.edit_message("Candidate ID", "Turn ID", "New Message", {groupchat_id: "Group Chat ID"})`
     * 
     * @param {string} candidate_id
     * @param {string} turn_id
     * @param {string} new_message
     * @param {{groupchat_id: string, timeout_ms: number}} manual_opt
     * 
     * @returns {Promise<GroupChatInfo>}
    */
    async edit_message(candidate_id, turn_id, new_message, manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'
        
        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        if (typeof candidate_id !== 'string') throw 'Please provide a valid candidate_id.';
        if (typeof turn_id !== 'string') throw 'Please provide a valid turn_id.';
        
        const result = await send_ws(this.#prop.ws[0], JSON.stringify({
            'rpc': {
                'method': 'unused_command',
                'data': {
                    'command': 'edit_turn_candidate',
                    'request_id': generateRandomUUID().slice(0, -12) + manual_opt.groupchat_id.split('-')[4],
                    'payload': {
                        'turn_key': {
                            'chat_id': manual_opt.groupchat_id,
                            'turn_id': turn_id
                        },
                        'current_candidate_id': candidate_id,
                        'new_candidate_raw_content': new_message
                    }
                }
            },
            'id': 1
        }), true, 2, false, false, manual_opt.timeout_ms)

        if (!result.push.pub.data.turn.author.is_human) {
            await send_ws(this.#prop.ws[1], JSON.stringify({
                'command': 'update_primary_candidate',
                'payload': {
                    'candidate_id': candidate_id,
                    'turn_key': {
                        'chat_id': this.#prop.current_chat_id,
                        'turn_id': turn_id
                    }
                },
                'origin_id': 'Android'
            }), false, 0, false, manual_opt.timeout_ms)
        }
        return result;
    }

    /**
     * Select the turn of character chat by yourself.  
     *   
     * Example (Connected to current Group Chat): `await library_name.group_chat.select_turn("Character ID", "Turn ID")`  
     * Example (targeting to another Group chat): `await library_name.group_chat.select_turn("Character ID", {groupchat_id: "Group Chat ID"})`
     * 
     * @param {string} char_id
     * @param {{groupchat_id: string, timeout_ms: number}} manual_opt
     * @returns {Promise<GroupChatInfo>}
    */
    async select_turn(char_id, manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}) {
        if (!this.#prop.token) throw 'Please login first.'

        if (typeof manual_opt != 'object') manual_opt = {groupchat_id: this.#prop.current_chat_id, timeout_ms: 0}
        if (typeof manual_opt.groupchat_id != 'string' || !manual_opt.groupchat_id) manual_opt.groupchat_id = this.#prop.current_chat_id
        if (typeof manual_opt.timeout_ms != 'number' || manual_opt.timeout_ms < 0) manual_opt.timeout_ms = 0;

        if (!manual_opt.groupchat_id) throw 'Group Chat ID cannot be empty, or at least connect to the Group Chat first.';

        if (typeof char_id !== 'string') throw 'Please provide a valid char_id.';
        
        return await send_ws(this.#prop.ws[0], JSON.stringify({
            'rpc': {
                'method': 'unused_command',
                'data': {
                    'command': 'generate_turn',
                    'request_id': generateRandomUUID().slice(0, -12) + manual_opt.groupchat_id.split('-')[4],
                    'payload': {
                        'chat_type': 'TYPE_MU_ROOM',
                        'character_id': char_id,
                        'chat_id': manual_opt.groupchat_id
                    }
                }
            },
            'id': 1
        }), true, 2, true, false, timeout_ms)
    }
}

export default GroupChat;
