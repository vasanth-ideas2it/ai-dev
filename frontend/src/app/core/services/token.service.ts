import { Injectable } from '@angular/core';

interface JwtPayload {
  sub: string;
  userId: string;
  orgId: string;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class TokenService {

  decode(token: string): JwtPayload {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  }

  isExpired(token: string): boolean {
    try {
      const { exp } = this.decode(token);
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  getRole(token: string): string {
    return this.decode(token).role;
  }

  getUserId(token: string): string {
    return this.decode(token).userId;
  }
}
