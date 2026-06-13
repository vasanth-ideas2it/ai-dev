import { UserProfile, UserRole } from '../../core/models/auth.models';

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};
