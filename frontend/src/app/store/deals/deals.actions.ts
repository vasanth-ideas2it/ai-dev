import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DealFilters, DealRequest, DealResponse, KanbanColumn } from '../../core/models/deal.models';
import { PageMeta } from '../../core/models/auth.models';

export const DealsActions = createActionGroup({
  source: 'Deals',
  events: {
    'Load Deals': props<{ page?: number; size?: number; filters?: DealFilters }>(),
    'Load Deals Success': props<{ deals: DealResponse[]; pagination: PageMeta }>(),
    'Load Deals Failure': props<{ error: string }>(),

    'Load Kanban': props<{ pipelineId: string }>(),
    'Load Kanban Success': props<{ kanban: KanbanColumn[] }>(),
    'Load Kanban Failure': props<{ error: string }>(),

    'Load Deal': props<{ id: string }>(),
    'Load Deal Success': props<{ deal: DealResponse }>(),
    'Load Deal Failure': props<{ error: string }>(),

    'Create Deal': props<{ request: DealRequest }>(),
    'Create Deal Success': props<{ deal: DealResponse }>(),
    'Create Deal Failure': props<{ error: string }>(),

    'Update Deal': props<{ id: string; request: DealRequest }>(),
    'Update Deal Success': props<{ deal: DealResponse }>(),
    'Update Deal Failure': props<{ error: string }>(),

    'Move Deal': props<{ id: string; stageId: string; previousKanban: KanbanColumn[] }>(),
    'Move Deal Success': props<{ deal: DealResponse }>(),
    'Move Deal Failure': props<{ error: string; previousKanban: KanbanColumn[] }>(),

    'Delete Deal': props<{ id: string }>(),
    'Delete Deal Success': props<{ id: string }>(),
    'Delete Deal Failure': props<{ error: string }>(),

    'Select Deal': props<{ id: string | null }>(),
    'Set Filters': props<{ filters: DealFilters }>(),
    'Update Kanban Optimistic': props<{ kanban: KanbanColumn[] }>(),
  },
});
