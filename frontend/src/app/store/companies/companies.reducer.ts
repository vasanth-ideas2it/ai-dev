import { createReducer, on } from '@ngrx/store';
import { CompaniesActions } from './companies.actions';
import { companiesAdapter, initialCompaniesState } from './companies.state';

export const companiesReducer = createReducer(
  initialCompaniesState,

  on(CompaniesActions.loadCompanies, state => ({ ...state, loading: true, error: null })),
  on(CompaniesActions.loadCompaniesSuccess, (state, { companies, pagination }) =>
    companiesAdapter.setAll(companies, { ...state, loading: false, pagination })),
  on(CompaniesActions.loadCompaniesFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  on(CompaniesActions.loadCompanySuccess, (state, { company }) =>
    companiesAdapter.upsertOne(company, { ...state, loading: false })),
  on(CompaniesActions.loadCompanyFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  on(CompaniesActions.createCompanySuccess, (state, { company }) =>
    companiesAdapter.addOne(company, state)),
  on(CompaniesActions.createCompanyFailure, (state, { error }) => ({ ...state, error })),

  on(CompaniesActions.updateCompanySuccess, (state, { company }) =>
    companiesAdapter.updateOne({ id: company.id, changes: company }, state)),
  on(CompaniesActions.updateCompanyFailure, (state, { error }) => ({ ...state, error })),

  on(CompaniesActions.deleteCompanySuccess, (state, { id }) =>
    companiesAdapter.removeOne(id, state)),
  on(CompaniesActions.deleteCompanyFailure, (state, { error }) => ({ ...state, error })),

  on(CompaniesActions.selectCompany, (state, { id }) => ({ ...state, selectedId: id })),

  on(CompaniesActions.setFilters, (state, { filters }) => ({ ...state, filters })),
);
