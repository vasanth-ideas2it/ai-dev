import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CompanyRequest, CompanyResponse } from '../../../core/models/company.models';

export interface CompanyFormDialogData {
  company?: CompanyResponse;
}

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss',
})
export class CompanyFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CompanyFormComponent>);
  readonly data = inject<CompanyFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data?.company;

  form = this.fb.nonNullable.group({
    name:     ['', Validators.required],
    industry: [''],
    website:  [''],
    phone:    [''],
    address:  [''],
  });

  ngOnInit(): void {
    if (this.data?.company) {
      const c = this.data.company;
      this.form.patchValue({
        name:     c.name,
        industry: c.industry  ?? '',
        website:  c.website   ?? '',
        phone:    c.phone     ?? '',
        address:  c.address   ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const request: CompanyRequest = {
      name:     raw.name,
      industry: raw.industry || null,
      website:  raw.website  || null,
      phone:    raw.phone    || null,
      address:  raw.address  || null,
    };
    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
