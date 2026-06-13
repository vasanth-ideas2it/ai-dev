import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PipelineResponse } from '../../../core/models/pipeline.models';
import { PipelinesActions } from '../../../store/pipelines/pipelines.actions';
import { DealsActions } from '../../../store/deals/deals.actions';
import { selectAllPipelines, selectPipelinesLoading } from '../../../store/pipelines/pipelines.selectors';
import { KanbanBoardComponent } from '../kanban-board/kanban-board.component';
import { DealListComponent } from '../deal-list/deal-list.component';
import { DealFormComponent } from '../deal-form/deal-form.component';

@Component({
  selector: 'app-deals-page',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    KanbanBoardComponent,
    DealListComponent,
  ],
  templateUrl: './deals-page.component.html',
  styleUrl: './deals-page.component.scss',
})
export class DealsPageComponent implements OnInit {

  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly pipelines$ = this.store.select(selectAllPipelines);
  readonly pipelinesLoading$ = this.store.select(selectPipelinesLoading);

  pipelines: PipelineResponse[] = [];
  selectedPipeline: PipelineResponse | null = null;
  viewMode: 'kanban' | 'list' = 'kanban';

  ngOnInit(): void {
    this.store.dispatch(PipelinesActions.loadPipelines());

    this.pipelines$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(pipelines => {
      this.pipelines = pipelines;
      if (pipelines.length > 0 && !this.selectedPipeline) {
        this.selectedPipeline = pipelines[0];
      }
    });
  }

  onPipelineChange(pipeline: PipelineResponse): void {
    this.selectedPipeline = pipeline;
  }

  openCreate(): void {
    const ref = this.dialog.open(DealFormComponent, {
      data: { pipelineId: this.selectedPipeline?.id },
      width: '580px',
    });
    ref.afterClosed().subscribe(request => {
      if (request) {
        this.store.dispatch(DealsActions.createDeal({ request }));
        if (this.viewMode === 'kanban' && this.selectedPipeline) {
          this.store.dispatch(DealsActions.loadKanban({ pipelineId: this.selectedPipeline.id }));
        }
      }
    });
  }
}
