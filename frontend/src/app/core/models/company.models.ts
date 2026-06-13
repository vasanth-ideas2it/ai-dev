export interface CompanyResponse {
  id: string;
  orgId: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRequest {
  name: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface CompanySummary {
  id: string;
  name: string;
}

export interface CompanyFilters {
  search?: string;
}

export interface GetCompaniesParams {
  [key: string]: string | number | boolean | null | undefined;
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}
