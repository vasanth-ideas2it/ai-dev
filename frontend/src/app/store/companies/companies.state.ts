import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { CompanyFilters, CompanyResponse } from '../../core/models/company.models';
import { PageMeta } from '../../core/models/auth.models';

export interface CompaniesState extends EntityState<CompanyResponse> {
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  pagination: PageMeta | null;
  filters: CompanyFilters;
}

export const companiesAdapter = createEntityAdapter<CompanyResponse>();

export const initialCompaniesState: CompaniesState = companiesAdapter.getInitialState({
  selectedId: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {},
});
