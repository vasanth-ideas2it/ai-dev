import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { RevenueForecast } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-revenue-forecast-chart',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule, NgChartsModule],
  templateUrl: './revenue-forecast-chart.component.html',
  styleUrl: './revenue-forecast-chart.component.scss',
})
export class RevenueForecastChartComponent implements OnChanges {

  @Input() forecast: RevenueForecast[] = [];
  @Input() loading = false;

  chartData: ChartData<'line'> = { labels: [], datasets: [] };

  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: ctx => ` $${(ctx.raw as number).toLocaleString()} — ${ctx.dataset.label}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: val => '$' + (val as number).toLocaleString(),
        },
        grid: { color: 'rgba(0,0,0,.06)' },
      },
      x: { grid: { display: false } },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['forecast']) this.rebuild();
  }

  private rebuild(): void {
    const filled = this.ensureAllMonths(this.forecast);
    this.chartData = {
      labels: filled.map(f => this.formatMonth(f.month)),
      datasets: [
        {
          label: 'Expected',
          data: filled.map(f => f.expected),
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63,81,181,0.08)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
        {
          label: 'Weighted',
          data: filled.map(f => f.weighted),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76,175,80,0.08)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          borderDash: [5, 3],
        },
      ],
    };
  }

  private ensureAllMonths(data: RevenueForecast[]): RevenueForecast[] {
    const map = new Map(data.map(f => [f.month, f]));
    const result: RevenueForecast[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push(map.get(key) ?? { month: key, expected: 0, weighted: 0 });
    }
    return result;
  }

  private formatMonth(yyyyMM: string): string {
    const [y, m] = yyyyMM.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('en', { month: 'short', year: '2-digit' });
  }
}
