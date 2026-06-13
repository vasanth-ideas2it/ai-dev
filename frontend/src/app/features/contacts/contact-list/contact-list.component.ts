import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ContactResponse } from '../../../core/models/contact.models';
import { PageMeta } from '../../../core/models/auth.models';
import { ContactsActions } from '../../../store/contacts/contacts.actions';
import {
  selectAllContacts,
  selectContactsLoading,
  selectContactsPagination,
} from '../../../store/contacts/contacts.selectors';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { ContactImportComponent } from '../contact-import/contact-import.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    AsyncPipe,
    TitleCasePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
})
export class ContactListComponent implements OnInit {

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly contacts$: Observable<ContactResponse[]> = this.store.select(selectAllContacts);
  readonly loading$: Observable<boolean> = this.store.select(selectContactsLoading);
  readonly pagination$: Observable<PageMeta | null> = this.store.select(selectContactsPagination);

  readonly displayedColumns = ['avatar', 'name', 'email', 'phone', 'company', 'owner', 'actions'];
  readonly searchControl = new FormControl('');

  private currentSort = 'createdAt,desc';

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(search => {
      this.store.dispatch(ContactsActions.setFilters({ filters: { search: search ?? '' } }));
      this.load(0);
    });
  }

  ngOnInit(): void {
    this.load(0);
  }

  load(page: number, size = 20): void {
    const search = this.searchControl.value ?? '';
    this.store.dispatch(ContactsActions.loadContacts({
      page,
      size,
      filters: { search: search || undefined },
    }));
  }

  onSort(sort: Sort): void {
    this.currentSort = sort.active && sort.direction
      ? `${sort.active},${sort.direction}`
      : 'createdAt,desc';
    this.load(0);
  }

  onPage(event: PageEvent): void {
    this.load(event.pageIndex, event.pageSize);
  }

  onRowClick(contact: ContactResponse): void {
    this.router.navigate(['/app/contacts', contact.id]);
  }

  openCreate(): void {
    const ref = this.dialog.open(ContactFormComponent, {
      data: {},
      width: '560px',
    });
    ref.afterClosed().subscribe(request => {
      if (request) {
        this.store.dispatch(ContactsActions.createContact({ request }));
      }
    });
  }

  openEdit(event: Event, contact: ContactResponse): void {
    event.stopPropagation();
    const ref = this.dialog.open(ContactFormComponent, {
      data: { contact },
      width: '560px',
    });
    ref.afterClosed().subscribe(request => {
      if (request) {
        this.store.dispatch(ContactsActions.updateContact({ id: contact.id, request }));
      }
    });
  }

  openDelete(event: Event, contact: ContactResponse): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete contact',
        message: `Delete ${contact.firstName} ${contact.lastName ?? ''}? This cannot be undone.`,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(ContactsActions.deleteContact({ id: contact.id }));
      }
    });
  }

  openImport(): void {
    const ref = this.dialog.open(ContactImportComponent, { width: '520px' });
    ref.afterClosed().subscribe(imported => {
      if (imported) this.load(0);
    });
  }

  initials(contact: ContactResponse): string {
    return (
      (contact.firstName[0] ?? '') + (contact.lastName?.[0] ?? '')
    ).toUpperCase();
  }
}
