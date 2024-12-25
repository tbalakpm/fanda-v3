import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Unit } from '../../../../models';
import { LoaderService, UnitService } from '../../../../services';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'unit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzPopconfirmModule,
    NzIconModule,
    NzToolTipModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTagModule,
    NzSwitchModule,
  ],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.scss',
})
export class UnitComponent {
  units: Unit[] = [];

  editId: string | null = null;
  editData: Unit = { isActive: true } as Unit;

  total: number;
  pageIndex = 1;
  pageSize = 10;
  sort = 'code';
  order = 'asc';

  searchValue = '';
  debounce: any;

  onSearchChange = (value: string) => {
    this.searchValue = value;
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.getOrgUnits(), 300);
  };

  constructor(
    public _loaderService: LoaderService,
    private _unitService: UnitService
  ) {}

  getOrgUnits(): void {
    // this._loaderService.showLoader();
    this._unitService
      .getPaged({
        page: 1,
        limit: 10,
        sort: this.sort,
        order: this.order,
        value: this.searchValue,
      })
      .subscribe({
        next: (data) => {
          this.units = [...data.items];
          this.total = data.total;
          this._loaderService.hideLoader();
        },
      });
  }

  onQueryParamsChange(qp: NzTableQueryParams) {
    this.pageIndex = qp.pageIndex;
    this.pageSize = qp.pageSize;
    for (let i in qp.sort) {
      const sort = qp.sort[i];
      if (sort.value) {
        this.sort = sort.key;
        this.order = sort.value === 'ascend' ? 'asc' : 'desc';
        break;
      } else {
        this.sort = 'code';
        this.order = 'asc';
      }
    }
    this.getOrgUnits();
  }

  startEdit(id: string, setFocus: string): void {
    this.editId = id;
    this.editData = { ...this.units.find((x) => x._id === id)! };
    setTimeout(() => {
      document.getElementById(setFocus + id)?.focus();
    });
  }

  cancelEdit(): void {
    if (this.editId === 'new') {
      this.units = this.units.filter((x) => x._id !== 'new');
    }
    this.editId = null;
    this.editData = { isActive: true } as Unit;
  }

  saveEdit(): void {
    // this._loaderService.showLoader();
    this._unitService.update(this.editId!, this.editData).subscribe({
      next: (data) => {
        this.editId = null;
        this.getOrgUnits();
      },
    });
  }

  addNewUnit() {
    this.editId = 'new';
    this.editData = { isActive: true } as Unit;
    this.editData._id = 'new';
    this.units = [this.editData, ...this.units];
  }

  saveNewUnit() {
    // this._loaderService.showLoader();
    this._unitService.create(this.editData).subscribe({
      next: (data) => {
        this.editId = null;
        this.getOrgUnits();
      },
    });
  }

  deleteUnit(id: string) {
    // this._loaderService.showLoader();
    this._unitService.delete(id).subscribe({
      next: () => {
        this.getOrgUnits();
        this._loaderService.hideLoader();
      },
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._unitService.activate(id).subscribe(() => {
        this.units.find((p) => p._id === id)!.isActive = true;
      });
    else
      this._unitService.deactivate(id).subscribe(() => {
        this.units.find((p) => p._id === id)!.isActive = false;
      });
  }
}
