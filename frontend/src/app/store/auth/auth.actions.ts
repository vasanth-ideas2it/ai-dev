import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserProfile } from '../../core/models/auth.models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string }>(),
    'Login Success': props<{ accessToken: string; refreshToken: string }>(),
    'Login Failure': props<{ error: string }>(),
    Logout: emptyProps(),
    'Load Current User': emptyProps(),
    'Load Current User Success': props<{ user: UserProfile }>(),
    'Load Current User Failure': props<{ error: string }>(),
  },
});
