interface UserLikedCharacter {
  characters: {
    external_id: string;
    title: string;
    description: string;
    greeting: string;
    avatar_file_name: string;
    visibility: string;
    copyable: boolean;
    definition: string;
    participant__name: string;
    user__id: string;
    user__username: string;
    img_gen_enabled: boolean;
    participant__num_interactions: number;
    upvotes: number;
  };
}

export default UserLikedCharacter;
