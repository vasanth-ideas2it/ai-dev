import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, withLatestFrom } from 'rxjs';
import { CompaniesService } from '../../core/services/companies.service';
import { CompaniesActions } from './companies.actions';
import { selectCompanyFilters, selectCompaniesPagination } from './companies.selectors';

@Injectable()
export class CompaniesEffects {

  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly companiesService = inject(CompaniesService);

  loadCompanies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.loadCompanies),
      switchMap(({ page, size, filters }) =>
        this.companiesService.getCompanies({ page, size, ...filters }).pipe(
          map(result =>
            CompaniesActions.loadCompaniesSuccess({
              companies: result.content,
              pagination: result.meta,
            }),
          ),
          catchError(err =>
            of(CompaniesActions.loadCompaniesFailure({ error: err.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  loadCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.loadCompany),
      switchMap(({ id }) =>
        this.companiesService.getCompany(id).pipe(
          map(company => CompaniesActions.loadCompanySuccess({ company })),
          catchError(err =>
            of(CompaniesActions.loadCompanyFailure({ error: err.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  createCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.createCompany),
      exhaustMap(({ request }) =>
        this.companiesService.createCompany(request).pipe(
          map(company => CompaniesActions.createCompanySuccess({ company })),
          catchError(err =>
            of(CompaniesActions.createCompanyFailure({
              error: err.error?.error?.message ?? 'Create failed',
            })),
          ),
        ),
      ),
    ),
  );

  updateCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.updateCompany),
      exhaustMap(({ id, request }) =>
        this.companiesService.updateCompany(id, request).pipe(
          map(company => CompaniesActions.updateCompanySuccess({ company })),
          catchError(err =>
            of(CompaniesActions.updateCompanyFailure({
              error: err.error?.error?.message ?? 'Update failed',
            })),
          ),
        ),
      ),
    ),
  );

  deleteCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.deleteCompany),
      exhaustMap(({ id }) =>
        this.companiesService.deleteCompany(id).pipe(
          map(() => CompaniesActions.deleteCompanySuccess({ id })),
          catchError(err =>
            of(CompaniesActions.deleteCompanyFailure({ error: err.message ?? 'Delete failed' })),
          ),
        ),
      ),
    ),
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CompaniesActions.createCompanySuccess,
        CompaniesActions.updateCompanySuccess,
        CompaniesActions.deleteCompanySuccess,
      ),
      withLatestFrom(
        this.store.select(selectCompanyFilters),
        this.store.select(selectCompaniesPagination),
      ),
      map(([, filters, pagination]) =>
        CompaniesActions.loadCompanies({
          page: pagination?.page ?? 0,
          size: pagination?.size ?? 20,
          filters,
        }),
      ),
    ),
  );
}
