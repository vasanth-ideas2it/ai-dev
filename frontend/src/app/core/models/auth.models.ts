export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'REP';

export interface ApiEnvelope<T> {
  data: T;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PagedResponse<T> {
  content: T[];
  meta: PageMeta;
}

export interface PageMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
