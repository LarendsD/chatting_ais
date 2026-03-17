class Voice {
    /**
     * @typedef {Object} VoiceInfo
     * @property {string} id
     * @property {string} name
     * @property {string} description
     * @property {string} gender
     * @property {string} visibility
     * @property {Object} creatorInfo
     * @property {string} creatorInfo.id
     * @property {string} creatorInfo.source
     * @property {string} creatorInfo.username
     * @property {string} audioSourceType
     * @property {string} previewText
     * @property {string} previewAudioURI
     * @property {string} backendProvider
     * @property {string} backendId
     * @property {string} internalStatus
     * @property {string} lastUpdateTime
    */

    #prop;
    constructor(prop) {
        this.#prop = prop;
    }

    /**
     * Get list of user created voice information.  
     *   
     * Example
     * - Get your own created voice list: `await library_name.voice.user_list()`
     * - Get user created voice list: `await library_name.voice.user_list("username")`
     * 
     * @param {string | undefined} username
     * @returns {Promise<{ voices: VoiceInfo[] }>}
    */
    user_created_list(username = '') {
        return username ? (async () => {
            return await (await https_fetch(`https://neo.character.ai/multimodal/api/v1/voices/search?creatorInfo.username=${username}`, 'GET', {
                'Authorization': `Token ${this.#prop.token}`
            })).json()
        })() : (async () => {
            return await (await https_fetch('https://neo.character.ai/multimodal/api/v1/voices/user', 'GET', {
                'Authorization': `Token ${this.#prop.token}`
            })).json()
        })()
    }

    /**
     * Get a voice information.  
     *   
     * Example: `await library_name.voice.info("Voice ID")`
     * 
     * @param {string} voice_id
     * @returns {Promise<{ voice: VoiceInfo }>}
    */
    async info(voice_id) {
        return await (await https_fetch(`https://neo.character.ai/multimodal/api/v1/voices/${voice_id}?useSearch=true`, 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Warning: This feature only supports Single character chat, not Group chat.  
     *   
     * Connect to voice character chat, and this function works only for single character chat.  
     *   
     * ---
     * Example function  
     * - Using Query: `await library_name.voice.connect("Query", true)`  
     * - Using Voice ID: `await library_name.voice.connect("Voice ID")`
     * 
     * Example to use  
     * - Without microphone
     *      ```js
     *      const Speaker = require("speaker"); // import Speaker from "speaker"
     *      const speaker = new Speaker({
     *            channels: 1,          // 1 channel
     *            bitDepth: 16,         // 16-bit samples
     *            sampleRate: 48000     // 48,000 Hz sample rate
     *      });
     *      
     *      library_name.character.connect("Character ID");
     *      let test = await library_name.voice.connect("Sonic the Hedgehog", true);
     * 
     *      console.log("Character voice ready!");
     * 
     *      test.on("frameReceived", ev => {
     *           speaker.write(Buffer.from(ev.value.data.buffer)); // PCM buffer write into speaker and you'll hear the sound.
     *      });
     *      library_name.character.generate_turn(); // Test is voice character is working or not.
     *      ```
     *   
     * - With microphone (Voice call)
     *      ```js
     *      const Speaker = require("speaker"); // import Speaker from "speaker"
     *      const { spawn } = require('child_process'); // import { spawn } from "child_process".
     *      //for microphone, I'll using sox. so Ineed child_process
     *      
     *      const speaker = new Speaker({
     *            channels: 1,          // 1 channel
     *            bitDepth: 16,         // 16-bit samples
     *            sampleRate: 48000     // 48,000 Hz sample rate
     *      });
     *      
     *      const recordMic = spawn('sox', [
     *           '-q',
     *           '-t', 'waveaudio', '-d', // Windows Audio Input (change parameter 3 to '-d' if you want set to default Device ID.)
     *           '-r', '48000',           // Sample rate: 48 kHz
     *           '-e', 'signed-integer',  // Encoding: signed PCM
     *           '-b', '16',              // Bit depth: 16-bit
     *           '-c', '1',               // Channel: 1 (mono)
     *           '-t', 'raw',             // Output format: raw PCM
     *           '-'                      // stdout
     *      ]);
     *      
     *      let test = await library_name.voice.connect("Sonic the Hedgehog", true, true);
     * 
     *      console.log("Voice call ready!");
     *  
     *      test.on("frameReceived", ev => {
     *           speaker.write(Buffer.from(ev.value.data.buffer)); // PCM buffer write into speaker and you'll hear the sound.
     *      });
     *      
     *      recordMic.on("data", data => {
     *           if (test.is_speech(data)) test.input_write(data); // Mic PCM Buffer output send it to Livekit server.
     *      });
     *      ```
     *   
     * Or, if you just wanted to get the Livekit information only: 
     * ```js
     * console.log(await library_name.voice.connect("Sonic the Hedgehog", true, false, null, {return_livekit_information_only: true}))
     * ```  
     * ---
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
     * 
     * @param {string} voice_query_or_id
     * @param {boolean} using_voice_query
     * @param {boolean} using_mic
     * @param {{sample_rate: number, channel: number} | undefined} mic_opt
     * @param {{char_id: string, chat_id: string, return_livekit_information_only: boolean} | undefined} manual_opt
     * @returns {Promise<Livekit_Class>}
    */
    async connect(voice_query_or_id, using_voice_query = false, using_mic = false, mic_opt = {'sample_rate': 48000, 'channel': 1}, manual_opt = {
        char_id: this.#prop.current_char_id_chat,
        chat_id: this.#prop.current_chat_id,
        return_livekit_information_only: false
    }) {
        if (!this.#prop.token) throw 'Please login first.'
        if (this.#prop.is_connected_livekit_room[0]) throw 'You\'re already connected to Livekit room!'

        if (typeof mic_opt != 'object') {
            mic_opt = {
                sample_rate: 48000,
                channel: 1
            }
        }
        if (typeof mic_opt.sample_rate != 'number' || !mic_opt.sample_rate) mic_opt.sample_rate = 48000
        if (typeof mic_opt.channel != 'number' || !mic_opt.channel) mic_opt.channel = 1

        if (typeof manual_opt != 'object') {
            manual_opt = {
                char_id: this.#prop.current_char_id_chat,
                chat_id: this.#prop.current_chat_id
            }
        }

        if (typeof manual_opt.char_id != 'string' || !manual_opt.char_id) {
            if (this.#prop.current_char_id_chat) manual_opt.char_id = this.#prop.current_char_id_chat
            else throw 'Character ID cannot be empty! please input Character ID correctly, or connect to the character by using character.connect() function.'
        }
        if (typeof manual_opt.chat_id != 'string' || !manual_opt.chat_id) {
            if (this.#prop.current_chat_id) manual_opt.chat_id = this.#prop.current_chat_id
            else throw 'Chat ID cannot be empty! please input Chat ID correctly, or connect to the character by using character.connect() function.'
        }
        if (typeof manual_opt.return_livekit_information_only != 'boolean') manual_opt.return_livekit_information_only = false

        return new Promise(async resolve => {
            const livekit = await import('@livekit/rtc-node').catch(_ => {
                throw 'This function only works when you\'re install livekit library. (npm/bun install @livekit/rtc-node)'
            });
            const connect_result = await (await https_fetch('https://neo.character.ai/multimodal/api/v1/sessions/joinOrCreateSession', 'POST', {
                'Authorization': `Token ${this.#prop.token}`,
                'Content-Type': 'application/json'
            }, JSON.stringify({
                'roomId': this.#prop.current_chat_id,
                ...(using_voice_query ? {
                    'voiceQueries': {
                        [this.#prop.current_char_id_chat]: voice_query_or_id
                    }
                } : {
                    'voices': {
                        [this.#prop.current_char_id_chat]: voice_query_or_id
                    }
                }),
                'enableASR': using_mic,
                'rtcBackend': 'lk',
                'userAuthToken': this.#prop.token,
                'username': this.#prop.user_data.user.user.username,
            }))).json()

            if (connect_result.message) {
                if (connect_result.message.includes('error reading voice')) throw 'Error: Voice ID not found! Please input a correct Voice ID.'
                else throw `Error: ${connect_result.message}`
            }
            if (manual_opt.return_livekit_information_only) resolve(connect_result)
            else {
                const livekit_room = new livekit.Room();

                livekit_room.once('trackSubscribed', track => {
                    if (track.kind == 1) {
                        /**
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
                        resolve(new Livekit_Class(this.#prop.token, livekit, livekit_room, {
                            sample_rate: mic_opt.sample_rate ? mic_opt.sample_rate : 48000,
                            channel: mic_opt.channel ? mic_opt.channel : 1,
                            char_id: manual_opt.char_id,
                            chat_id: manual_opt.chat_id
                        }, using_mic, track));
                    }
                });
                await livekit_room.connect(connect_result.lkUrl, connect_result.lkToken, {
                    autoSubscribe: true,
                    dynacast: true
                })
            }
        })  
    }
}

export default Voice;