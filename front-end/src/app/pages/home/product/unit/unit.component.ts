import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { Unit } from '@models';
import { LoaderService, UnitService } from '@services';

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
  styleUrl: './unit.component.css',
})
export class UnitComponent {
  units: Unit[] = [];

  editId: string | null = null;
  editData: Unit = { isActive: true } as Unit;

  total: number;

  constructor(
    public _loaderService: LoaderService,
    private _unitService: UnitService
  ) {
    this.getOrgUnits();
  }

  getOrgUnits(): void {
    this._unitService.getAll().subscribe({
      next: ({ data, total }) => {
        this.units = [...data];
        this.total = total;
        this._loaderService.hideLoader();
      },
    });
  }

  startEdit(id: string, setFocus: string): void {
    this.editId = id;
    this.editData = { ...this.units.find((x) => x.unitId === id)! };
    setTimeout(() => {
      document.getElementById(setFocus + id)?.focus();
    });
  }

  cancelEdit(): void {
    if (this.editId === 'new') {
      this.units = this.units.filter((x) => x.unitId !== 'new');
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
    this.editData = { isActive: true, code: '', name: '' } as Unit;
    this.editData.unitId = 'new';
    this.units = [this.editData, ...this.units];
  }

  saveNewUnit() {
    this.editData.unitId = undefined;
    this._unitService.create(this.editData).subscribe({
      next: (data) => {
        this.editId = null;
        this.getOrgUnits();
      },
    });
  }

  deleteUnit(id: string) {
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
        this.units.find((p) => p.unitId === id)!.isActive = true;
      });
    else
      this._unitService.deactivate(id).subscribe(() => {
        this.units.find((p) => p.unitId === id)!.isActive = false;
      });
  }
}
