import { Routes } from '@angular/router';

export const companiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./company-list/company-list.component').then(m => m.CompanyListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./company-detail/company-detail.component').then(m => m.CompanyDetailComponent),
  },
];
