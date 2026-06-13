import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [AsyncPipe, MatProgressSpinnerModule],
  template: `
    @if (loading.isLoading$ | async) {
      <div class="spinner-overlay">
        <mat-spinner diameter="48" />
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
  `],
})
export class LoadingSpinnerComponent {
  protected readonly loading = inject(LoadingService);
}
