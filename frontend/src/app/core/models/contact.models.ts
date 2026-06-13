import { PageMeta } from './auth.models';

export interface ContactResponse {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  label: string | null;
  companyId: string | null;
  companyName: string | null;
  ownerId: string | null;
  ownerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  label?: string | null;
  companyId?: string | null;
  ownerId?: string | null;
}

export interface ContactFilters {
  search?: string;
  ownerId?: string;
}

export interface GetContactsParams {
  [key: string]: string | number | boolean | null | undefined;
  page?: number;
  size?: number;
  search?: string;
  ownerId?: string;
  sort?: string;
}

export type ActivityType = 'CALL' | 'EMAIL' | 'NOTE' | 'MEETING' | 'STAGE_CHANGED';

export interface ActivityResponse {
  id: string;
  orgId: string;
  type: ActivityType;
  body: string | null;
  contactId: string | null;
  dealId: string | null;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CsvImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: string[];
}
