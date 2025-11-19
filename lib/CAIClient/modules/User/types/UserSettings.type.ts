interface UserSettings {
  default_persona_id: string | undefined;
  voiceOverrides: Record<string, string> | undefined;
  personaOverrides: Record<string, string> | undefined;
  voiceOverridesMigrated: boolean;
  proactiveDmOptedOut: boolean;
  outputStylePreferences: {
    bannedWords: Set<string>;
  } | null;
}

export default UserSettings;
