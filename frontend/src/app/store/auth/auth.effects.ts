import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {

  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(auth => {
            this.authService.setAccessToken(auth.accessToken);
            this.authService.storeRefreshToken(auth.refreshToken);
            return AuthActions.loginSuccess({
              accessToken: auth.accessToken,
              refreshToken: auth.refreshToken,
            });
          }),
          catchError(err =>
            of(AuthActions.loginFailure({
              error: err.error?.error?.message ?? 'Login failed. Check your credentials.',
            })),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/app/dashboard'])),
      map(() => AuthActions.loadCurrentUser()),
    ),
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map(user => AuthActions.loadCurrentUserSuccess({ user })),
          catchError(err =>
            of(AuthActions.loadCurrentUserFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout().subscribe({ error: () => {} });
          this.authService.clearTokens();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}
