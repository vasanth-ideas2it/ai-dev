import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ContactFilters, ContactResponse } from '../../core/models/contact.models';
import { PageMeta } from '../../core/models/auth.models';

export interface ContactsState extends EntityState<ContactResponse> {
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  pagination: PageMeta | null;
  filters: ContactFilters;
}

export const contactsAdapter = createEntityAdapter<ContactResponse>();

export const initialContactsState: ContactsState = contactsAdapter.getInitialState({
  selectedId: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {},
});
