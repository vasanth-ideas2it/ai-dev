import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  {
    path: 'app',
    loadComponent: () =>
      import('./features/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'contacts',
        loadChildren: () =>
          import('./features/contacts/contacts.routes').then(m => m.contactsRoutes),
      },
      {
        path: 'companies',
        loadChildren: () =>
          import('./features/companies/companies.routes').then(m => m.companiesRoutes),
      },
      {
        path: 'deals',
        loadChildren: () =>
          import('./features/deals/deals.routes').then(m => m.dealsRoutes),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/tasks.component').then(m => m.TasksComponent),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.settingsRoutes),
      },
    ],
  },

  { path: '**', redirectTo: '/login' },
];
