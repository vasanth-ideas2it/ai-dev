import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon mat-card-avatar>task_alt</mat-icon>
        <mat-card-title>Tasks</mat-card-title>
        <mat-card-subtitle>Track your to-dos</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content><p>Task list coming soon.</p></mat-card-content>
    </mat-card>
  `,
})
export class TasksComponent {}
