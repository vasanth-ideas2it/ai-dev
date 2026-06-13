import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authed = addToken(req, authService.getAccessToken());

  return next(authed).pipe(
    catchError(error => {
      if (error.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(auth => {
          authService.setAccessToken(auth.accessToken);
          authService.storeRefreshToken(auth.refreshToken);
          return next(addToken(req, auth.accessToken));
        }),
        catchError(refreshError => {
          authService.clearTokens();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function addToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token || !req.url.includes('/api/')) return req;
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/api/auth/login') || url.includes('/api/auth/refresh');
}
