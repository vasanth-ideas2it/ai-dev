import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ContactsService } from '../../../core/services/contacts.service';
import { CsvImportResult } from '../../../core/models/contact.models';

@Component({
  selector: 'app-contact-import',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
  ],
  templateUrl: './contact-import.component.html',
  styleUrl: './contact-import.component.scss',
})
export class ContactImportComponent {

  private readonly dialogRef = inject(MatDialogRef<ContactImportComponent>);
  private readonly contactsService = inject(ContactsService);

  selectedFile: File | null = null;
  uploading = false;
  result: CsvImportResult | null = null;
  error: string | null = null;
  isDragOver = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.setFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  private setFile(file: File): void {
    if (!file.name.endsWith('.csv')) {
      this.error = 'Only CSV files are supported.';
      return;
    }
    this.selectedFile = file;
    this.error = null;
    this.result = null;
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.error = null;
    this.contactsService.importContacts(this.selectedFile).subscribe({
      next: result => {
        this.result = result;
        this.uploading = false;
      },
      error: err => {
        this.error = err.error?.error?.message ?? 'Import failed. Check the CSV format.';
        this.uploading = false;
      },
    });
  }

  done(): void {
    this.dialogRef.close(!!this.result?.imported);
  }
}
