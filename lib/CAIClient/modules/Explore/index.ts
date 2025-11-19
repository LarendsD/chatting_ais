class Explore {
    /**
     * @typedef {Object} ExploreCharacter
     * @property {Object[]} characters
     * @property {string} characters[].external_id
     * @property {string} characters[].name
     * @property {string} characters[].participant__name
     * @property {number} characters[].participant__num_interactions
     * @property {string} characters[].title
     * @property {string} characters[].description
     * @property {string} characters[].greeting
     * @property {string} characters[].visibility
     * @property {string} characters[].avatar_file_name
     * @property {boolean} characters[].img_gen_enabled
     * @property {string} characters[].user__username
     * @property {Object} characters[].translations
     * @property {Object} characters[].translations.name
     * @property {string} characters[].translations.name.ko
     * @property {string} characters[].translations.name.ru
     * @property {string} characters[].translations.name.ja_JP
     * @property {string} characters[].translations.name.zh_CN
     * @property {Object} characters[].translations.title
     * @property {string} characters[].translations.title.es
     * @property {string} characters[].translations.title.ko
     * @property {string} characters[].translations.title.ru
     * @property {string} characters[].translations.title.ja_JP
     * @property {string} characters[].translations.title.pt_BR
     * @property {string} characters[].translations.title.zh_CN
     * @property {Object} characters[].translations.greeting
     * @property {string} characters[].translations.greeting.es
     * @property {string} characters[].translations.greeting.ko
     * @property {string} characters[].translations.greeting.ru
     * @property {string} characters[].translations.greeting.ja_JP
     * @property {string} characters[].translations.greeting.pt_BR
     * @property {string} characters[].translations.greeting.zh_CN
     * @property {string | undefined} characters[].default_voice_id
     * @property {string} characters[].short_hash
    */

    /**
     * @typedef {Object} CharacterCategoriesInformation
     * @property {string} external_id
     * @property {string} title
     * @property {string} greeting
     * @property {string} avatar_file_name
     * @property {boolean} copyable
     * @property {string} participant__name
     * @property {string} user__username
     * @property {number} participant__num_interactions
     * @property {boolean} img_gen_enabled
     * @property {number} priority
     * @property {string | undefined} default_voice_id
     * @property {number} upvotes
    */

    /**
     * @typedef {{
     * "Helpers": CharacterCategoriesInformation[]
     * "Anime Game Characters": CharacterCategoriesInformation[]
     * "Games": CharacterCategoriesInformation[]
     * "Anime": CharacterCategoriesInformation[]
     * "Game Characters": CharacterCategoriesInformation[]
     * "Movies & TV": CharacterCategoriesInformation[]
     * "Comedy": CharacterCategoriesInformation[]
     * "Books": CharacterCategoriesInformation[]
     * "VTuber": CharacterCategoriesInformation[]
     * "Image Generating": CharacterCategoriesInformation[]
     * "Discussion": CharacterCategoriesInformation[]
     * "Famous People": CharacterCategoriesInformation[]
     * "Language Learning": CharacterCategoriesInformation[]
     * "Religion": CharacterCategoriesInformation[]
     * "History": CharacterCategoriesInformation[]
     * "Animals": CharacterCategoriesInformation[]
     * "Philosophy": CharacterCategoriesInformation[]
     * "Politics": CharacterCategoriesInformation[]
     * "Chinese": CharacterCategoriesInformation[]
     * }} CharacterCategories
    */

    /**
     * @typedef {{
     * "Helpers": CharacterCategoriesInformation[]
     * "Anime Game Characters": CharacterCategoriesInformation[]
     * "Games": CharacterCategoriesInformation[]
     * "Anime": CharacterCategoriesInformation[]
     * "Game Characters": CharacterCategoriesInformation[]
     * "Movies & TV": CharacterCategoriesInformation[]
     * "Comedy": CharacterCategoriesInformation[]
     * "Books": CharacterCategoriesInformation[]
     * "VTuber": CharacterCategoriesInformation[]
     * "Image Generating": CharacterCategoriesInformation[]
     * "Discussion": CharacterCategoriesInformation[]
     * "Famous People": CharacterCategoriesInformation[]
     * "Language Learning": CharacterCategoriesInformation[]
     * "Religion": CharacterCategoriesInformation[]
     * "History": CharacterCategoriesInformation[]
     * "Animals": CharacterCategoriesInformation[]
     * "Philosophy": CharacterCategoriesInformation[]
     * "Politics": CharacterCategoriesInformation[]
     * "Chinese": CharacterCategoriesInformation[]
     * }} CharacterCategories
    */

    /**
     * @typedef {{voices: [{
     * id: string,
     * name: string,
     * description: string,
     * gender: string,
     * visibility: string,
     * creatorInfo: {id: string, source: string, username: string},
     * audioSourceType: string,
     * previewText: string,
     * previewAudioURI: string,
     * backendProvider: string,
     * backendId: string,
     * internalStatus: string,
     * lastUpdateTime: string
     * }]}} FeaturedVoices
   */
    #prop;
    constructor(prop) {
        this.#prop = prop;
    }

    /**
     * Get a list of characters displayed by the Character.AI server.  
     *   
     * Example: `await library_name.explore.featured()`
     * 
     * @returns {Promise<ExploreCharacter>}
    */
    async featured() {
        if (!this.#prop.token) throw 'Please login first.'
        return await (await https_fetch('https://neo.character.ai/recommendation/v1/featured', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()
    }

    /**
     * Get a list of simillar character from ID character.  
     *   
     * Example: `await library_name.explore.simillar_char(char_id)`
     * 
     * @returns {Promise<ExploreCharacter>}
    */
    async simillar_char(char_id) {
        if (!this.#prop.token) throw 'Please login first.';
        if (!char_id) throw 'Character ID cannot be empty! Please input the Character ID.';
        return await (await https_fetch(`https://neo.character.ai/recommendation/v1/character/${char_id}`, 'GET', {'Authorization': `Token ${this.#prop.token}`})).json();
    }

    /**
     * Get a list of characters recommended by the Character.AI server.  
     *   
     * Example: `await library_name.explore.for_you()`
     * 
     * @returns {Promise<ExploreCharacter>}
    */
    async for_you() {
        if (!this.#prop.token) throw 'Please login first.'
        return await (await https_fetch('https://neo.character.ai/recommendation/v1/user', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()
    }

    /**
     * Get a list of discovery tags by the Character.AI server.  
     *   
     * Example: `await library_name.explore.discovery_tags()`
     * 
     * @returns {Promise<{tags: String[]}>}
     */
    async discovery_tags() {
        if (!this.#prop.token) throw 'Please login first.'
        return await (await https_fetch('https://neo.character.ai/recommendation/v1/discovery_tags', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Get a list of characters by tags.  
     *   
     * Example: `await library_name.explore.character_with_tags()`
     * 
     * @param {string} tag
     * @returns {Promise<{tags: String[]}>}
     */
    async characters_with_tag(tag) {
        if (!this.#prop.token) throw 'Please login first.'
        if (typeof tag != 'string') throw 'Parameter \'name\' is inavlid. Please fill it correctly.'
        
        return await (await https_fetch(`https://neo.character.ai/recommendation/v1/characters_with_tag/${tag}`, 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Get a list of characters from the character category exploration.  
     *   
     * Example: `await library_name.explore.character_categories()`
     * 
     * @returns {Promise<CharacterCategories>}
    */
    async character_categories() {
        return (await (await https_fetch('https://plus.character.ai/chat/curated_categories/characters/', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json()).characters_by_curated_category
    }

    /**
     * Get a list of featured voices.  
     *   
     * Example: `await library_name.explore.featured_voices()`
     * 
     * @returns {Promise<FeaturedVoices>}
    */
    async featured_voices() {
        return (await (await https_fetch('https://neo.character.ai/multimodal/api/v1/voices/featured', 'GET', {'Authorization': `Token ${this.#prop.token}`})).json())
    }
}

export default Explore;