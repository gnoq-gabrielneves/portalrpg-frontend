export type AuthProfileSocialLink = {
  label: string;
  url: string;
};

export type AuthProfile = {
  _id?: string;
  avatarUrl?: string;
  bio?: string;
  displayName: string;
  favoriteSystem?: string;
  preferredSystems?: string[];
  socialLinks?: AuthProfileSocialLink[];
  userId?: string;
};

export type AuthUser = {
  email: string;
  id: string;
  profile: AuthProfile | null;
  role: string;
  status: string;
};

export type AuthSession = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  rememberAccess?: boolean;
  password: string;
};

export type LoginRequestPayload = Omit<LoginPayload, "rememberAccess">;

export type AuthContextType = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isIdleWarningOpen: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  stayActive: () => Promise<void>;
  updateSessionUser: (user: AuthUser) => void;
  user: AuthUser | null;
};
