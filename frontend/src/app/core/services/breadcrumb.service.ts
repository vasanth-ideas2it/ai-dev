import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {

  private readonly breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs = this.breadcrumbs$.asObservable();

  set(crumbs: Breadcrumb[]): void {
    this.breadcrumbs$.next(crumbs);
  }

  reset(): void {
    this.breadcrumbs$.next([]);
  }
}
