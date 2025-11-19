interface CharacterDetailedInfo {
  character: {
    id: number;
    external_id: string;
    name: string;
    participant__id: string;
    participant__name: string;
    participant__num_interactions: number;
    title: string;
    description: string;
    definition: string;
    sanitized_definition: string;
    greeting: string;
    user_id: number;
    voice_id: string | null;
    visibility: string;
    safety: string;
    archived: boolean | null;
    avatar_file_name: string;
    img_gen_enabled: boolean;
    base_img_prompt: string;
    img_gen_guidance_scale: string | null;
    user__username: string;
    is_persona: boolean;
    translations: object;
    default_voice_id: string;
    short_hash: string;
    identifier: string;
    img_prompt_regex: string;
    strip_img_prompt_from_msg: boolean;
    copyable: boolean;
    starter_prompts: { phrases: []; } | null;
    comments_enabled: boolean;
    updated: string;
    categories: [{
      name: string;
      priority: number;
      description: string;
    }];
  };
  status: string | undefined;
}

export default CharacterDetailedInfo;
