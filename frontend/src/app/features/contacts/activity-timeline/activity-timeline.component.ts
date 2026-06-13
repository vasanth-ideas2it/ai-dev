import { Component, Input } from '@angular/core';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ActivityResponse, ActivityType } from '../../../core/models/contact.models';

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  CALL: 'phone',
  EMAIL: 'email',
  NOTE: 'sticky_note_2',
  MEETING: 'event',
  STAGE_CHANGED: 'swap_horiz',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  CALL: 'icon-call',
  EMAIL: 'icon-email',
  NOTE: 'icon-note',
  MEETING: 'icon-meeting',
  STAGE_CHANGED: 'icon-stage',
};

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [DatePipe, NgClass, TitleCasePipe, MatIconModule, MatDividerModule],
  templateUrl: './activity-timeline.component.html',
  styleUrl: './activity-timeline.component.scss',
})
export class ActivityTimelineComponent {
  @Input() activities: ActivityResponse[] = [];

  iconFor(type: ActivityType): string {
    return ACTIVITY_ICONS[type] ?? 'circle';
  }

  colorClassFor(type: ActivityType): string {
    return ACTIVITY_COLORS[type] ?? '';
  }
}
