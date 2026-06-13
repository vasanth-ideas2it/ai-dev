import { Routes } from '@angular/router';

export const dealsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./deals-page/deals-page.component').then(m => m.DealsPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./deal-detail/deal-detail.component').then(m => m.DealDetailComponent),
  },
];
