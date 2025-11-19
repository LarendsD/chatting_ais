interface UserPublicInfo {
  public_user: {
    characters: string[];
    username: string;
    name: string;
    num_following: number;
    num_followers: number;
    avatar_file_name: string;
    subscription_type: string;
    bio: string;
    creator_info: string | undefined;
  };
}

export default UserPublicInfo;
