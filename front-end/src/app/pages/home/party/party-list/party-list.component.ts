import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Party } from '../../../../models';
import {
  LoaderService,
  CustomerService,
  SupplierService,
  QueryOptions,
} from '../../../../services';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Router, RouterModule } from '@angular/router';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { PageHeaderComponent } from '../../../../components/page-header/page-header.component';
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

  private _parties: Party[] = [];
  searchedParty: Party[] = [];

  total: number;
  partyColumns = partyColumns;

  get parties() {
    return this._parties;
  }
  set parties(value: Party[]) {
    this._parties = value;
    this.searchedData = '';
  }

  set searchedData(value: string) {
    this.searchedParty = [
      ...this.parties.filter(
        (party) =>
          party.name.toLowerCase().includes(value.toLowerCase()) ||
          party.code.toLowerCase().includes(value.toLowerCase()) ||
          party.gstin?.toLowerCase().includes(value.toLowerCase())
      ),
    ];
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
    // this._loaderService.showLoader();
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
