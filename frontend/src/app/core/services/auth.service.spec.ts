import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── login ──────────────────────────────────────────────────────────────────

  it('login() POSTs credentials and returns unwrapped auth data', () => {
    const mock: AuthResponse = { accessToken: 'acc-tok', refreshToken: 'ref-tok' };
    let result: AuthResponse | undefined;

    service.login('user@test.com', 'pass123').subscribe(r => (result = r));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@test.com', password: 'pass123' });
    req.flush({ data: mock });

    expect(result).toEqual(mock);
  });

  it('login() propagates HTTP error to subscriber', () => {
    let errored = false;
    service.login('bad@test.com', 'wrong').subscribe({
      error: () => (errored = true),
    });

    httpMock
      .expectOne('/api/auth/login')
      .flush({ error: { message: 'Unauthorized' } }, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBeTrue();
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  it('logout() POSTs to /api/auth/logout with stored refresh token', () => {
    service.storeRefreshToken('my-ref-tok');
    service.logout().subscribe();

    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'my-ref-tok' });
    req.flush(null);
  });

  // ── refreshToken ───────────────────────────────────────────────────────────

  it('refreshToken() POSTs to /api/auth/refresh and returns new tokens', () => {
    const mock: AuthResponse = { accessToken: 'new-acc', refreshToken: 'new-ref' };
    service.storeRefreshToken('old-ref');
    let result: AuthResponse | undefined;

    service.refreshToken().subscribe(r => (result = r));

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    req.flush({ data: mock });

    expect(result).toEqual(mock);
  });

  // ── token management ───────────────────────────────────────────────────────

  it('setAccessToken / getAccessToken manage in-memory token', () => {
    expect(service.getAccessToken()).toBeNull();
    service.setAccessToken('tok');
    expect(service.getAccessToken()).toBe('tok');
  });

  it('storeRefreshToken / getRefreshToken use localStorage', () => {
    expect(service.getRefreshToken()).toBeNull();
    service.storeRefreshToken('ref');
    expect(service.getRefreshToken()).toBe('ref');
    expect(localStorage.getItem('crm_refresh_token')).toBe('ref');
  });

  it('clearTokens removes both access and refresh tokens', () => {
    service.setAccessToken('a');
    service.storeRefreshToken('r');
    service.clearTokens();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('hasValidToken returns false when no access token is set', () => {
    expect(service.hasValidToken()).toBeFalse();
  });

  it('hasValidToken returns true after setAccessToken', () => {
    service.setAccessToken('valid');
    expect(service.hasValidToken()).toBeTrue();
  });

  it('hasValidToken returns false after clearTokens', () => {
    service.setAccessToken('valid');
    service.clearTokens();
    expect(service.hasValidToken()).toBeFalse();
  });
});
