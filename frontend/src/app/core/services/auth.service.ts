import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiEnvelope, AuthResponse, UserProfile } from '../models/auth.models';

const REFRESH_TOKEN_KEY = 'crm_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private accessToken: string | null = null;

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<ApiEnvelope<AuthResponse>>('/api/auth/login', { email, password })
      .pipe(map(r => r.data));
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<void>('/api/auth/logout', { refreshToken });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<ApiEnvelope<AuthResponse>>('/api/auth/refresh', { refreshToken })
      .pipe(map(r => r.data));
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.http
      .get<ApiEnvelope<UserProfile>>('/api/auth/me')
      .pipe(map(r => r.data));
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  storeRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  hasValidToken(): boolean {
    return !!this.accessToken;
  }
}
