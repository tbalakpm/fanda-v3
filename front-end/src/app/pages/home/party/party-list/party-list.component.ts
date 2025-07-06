/** biome-ignore-all lint/style/useImportType: Suppress import types */
/** biome-ignore-all assist/source/organizeImports: Suppress sort imports */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
  LoaderService,
  CustomerService,
  SupplierService,
} from '../../../../services';
import { Router, RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PageHeaderComponent } from '@components';
import { partyColumns } from './party-list';
import type { Party } from '../../../../models';

@Component({
  selector: 'party',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
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
    NzPopconfirmModule,
  ],
  templateUrl: './party-list.component.html',
  styleUrl: './party-list.component.css',
})
export class PartyListComponent {
  isCustomer: boolean;

  partyColumns = partyColumns;
  total: number;
  searchValue = '';

  private _parties: Party[] = [];
  get parties() {
    return this._parties.filter(
      (party) =>
        party.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        party.code.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        party.gstin?.toLowerCase().includes(this.searchValue.toLowerCase())
    );
  }
  set parties(value: Party[]) {
    this._parties = value;
  }

  constructor(
    private router: Router,
    public _loaderService: LoaderService,
    private _customerService: CustomerService,
    private _supplierService: SupplierService
  ) {
    this.isCustomer = this.router.url.includes('customer');
    this.getParties();
  }

  getParties(): void {
    const request = this.isCustomer
      ? this._customerService.getAll()
      : this._supplierService.getAll();

    request.subscribe({
      next: (res) => {
        this.total = res.total;
        this.parties = res.data;
      },
    });
  }

  deleteParty(id: string) {
    const request = this.isCustomer
      ? this._customerService.delete(id)
      : this._supplierService.delete(id);

    request.subscribe({
      next: () => {
        this.parties = this.parties.filter((p) => p.id !== id);
      },
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active) {
      this.isCustomer
        ? this._customerService.activate(id).subscribe(() => {
            const foundCustomer = this.parties.find((p) => p.id === id);
            if (foundCustomer) foundCustomer.isActive = true;
          })
        : this._supplierService.activate(id).subscribe(() => {
            const foundSupplier = this.parties.find((p) => p.id === id);
            if (foundSupplier) foundSupplier.isActive = true;
          });
    } else {
      this.isCustomer
        ? this._customerService.deactivate(id).subscribe(() => {
            const foundCustomer = this.parties.find((p) => p.id === id);
            if (foundCustomer) foundCustomer.isActive = false;
          })
        : this._supplierService.deactivate(id).subscribe(() => {
            const foundSupplier = this.parties.find((p) => p.id === id);
            if (foundSupplier) foundSupplier.isActive = false;
          });
    }
  }
}
