import { createReducer, on } from '@ngrx/store';
import { PipelinesActions } from './pipelines.actions';
import { pipelinesAdapter, initialPipelinesState } from './pipelines.state';

export const pipelinesReducer = createReducer(
  initialPipelinesState,

  on(PipelinesActions.loadPipelines, state => ({ ...state, loading: true, error: null })),
  on(PipelinesActions.loadPipelinesSuccess, (state, { pipelines }) =>
    pipelinesAdapter.setAll(pipelines, { ...state, loading: false })),
  on(PipelinesActions.loadPipelinesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(PipelinesActions.loadPipelineSuccess, (state, { pipeline }) =>
    pipelinesAdapter.upsertOne(pipeline, { ...state, loading: false })),
  on(PipelinesActions.loadPipelineFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(PipelinesActions.replaceStages, state => ({ ...state, saving: true, error: null })),
  on(PipelinesActions.replaceStagesSuccess, (state, { pipeline }) =>
    pipelinesAdapter.updateOne({ id: pipeline.id, changes: pipeline }, { ...state, saving: false })),
  on(PipelinesActions.replaceStagesFailure, (state, { error }) => ({ ...state, saving: false, error })),

  on(PipelinesActions.selectPipeline, (state, { id }) => ({ ...state, selectedId: id })),
);
