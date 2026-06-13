import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DealsState, dealsAdapter } from './deals.state';

export const selectDealsState = createFeatureSelector<DealsState>('deals');

const { selectAll, selectEntities } = dealsAdapter.getSelectors();

export const selectAllDeals = createSelector(selectDealsState, selectAll);
export const selectDealEntities = createSelector(selectDealsState, selectEntities);

export const selectSelectedDealId = createSelector(selectDealsState, state => state.selectedId);

export const selectSelectedDeal = createSelector(
  selectDealEntities,
  selectSelectedDealId,
  (entities, id) => (id ? (entities[id] ?? null) : null),
);

export const selectDealsLoading = createSelector(selectDealsState, state => state.loading);
export const selectKanbanLoading = createSelector(selectDealsState, state => state.kanbanLoading);
export const selectDealsError = createSelector(selectDealsState, state => state.error);
export const selectDealsPagination = createSelector(selectDealsState, state => state.pagination);
export const selectDealFilters = createSelector(selectDealsState, state => state.filters);
export const selectKanban = createSelector(selectDealsState, state => state.kanban);
