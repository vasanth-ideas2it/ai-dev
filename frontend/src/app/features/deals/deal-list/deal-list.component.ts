import { Component, Input, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { DealResponse, DealFilters } from '../../../core/models/deal.models';
import { PageMeta } from '../../../core/models/auth.models';
import { DealsActions } from '../../../store/deals/deals.actions';
import {
  selectAllDeals,
  selectDealsLoading,
  selectDealsPagination,
  selectDealFilters,
} from '../../../store/deals/deals.selectors';
import { DealFormComponent } from '../deal-form/deal-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-deal-list',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './deal-list.component.html',
  styleUrl: './deal-list.component.scss',
})
export class DealListComponent implements OnInit {

  @Input() pipelineId: string | null = null;

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['title', 'value', 'stage', 'contact', 'closeDate', 'probability', 'actions'];
  readonly searchControl = new FormControl('');

  readonly deals$: Observable<DealResponse[]> = this.store.select(selectAllDeals);
  readonly loading$: Observable<boolean> = this.store.select(selectDealsLoading);
  readonly pagination$: Observable<PageMeta | null> = this.store.select(selectDealsPagination);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(search => {
      this.store.dispatch(DealsActions.setFilters({ filters: { search: search ?? undefined } }));
      this.load();
    });
  }

  ngOnInit(): void {
    this.load();
  }

  private load(page = 0, size = 20): void {
    const filters: DealFilters = {};
    if (this.pipelineId) filters.pipelineId = this.pipelineId;
    const search = this.searchControl.value;
    if (search) filters.search = search;
    this.store.dispatch(DealsActions.loadDeals({ page, size, filters }));
  }

  onPage(event: PageEvent): void {
    this.load(event.pageIndex, event.pageSize);
  }

  openDeal(deal: DealResponse): void {
    this.router.navigate(['/app/deals', deal.id]);
  }

  openEdit(deal: DealResponse, event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialog.open(DealFormComponent, {
      data: { deal },
      width: '560px',
    });
    ref.afterClosed().subscribe(request => {
      if (request) {
        this.store.dispatch(DealsActions.updateDeal({ id: deal.id, request }));
      }
    });
  }

  openDelete(deal: DealResponse, event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete deal',
        message: `Delete "${deal.title}"? This cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.store.dispatch(DealsActions.deleteDeal({ id: deal.id }));
    });
  }

  probClass(prob: number | null): string {
    if (prob == null) return '';
    if (prob >= 75) return 'prob-high';
    if (prob >= 40) return 'prob-mid';
    return 'prob-low';
  }
}
