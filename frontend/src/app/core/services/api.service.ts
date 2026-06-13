import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiEnvelope } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: Record<string, string | number | boolean | null | undefined>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http
      .get<ApiEnvelope<T>>(url, { params: httpParams })
      .pipe(map(r => r.data));
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(url, body)
      .pipe(map(r => r.data));
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiEnvelope<T>>(url, body)
      .pipe(map(r => r.data));
  }

  delete<T>(url: string): Observable<T> {
    return this.http
      .delete<ApiEnvelope<T>>(url)
      .pipe(map(r => r.data));
  }
}
