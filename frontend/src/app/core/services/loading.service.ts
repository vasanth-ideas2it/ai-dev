import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pendingCount = 0;
  private readonly loading = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.loading.asObservable();

  show(): void {
    if (++this.pendingCount === 1) {
      this.loading.next(true);
    }
  }

  hide(): void {
    if (this.pendingCount > 0 && --this.pendingCount === 0) {
      this.loading.next(false);
    }
  }
}
