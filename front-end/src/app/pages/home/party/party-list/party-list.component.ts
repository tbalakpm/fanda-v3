import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router, RouterModule } from '@angular/router';
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

import { PageHeaderComponent } from '@components';
import { Party } from '@models';
import { CustomerService, LoaderService, SupplierService } from '@services';

import { partyColumns } from './party-list';

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
  styleUrl: './party-list.component.scss',
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
    this.getOrgParty();
  }

  getOrgParty(): void {
    let request = this.isCustomer
      ? this._customerService.getAll()
      : this._supplierService.getAll();

    request.subscribe({
      next: (res) => {
        this.total = res.total;
        this.parties = [...res.data];
      },
    });
  }

  deleteParty(id: string) {
    let request = this.isCustomer
      ? this._customerService.delete(id)
      : this._supplierService.delete(id);

    request.subscribe({
      next: () => {
        this.parties = this.parties.filter((p) => p._id !== id);
      },
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this.isCustomer
        ? this._customerService.activate(id).subscribe(() => {
            this.parties.find((p) => p._id === id)!.isActive = true;
          })
        : this._supplierService.activate(id).subscribe(() => {
            this.parties.find((p) => p._id === id)!.isActive = true;
          });
    else
      this.isCustomer
        ? this._customerService.deactivate(id).subscribe(() => {
            this.parties.find((p) => p._id === id)!.isActive = false;
          })
        : this._supplierService.deactivate(id).subscribe(() => {
            this.parties.find((p) => p._id === id)!.isActive = false;
          });
  }
}
