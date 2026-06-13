import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskResponse } from '../../../core/models/deal.models';

@Component({
  selector: 'app-overdue-tasks',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './overdue-tasks.component.html',
  styleUrl: './overdue-tasks.component.scss',
})
export class OverdueTasksComponent {
  @Input() tasks: TaskResponse[] = [];
  @Input() loading = false;
  @Output() completeTask = new EventEmitter<string>();
}
