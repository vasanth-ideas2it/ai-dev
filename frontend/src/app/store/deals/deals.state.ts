import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { DealFilters, DealResponse, KanbanColumn } from '../../core/models/deal.models';
import { PageMeta } from '../../core/models/auth.models';

export interface DealsState extends EntityState<DealResponse> {
  selectedId: string | null;
  loading: boolean;
  kanbanLoading: boolean;
  error: string | null;
  pagination: PageMeta | null;
  filters: DealFilters;
  kanban: KanbanColumn[];
}

export const dealsAdapter = createEntityAdapter<DealResponse>();

export const initialDealsState: DealsState = dealsAdapter.getInitialState({
  selectedId: null,
  loading: false,
  kanbanLoading: false,
  error: null,
  pagination: null,
  filters: {},
  kanban: [],
});
