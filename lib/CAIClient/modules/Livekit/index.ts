import EventEmitter from 'node:events';

class Livekit extends EventEmitter {
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

    /**
     * @type {{
     *      cai_token: string
     *      livekit: import("@livekit/rtc-node"),
     *      livekit_room: import("@livekit/rtc-node").Room,
     *      audioSource: import("@livekit/rtc-node").AudioSource,
     *      audioStream: import("@livekit/rtc-node").AudioStream,
     *      opts: {chat_id: string, char_id: string, sample_rate: number, channel: number},
     *      interval_loop: setInterval,
     *      current_candidate_id: string,
     *      is_char_speaking: boolean
     * }}
    */
    #livekit_opt = {
        cai_token: null,
        livekit: null,
        livekit_room: null,
        audioSource: null,
        audioStream: null,
        opts: {chat_id: null, char_id: null, sample_rate: 0, channel: 0},
        interval_loop: null,
        current_candidate_id: null,
        is_char_speaking: false
    }

    /**
     * @param {string} cai_token
     * @param {import("@livekit/rtc-node")} lkit
     * @param {import("@livekit/rtc-node").Room} room
     * @param {{sample_rate: number, channel: number, chat_id: string, char_id: string}} opts
     * @param {number} using_mic
     * @param {any} track
    */
    constructor(cai_token, lkit, room, opts, using_mic, track) {
        super()
        this.#livekit_opt = {
            'cai_token': cai_token,
            'livekit': lkit,
            'livekit_room': room,
            'opts': opts,
            'audioStream': new lkit.AudioStream(track)
        }

        if (using_mic) {
            this.#livekit_opt.audioSource = new this.#livekit_opt.livekit.AudioSource(opts.sample_rate, opts.channel);
            this.#livekit_opt.livekit_room.localParticipant.publishTrack(
                this.#livekit_opt.livekit.LocalAudioTrack.createAudioTrack('audio', this.#livekit_opt.audioSource),
                new this.#livekit_opt.livekit.TrackPublishOptions({
                    source: this.#livekit_opt.livekit.TrackSource.SOURCE_MICROPHONE
                })
            );
        }

        this.#livekit_opt.interval_loop = setInterval(async () => {
            this.emit('frameReceived', await this.#livekit_opt.audioStream.next())
        }, 0)
        room.on('dataReceived', data => {
            data = JSON.parse(textDecoder.decode(data))
            switch(data.event) {
                case 'speechStarted': {
                    this.#livekit_opt.current_candidate_id = data.candidateId
                    this.#livekit_opt.is_char_speaking = true;
                    break;
                }
                case 'speechEnded': {
                    this.#livekit_opt.current_candidate_id = null;
                    this.#livekit_opt.is_char_speaking = false;
                    break;
                }
            }
            this.emit('dataReceived', data);
        }).on('disconnected', async () => {
            this.emit('disconnected')
            await this.disconnect()
        })
    }

    /**
     * @typedef {Object} EventPayloads
     * @property {{
     *      callId: string,
     *      candidateId: string,
     *      participantId: string,
     *      event: string,
     *      timestamp: string,
     * }} dataReceived
     * @property {IteratorResult<import("@livekit/rtc-node").AudioFrame, any>} frameReceived
     * @property {{hello: string}} disconnected
    */

    /**
     * Get Character.AI Voices (Livekit) data events.  
     *   
     * - `dataReceived`: Receive Character.AI Livekit data events.  
     * - `frameReceived`: Receive audio stream from Livekit Server.  
     * - `disconnected`: Notify when the Voice is disconnect.
     * 
     * @template {"dataReceived" | "frameReceived" | "disconnected"} T
     * @param {T} event_name
     * @param {(args: EventPayloads[T]) => void} listener
     * @returns {this}
    */
    on(event_name, listener) {
        return super.on(event_name, listener)
    }

    /**
     * Check is Character is speaking or not.
     * @returns {boolean}
    */
    get is_character_speaking() {
        return this.#livekit_opt.is_char_speaking;
    }

    /**
     * this function checking is the PCM buffer frame is silence or not.  
     * if the PCM Buffer is silence, it will return false. if not, it will return true  
     *   
     * Threshold default: 1000  
     *   
     * Credit: https://github.com/ashishbajaj99/mic/blob/master/lib/silenceTransform.js  
     * 
     * @param {Buffer} chunk 
     * @param {number} threshold 
     * @returns {boolean}
    */
    is_speech(chunk, threshold = 1000) {
        let consecutiveSilence = 0, speechSample;
        
        for (let i = 0; i < chunk.length; i += 2) {
            if (chunk[i + 1] > 128) speechSample = (chunk[i + 1] - 256) * 256;
            else speechSample = chunk[i + 1] * 256;
            speechSample += chunk[i];

            if (Math.abs(speechSample) > threshold) return true;
            else consecutiveSilence++;
        }

        if (consecutiveSilence >= chunk.length / 2) return false;
        return true;
    }

    /**
     * Send audio PCM raw data to the Livekit Server.  
     *   
     * Example  
     * ```js
     * let test = await library_name.voice.connect("Sonic the Hedgehog", true);
     * test.input_write(pcm_data);
     * ```
     * @param {Buffer} pcm_data
     * @returns {Promise<void>}
    */
    async input_write(pcm_data) {
        if (this.#livekit_opt.audioSource) {
            pcm_data = new Int16Array(pcm_data.buffer, pcm_data.byteOffset, pcm_data.length / 2);
            await this.#livekit_opt.audioSource.captureFrame(
                new this.#livekit_opt.livekit.AudioFrame(
                    pcm_data,
                    this.#livekit_opt.opts.sample_rate,
                    this.#livekit_opt.opts.channel,
                    pcm_data.length
                )
            )
        }
    }

    /**
     * Interrupt while character talking.  
     *   
     * Example  
     * ```js
     * let test = await library_name.voice.connect("Sonic the Hedgehog", true);
     * await test.interrupt_call()
     * ```
     * @returns {Promise<object>}
    */
    async interrupt_call() {
        if (!this.#livekit_opt.current_candidate_id) return 'Character is still not talking.'
        const result = await https_fetch('https://neo.character.ai/multimodal/api/v1/sessions/discardCandidate', 'POST', {
            'Authorization': `Token ${this.#livekit_opt.cai_token}`,
            'Content-Type': 'application/json'
        }, JSON.stringify({
            'roomId': this.#livekit_opt.opts.chat_id,
            'characterId': this.#livekit_opt.opts.char_id,
            'candidateId': this.#livekit_opt.current_candidate_id
        }))
        this.#livekit_opt.current_candidate_id = null;
        return result;
    }

    /**
     * Disconnect from voice character.  
     *   
     * Example  
     * ```js
     * let test = await library_name.voice.connect("Sonic the Hedgehog", true);
     * await test.disconnect()
     * ```
     * @returns {Promise<void>}
    */
    async disconnect() {
        clearInterval(this.#livekit_opt.interval_loop)
        this.#livekit_opt.audioStream.close()
        await this.#livekit_opt.livekit_room.disconnect();
        await this.#livekit_opt.livekit.dispose();

        this.removeAllListeners();
        delete this.#livekit_opt.livekit;
        delete this.#livekit_opt.livekit_room;
        this.#livekit_opt = null
    }
}

export default Livekit;
