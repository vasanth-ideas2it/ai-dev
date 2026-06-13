import { ActivityResponse } from './contact.models';

export type DealStatus = 'OPEN' | 'WON' | 'LOST';

export interface DealResponse {
  id: string;
  orgId: string;
  title: string;
  value: number | null;
  currency: string;
  probability: number | null;
  closeDate: string | null;
  status: DealStatus;
  stageId: string;
  stageName: string;
  pipelineId: string;
  pipelineName: string;
  contactId: string | null;
  contactName: string | null;
  companyId: string | null;
  companyName: string | null;
  ownerId: string | null;
  ownerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealRequest {
  title: string;
  value?: number | null;
  currency?: string;
  probability?: number | null;
  closeDate?: string | null;
  stageId: string;
  contactId?: string | null;
  companyId?: string | null;
  ownerId?: string | null;
}

export interface KanbanColumn {
  stageId: string;
  stageName: string;
  stageOrder: number;
  probability: number;
  deals: DealResponse[];
}

export interface DealFilters {
  search?: string;
  pipelineId?: string;
  stageId?: string;
  ownerId?: string;
}

export interface GetDealsParams {
  [key: string]: string | number | boolean | null | undefined;
  page?: number;
  size?: number;
  search?: string;
  pipelineId?: string;
  stageId?: string;
  ownerId?: string;
}

export interface TaskResponse {
  id: string;
  orgId: string;
  title: string;
  dueDate: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  contactId: string | null;
  dealId: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
}
