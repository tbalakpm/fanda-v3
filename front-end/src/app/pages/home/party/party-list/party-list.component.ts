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
  parties: Party[] = [];
  isCustomer: boolean;

  total: number;
  pageIndex = 1;
  pageSize = 10;
  sort = 'code';
  order = 'asc';
  _searchValue = '';

  get searchValue() {
    return this._searchValue;
  }
  set searchValue(value: string) {
    this._searchValue = value;
    this.getOrgParty();
  }

  constructor(
    private router: Router,
    public _loaderService: LoaderService,
    private _customerService: CustomerService,
    private _supplierService: SupplierService
  ) {
    this.isCustomer = this.router.url.includes('customer');
  }

  getOrgParty(): void {
    // this._loaderService.showLoader();
    let options: QueryOptions = {
      page: this.pageIndex,
      limit: this.pageSize,
      sort: this.sort,
      order: this.order,
      value: this.searchValue,
    };
    let request = this.isCustomer
      ? this._customerService.getPaged(options)
      : this._supplierService.getPaged(options);

    request.subscribe({
      next: (data) => {
        console.log(data.items);
        this.parties = [...data.items];
        this.total = data.total;
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
    this.getOrgParty();
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
