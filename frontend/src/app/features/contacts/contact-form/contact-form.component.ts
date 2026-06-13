import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, map, startWith } from 'rxjs';
import { CompaniesService } from '../../../core/services/companies.service';
import { ContactRequest, ContactResponse } from '../../../core/models/contact.models';
import { CompanySummary } from '../../../core/models/company.models';

export interface ContactFormDialogData {
  contact?: ContactResponse;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ContactFormComponent>);
  private readonly companiesService = inject(CompaniesService);
  readonly data = inject<ContactFormDialogData>(MAT_DIALOG_DATA);

  companies$: Observable<CompanySummary[]> = this.companiesService
    .getCompanies({ size: 200 })
    .pipe(map(r => r.content.map(c => ({ id: c.id, name: c.name }))));

  readonly isEdit = !!this.data?.contact;

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName:  [''],
    email:     ['', Validators.email],
    phone:     [''],
    label:     [''],
    notes:     [''],
    companyId: [''],
    ownerId:   [''],
  });

  ngOnInit(): void {
    if (this.data?.contact) {
      const c = this.data.contact;
      this.form.patchValue({
        firstName: c.firstName,
        lastName:  c.lastName  ?? '',
        email:     c.email     ?? '',
        phone:     c.phone     ?? '',
        label:     c.label     ?? '',
        notes:     c.notes     ?? '',
        companyId: c.companyId ?? '',
        ownerId:   c.ownerId   ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const request: ContactRequest = {
      firstName: raw.firstName,
      lastName:  raw.lastName  || null,
      email:     raw.email     || null,
      phone:     raw.phone     || null,
      label:     raw.label     || null,
      notes:     raw.notes     || null,
      companyId: raw.companyId || null,
      ownerId:   raw.ownerId   || null,
    };
    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
