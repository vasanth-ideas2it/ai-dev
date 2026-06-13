import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon mat-card-avatar>monetization_on</mat-icon>
        <mat-card-title>Deals</mat-card-title>
        <mat-card-subtitle>Pipeline and deal management</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content><p>Deals kanban board coming soon.</p></mat-card-content>
    </mat-card>
  `,
})
export class DealsComponent {}
