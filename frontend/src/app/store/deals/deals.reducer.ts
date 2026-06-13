import { createReducer, on } from '@ngrx/store';
import { DealsActions } from './deals.actions';
import { dealsAdapter, initialDealsState } from './deals.state';

export const dealsReducer = createReducer(
  initialDealsState,

  on(DealsActions.loadDeals, state => ({ ...state, loading: true, error: null })),
  on(DealsActions.loadDealsSuccess, (state, { deals, pagination }) =>
    dealsAdapter.setAll(deals, { ...state, loading: false, pagination })),
  on(DealsActions.loadDealsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(DealsActions.loadKanban, state => ({ ...state, kanbanLoading: true, error: null })),
  on(DealsActions.loadKanbanSuccess, (state, { kanban }) => ({ ...state, kanbanLoading: false, kanban })),
  on(DealsActions.loadKanbanFailure, (state, { error }) => ({ ...state, kanbanLoading: false, error })),

  on(DealsActions.loadDealSuccess, (state, { deal }) =>
    dealsAdapter.upsertOne(deal, { ...state, loading: false })),
  on(DealsActions.loadDealFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(DealsActions.createDealSuccess, (state, { deal }) => dealsAdapter.addOne(deal, state)),
  on(DealsActions.createDealFailure, (state, { error }) => ({ ...state, error })),

  on(DealsActions.updateDealSuccess, (state, { deal }) =>
    dealsAdapter.updateOne({ id: deal.id, changes: deal }, state)),
  on(DealsActions.updateDealFailure, (state, { error }) => ({ ...state, error })),

  on(DealsActions.updateKanbanOptimistic, (state, { kanban }) => ({ ...state, kanban })),
  on(DealsActions.moveDealSuccess, (state, { deal }) =>
    dealsAdapter.updateOne({ id: deal.id, changes: deal }, state)),
  on(DealsActions.moveDealFailure, (state, { previousKanban }) => ({ ...state, kanban: previousKanban })),

  on(DealsActions.deleteDealSuccess, (state, { id }) => dealsAdapter.removeOne(id, state)),
  on(DealsActions.deleteDealFailure, (state, { error }) => ({ ...state, error })),

  on(DealsActions.selectDeal, (state, { id }) => ({ ...state, selectedId: id })),
  on(DealsActions.setFilters, (state, { filters }) => ({ ...state, filters })),
);
