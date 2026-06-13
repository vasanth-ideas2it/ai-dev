import { Component, OnInit, inject, input } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { CompanyResponse } from '../../../core/models/company.models';
import { CompaniesActions } from '../../../store/companies/companies.actions';
import {
  selectCompaniesLoading,
  selectSelectedCompany,
} from '../../../store/companies/companies.selectors';
import { CompanyFormComponent } from '../company-form/company-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss',
})
export class CompanyDetailComponent implements OnInit {

  readonly id = input.required<string>();

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly company$: Observable<CompanyResponse | null> = this.store.select(selectSelectedCompany);
  readonly loading$: Observable<boolean> = this.store.select(selectCompaniesLoading);

  ngOnInit(): void {
    const id = this.id();
    this.store.dispatch(CompaniesActions.selectCompany({ id }));
    this.store.dispatch(CompaniesActions.loadCompany({ id }));
  }

  openEdit(company: CompanyResponse): void {
    const ref = this.dialog.open(CompanyFormComponent, { data: { company }, width: '520px' });
    ref.afterClosed().subscribe(request => {
      if (request) this.store.dispatch(CompaniesActions.updateCompany({ id: company.id, request }));
    });
  }

  openDelete(company: CompanyResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete company', message: `Delete "${company.name}"? This cannot be undone.` },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(CompaniesActions.deleteCompany({ id: company.id }));
        this.router.navigate(['/app/companies']);
      }
    });
  }
}
