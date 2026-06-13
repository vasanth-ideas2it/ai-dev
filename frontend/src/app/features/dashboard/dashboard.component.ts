import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiEnvelope } from '../../core/models/auth.models';
import { DashboardData, DashboardSummary, DealsByStage, RevenueForecast } from '../../core/models/dashboard.models';
import { ActivityResponse } from '../../core/models/contact.models';
import { TaskResponse } from '../../core/models/deal.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { selectFirstPipeline } from '../../store/pipelines/pipelines.selectors';
import { PipelinesActions } from '../../store/pipelines/pipelines.actions';
import { SummaryCardsComponent } from './summary-cards/summary-cards.component';
import { DealsByStageChartComponent } from './deals-by-stage-chart/deals-by-stage-chart.component';
import { RevenueForecastChartComponent } from './revenue-forecast-chart/revenue-forecast-chart.component';
import { RecentActivitiesComponent } from './recent-activities/recent-activities.component';
import { OverdueTasksComponent } from './overdue-tasks/overdue-tasks.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatSnackBarModule,
    SummaryCardsComponent,
    DealsByStageChartComponent,
    RevenueForecastChartComponent,
    RecentActivitiesComponent,
    OverdueTasksComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  private readonly store = inject(Store);
  private readonly dashboardService = inject(DashboardService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  loading = true;
  summary: DashboardSummary | null = null;
  dealsByStage: DealsByStage[] = [];
  forecast: RevenueForecast[] = [];
  activities: ActivityResponse[] = [];
  overdueTasks: TaskResponse[] = [];

  ngOnInit(): void {
    this.store.dispatch(PipelinesActions.loadPipelines());

    this.store.select(selectFirstPipeline)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pipeline => {
        if (pipeline) this.loadAll(pipeline.id);
      });
  }

  private loadAll(pipelineId: string): void {
    this.loading = true;
    this.dashboardService.loadAll(pipelineId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: DashboardData) => {
          this.summary      = data.summary;
          this.dealsByStage = data.dealsByStage;
          this.forecast     = data.forecast;
          this.activities   = data.activities;
          this.overdueTasks = data.overdueTasks;
          this.loading      = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to load dashboard', 'Dismiss', { duration: 4000 });
        },
      });
  }

  onCompleteTask(taskId: string): void {
    this.http.put<ApiEnvelope<TaskResponse>>(`/api/tasks/${taskId}/complete`, {})
      .pipe(
        map(r => r.data),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(updated => {
        if (updated) {
          this.overdueTasks = this.overdueTasks.filter(t => t.id !== taskId);
          if (this.summary) {
            this.summary = {
              ...this.summary,
              overdueTasksCount: Math.max(0, this.summary.overdueTasksCount - 1),
            };
          }
        }
      });
  }
}
