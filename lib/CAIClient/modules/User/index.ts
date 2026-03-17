import ClientProps from 'lib/CAIClient/types/ClientProps.type.js';
import UserInfo from './types/UserInfo.type.js';
import UserSettings from './types/UserSettings.type.js';
import UserPublicInfo from './types/UserPublicInfo.type.js';
import UserPublicInfos from './types/UserPublicInfos.type.js';
import StatusInfo from 'lib/CAIClient/types/StatusInfo.type.js';
import UserPublicFollowInfo from './types/UserPublicFollowInfo.js';
import UserLikedCharacter from './types/UserLikedCharacter.js';
import UserBirthdayStatus from './types/UserBirthdayStatus.type.js';
import CreatedCharactersUserInfo from './types/CreatedCharactersUserInfo.type.js';

class User {
  private prop: ClientProps;
  constructor(prop: ClientProps) {
    this.prop = prop
  }

  /**
   * Get current information account.  
  */
  get info(): UserInfo {
    return !this.prop.token ? (() => { throw 'Please login first.' })() : this.prop.user_data!;
  }

  /**
   * Get current settings account.  
   *   
   * Example: `console.log(library_name.user.settings)`
  */
  get settings(): UserSettings {
    return !this.prop.token ? (() => { throw 'Please login first.' })() : this.prop.user_settings!;
  }

  /**
   * Get user public information account.  
   *   
   * Example  
   * - Get someone public info: `await library_name.user.public_info("username")`  
   * - Get your own info: `await library_name.user.public_info()`
   * 
   * @param {string | undefined} username
   * @returns {Promise<UserPublicInfo>}
  */
  async public_info(username?: string): Promise<UserPublicInfo> {
    if (!this.prop.token) {
      throw 'Please login first.'
    };

    const response = await this.prop.httpCAIPlusInstance.post<UserPublicInfo>('/chat/user/public', {
      username: username ? username : this.prop.user_data!.user.user.username,
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  /**
   * Get user public information account. same like `public_info()`, but this function have less information.  
   * This function allow to fetch more than one usernames. Using array.
  */
  async public_info_array(usernames: Array<string> | string): Promise<UserPublicInfos> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    if (!usernames.length) {
      throw 'Parameter named \'usernames\' cannot be empty.';
    };

    const response = await this.prop.httpCAIPlusInstance.post<UserPublicInfos>('/chat/anon/users/public', {
      usernames: typeof usernames === 'string' ? [usernames] : usernames
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json',
      }
    })

    return response.data;
  }

  /**
   * Change current information account.  
   *   
   * Example: `library_name.user.change_info("username", "name", "avatar_rel_path", "bio")`  
   * - Warning: avatar_rel_path image link must be generated/uploaded to Character.AI server.
  */
  async change_info(username = '', name = '', avatar_rel_path = '', bio = ''): Promise<StatusInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    if (username) {
      this.prop.user_data!.user.user.username = username;
    }

    if (name) {
      this.prop.user_data!.user.user.account.name = name
    }

    if (avatar_rel_path) {
      this.prop.user_data!.user.user.account.avatar_file_name = avatar_rel_path
    }

    if (bio) {
      this.prop.user_data!.user.bio = bio
    }

    const response = await this.prop.httpCAIPlusInstance.post<StatusInfo>('/chat/user/update', {
      username: username && username !== this.prop.user_data!.user.user.username ? username : this.prop.user_data!.user.user.username,
      'name': name && name !== this.prop.user_data!.user.user.account.name ? name : this.prop.user_data!.user.user.account.name,
      'avatar_type': 'UPLOADED',
      'avatar_rel_path': avatar_rel_path && avatar_rel_path !== this.prop.user_data!.user.user.account.avatar_file_name ? 
        avatar_rel_path : 
        this.prop.user_data!.user.user.account.avatar_file_name,
      'bio': bio && bio !== this.prop.user_data!.user.bio ? bio : this.prop.user_data!.user.bio
    })

    return response.data;
  }

  /**
   * Refresh settings. also it will returns the current of the settings.  
   * no need to do `library_name.user.settings` after call this function.  
   *   
   * Example: `await library_name.user.refresh_settings()`
  */
  async refresh_settings(): Promise<UserSettings> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAIPlusInstance.get<UserSettings>('/chat/user/settings/', {
      headers: {
        Authorization: `Token ${this.prop.token}`,
      }
    });

    this.prop.user_settings = response.data;

    this.prop.user_settings!.outputStylePreferences = {
      bannedWords: new Set(
        Array.isArray(this.prop.user_settings.outputStylePreferences?.bannedWords) ? 
          this.prop.user_settings.outputStylePreferences.bannedWords : 
          []
      ),
    };

    return this.prop.user_settings
  }

  /**
   * Update user settings by your own settings.  
   *   
   * Example: `await library_name.user.change_settings()`
  */
  async update_settings(settings_object: Partial<UserSettings>): Promise<UserSettings> {
    if (!this.prop.token) {
      throw 'Please login first.'
    };

    const response = await this.prop.httpCAIPlusInstance.post<UserSettings>('/chat/user/update_settings', settings_object, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    });

    await this.refresh_settings();

    return response.data;
  }

  /**
   * Get public user following list.  
   *   
   * Example  
   * - Get someone public user following list: `await library_name.user.public_following_list("Username", page_param)`  
   * - Get your own user following list: `await library_name.user.public_following_list("", page_param)`
  */
  async public_following_list(username?: string, page_param = 1): Promise<UserPublicFollowInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAIPlusInstance.post<UserPublicFollowInfo>('/chat/user/public/following', {
      username: username ? username : this.prop.user_data!.user.user.username, 
      pageParam: page_param
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    });
  
    return response.data;
  }

  /**
   * Check are you following this user account or not.  
   *   
   * Example: `await library_name.user.following_check("Username")`
   */
  async following_check(username: string): Promise<{followStatus: Record<string, boolean>}> {
    if (!this.prop.token) {
      throw 'Please login first.'
    };

    const response = await this.prop.httpCAINeoInstance.post('/external/users/following/check', {
      usernames_to_check: [username]
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      },
    })

    return response.data;
  }

  /**
   * Get public user followers list.  
   *   
   * Example  
   * - Get someone public user followers list: `await library_name.user.public_followers_list("Username", page_param)`  
   * - Get your own user followers list: `await library_name.user.public_followers_list("", page_param)`
  */
  async public_followers_list(username?: string, page_param = 1): Promise<UserPublicFollowInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAIPlusInstance.post<UserPublicFollowInfo>('/chat/user/public/followers', {
      username: username ? username : this.prop.user_data!.user.user.username,
      'pageParam': page_param,
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  /**
   * Get account following name list.  
   *   
   * Example: `await library_name.user.following_list_name()`
  */
  async following_list_name(): Promise<{following: string[]}> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAIPlusInstance.get('/chat/user/following', {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      },
    });

    return response.data;
  }

  /**
   * Get account followers name list.  
   *   
   * Example: `await library_name.user.followers_list_name()`
  */
  async followers_list_name(): Promise<{following: string[]}> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAIPlusInstance.get('/chat/user/followers', {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      },
    });
    
    return response.data;
  }

  /**
   * Follow user account.  
   *   
   * Example: `await library_name.user.follow("Username")`
   * 
   * @param {string} username
   * @returns {Promise<StatusInfo>}
  */
  async follow(username: string): Promise<StatusInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAIPlusInstance.post<StatusInfo>('/chat/user/follow', {
      username,
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      },
    });

    return response.data;
  }

  /**
   * Unfollow user account.  
   *   
   * Example: `await library_name.user.unfollow("Username")`
  */
  async unfollow(username: string): Promise<StatusInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAIPlusInstance.post<StatusInfo>('/chat/user/unfollow', {
      username,
    }, {
      headers: {
        Authorization: `Token ${this.prop.token}`,
        'Content-Type': 'application/json'
      },
    });

    return response.data;
  }

  /**
   * Get account liked character list.  
   *   
   * Example: `await library_name.user.liked_character_list()`
  */
  async liked_character_list(): Promise<UserLikedCharacter> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAIPlusInstance.get<UserLikedCharacter>('/chat/user/characters/upvoted', {
      headers: {
        Authorization: `Token ${this.prop.token}`,
      },
    });

    return response.data;
  }

  /**
   * Add muted words.  
   *   
   * Example  
   * - Using array: `await library_name.user.add_muted_words(["hello", "world"])`  
   * - Using string: `await library_name.user.add_muted_words("hello world")`
  */
  async add_muted_words(words: string | string[]): Promise<UserSettings> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    if (Array.isArray(words)) {
      for (let a = 0; a < words.length; a++) {
        if (!words[a]) {
          throw `word at index ${a} cannot be empty.`;
        }

        if (words[a].includes(' ')) {
          throw `this word ('${words[a]}') must be single word.`;
        };

        this.prop.user_settings!.outputStylePreferences!.bannedWords.add(words[a])
      }
    } else {
      words = words.split(' ');

      for (let a = 0; a < words.length; a++) {
        if (!words[a]) {
          throw `word at index ${a} cannot be empty.`;
        }

        this.prop.user_settings!.outputStylePreferences!.bannedWords.add(words[a])
      }
    }

    return this.update_settings({
      outputStylePreferences: {
        bannedWords: new Set([...this.prop.user_settings!.outputStylePreferences!.bannedWords ?? []]),
      }
    });
  }

  /**
   * Remove muted word.  
   *   
   * Example  
   * - Using array: `await library_name.user.remove_muted_word(["hello", "world"])`  
   * - Using string: `await library_name.user.remove_muted_word("hello world")`
  */
  async remove_muted_words(words: string | string[]): Promise<UserSettings> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    if (Array.isArray(words)) {
      for (let a = 0; a < words.length; a++) {
        if (!words[a]) {
          throw `word at index ${a} cannot be empty.`;
        }

        if (words[a].includes(' ')) {
          throw `this word ('${words[a]}') must be single word.`
        };

        this.prop.user_settings!.outputStylePreferences!.bannedWords.delete(words[a])
      }
    } else {
      words = words.split(' ');
      for (let a = 0; a < words.length; a++) {
        if (!words[a]) {
          throw `word at index ${a} cannot be empty.`;
        };

        this.prop.user_settings!.outputStylePreferences!.bannedWords.delete(words[a])
      }
    }

    return await this.update_settings({
      'outputStylePreferences': {
        bannedWords: new Set([...this.prop.user_settings!.outputStylePreferences!.bannedWords]),
      }
    });
  }

  /**
   * Clear muted words.  
   *   
   * Example: `await library_name.user.clear_muted_words()`
  */
  async clear_muted_words(): Promise<UserSettings> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    return await this.update_settings({ outputStylePreferences: { bannedWords: new Set() } })
  }

  /** 
   * check if the user age meets agreement (17+ i guess?)  
   *   
   * Example: `await library_name.user.birthday_status()`
   */
  async birthday_status(): Promise<UserBirthdayStatus> {
    if (!this.prop.token) {
      throw 'Please login first.';
    }

    const response = await this.prop.httpCAIPlusInstance.get<UserBirthdayStatus>('/chat/user/get-user-birthday-status', {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    })

    return response.data;
  }

  /**
   * Get all list characters created by this current user.  
   *   
   * Example: `await library_name.user.get_characters_created()`
   */
  async get_characters_created(): Promise<CreatedCharactersUserInfo> {
    if (!this.prop.token) {
      throw 'Please login first.';
    };

    const response = await this.prop.httpCAINeoInstance.get<CreatedCharactersUserInfo>('/character/v1/get_characters_created_by_user', {
      headers: {
        Authorization: `Token ${this.prop.token}`
      }
    });

    return response.data;
  }
}

export default User;
