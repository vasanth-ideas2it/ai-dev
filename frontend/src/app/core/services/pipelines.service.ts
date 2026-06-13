import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PipelineResponse, PipelineStagesRequest } from '../models/pipeline.models';

@Injectable({ providedIn: 'root' })
export class PipelinesService {

  private readonly api = inject(ApiService);

  getPipelines(): Observable<PipelineResponse[]> {
    return this.api.get<PipelineResponse[]>('/api/pipelines');
  }

  getPipeline(id: string): Observable<PipelineResponse> {
    return this.api.get<PipelineResponse>(`/api/pipelines/${id}`);
  }

  replaceStages(id: string, req: PipelineStagesRequest): Observable<PipelineResponse> {
    return this.api.put<PipelineResponse>(`/api/pipelines/${id}/stages`, req);
  }
}
