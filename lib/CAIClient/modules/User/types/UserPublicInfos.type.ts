interface UserPublicInfos {
  public_users: {
    username: string;
    account__avatar_file_name: string;
    character_info: {
      num_characters: number;
      num_interactions: number;
      top_1_char: {
        character_name: string;
        interactions: number;
        avatar_file_name: string;
        external_id: string;
      };
      top_2_char: {
        character_name: string;
        interactions: number;
        avatar_file_name: string;
        external_id: string;
      };
    };
  };
}

export default UserPublicInfos;