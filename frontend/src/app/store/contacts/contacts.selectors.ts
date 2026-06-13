import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ContactsState, contactsAdapter } from './contacts.state';

export const selectContactsState = createFeatureSelector<ContactsState>('contacts');

const { selectAll, selectEntities } = contactsAdapter.getSelectors();

export const selectAllContacts = createSelector(selectContactsState, selectAll);

export const selectContactEntities = createSelector(selectContactsState, selectEntities);

export const selectSelectedContactId = createSelector(
  selectContactsState,
  state => state.selectedId,
);

export const selectSelectedContact = createSelector(
  selectContactEntities,
  selectSelectedContactId,
  (entities, id) => (id ? (entities[id] ?? null) : null),
);

export const selectContactsLoading = createSelector(
  selectContactsState,
  state => state.loading,
);

export const selectContactsError = createSelector(
  selectContactsState,
  state => state.error,
);

export const selectContactsPagination = createSelector(
  selectContactsState,
  state => state.pagination,
);

export const selectContactFilters = createSelector(
  selectContactsState,
  state => state.filters,
);
