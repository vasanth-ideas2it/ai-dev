import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'pipelines',
    pathMatch: 'full',
  },
  {
    path: 'pipelines',
    loadComponent: () =>
      import('./pipeline-settings/pipeline-settings.component').then(
        m => m.PipelineSettingsComponent,
      ),
  },
];
