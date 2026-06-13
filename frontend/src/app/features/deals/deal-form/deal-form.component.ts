import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, of, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactsService } from '../../../core/services/contacts.service';
import { CompaniesService } from '../../../core/services/companies.service';
import { ContactResponse } from '../../../core/models/contact.models';
import { CompanyResponse } from '../../../core/models/company.models';
import { DealRequest, DealResponse } from '../../../core/models/deal.models';
import { PipelineResponse, PipelineStageResponse } from '../../../core/models/pipeline.models';
import { PipelinesActions } from '../../../store/pipelines/pipelines.actions';
import { selectAllPipelines, selectPipelinesLoading } from '../../../store/pipelines/pipelines.selectors';

export interface DealFormData {
  deal?: DealResponse;
  pipelineId?: string;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSliderModule,
    MatIconModule,
  ],
  templateUrl: './deal-form.component.html',
  styleUrl: './deal-form.component.scss',
})
export class DealFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly dialogRef = inject(MatDialogRef<DealFormComponent>);
  private readonly data: DealFormData = inject(MAT_DIALOG_DATA) ?? {};
  private readonly contactsService = inject(ContactsService);
  private readonly companiesService = inject(CompaniesService);

  readonly isEdit = !!this.data.deal;
  readonly currencies = CURRENCIES;

  readonly form = this.fb.nonNullable.group({
    title: [this.data.deal?.title ?? '', Validators.required],
    value: [this.data.deal?.value ?? null as number | null],
    currency: [this.data.deal?.currency ?? 'USD'],
    stageId: [this.data.deal?.stageId ?? '', Validators.required],
    probability: [this.data.deal?.probability ?? 0],
    closeDate: [this.data.deal?.closeDate ? new Date(this.data.deal.closeDate) : null as Date | null],
    contactId: [this.data.deal?.contactId ?? null as string | null],
    companyId: [this.data.deal?.companyId ?? null as string | null],
    contactSearch: [''],
    companySearch: [''],
  });

  pipelines$: Observable<PipelineResponse[]> = this.store.select(selectAllPipelines);
  pipelinesLoading$: Observable<boolean> = this.store.select(selectPipelinesLoading);

  currentStages: PipelineStageResponse[] = [];
  filteredContacts: ContactResponse[] = [];
  filteredCompanies: CompanyResponse[] = [];

  selectedContactName = this.data.deal?.contactName ?? '';
  selectedCompanyName = this.data.deal?.companyName ?? '';

  private readonly contactSearch$ = new Subject<string>();
  private readonly companySearch$ = new Subject<string>();

  constructor() {
    this.contactSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2
        ? this.contactsService.getContacts({ search: q, size: 10 })
        : of({ content: [] as ContactResponse[], meta: { page: 0, size: 10, total: 0, totalPages: 0 } }),
      ),
      takeUntilDestroyed(),
    ).subscribe(result => this.filteredContacts = result.content);

    this.companySearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2
        ? this.companiesService.getCompanies({ search: q, size: 10 })
        : of({ content: [] as CompanyResponse[], meta: { page: 0, size: 10, total: 0, totalPages: 0 } }),
      ),
      takeUntilDestroyed(),
    ).subscribe(result => this.filteredCompanies = result.content);
  }

  ngOnInit(): void {
    this.store.dispatch(PipelinesActions.loadPipelines());

    this.pipelines$.pipe(takeUntilDestroyed()).subscribe(pipelines => {
      if (!this.form.value.stageId && pipelines.length > 0) {
        const pipeline = this.data.pipelineId
          ? pipelines.find(p => p.id === this.data.pipelineId) ?? pipelines[0]
          : pipelines[0];
        this.currentStages = pipeline.stages;
        if (this.currentStages.length > 0 && !this.isEdit) {
          this.form.patchValue({ stageId: this.currentStages[0].id, probability: this.currentStages[0].probability });
        }
      } else if (this.isEdit && pipelines.length > 0) {
        const pipeline = pipelines.find(p => p.id === this.data.deal!.pipelineId) ?? pipelines[0];
        this.currentStages = pipeline.stages;
      }
    });
  }

  onStageChange(stageId: string): void {
    const stage = this.currentStages.find(s => s.id === stageId);
    if (stage) {
      this.form.patchValue({ probability: stage.probability });
    }
  }

  onContactSearch(query: string): void {
    this.contactSearch$.next(query);
  }

  onContactSelected(contact: ContactResponse): void {
    this.form.patchValue({ contactId: contact.id });
    this.selectedContactName = `${contact.firstName} ${contact.lastName ?? ''}`.trim();
  }

  onContactCleared(): void {
    this.form.patchValue({ contactId: null, contactSearch: '' });
    this.selectedContactName = '';
    this.filteredContacts = [];
  }

  onCompanySearch(query: string): void {
    this.companySearch$.next(query);
  }

  onCompanySelected(company: CompanyResponse): void {
    this.form.patchValue({ companyId: company.id });
    this.selectedCompanyName = company.name;
  }

  onCompanyCleared(): void {
    this.form.patchValue({ companyId: null, companySearch: '' });
    this.selectedCompanyName = '';
    this.filteredCompanies = [];
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const request: DealRequest = {
      title: v.title,
      value: v.value ?? null,
      currency: v.currency,
      stageId: v.stageId,
      probability: v.probability,
      closeDate: v.closeDate ? (v.closeDate as Date).toISOString().split('T')[0] : null,
      contactId: v.contactId,
      companyId: v.companyId,
    };
    this.dialogRef.close(request);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
