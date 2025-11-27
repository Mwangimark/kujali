import { Component, inject, signal, computed, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { cloneDeep as ___cloneDeep } from 'lodash';

import { Logger } from '@iote/bricks-angular';
import { Budget, BudgetRecord, BudgetStatus, OrgBudgetsOverview } from '@app/model/finance/planning/budgets';
import { BudgetsStore, OrgBudgetsStore } from '@app/state/finance/budgetting/budgets';
import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss',
              '../../components/budget-view-styles.scss'],
})
export class SelectBudgetPageComponent {
  // Inject services
  private _orgBudgets$$ = inject(OrgBudgetsStore);
  private _budgets$$ = inject(BudgetsStore);
  private _dialog = inject(MatDialog);
  private _logger = inject(Logger);

  // UI state
  showFilter = signal(false);

  // Signals for data
  overview = signal<OrgBudgetsOverview | null>(null);
  sharedBudgets = signal<any[]>([]);
  
  // Computed: combined & transformed budgets
  allBudgets = computed(() => {
    const ov = this.overview();
    const sh = this.sharedBudgets();

    if (!ov) return {overview: [], budgets: []};

    const transformed = ov.budgets.map(budget => ({
      ...budget,
      endYear: budget.startYear + budget.duration - 1
    }));

    return {overview: ov.overview, budgets: transformed};
  });

  constructor() {
    // Fetch overview and shared budgets declaratively
    effect(() => {
      this._orgBudgets$$.get().subscribe(data => this.overview.set(data));
    });

    effect(() => {
      this._budgets$$.get().subscribe(data => this.sharedBudgets.set(data));
    });
  }

  // Toggle search/filter panel
  toogleFilter(value: boolean) { this.showFilter.set(value); }

  // Placeholder for search filter
  applyFilter(event: Event) {}

  fieldsFilter(value: (Invoice) => boolean) {}

  // Open modal dialogs
  openDialog(parent: Budget | false) {
    this._dialog.open(CreateBudgetModalComponent, {
      width: '600px',
      height: 'fit-content',
      data: parent ?? false
    });
  }

  // Budget actions
  canPromote(record: BudgetRecord) {
    return (record.budget as any).canBeActivated;
  }

  setActive(record: BudgetRecord) {
    const toSave = ___cloneDeep(record.budget);
    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;

    toSave.status = BudgetStatus.InUse;

    (<any>record).updating = true;

    this._budgets$$.update(toSave).subscribe(() => {
      (<any>record).updating = false;
      this._logger.log(() => `Updated Budget ${toSave.id} as active for this org.`);
    });
  }
}
