import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';
import { PipelinesService } from '../../core/services/pipelines.service';
import { PipelinesActions } from './pipelines.actions';

@Injectable()
export class PipelinesEffects {

  private readonly actions$ = inject(Actions);
  private readonly pipelinesService = inject(PipelinesService);

  loadPipelines$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PipelinesActions.loadPipelines),
      switchMap(() =>
        this.pipelinesService.getPipelines().pipe(
          map(pipelines => PipelinesActions.loadPipelinesSuccess({ pipelines })),
          catchError(err =>
            of(PipelinesActions.loadPipelinesFailure({ error: err.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  loadPipeline$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PipelinesActions.loadPipeline),
      switchMap(({ id }) =>
        this.pipelinesService.getPipeline(id).pipe(
          map(pipeline => PipelinesActions.loadPipelineSuccess({ pipeline })),
          catchError(err =>
            of(PipelinesActions.loadPipelineFailure({ error: err.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  replaceStages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PipelinesActions.replaceStages),
      exhaustMap(({ id, request }) =>
        this.pipelinesService.replaceStages(id, request).pipe(
          map(pipeline => PipelinesActions.replaceStagesSuccess({ pipeline })),
          catchError(err =>
            of(PipelinesActions.replaceStagesFailure({
              error: err.error?.error?.message ?? 'Save failed',
            })),
          ),
        ),
      ),
    ),
  );
}
