export interface PipelineStageResponse {
  id: string;
  name: string;
  stageOrder: number;
  probability: number;
  color: string | null;
}

export interface PipelineResponse {
  id: string;
  orgId: string;
  name: string;
  stages: PipelineStageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStageRequest {
  id?: string | null;
  name: string;
  stageOrder: number;
  probability: number;
  color?: string | null;
}

export interface PipelineStagesRequest {
  stages: PipelineStageRequest[];
}
