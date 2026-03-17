interface CreatedCharactersUserInfo {
  characters: {
    external_id: string;
    title: string;
    greeting: string;
    description: string;
    definition: string;
    avatar_file_name: string;
    visibility: string;
    copyable: boolean;
    participant__name: string;
    participant__num_interactions: number;
    user__id: number;
    user__username: string;
    img_gen_enabled: boolean;
    default_voice_id: string;
    remix_count: number;
    upvotes: number;
  };
}

export default CreatedCharactersUserInfo;
