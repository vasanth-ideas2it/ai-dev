import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PipelineResponse, PipelineStageResponse } from '../../../core/models/pipeline.models';
import { PipelinesActions } from '../../../store/pipelines/pipelines.actions';
import {
  selectAllPipelines,
  selectPipelinesLoading,
  selectPipelinesSaving,
  selectPipelinesError,
} from '../../../store/pipelines/pipelines.selectors';

interface EditableStage extends PipelineStageResponse {
  dirty?: boolean;
}

@Component({
  selector: 'app-pipeline-settings',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './pipeline-settings.component.html',
  styleUrl: './pipeline-settings.component.scss',
})
export class PipelineSettingsComponent implements OnInit {

  private readonly store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading$ = this.store.select(selectPipelinesLoading);
  readonly saving$ = this.store.select(selectPipelinesSaving);

  pipelines: PipelineResponse[] = [];
  selectedPipeline: PipelineResponse | null = null;
  stages: EditableStage[] = [];

  ngOnInit(): void {
    this.store.dispatch(PipelinesActions.loadPipelines());

    this.store.select(selectAllPipelines)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pipelines => {
        this.pipelines = pipelines;
        if (pipelines.length > 0 && !this.selectedPipeline) {
          this.selectPipeline(pipelines[0]);
        } else if (this.selectedPipeline) {
          const updated = pipelines.find(p => p.id === this.selectedPipeline!.id);
          if (updated) this.selectPipeline(updated);
        }
      });

    this.store.select(selectPipelinesError)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(error => {
        if (error) this.snackBar.open(error, 'Dismiss', { duration: 4000 });
      });

    this.store.select(selectPipelinesSaving)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(saving => {
        if (!saving && this.stages.some(s => s.dirty)) {
          this.snackBar.open('Pipeline saved', undefined, { duration: 2000 });
          this.stages = this.stages.map(s => ({ ...s, dirty: false }));
        }
      });
  }

  selectPipeline(pipeline: PipelineResponse): void {
    this.selectedPipeline = pipeline;
    this.stages = pipeline.stages.map(s => ({ ...s }));
  }

  onDrop(event: CdkDragDrop<EditableStage[]>): void {
    moveItemInArray(this.stages, event.previousIndex, event.currentIndex);
    this.stages = this.stages.map((s, i) => ({ ...s, stageOrder: i + 1, dirty: true }));
  }

  markDirty(index: number): void {
    this.stages[index] = { ...this.stages[index], dirty: true };
  }

  addStage(): void {
    const newStage: EditableStage = {
      id: '',
      name: 'New Stage',
      stageOrder: this.stages.length + 1,
      probability: 50,
      color: null,
      dirty: true,
    };
    this.stages = [...this.stages, newStage];
  }

  removeStage(index: number): void {
    this.stages = this.stages
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, stageOrder: i + 1, dirty: true }));
  }

  save(): void {
    if (!this.selectedPipeline) return;
    this.store.dispatch(PipelinesActions.replaceStages({
      id: this.selectedPipeline.id,
      request: {
        stages: this.stages.map(s => ({
          id: s.id || null,
          name: s.name,
          stageOrder: s.stageOrder,
          probability: s.probability,
          color: s.color,
        })),
      },
    }));
  }

  hasChanges(): boolean {
    return this.stages.some(s => s.dirty);
  }
}
