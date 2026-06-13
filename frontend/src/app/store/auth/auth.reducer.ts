import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, state => ({
    ...state, loading: true, error: null,
  })),

  on(AuthActions.loginSuccess, (state, { accessToken }) => ({
    ...state, accessToken, loading: false, error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  on(AuthActions.logout, () => initialAuthState),

  on(AuthActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state, user,
  })),

  on(AuthActions.loadCurrentUserFailure, (state, { error }) => ({
    ...state, error,
  })),
);
