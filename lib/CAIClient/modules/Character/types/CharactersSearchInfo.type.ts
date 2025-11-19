interface CharactersSearchInfo {
  characters: Array<{
    title: string;
    greeting: string;
    description: string;
    external_id: string;
    priority: number;
    avatar_file_name: string;
    visibility: string;
    tag_id: string;
    tag: string;
    created_at: number;
    updated_at: number;
    num_likes: number;
    num_interactions_last_day: number;
    score: number;
    participant__name: string;
    user__username: string;
    participant__num_interactions: number;
  }>;
  uuid: string;
  tags: Array<{
    id: string;
    name: string;
  }>;
  safety_filtered: boolean;
}

export default CharactersSearchInfo;
