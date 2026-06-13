import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError(err => {
      const isAuthEndpoint = req.url.includes('/api/auth/login') ||
                             req.url.includes('/api/auth/register');

      if (err.status >= 400 && !isAuthEndpoint) {
        const message =
          err.error?.message ??
          (err.status === 404 ? 'Resource not found' :
           err.status === 403 ? 'Access denied' :
           err.status === 429 ? 'Too many requests — please slow down' :
           err.status >= 500 ? 'Server error — please try again later' :
           'An unexpected error occurred');

        snackBar.open(message, 'Dismiss', { duration: 4000 });
      }

      return throwError(() => err);
    })
  );
};
