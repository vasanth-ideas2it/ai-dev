import { ActivityResponse } from './contact.models';
import { TaskResponse } from './deal.models';

export interface DashboardSummary {
  newContactsThisMonth: number;
  openDeals: number;
  totalDealValue: number;
  overdueTasksCount: number;
}

export interface DealsByStage {
  stageId: string;
  stageName: string;
  count: number;
  totalValue: number;
}

export interface RevenueForecast {
  month: string;      // "YYYY-MM"
  expected: number;
  weighted: number;
}

export interface DashboardData {
  summary: DashboardSummary | null;
  dealsByStage: DealsByStage[];
  forecast: RevenueForecast[];
  activities: ActivityResponse[];
  overdueTasks: TaskResponse[];
}
