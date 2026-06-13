import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ContactFilters, ContactRequest, ContactResponse } from '../../core/models/contact.models';
import { PageMeta } from '../../core/models/auth.models';

export const ContactsActions = createActionGroup({
  source: 'Contacts',
  events: {
    'Load Contacts': props<{ page?: number; size?: number; filters?: ContactFilters }>(),
    'Load Contacts Success': props<{ contacts: ContactResponse[]; pagination: PageMeta }>(),
    'Load Contacts Failure': props<{ error: string }>(),

    'Load Contact': props<{ id: string }>(),
    'Load Contact Success': props<{ contact: ContactResponse }>(),
    'Load Contact Failure': props<{ error: string }>(),

    'Create Contact': props<{ request: ContactRequest }>(),
    'Create Contact Success': props<{ contact: ContactResponse }>(),
    'Create Contact Failure': props<{ error: string }>(),

    'Update Contact': props<{ id: string; request: ContactRequest }>(),
    'Update Contact Success': props<{ contact: ContactResponse }>(),
    'Update Contact Failure': props<{ error: string }>(),

    'Delete Contact': props<{ id: string }>(),
    'Delete Contact Success': props<{ id: string }>(),
    'Delete Contact Failure': props<{ error: string }>(),

    'Select Contact': props<{ id: string | null }>(),
    'Set Filters': props<{ filters: ContactFilters }>(),
  },
});
