import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, withLatestFrom } from 'rxjs';
import { ContactsService } from '../../core/services/contacts.service';
import { ContactsActions } from './contacts.actions';
import { selectContactFilters, selectContactsPagination } from './contacts.selectors';

@Injectable()
export class ContactsEffects {

  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly contactsService = inject(ContactsService);

  loadContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContactsActions.loadContacts),
      switchMap(({ page, size, filters }) =>
        this.contactsService.getContacts({ page, size, ...filters }).pipe(
          map(result =>
            ContactsActions.loadContactsSuccess({
              contacts: result.content,
              pagination: result.meta,
            }),
          ),
          catchError(err =>
            of(ContactsActions.loadContactsFailure({ error: err.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  loadContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContactsActions.loadContact),
      switchMap(({ id }) =>
        this.contactsService.getContact(id).pipe(
          map(contact => ContactsActions.loadContactSuccess({ contact })),
          catchError(err =>
            of(ContactsActions.loadContactFailure({ error: err.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  createContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContactsActions.createContact),
      exhaustMap(({ request }) =>
        this.contactsService.createContact(request).pipe(
          map(contact => ContactsActions.createContactSuccess({ contact })),
          catchError(err =>
            of(ContactsActions.createContactFailure({ error: err.error?.error?.message ?? 'Create failed' })),
          ),
        ),
      ),
    ),
  );

  updateContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContactsActions.updateContact),
      exhaustMap(({ id, request }) =>
        this.contactsService.updateContact(id, request).pipe(
          map(contact => ContactsActions.updateContactSuccess({ contact })),
          catchError(err =>
            of(ContactsActions.updateContactFailure({ error: err.error?.error?.message ?? 'Update failed' })),
          ),
        ),
      ),
    ),
  );

  deleteContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ContactsActions.deleteContact),
      exhaustMap(({ id }) =>
        this.contactsService.deleteContact(id).pipe(
          map(() => ContactsActions.deleteContactSuccess({ id })),
          catchError(err =>
            of(ContactsActions.deleteContactFailure({ error: err.message ?? 'Delete failed' })),
          ),
        ),
      ),
    ),
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ContactsActions.createContactSuccess,
        ContactsActions.updateContactSuccess,
        ContactsActions.deleteContactSuccess,
      ),
      withLatestFrom(
        this.store.select(selectContactFilters),
        this.store.select(selectContactsPagination),
      ),
      map(([, filters, pagination]) =>
        ContactsActions.loadContacts({
          page: pagination?.page ?? 0,
          size: pagination?.size ?? 20,
          filters,
        }),
      ),
    ),
  );
}
