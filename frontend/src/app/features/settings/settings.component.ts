import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon mat-card-avatar>settings</mat-icon>
        <mat-card-title>Settings</mat-card-title>
        <mat-card-subtitle>Account and organisation settings</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content><p>Settings page coming soon.</p></mat-card-content>
    </mat-card>
  `,
})
export class SettingsComponent {}
