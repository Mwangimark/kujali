import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';
import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
})
export class BudgetTableComponent {

  @Input() budgets!: Signal<{overview: BudgetRecord[], budgets: any[]}>; // Signal input
  @Input() canPromote = false;
  @Output() doPromote: EventEmitter<void> = new EventEmitter();

  // Sorting state (optional)
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  constructor(private _router$$: Router, private _dialog: MatDialog) {}

  // Sorting function
  sortData(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  sortedBudgets() {
    const data = [...(this.budgets()?.budgets || [])];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    if (!column) return data;

    return data.sort((a: any, b: any) => {
      const aVal = a[column] ?? '';
      const bVal = b[column] ?? '';

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Actions
  promote() { if (this.canPromote) this.doPromote.emit(); }

  openShareBudgetDialog(parent: Budget | false) {
    this._dialog.open(ShareBudgetModalComponent, {
      panelClass: 'no-pad-dialog',
      width: '600px',
      data: parent ?? false
    });
  }

  openCloneBudgetDialog(parent: Budget | false) {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent ?? false
    });
  }

  openChildBudgetDialog(parent: Budget) {
    let children: any = this.budgets()?.overview.find(b => b.budget.id === parent.id)?.children;
    children = children?.map(child => child.budget);
    this._dialog.open(ChildBudgetsModalComponent, {
      height: 'fit-content',
      minWidth: '600px',
      data: { parent, budgets: children }
    });
  }

  goToDetail(budgetId: string, action: string) {
    this._router$$.navigate(['budgets', budgetId, action]);
  }

  access(requested: any) {
    switch (requested) {
      case 'view': case 'clone': return true;
      case 'edit': return true;
      default: return false;
    }
  }

  translateStatus(status: number) {
    switch (status) {
      case 1: return 'BUDGET.STATUS.ACTIVE';
      case 0: return 'BUDGET.STATUS.DESIGN';
      case 9: return 'BUDGET.STATUS.NO-USE';
      case -1: return 'BUDGET.STATUS.DELETED';
      default: return '';
    }
  }
}
