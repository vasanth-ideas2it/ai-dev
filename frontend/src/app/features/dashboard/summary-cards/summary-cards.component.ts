import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardSummary } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CurrencyPipe, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './summary-cards.component.html',
  styleUrl: './summary-cards.component.scss',
})
export class SummaryCardsComponent {
  @Input() summary: DashboardSummary | null = null;
  @Input() loading = false;
}
