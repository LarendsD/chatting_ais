enum ChatModel {
  /**
   * Ролевая игра на платформе RatGPT (DeepSqueak)
   */
  DeepSynth = 'MODEL_TYPE_DEEP_SYNTH',
  /**
   * Ролевая игра на платформе Clawd (PipSqueak)
   */
  DeepSynthLite = 'MODEL_TYPE_DEEP_SYNTH_LITE',
  /**
   * Сочетание скорости и интеллекта (Roar)
   */
  Balanced = 'MODEL_TYPE_BALANCED',
  /**
   * Выбрать лучшее для меня (Dynamic)
   */
  Dynamic = 'MODEL_TYPE_DYNAMIC',
  /**
   * Острый ум, быстрые слова (Meow)
   */
  Fast = 'MODEL_TYPE_FAST',
  /**
   * Круто для лета (схуяли?) (Soft launch)
   */
  Romantic = 'MODEL_TYPE_ROMANTIC',
  /**
   * Менее остро (Goro)
   */
  FamilyFriendly = 'MODEL_TYPE_FAMILY_FRIENDLY',
  /**
   * Лучше владеет языками (Pawly)
   */
  Multilingual = 'MODEL_TYPE_MULTILINGUAL',
  /**
   * Интеллектуальный и более вдумчивый (Nyan)
   */
  Smart = 'MODEL_TYPE_SMART'
}

export default ChatModel;
