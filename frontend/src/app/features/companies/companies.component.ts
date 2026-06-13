import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon mat-card-avatar>business</mat-icon>
        <mat-card-title>Companies</mat-card-title>
        <mat-card-subtitle>Manage your companies</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content><p>Companies list coming soon.</p></mat-card-content>
    </mat-card>
  `,
})
export class CompaniesComponent {}
