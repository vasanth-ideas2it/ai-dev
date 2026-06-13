import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DealResponse, KanbanColumn } from '../../../core/models/deal.models';
import { PipelineResponse } from '../../../core/models/pipeline.models';
import { DealsActions } from '../../../store/deals/deals.actions';
import { selectKanban, selectKanbanLoading } from '../../../store/deals/deals.selectors';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    DragDropModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss',
})
export class KanbanBoardComponent implements OnInit, OnChanges {

  @Input({ required: true }) pipelineId!: string;
  @Input() pipeline: PipelineResponse | null = null;

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  kanban: KanbanColumn[] = [];

  ngOnInit(): void {
    this.store.select(selectKanbanLoading)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(l => this.loading = l);

    this.store.select(selectKanban)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(k => this.kanban = this.mergeWithPipeline(k));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pipelineId'] && this.pipelineId) {
      this.store.dispatch(DealsActions.loadKanban({ pipelineId: this.pipelineId }));
    }
    if (changes['pipeline']) {
      this.kanban = this.mergeWithPipeline(this.kanban);
    }
  }

  private mergeWithPipeline(kanban: KanbanColumn[]): KanbanColumn[] {
    if (!this.pipeline) return kanban;
    const kanbanMap = new Map(kanban.map(col => [col.stageId, col]));
    return this.pipeline.stages.map(stage => kanbanMap.get(stage.id) ?? {
      stageId: stage.id,
      stageName: stage.name,
      stageOrder: stage.stageOrder,
      probability: stage.probability,
      deals: [],
    });
  }

  onDrop(event: CdkDragDrop<DealResponse[]>, targetColumn: KanbanColumn): void {
    if (event.previousContainer === event.container) return;

    const deal = event.item.data as DealResponse;
    const previousKanban = this.kanban;

    const newKanban: KanbanColumn[] = this.kanban.map(col => {
      if (col.stageId === deal.stageId) {
        return { ...col, deals: col.deals.filter(d => d.id !== deal.id) };
      }
      if (col.stageId === targetColumn.stageId) {
        const newDeals = [...col.deals];
        newDeals.splice(event.currentIndex, 0, {
          ...deal,
          stageId: targetColumn.stageId,
          stageName: targetColumn.stageName,
          probability: targetColumn.probability,
        });
        return { ...col, deals: newDeals };
      }
      return col;
    });

    this.store.dispatch(DealsActions.updateKanbanOptimistic({ kanban: newKanban }));
    this.store.dispatch(DealsActions.moveDeal({
      id: deal.id,
      stageId: targetColumn.stageId,
      previousKanban,
    }));
  }

  openDeal(deal: DealResponse): void {
    this.router.navigate(['/app/deals', deal.id]);
  }

  columnTotal(deals: DealResponse[]): number {
    return deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  }

  probColor(probability: number): string {
    if (probability >= 75) return 'prob-high';
    if (probability >= 40) return 'prob-mid';
    return 'prob-low';
  }
}
