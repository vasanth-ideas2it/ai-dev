import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { routes } from './app.routes';
import { reducers } from './store';
import { AuthEffects } from './store/auth/auth.effects';
import { ContactsEffects } from './store/contacts/contacts.effects';
import { CompaniesEffects } from './store/companies/companies.effects';
import { DealsEffects } from './store/deals/deals.effects';
import { PipelinesEffects } from './store/pipelines/pipelines.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    provideStore(reducers),
    provideEffects([AuthEffects, ContactsEffects, CompaniesEffects, DealsEffects, PipelinesEffects]),
    provideRouterStore(),
  ],
};
