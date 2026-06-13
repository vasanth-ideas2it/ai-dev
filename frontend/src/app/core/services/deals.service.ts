import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DealRequest, DealResponse, GetDealsParams, KanbanColumn, TaskResponse } from '../models/deal.models';
import { ActivityResponse } from '../models/contact.models';
import { PagedResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class DealsService {

  private readonly api = inject(ApiService);

  getDeals(params: GetDealsParams = {}): Observable<PagedResponse<DealResponse>> {
    return this.api.get<PagedResponse<DealResponse>>('/api/deals', params);
  }

  getKanban(pipelineId: string): Observable<KanbanColumn[]> {
    return this.api.get<KanbanColumn[]>('/api/deals/kanban', { pipelineId });
  }

  getDeal(id: string): Observable<DealResponse> {
    return this.api.get<DealResponse>(`/api/deals/${id}`);
  }

  createDeal(req: DealRequest): Observable<DealResponse> {
    return this.api.post<DealResponse>('/api/deals', req);
  }

  updateDeal(id: string, req: DealRequest): Observable<DealResponse> {
    return this.api.put<DealResponse>(`/api/deals/${id}`, req);
  }

  moveDeal(id: string, stageId: string): Observable<DealResponse> {
    return this.api.put<DealResponse>(`/api/deals/${id}/stage`, { stageId });
  }

  deleteDeal(id: string): Observable<void> {
    return this.api.delete<void>(`/api/deals/${id}`);
  }

  getDealActivities(id: string): Observable<ActivityResponse[]> {
    return this.api.get<ActivityResponse[]>(`/api/deals/${id}/activities`);
  }

  getDealTasks(id: string): Observable<TaskResponse[]> {
    return this.api.get<TaskResponse[]>('/api/tasks', { dealId: id, size: 50 });
  }
}
