import { ActionReducerMap } from '@ngrx/store';
import { AuthState } from './auth/auth.state';
import { authReducer } from './auth/auth.reducer';
import { ContactsState } from './contacts/contacts.state';
import { contactsReducer } from './contacts/contacts.reducer';
import { CompaniesState } from './companies/companies.state';
import { companiesReducer } from './companies/companies.reducer';
import { DealsState } from './deals/deals.state';
import { dealsReducer } from './deals/deals.reducer';
import { PipelinesState } from './pipelines/pipelines.state';
import { pipelinesReducer } from './pipelines/pipelines.reducer';

export interface AppState {
  auth: AuthState;
  contacts: ContactsState;
  companies: CompaniesState;
  deals: DealsState;
  pipelines: PipelinesState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  contacts: contactsReducer,
  companies: companiesReducer,
  deals: dealsReducer,
  pipelines: pipelinesReducer,
};
