class Persona {
    /**
     * @typedef {Object} Persona
     * @property {string} external_id
     * @property {string} title
     * @property {string} name
     * @property {string} visibility
     * @property {boolean} copyable
     * @property {string} greeting
     * @property {string} description
     * @property {string} identifier
     * @property {string} avatar_file_name
     * @property {string[]} songs
     * @property {boolean} img_gen_enabled
     * @property {string} base_img_prompt
     * @property {string} img_prompt_regex
     * @property {boolean} strip_img_prompt_from_msg
     * @property {string} definition
     * @property {string} default_voice_id
     * @property {object | undefined} starter_prompts
     * @property {string[]} starter_prompts.phrases
     * @property {boolean} comments_enabled
     * @property {string[]} categories
     * @property {string} user__username
     * @property {string} participant__name
     * @property {string} participant__user__username
     * @property {number} num_interactions
     * @property {string} voice_id
    */

    /**
     * @typedef {Object} PersonaList
     * @property {string} external_id
     * @property {string} title
     * @property {string} greeting
     * @property {string} description
     * @property {string} definition
     * @property {string} avatar_file_name
     * @property {string} visibility
     * @property {boolean} copyable
     * @property {string} participant__name
     * @property {number} participant__num_interactions
     * @property {number} user__id
     * @property {string} user__username
     * @property {boolean} img_gen_enabled
     * @property {string} default_voice_id
     * @property {boolean} is_persona
    */

    #prop;
    constructor(prop) {
        this.#prop = prop;
    }

    /**
     * Create your personality for your character.  
     *   
     * Example: `await library_name.persona.create("Persona Name", "Description")`
     * 
     * @param {string} name
     * @param {string} description
     * @returns {Promise<{status: string, persona: Persona}>}
    */
    async create(name, description) {
        if (!this.#prop.token) throw 'Please login first.'
        if (!name && !description) throw 'Please fill name and description argument.'
        return await (await https_fetch('https://plus.character.ai/chat/persona/create/', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify({
            'title': name,
            'name': name,
            'identifier': 'id:' + generateRandomUUID(),
            'categories': [],
            'visibility': 'PRIVATE',
            'copyable': false,
            'description': 'This is my persona.',
            'greeting': 'Hello! This is my persona',
            'definition': description,
            'avatar_rel_path': '',
            'img_gen_enabled': false,
            'base_img_prompt': '',
            'avatar_file_name': '',
            'voice_id': '',
            'strip_img_prompt_from_msg': false
        }))).json()
    }

    /**
     * Get your personality information.  
     *   
     * Example: `await library_name.persona.info("Your External Persona ID")`
     * 
     * @param {string} external_persona_id
     * @returns {Promise<{error: string, persona: Persona}>}
    */
    async info(external_persona_id) {
        if (!this.#prop.token) throw 'Please login first.'
        if (!external_persona_id) throw 'Please fill external_persona_id.'
        return await (await https_fetch(`https://plus.character.ai/chat/persona/?id=${external_persona_id}`, 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()
    }

    /**
     * Set your default personality specifically.  
     *   
     * Example  
     * - Set: `await library_name.persona.set_default("Your External Persona ID")`  
     * - Unset: `await library_name.persona.set_default()`
     * 
     * @param {string | undefined} external_persona_id
     * @returns {Promise<{error: string, persona: Persona}>}
    */
    async set_default(external_persona_id = '') {
        if (!this.#prop.token) throw 'Please login first.'

        if ((await this.info(external_persona_id)).error) return false;
        const result = await (await https_fetch('https://plus.character.ai/chat/user/settings/', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()
        if (external_persona_id) result['default_persona_id'] = external_persona_id
        else delete result.default_persona_id
        await https_fetch('https://plus.character.ai/chat/user/update_settings/', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify(result))
        return true;
    }

    /**
     * Get all your personality data.  
     *   
     * Example: `await library_name.persona.list()`
     * 
     * @returns {Promise<PersonaList>}
    */
    async list() {
        if (!this.#prop.token) throw 'Pleae login first'
        return await (await https_fetch('https://plus.character.ai/chat/personas/?force_refresh=1', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()
    }

    /**
     * Update your personality specifically.  
     *   
     * Example: `await library_name.persona.update("Your External Persona ID", "Name", "Description")`
     * 
     * @param {string} external_persona_id
     * @param {string} name
     * @param {string} description
     * @returns {Promise<{status: string, persona: Persona}>}
    */
    async update(external_persona_id, name, description) {
        if (!this.#prop.token) throw 'Please login first.'

        if (!external_persona_id) throw 'Please fill external_persona_id.'
        if ((await this.info(external_persona_id)).error) return {'status': 'ERR_NOT_FOUND', persona:{}}

        const get_info = await this.info(external_persona_id)
        return await (await https_fetch('https://plus.character.ai/chat/persona/update/', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify({
            'external_id': external_persona_id,
            'title': get_info.persona.title,
            'greeting': 'Hello! This is my persona',
            'description': 'This is my persona.',
            'definition': description ? description : get_info.persona.definition,
            'avatar_file_name': get_info.persona.avatar_file_name,
            'visibility': 'PRIVATE',
            'copyable': false,
            'participant__name': get_info.persona.participant__name,
            'participant__num_interactions': 0,
            'user__id': this.#prop.user_data.user.user.id,
            'user__username': get_info.persona.user__username,
            'img_gen_enabled': false,
            'default_voice_id': '',
            'is_persona': true,
            'name': name ? name : get_info.persona.name,
            'avatar_rel_path': get_info.persona.avatar_file_name,
            'enabled': false
        }))).json()
    }

    /**
     * Delete your personality spesifically.  
     *   
     * Example: `await library_name.persona.delete("Your External Persona ID")`
     * 
     * @param {string} external_persona_id
     * @returns {Promise<{status: string, persona: Persona}>}
    */
    async delete(external_persona_id) {
        if (!this.#prop.token) throw 'Please login first.'
        
        if (!external_persona_id) throw 'Please fill external_persona_id.'
        if ((await this.info(external_persona_id)).error) return {status: 'ERR_NOT_FOUND', persona: {}}

        const result_setting = await (await https_fetch('https://plus.character.ai/chat/user/settings/', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()
        delete result_setting.personaOverrides[external_persona_id]
        await https_fetch('https://plus.character.ai/chat/user/update_settings/', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify(result_setting))

        const get_info = await this.info(external_persona_id)
        return await (await https_fetch('https://plus.character.ai/chat/persona/update/', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify({
            'external_id': external_persona_id,
            'title': get_info.persona.title,
            'greeting': 'Hello! This is my persona',
            'description': 'This is my persona.',
            'definition': get_info.persona.definition,
            'avatar_file_name': get_info.persona.avatar_file_name,
            'visibility': 'PRIVATE',
            'copyable': false,
            'participant__name': get_info.persona.participant__name,
            'participant__num_interactions': 0,
            'user__id': this.#prop.user_data.user.user.id,
            'user__username': get_info.persona.user__username,
            'img_gen_enabled': false,
            'default_voice_id': '',
            'is_persona': true,
            'archived': true,
            'name': get_info.persona.name
        }))).json()
    }

    /**
     * Set a custom personality for your character specifically.  
     *   
     * Example  
     * - Set: `await library_name.persona.set_character("Your Character ID", "Your External Persona ID")`  
     * - Unset: `await library_name.persona.set_character("Your Character ID")`
     * 
     * @param {string} character_id
     * @param {string | undefined} external_persona_id
     * @returns {Promise<boolean>}
    */
    async set_character(character_id, external_persona_id = '') {
        if (!this.#prop.token) throw 'Please login first.'

        if (!character_id) throw 'Please fill character_id.'
        if ((await this.info(external_persona_id)).error) return false;
            
        const result = await (await https_fetch('https://plus.character.ai/chat/user/settings/', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()

        if (external_persona_id) {
            if (!Object.values(result.personaOverrides).length) result.personaOverrides = {}
            result.personaOverrides[character_id] = external_persona_id
        } else delete result.personaOverrides[character_id]

        await https_fetch('https://plus.character.ai/chat/user/update_settings/', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify(result))

        return true;
    }
}

export default Persona;
