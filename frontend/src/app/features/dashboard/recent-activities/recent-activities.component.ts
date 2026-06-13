import { Component, Input } from '@angular/core';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivityResponse, ActivityType } from '../../../core/models/contact.models';

const ICONS: Record<ActivityType, string> = {
  CALL: 'phone', EMAIL: 'email', NOTE: 'sticky_note_2',
  MEETING: 'event', STAGE_CHANGED: 'swap_horiz',
};
const COLORS: Record<ActivityType, string> = {
  CALL: '#3f51b5', EMAIL: '#e91e63', NOTE: '#ff9800',
  MEETING: '#4caf50', STAGE_CHANGED: '#9c27b0',
};

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [DatePipe, NgClass, TitleCasePipe, RouterLink, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './recent-activities.component.html',
  styleUrl: './recent-activities.component.scss',
})
export class RecentActivitiesComponent {
  @Input() activities: ActivityResponse[] = [];
  @Input() loading = false;

  icon(type: ActivityType): string  { return ICONS[type] ?? 'circle'; }
  color(type: ActivityType): string { return COLORS[type] ?? '#9e9e9e'; }
}
