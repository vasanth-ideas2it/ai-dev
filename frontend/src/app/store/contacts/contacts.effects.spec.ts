import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ContactsEffects } from './contacts.effects';
import { ContactsService } from '../../core/services/contacts.service';
import { ContactsActions } from './contacts.actions';
import { ContactFilters, ContactResponse } from '../../core/models/contact.models';
import { PageMeta, PagedResponse } from '../../core/models/auth.models';

const mockContact: ContactResponse = {
  id: 'c1',
  orgId: 'o1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@test.com',
  phone: null,
  notes: null,
  label: null,
  companyId: null,
  companyName: null,
  ownerId: null,
  ownerName: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockMeta: PageMeta = { page: 0, size: 20, total: 1, totalPages: 1 };
const mockPaged: PagedResponse<ContactResponse> = { content: [mockContact], meta: mockMeta };

const initialContactsState = {
  ids: [] as string[],
  entities: {} as Record<string, ContactResponse>,
  selectedId: null,
  loading: false,
  error: null,
  pagination: mockMeta,
  filters: {} as ContactFilters,
};

describe('ContactsEffects', () => {
  let effects: ContactsEffects;
  let actions$: Observable<Action>;
  let store: MockStore;
  let contactsService: jasmine.SpyObj<ContactsService>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj<ContactsService>('ContactsService', [
      'getContacts',
      'getContact',
      'createContact',
      'updateContact',
      'deleteContact',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ContactsEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { contacts: initialContactsState } }),
        { provide: ContactsService, useValue: serviceSpy },
      ],
    });

    effects = TestBed.inject(ContactsEffects);
    store = TestBed.inject(MockStore);
    contactsService = TestBed.inject(ContactsService) as jasmine.SpyObj<ContactsService>;
  });

  // ── loadContacts$ ──────────────────────────────────────────────────────────

  describe('loadContacts$', () => {
    it('dispatches loadContactsSuccess with contacts and pagination on success', done => {
      contactsService.getContacts.and.returnValue(of(mockPaged));
      actions$ = of(ContactsActions.loadContacts({ page: 0, size: 20, filters: {} }));

      effects.loadContacts$.subscribe(action => {
        expect(action).toEqual(
          ContactsActions.loadContactsSuccess({ contacts: [mockContact], pagination: mockMeta }),
        );
        done();
      });
    });

    it('dispatches loadContactsFailure with error message on HTTP error', done => {
      contactsService.getContacts.and.returnValue(
        throwError(() => new Error('Network error')),
      );
      actions$ = of(ContactsActions.loadContacts({ page: 0, size: 20, filters: {} }));

      effects.loadContacts$.subscribe(action => {
        expect(action).toEqual(
          ContactsActions.loadContactsFailure({ error: 'Network error' }),
        );
        done();
      });
    });
  });

  // ── createContact$ ─────────────────────────────────────────────────────────

  describe('createContact$', () => {
    it('dispatches createContactSuccess on success', done => {
      contactsService.createContact.and.returnValue(of(mockContact));
      actions$ = of(
        ContactsActions.createContact({
          request: { firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' },
        }),
      );

      effects.createContact$.subscribe(action => {
        expect(action).toEqual(ContactsActions.createContactSuccess({ contact: mockContact }));
        done();
      });
    });

    it('dispatches createContactFailure on error', done => {
      contactsService.createContact.and.returnValue(
        throwError(() => ({ error: { error: { message: 'Conflict' } } })),
      );
      actions$ = of(ContactsActions.createContact({ request: { firstName: 'Alice' } }));

      effects.createContact$.subscribe(action => {
        expect(action).toEqual(
          ContactsActions.createContactFailure({ error: 'Conflict' }),
        );
        done();
      });
    });
  });

  // ── deleteContact$ ─────────────────────────────────────────────────────────

  describe('deleteContact$', () => {
    it('dispatches deleteContactSuccess with id on success', done => {
      contactsService.deleteContact.and.returnValue(of(undefined as any));
      actions$ = of(ContactsActions.deleteContact({ id: 'c1' }));

      effects.deleteContact$.subscribe(action => {
        expect(action).toEqual(ContactsActions.deleteContactSuccess({ id: 'c1' }));
        done();
      });
    });
  });
});
