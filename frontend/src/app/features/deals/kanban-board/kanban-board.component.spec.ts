import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanBoardComponent } from './kanban-board.component';
import { DealResponse, KanbanColumn } from '../../../core/models/deal.models';
import { DealsActions } from '../../../store/deals/deals.actions';

const makeDeal = (overrides: Partial<DealResponse> = {}): DealResponse => ({
  id: 'd1',
  orgId: 'o1',
  title: 'Test Deal',
  value: 1000,
  currency: 'USD',
  probability: 10,
  closeDate: null,
  status: 'OPEN',
  stageId: 'stage1',
  stageName: 'Lead',
  pipelineId: 'p1',
  pipelineName: 'Default',
  contactId: null,
  contactName: null,
  companyId: null,
  companyName: null,
  ownerId: 'u1',
  ownerName: 'Alice',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const col1: KanbanColumn = {
  stageId: 'stage1',
  stageName: 'Lead',
  stageOrder: 1,
  probability: 10,
  deals: [makeDeal()],
};

const col2: KanbanColumn = {
  stageId: 'stage2',
  stageName: 'Qualified',
  stageOrder: 2,
  probability: 30,
  deals: [],
};

const initialState = {
  deals: {
    ids: ['d1'],
    entities: { d1: makeDeal() },
    kanban: [col1, col2],
    kanbanLoading: false,
    loading: false,
    error: null,
    selectedId: null,
    pagination: null,
    filters: {},
  },
};

describe('KanbanBoardComponent', () => {
  let component: KanbanBoardComponent;
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanBoardComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
    component.pipelineId = 'p1';
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  // ── onDrop cross-column ───────────────────────────────────────────────────

  it('onDrop cross-column dispatches updateKanbanOptimistic then moveDeal', () => {
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    component.kanban = [col1, col2];
    const deal = makeDeal();

    const event = {
      previousContainer: { data: col1.deals },
      container: { data: col2.deals },
      currentIndex: 0,
      item: { data: deal },
    } as unknown as CdkDragDrop<DealResponse[]>;

    component.onDrop(event, col2);

    const calls = dispatchSpy.calls.allArgs().map(a => a[0]);

    expect(calls).toContain(
      jasmine.objectContaining({ type: '[Deals] Update Kanban Optimistic' }),
    );
    expect(calls).toContain(
      DealsActions.moveDeal({ id: 'd1', stageId: 'stage2', previousKanban: [col1, col2] }),
    );
  });

  it('onDrop same container does not dispatch anything', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    const sameContainer = { data: col1.deals };

    const event = {
      previousContainer: sameContainer,
      container: sameContainer,
      currentIndex: 0,
      item: { data: makeDeal() },
    } as unknown as CdkDragDrop<DealResponse[]>;

    component.onDrop(event, col1);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  // ── optimistic update shape ───────────────────────────────────────────────

  it('onDrop moves deal into target column in the optimistic update', () => {
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    component.kanban = [col1, col2];
    const deal = makeDeal();

    const event = {
      previousContainer: { data: col1.deals },
      container: { data: col2.deals },
      currentIndex: 0,
      item: { data: deal },
    } as unknown as CdkDragDrop<DealResponse[]>;

    component.onDrop(event, col2);

    const optimisticCall = dispatchSpy.calls
      .allArgs()
      .find(a => (a[0] as any).type === '[Deals] Update Kanban Optimistic');

    expect(optimisticCall).toBeDefined();
    const newKanban: KanbanColumn[] = (optimisticCall![0] as any).kanban;
    const newCol2 = newKanban.find(c => c.stageId === 'stage2')!;
    expect(newCol2.deals.length).toBe(1);
    expect(newCol2.deals[0].id).toBe('d1');
    expect(newCol2.deals[0].stageId).toBe('stage2');
  });

  // ── helpers ───────────────────────────────────────────────────────────────

  it('columnTotal returns sum of deal values', () => {
    const deals: DealResponse[] = [
      makeDeal({ id: 'd1', value: 500 }),
      makeDeal({ id: 'd2', value: 750 }),
    ];
    expect(component.columnTotal(deals)).toBe(1250);
  });

  it('columnTotal returns 0 for empty array', () => {
    expect(component.columnTotal([])).toBe(0);
  });

  it('probColor returns correct CSS class', () => {
    expect(component.probColor(80)).toBe('prob-high');
    expect(component.probColor(75)).toBe('prob-high');
    expect(component.probColor(74)).toBe('prob-mid');
    expect(component.probColor(40)).toBe('prob-mid');
    expect(component.probColor(39)).toBe('prob-low');
    expect(component.probColor(0)).toBe('prob-low');
  });
});
