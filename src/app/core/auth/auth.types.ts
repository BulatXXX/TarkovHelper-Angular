export type AuthUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  // refreshToken?: string; // если решишь хранить refresh в localStorage (не рекомендую)
};

export type AuthState =
  | { status: 'guest' }
  | { status: 'auth'; user: AuthUser; accessToken: string };


