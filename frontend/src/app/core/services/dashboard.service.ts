import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DashboardSummary, DealsByStage, RevenueForecast, DashboardData } from '../models/dashboard.models';
import { ActivityResponse } from '../models/contact.models';
import { TaskResponse } from '../models/deal.models';
import { PagedResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly api = inject(ApiService);

  getSummary(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/api/dashboard/summary');
  }

  getDealsByStage(pipelineId: string): Observable<DealsByStage[]> {
    return this.api.get<DealsByStage[]>('/api/dashboard/deals-by-stage', { pipelineId });
  }

  getRevenueForecast(): Observable<RevenueForecast[]> {
    return this.api.get<RevenueForecast[]>('/api/dashboard/revenue-forecast');
  }

  getRecentActivities(limit = 20): Observable<ActivityResponse[]> {
    return this.api.get<ActivityResponse[]>('/api/dashboard/recent-activities', { limit });
  }

  getOverdueTasks(size = 5): Observable<TaskResponse[]> {
    return this.api.get<TaskResponse[]>('/api/dashboard/overdue-tasks', { size });
  }

  loadAll(pipelineId: string): Observable<DashboardData> {
    return new Observable(observer => {
      forkJoin({
        summary: this.getSummary().pipe(catchError(() => of(null))),
        dealsByStage: this.getDealsByStage(pipelineId).pipe(catchError(() => of([]))),
        forecast: this.getRevenueForecast().pipe(catchError(() => of([]))),
        activities: this.getRecentActivities().pipe(catchError(() => of([]))),
        overdueTasks: this.getOverdueTasks().pipe(catchError(() => of([]))),
      }).subscribe({
        next: data => { observer.next(data as DashboardData); observer.complete(); },
        error: err => observer.error(err),
      });
    });
  }
}
