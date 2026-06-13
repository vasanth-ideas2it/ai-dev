import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  ActivityResponse,
  ContactRequest,
  ContactResponse,
  CsvImportResult,
  GetContactsParams,
} from '../models/contact.models';
import { ApiEnvelope, PagedResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class ContactsService {

  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  getContacts(params: GetContactsParams = {}): Observable<PagedResponse<ContactResponse>> {
    return this.api.get<PagedResponse<ContactResponse>>('/api/contacts', params);
  }

  getContact(id: string): Observable<ContactResponse> {
    return this.api.get<ContactResponse>(`/api/contacts/${id}`);
  }

  createContact(req: ContactRequest): Observable<ContactResponse> {
    return this.api.post<ContactResponse>('/api/contacts', req);
  }

  updateContact(id: string, req: ContactRequest): Observable<ContactResponse> {
    return this.api.put<ContactResponse>(`/api/contacts/${id}`, req);
  }

  deleteContact(id: string): Observable<void> {
    return this.api.delete<void>(`/api/contacts/${id}`);
  }

  importContacts(file: File): Observable<CsvImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiEnvelope<CsvImportResult>>('/api/contacts/import', formData)
      .pipe(map(r => r.data));
  }

  getContactActivities(contactId: string): Observable<ActivityResponse[]> {
    return this.api.get<ActivityResponse[]>(`/api/contacts/${contactId}/activities`);
  }
}
