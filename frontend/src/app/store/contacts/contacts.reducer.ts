import { createReducer, on } from '@ngrx/store';
import { ContactsActions } from './contacts.actions';
import { contactsAdapter, initialContactsState } from './contacts.state';

export const contactsReducer = createReducer(
  initialContactsState,

  on(ContactsActions.loadContacts, state => ({ ...state, loading: true, error: null })),
  on(ContactsActions.loadContactsSuccess, (state, { contacts, pagination }) =>
    contactsAdapter.setAll(contacts, { ...state, loading: false, pagination })),
  on(ContactsActions.loadContactsFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  on(ContactsActions.loadContactSuccess, (state, { contact }) =>
    contactsAdapter.upsertOne(contact, { ...state, loading: false })),
  on(ContactsActions.loadContactFailure, (state, { error }) => ({
    ...state, loading: false, error,
  })),

  on(ContactsActions.createContactSuccess, (state, { contact }) =>
    contactsAdapter.addOne(contact, state)),
  on(ContactsActions.createContactFailure, (state, { error }) => ({ ...state, error })),

  on(ContactsActions.updateContactSuccess, (state, { contact }) =>
    contactsAdapter.updateOne({ id: contact.id, changes: contact }, state)),
  on(ContactsActions.updateContactFailure, (state, { error }) => ({ ...state, error })),

  on(ContactsActions.deleteContactSuccess, (state, { id }) =>
    contactsAdapter.removeOne(id, state)),
  on(ContactsActions.deleteContactFailure, (state, { error }) => ({ ...state, error })),

  on(ContactsActions.selectContact, (state, { id }) => ({ ...state, selectedId: id })),

  on(ContactsActions.setFilters, (state, { filters }) => ({ ...state, filters })),
);
