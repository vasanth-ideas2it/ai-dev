import { createActionGroup, props } from '@ngrx/store';
import { CompanyFilters, CompanyRequest, CompanyResponse } from '../../core/models/company.models';
import { PageMeta } from '../../core/models/auth.models';

export const CompaniesActions = createActionGroup({
  source: 'Companies',
  events: {
    'Load Companies': props<{ page?: number; size?: number; filters?: CompanyFilters }>(),
    'Load Companies Success': props<{ companies: CompanyResponse[]; pagination: PageMeta }>(),
    'Load Companies Failure': props<{ error: string }>(),

    'Load Company': props<{ id: string }>(),
    'Load Company Success': props<{ company: CompanyResponse }>(),
    'Load Company Failure': props<{ error: string }>(),

    'Create Company': props<{ request: CompanyRequest }>(),
    'Create Company Success': props<{ company: CompanyResponse }>(),
    'Create Company Failure': props<{ error: string }>(),

    'Update Company': props<{ id: string; request: CompanyRequest }>(),
    'Update Company Success': props<{ company: CompanyResponse }>(),
    'Update Company Failure': props<{ error: string }>(),

    'Delete Company': props<{ id: string }>(),
    'Delete Company Success': props<{ id: string }>(),
    'Delete Company Failure': props<{ error: string }>(),

    'Select Company': props<{ id: string | null }>(),
    'Set Filters': props<{ filters: CompanyFilters }>(),
  },
});
