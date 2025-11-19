interface CharacterInformation {
  character: {
    external_id: string;
    title: string;
    name: string;
    visibility: string;
    copyable: string;
    greeting: string;
    description: string;
    identifier: string;
    avatar_file_name: string;
    songs: [];
    img_gen_enabled: boolean;
    base_img_prompt: string;
    img_prompt_regex: string;
    strip_img_prompt_from_msg: boolean;
    default_voice_id: string | undefined;
    starter_prompts: object | undefined;
  };
  phrases: string[] | undefined;
  user__username: string;
  participant__name: string;
  participant__num_interactions: number;
  participant__user__username: string;
  voice_id: string;
  usage: string;
  upvotes: string;
  status: string;
}

export default CharacterInformation;
