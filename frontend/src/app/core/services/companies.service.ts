import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  CompanyRequest,
  CompanyResponse,
  GetCompaniesParams,
} from '../models/company.models';
import { PagedResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class CompaniesService {

  private readonly api = inject(ApiService);

  getCompanies(params: GetCompaniesParams = {}): Observable<PagedResponse<CompanyResponse>> {
    return this.api.get<PagedResponse<CompanyResponse>>('/api/companies', params);
  }

  getCompany(id: string): Observable<CompanyResponse> {
    return this.api.get<CompanyResponse>(`/api/companies/${id}`);
  }

  createCompany(req: CompanyRequest): Observable<CompanyResponse> {
    return this.api.post<CompanyResponse>('/api/companies', req);
  }

  updateCompany(id: string, req: CompanyRequest): Observable<CompanyResponse> {
    return this.api.put<CompanyResponse>(`/api/companies/${id}`, req);
  }

  deleteCompany(id: string): Observable<void> {
    return this.api.delete<void>(`/api/companies/${id}`);
  }
}
