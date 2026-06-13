import { Component, OnInit, inject, input } from '@angular/core';
import { AsyncPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ContactsService } from '../../../core/services/contacts.service';
import { ActivityResponse, ContactResponse } from '../../../core/models/contact.models';
import { ContactsActions } from '../../../store/contacts/contacts.actions';
import {
  selectContactsLoading,
  selectSelectedContact,
} from '../../../store/contacts/contacts.selectors';
import { ActivityTimelineComponent } from '../activity-timeline/activity-timeline.component';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    UpperCasePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    ActivityTimelineComponent,
  ],
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent implements OnInit {

  readonly id = input.required<string>();

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly contactsService = inject(ContactsService);

  readonly contact$: Observable<ContactResponse | null> = this.store.select(selectSelectedContact);
  readonly loading$: Observable<boolean> = this.store.select(selectContactsLoading);

  activities: ActivityResponse[] = [];
  activitiesLoading = false;

  ngOnInit(): void {
    const id = this.id();
    this.store.dispatch(ContactsActions.selectContact({ id }));
    this.store.dispatch(ContactsActions.loadContact({ id }));
    this.loadActivities(id);
  }

  private loadActivities(id: string): void {
    this.activitiesLoading = true;
    this.contactsService.getContactActivities(id).subscribe({
      next: activities => {
        this.activities = activities;
        this.activitiesLoading = false;
      },
      error: () => { this.activitiesLoading = false; },
    });
  }

  openEdit(contact: ContactResponse): void {
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

  openDelete(contact: ContactResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete contact',
        message: `Delete ${contact.firstName} ${contact.lastName ?? ''}? This cannot be undone.`,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(ContactsActions.deleteContact({ id: contact.id }));
        this.router.navigate(['/app/contacts']);
      }
    });
  }
}
