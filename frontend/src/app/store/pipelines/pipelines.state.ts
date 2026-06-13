import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { PipelineResponse } from '../../core/models/pipeline.models';

export interface PipelinesState extends EntityState<PipelineResponse> {
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedId: string | null;
}

export const pipelinesAdapter = createEntityAdapter<PipelineResponse>();

export const initialPipelinesState: PipelinesState = pipelinesAdapter.getInitialState({
  loading: false,
  saving: false,
  error: null,
  selectedId: null,
});
