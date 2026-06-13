import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PipelinesState, pipelinesAdapter } from './pipelines.state';

export const selectPipelinesState = createFeatureSelector<PipelinesState>('pipelines');

const { selectAll, selectEntities } = pipelinesAdapter.getSelectors();

export const selectAllPipelines = createSelector(selectPipelinesState, selectAll);
export const selectPipelineEntities = createSelector(selectPipelinesState, selectEntities);

export const selectSelectedPipelineId = createSelector(
  selectPipelinesState,
  state => state.selectedId,
);

export const selectSelectedPipeline = createSelector(
  selectPipelineEntities,
  selectSelectedPipelineId,
  (entities, id) => (id ? (entities[id] ?? null) : null),
);

export const selectFirstPipeline = createSelector(
  selectAllPipelines,
  pipelines => pipelines[0] ?? null,
);

export const selectPipelinesLoading = createSelector(selectPipelinesState, state => state.loading);
export const selectPipelinesSaving = createSelector(selectPipelinesState, state => state.saving);
export const selectPipelinesError = createSelector(selectPipelinesState, state => state.error);
