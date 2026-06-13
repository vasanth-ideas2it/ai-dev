import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DealsByStage } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-deals-by-stage-chart',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule, NgChartsModule],
  templateUrl: './deals-by-stage-chart.component.html',
  styleUrl: './deals-by-stage-chart.component.scss',
})
export class DealsByStageChartComponent implements OnChanges {

  @Input() stages: DealsByStage[] = [];
  @Input() loading = false;

  chartData: ChartData<'bar'> = { labels: [], datasets: [] };

  readonly chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const stage = this.stages[ctx.dataIndex];
            return stage
              ? ` ${ctx.raw} deals · $${stage.totalValue.toLocaleString()}`
              : ` ${ctx.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: 'rgba(0,0,0,.06)' },
      },
      y: { grid: { display: false } },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stages']) this.rebuild();
  }

  private rebuild(): void {
    this.chartData = {
      labels: this.stages.map(s => s.stageName),
      datasets: [{
        data: this.stages.map(s => s.count),
        backgroundColor: [
          '#e8eaf6', '#c5cae9', '#9fa8da',
          '#7986cb', '#5c6bc0', '#3f51b5',
        ].slice(0, this.stages.length),
        borderColor: '#3f51b5',
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }
}
