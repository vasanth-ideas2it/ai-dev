import { Component, DestroyRef, OnInit, inject, input } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DealsService } from '../../../core/services/deals.service';
import { ActivityResponse } from '../../../core/models/contact.models';
import { DealResponse, TaskResponse } from '../../../core/models/deal.models';
import { PipelineStageResponse } from '../../../core/models/pipeline.models';
import { DealsActions } from '../../../store/deals/deals.actions';
import { PipelinesActions } from '../../../store/pipelines/pipelines.actions';
import { selectSelectedDeal, selectDealsLoading } from '../../../store/deals/deals.selectors';
import { selectAllPipelines } from '../../../store/pipelines/pipelines.selectors';
import { ActivityTimelineComponent } from '../../contacts/activity-timeline/activity-timeline.component';
import { DealFormComponent } from '../deal-form/deal-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-deal-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ActivityTimelineComponent,
  ],
  templateUrl: './deal-detail.component.html',
  styleUrl: './deal-detail.component.scss',
})
export class DealDetailComponent implements OnInit {

  readonly id = input.required<string>();

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly dealsService = inject(DealsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly deal$ = this.store.select(selectSelectedDeal);
  readonly loading$ = this.store.select(selectDealsLoading);

  pipelineStages: PipelineStageResponse[] = [];
  activities: ActivityResponse[] = [];
  tasks: TaskResponse[] = [];
  activitiesLoading = false;

  ngOnInit(): void {
    const id = this.id();
    this.store.dispatch(DealsActions.selectDeal({ id }));
    this.store.dispatch(DealsActions.loadDeal({ id }));
    this.store.dispatch(PipelinesActions.loadPipelines());

    this.deal$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(deal => {
      if (deal) this.loadSideData(deal);
    });

    this.store.select(selectAllPipelines)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pipelines => {
        this.deal$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(deal => {
          if (deal && pipelines.length > 0) {
            const pipeline = pipelines.find(p => p.id === deal.pipelineId) ?? pipelines[0];
            this.pipelineStages = pipeline?.stages ?? [];
          }
        });
      });
  }

  private loadSideData(deal: DealResponse): void {
    if (this.activitiesLoading) return;
    this.activitiesLoading = true;
    this.dealsService.getDealActivities(deal.id).subscribe({
      next: acts => {
        this.activities = acts;
        this.activitiesLoading = false;
      },
      error: () => { this.activitiesLoading = false; },
    });

    this.dealsService.getDealTasks(deal.id).subscribe({
      next: tasks => this.tasks = tasks,
      error: () => {},
    });
  }

  stageIndex(deal: DealResponse): number {
    return this.pipelineStages.findIndex(s => s.id === deal.stageId);
  }

  openEdit(deal: DealResponse): void {
    const ref = this.dialog.open(DealFormComponent, {
      data: { deal },
      width: '580px',
    });
    ref.afterClosed().subscribe(request => {
      if (request) {
        this.store.dispatch(DealsActions.updateDeal({ id: deal.id, request }));
      }
    });
  }

  openDelete(deal: DealResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete deal',
        message: `Delete "${deal.title}"? This cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(DealsActions.deleteDeal({ id: deal.id }));
        this.router.navigate(['/app/deals']);
      }
    });
  }

  taskStatusIcon(status: string): string {
    return status === 'DONE' ? 'check_circle' : status === 'IN_PROGRESS' ? 'pending' : 'radio_button_unchecked';
  }

  taskStatusColor(status: string): string {
    return status === 'DONE' ? '#4caf50' : status === 'IN_PROGRESS' ? '#ff9800' : '#9e9e9e';
  }
}
