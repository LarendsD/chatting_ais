interface UserPublicFollowInfo {
  users: {
    username: string;
    account__avatar_file_name: string;
    account__bio: string;
  };
  has_next_page: boolean;
}

export default UserPublicFollowInfo;
