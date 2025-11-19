class Search {
    #prop
    constructor(prop) {
        this.#prop = prop; 
    }

    /**
     * Get list of tags.  
     *   
     * Example: `await library_name.search.list_tags()`
     * 
     * @returns {Promise<>}
     */
    async list_tags() {
        if (!this.#prop.token) throw 'Please login first.';

        return await (await https_fetch('https://neo.character.ai/search/v1/tags', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Search users by name.  
     *   
     * Example: `await library_name.search.users("Name user", "popular") // sorted by popular`
     * 
     * @template {"popular" | "followers"} T
     * @param {string} name
     * @param {T | "" | undefined} sorted_by
     * @returns {Promise<UserSearch>}
    */
    async users(name, sorted_by) {
        if (!this.#prop.token) throw 'Please login first.'
        if (typeof name != 'string') throw 'Parameter \'name\' is inavlid. Please fill it correctly.'
        if (typeof sorted_by != 'string') throw 'Parameter \'sorted_by\' is invalid. Please fill it correctly.'

        return await (await https_fetch(`https://neo.character.ai/search/v1/creator?query=${name}&sortedBy=${sorted_by}`, 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json();
    }

    /**
     * Search scenes by query.  
     *   
     * Example: `await library_name.search.scenes("Query")`
     * 
     * @param {string} query
     * @returns {Promise<{"scenes": [], "uuid": string}>}
     */
    async scenes(query) {
        if (!this.#prop.token) throw 'Please login first.';

        return await (await https_fetch(`https://neo.character.ai/search/v1/scene?query=${query}`, 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json();
    }

    /**
     * Search for a characters by name.  
     *   
     * Example: `await library_name.search.characters("Character Name")`
     * 
     * @template {"relevance" | "likes" | "popular" | "newest"} T
     * @param {string} name
     * @param {T | "" | undefined} sorted_by
     * @returns {Promise<CharactersSearchInfo>}
    */
    async characters(name, sorted_by = 'relevance') {
        if (!this.#prop.token) throw 'Please login first.'
        if (typeof name != 'string') throw 'Parameter \'name\' is inavlid. Please fill it correctly.'
        if (typeof sorted_by != 'string') throw 'Parameter \'sorted_by\' is invalid. Please fill it correctly.'
        
        return await (await https_fetch(`https://neo.character.ai/search/v1/character?query=${name}&sortedBy=${sorted_by}`, 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Search for a voices by name.  
     *   
     * Example: `await library_name.search.voices("Name voice")`
     * 
     * @param {string} name
     * @returns {Promise<{ voices: VoiceInfo[] }>}
    */
    async voices(name) {
        return await (await https_fetch(`https://neo.character.ai/multimodal/api/v1/voices/search?characterName=${name}`, 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Get popular search.  
     *   
     * Example: `await library_name.search.popular()`
     * 
     * @returns {Promise<String[]>}
    */
    async popular() {
        if (!this.#prop.token) throw 'Please login first.'

        return await (await https_fetch('https://neo.character.ai/search/v1/query/popular', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Get trending search.  
     *   
     * Example: `await library_name.search.trending()`
     * 
     * @returns {Promise<String[]>}
    */
    async trending() {
        if (!this.#prop.token) throw 'Please login first.'
        
        return await (await https_fetch('https://neo.character.ai/search/v1/query/trending', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json()
    }

    /**
     * Get autocomplete search.  
     *   
     * Example: `await library_name.search.autocomplete("Search")`
     * 
     * @param {string} query 
     * @returns {Promise<{"search_autocomplete": String[]}>}
     */
    async autocomplete(query) {
        if (!this.#prop.token) throw 'Please login first.';

        return await (await https_fetch(`https://neo.character.ai/search/v1/query/autocomplete?query_prefix=${query}`, 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json();
    }
    
    /** Get languages list.  
     *   
     * Example: `await library_name.search.languages()`
     * 
     * @returns {Promise<{languages: [{"id": string, "name": string, "localized_name": string, "code": string}]}>}
     */
    async languages() {
        if (!this.#prop.token) throw 'Please login first.';

        return await (await https_fetch('https://neo.character.ai/search/v1/languages', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json();
    }
}

export default Search;
