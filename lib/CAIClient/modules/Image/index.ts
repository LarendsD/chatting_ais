class Image {
    #prop;
    constructor(prop) {
        this.#prop = prop;
    }

    /**
     * Generate avatar image using prompt.  
     *   
     * Example: `await library_name.image.generate_avatar("your prompt")`
     * 
     * @param {string} prompt_name
     * @returns {Promise<{ result: [{ prompt: string, url: string }] }>}
    */
    async generate_avatar(prompt_name) {
        if (!this.#prop.token) throw 'Please login first.'
        return await (await https_fetch('https://plus.character.ai/chat/character/generate-avatar-options', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify({
            'prompt':prompt_name,
            'num_candidates':4,
            'model_version':'v1'
        }))).json()
    }

    /**
     * Generate image using prompt.  
     *   
     * Example: `await library_name.image.generate_image("your prompt")`
     * 
     * @param {string} prompt_name
     * @returns {Promise<{ image_rel_path: string }>}
    */
    async generate_image(prompt_name) {
        if (!this.#prop.token) throw 'Please login first.'
        return await (await https_fetch('https://plus.character.ai/chat/generate-image/', 'POST', {'Authorization': `Token ${this.#prop.token}`, 'Content-Type': 'application/json'}, JSON.stringify({'image_description':prompt_name}))).json()
    }
}

export default Image;
