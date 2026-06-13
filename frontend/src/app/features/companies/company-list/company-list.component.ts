import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { CompanyResponse } from '../../../core/models/company.models';
import { PageMeta } from '../../../core/models/auth.models';
import { CompaniesActions } from '../../../store/companies/companies.actions';
import {
  selectAllCompanies,
  selectCompaniesLoading,
  selectCompaniesPagination,
} from '../../../store/companies/companies.selectors';
import { CompanyFormComponent } from '../company-form/company-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
})
export class CompanyListComponent implements OnInit {

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly companies$: Observable<CompanyResponse[]> = this.store.select(selectAllCompanies);
  readonly loading$: Observable<boolean> = this.store.select(selectCompaniesLoading);
  readonly pagination$: Observable<PageMeta | null> = this.store.select(selectCompaniesPagination);

  readonly displayedColumns = ['icon', 'name', 'industry', 'website', 'phone', 'actions'];
  readonly searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(search => {
      this.store.dispatch(CompaniesActions.setFilters({ filters: { search: search ?? '' } }));
      this.load(0);
    });
  }

  ngOnInit(): void {
    this.load(0);
  }

  load(page: number, size = 20): void {
    const search = this.searchControl.value ?? '';
    this.store.dispatch(CompaniesActions.loadCompanies({
      page,
      size,
      filters: { search: search || undefined },
    }));
  }

  onSort(_sort: Sort): void { this.load(0); }

  onPage(event: PageEvent): void { this.load(event.pageIndex, event.pageSize); }

  onRowClick(company: CompanyResponse): void {
    this.router.navigate(['/app/companies', company.id]);
  }

  openCreate(): void {
    const ref = this.dialog.open(CompanyFormComponent, { data: {}, width: '520px' });
    ref.afterClosed().subscribe(request => {
      if (request) this.store.dispatch(CompaniesActions.createCompany({ request }));
    });
  }

  openEdit(event: Event, company: CompanyResponse): void {
    event.stopPropagation();
    const ref = this.dialog.open(CompanyFormComponent, { data: { company }, width: '520px' });
    ref.afterClosed().subscribe(request => {
      if (request) this.store.dispatch(CompaniesActions.updateCompany({ id: company.id, request }));
    });
  }

  openDelete(event: Event, company: CompanyResponse): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete company', message: `Delete "${company.name}"? This cannot be undone.` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.store.dispatch(CompaniesActions.deleteCompany({ id: company.id }));
    });
  }
}
