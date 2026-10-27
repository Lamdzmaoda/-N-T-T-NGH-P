import type { User } from "./User";

export interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void

  signUp: (
    username: string,
    password: string,
    email: string,
    phone: string,
    full_name: string,
  ) => Promise<void>;

  signIn: (
    username: string,
    password: string,
  ) => Promise<void>;

  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}
