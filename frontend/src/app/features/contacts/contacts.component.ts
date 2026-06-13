import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon mat-card-avatar>contacts</mat-icon>
        <mat-card-title>Contacts</mat-card-title>
        <mat-card-subtitle>Manage your contacts</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content><p>Contacts list coming soon.</p></mat-card-content>
    </mat-card>
  `,
})
export class ContactsComponent {}
