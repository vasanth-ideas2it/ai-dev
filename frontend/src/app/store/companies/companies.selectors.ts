import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CompaniesState, companiesAdapter } from './companies.state';

export const selectCompaniesState = createFeatureSelector<CompaniesState>('companies');

const { selectAll, selectEntities } = companiesAdapter.getSelectors();

export const selectAllCompanies = createSelector(selectCompaniesState, selectAll);

export const selectCompanyEntities = createSelector(selectCompaniesState, selectEntities);

export const selectSelectedCompanyId = createSelector(
  selectCompaniesState,
  state => state.selectedId,
);

export const selectSelectedCompany = createSelector(
  selectCompanyEntities,
  selectSelectedCompanyId,
  (entities, id) => (id ? (entities[id] ?? null) : null),
);

export const selectCompaniesLoading = createSelector(
  selectCompaniesState,
  state => state.loading,
);

export const selectCompaniesError = createSelector(
  selectCompaniesState,
  state => state.error,
);

export const selectCompaniesPagination = createSelector(
  selectCompaniesState,
  state => state.pagination,
);

export const selectCompanyFilters = createSelector(
  selectCompaniesState,
  state => state.filters,
);
