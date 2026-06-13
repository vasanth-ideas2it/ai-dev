import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, withLatestFrom } from 'rxjs';
import { DealsService } from '../../core/services/deals.service';
import { DealsActions } from './deals.actions';
import { selectDealFilters, selectDealsPagination } from './deals.selectors';

@Injectable()
export class DealsEffects {

  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly dealsService = inject(DealsService);

  loadDeals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealsActions.loadDeals),
      switchMap(({ page, size, filters }) =>
        this.dealsService.getDeals({ page, size, ...filters }).pipe(
          map(result => DealsActions.loadDealsSuccess({ deals: result.content, pagination: result.meta })),
          catchError(err => of(DealsActions.loadDealsFailure({ error: err.message ?? 'Load failed' }))),
        ),
      ),
    ),
  );

  loadKanban$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealsActions.loadKanban),
      switchMap(({ pipelineId }) =>
        this.dealsService.getKanban(pipelineId).pipe(
          map(kanban => DealsActions.loadKanbanSuccess({ kanban })),
          catchError(err => of(DealsActions.loadKanbanFailure({ error: err.message ?? 'Load failed' }))),
        ),
      ),
    ),
  );

  loadDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealsActions.loadDeal),
      switchMap(({ id }) =>
        this.dealsService.getDeal(id).pipe(
          map(deal => DealsActions.loadDealSuccess({ deal })),
          catchError(err => of(DealsActions.loadDealFailure({ error: err.message ?? 'Load failed' }))),
        ),
      ),
    ),
  );

  createDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealsActions.createDeal),
      exhaustMap(({ request }) =>
        this.dealsService.createDeal(request).pipe(
          map(deal => DealsActions.createDealSuccess({ deal })),
          catchError(err =>
            of(DealsActions.createDealFailure({ error: err.error?.error?.message ?? 'Create failed' })),
          ),
        ),
      ),
    ),
  );

  updateDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealsActions.updateDeal),
      exhaustMap(({ id, request }) =>
        this.dealsService.updateDeal(id, request).pipe(
          map(deal => DealsActions.updateDealSuccess({ deal })),
          catchError(err =>
            of(DealsActions.updateDealFailure({ error: err.error?.error?.message ?? 'Update failed' })),
          ),
        ),
      ),
    ),
  );

  moveDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealsActions.moveDeal),
      exhaustMap(({ id, stageId, previousKanban }) =>
        this.dealsService.moveDeal(id, stageId).pipe(
          map(deal => DealsActions.moveDealSuccess({ deal })),
          catchError(err =>
            of(DealsActions.moveDealFailure({
              error: err.error?.error?.message ?? 'Move failed',
              previousKanban,
            })),
          ),
        ),
      ),
    ),
  );

  deleteDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealsActions.deleteDeal),
      exhaustMap(({ id }) =>
        this.dealsService.deleteDeal(id).pipe(
          map(() => DealsActions.deleteDealSuccess({ id })),
          catchError(err => of(DealsActions.deleteDealFailure({ error: err.message ?? 'Delete failed' }))),
        ),
      ),
    ),
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        DealsActions.createDealSuccess,
        DealsActions.updateDealSuccess,
        DealsActions.deleteDealSuccess,
      ),
      withLatestFrom(
        this.store.select(selectDealFilters),
        this.store.select(selectDealsPagination),
      ),
      map(([, filters, pagination]) =>
        DealsActions.loadDeals({
          page: pagination?.page ?? 0,
          size: pagination?.size ?? 20,
          filters,
        }),
      ),
    ),
  );
}
