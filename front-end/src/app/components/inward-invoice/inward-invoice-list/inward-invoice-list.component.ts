import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { GST_TREATMENTS_IN_DICT, INVOICE_TYPES_DICT } from '@constants';
import { InwardInvoice } from '@models';
import { InwardInvoiceService, LoaderService } from '@services';

@Component({
  selector: 'inward-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzPopconfirmModule,
  ],
  templateUrl: './inward-invoice-list.component.html',
  styleUrl: './inward-invoice-list.component.scss',
})
export class InwardInvoiceListComponent {
  @Input()
  invoiceType: 'purchase' | 'salesreturn' | 'stock' | 'transfer';

  purchases: InwardInvoice[] = [];

  invoiceTypes = INVOICE_TYPES_DICT;
  gstTreatments = GST_TREATMENTS_IN_DICT;

  total: number;
  pageIndex = 1;
  pageSize = 10;

  constructor(
    public _loaderService: LoaderService,
    private _inwardInvoiceService: InwardInvoiceService
  ) {}

  fetchInvoice() {
    // this._loaderService.showLoader();
    this._inwardInvoiceService
      .getPaged({
        invoiceType: this.invoiceType,
        page: this.pageIndex,
        limit: this.pageSize,
      })
      .subscribe((purchases) => {
        this.purchases = [...purchases.items];
        this.total = purchases.total;
        this._loaderService.hideLoader();
      });
  }

  onQueryParamsChange(qp: NzTableQueryParams) {
    this.pageIndex = qp.pageIndex;
    this.pageSize = qp.pageSize;
    this.fetchInvoice();
  }

  deleteInvoice(id: string) {
    this._inwardInvoiceService.delete(id).subscribe(() => {
      this.fetchInvoice();
    });
  }
}
