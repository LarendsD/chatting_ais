class Notification {
    /**
     * @typedef {Object[]} NotificationInfo
     * @property {string} id
     * @property {string} channel
     * @property {string} sent_at
     * @property {string} title
     * @property {string} body
     * @property {string} user_status
     * @property {Object} payload
     * @property {string} payload.type
     * @property {string} payload.id
     * @property {string} payload.notification_id
    */
    
    /**
     * @typedef {Object[]} NotificationInfoV2
     * @property {string} id
     * @property {string} channel
     * @property {string} sent_at
     * @property {string} title
     * @property {string} body
     * @property {string} user_status
     * @property {Object} payload
     * @property {string} payload.type
     * @property {string} payload.id
     * @property {string} payload.notification_id
     * @property {Object} payload.extra_metadata
     * @property {string} next_cursor
    */

    #prop;
    constructor(prop) {
        this.#prop = prop;
    }

    /**
     * Get all of the history notification.  
     *   
     * Example: `await library_name.notification.history()`
     * 
     * @returns {Promise<NotificationInfo>}
     */
    async history() {
        if (!this.#prop.token) throw 'Please login first.';
        
        return await (await https_fetch('https://neo.character.ai/notifications/history', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json();
    }
    
    /**
     * Get all of the history notification (Version 2).  
     * In this Version 2, it has an extra metadata.  
     *   
     * Example: `await library_name.notification.history_v2()`
     * 
     * @returns {Promise<NotificationInfoV2>}
     */
    async history_v2() {
        if (!this.#prop.token) throw 'Please login first.';
        
        return await (await https_fetch('https://neo.character.ai/v2/notifications/history', 'GET', {
            'Authorization': `Token ${this.#prop.token}`
        })).json();
    }
}

export default Notification;
