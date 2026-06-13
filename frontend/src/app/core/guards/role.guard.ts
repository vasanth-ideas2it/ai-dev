import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectUserRole } from '../../store/auth/auth.selectors';

export const roleGuard: CanActivateFn = route => {
  const store = inject(Store);
  const router = inject(Router);
  const requiredRoles = (route.data['roles'] as string[]) ?? [];

  return store.select(selectUserRole).pipe(
    take(1),
    map(role => {
      if (!role || (requiredRoles.length > 0 && !requiredRoles.includes(role))) {
        return router.createUrlTree(['/app/dashboard']);
      }
      return true;
    }),
  );
};
