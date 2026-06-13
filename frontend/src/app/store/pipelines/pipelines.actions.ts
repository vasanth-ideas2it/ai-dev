import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PipelineResponse, PipelineStagesRequest } from '../../core/models/pipeline.models';

export const PipelinesActions = createActionGroup({
  source: 'Pipelines',
  events: {
    'Load Pipelines': emptyProps(),
    'Load Pipelines Success': props<{ pipelines: PipelineResponse[] }>(),
    'Load Pipelines Failure': props<{ error: string }>(),

    'Load Pipeline': props<{ id: string }>(),
    'Load Pipeline Success': props<{ pipeline: PipelineResponse }>(),
    'Load Pipeline Failure': props<{ error: string }>(),

    'Replace Stages': props<{ id: string; request: PipelineStagesRequest }>(),
    'Replace Stages Success': props<{ pipeline: PipelineResponse }>(),
    'Replace Stages Failure': props<{ error: string }>(),

    'Select Pipeline': props<{ id: string | null }>(),
  },
});
