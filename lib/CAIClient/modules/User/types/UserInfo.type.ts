interface UserInfo {
  user: {
    user: {
      username: string,
      id: number,
      first_name: string,
      account: {
        name: string,
        avatar_type: string,
        onboarding_complete: boolean,
        avatar_file_name: string,
        mobile_onboarding_complete: number,
      },
      is_staff: boolean,
      subscription: string | null,
      entitlements: unknown[]
    },
    is_human: boolean,
    name: string,
    email: string,
    date_joined: string,
    needs_to_acknowledge_policy: boolean,
    suspended_until: string | null,
    hidden_characters: unknown[],
    blocked_users: unknown[],
    bio: string | null,
    interests: string | null,
    date_of_birth: string
  }
}

export default UserInfo;
