interface CharacterAbout {
  about_character: {
    external_id: string;
    is_person_name: string;
    language: string;
    description: string;
    expertise: string;
    personality_question: string;
    personality_question_answer: string;
    slug: string;
    icebreakers: [];
    noindex: boolean;
  };
}

export default CharacterAbout;
