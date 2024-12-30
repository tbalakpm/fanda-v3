import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { PageHeaderComponent } from '@components';
import { Stock } from '@models';
import { LoaderService, StockService } from '@services';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    PageHeaderComponent,

    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzPopconfirmModule,
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss',
})
export class StockComponent {
  stocks: Stock[] = [];

  total: number;
  pageIndex = 1;
  pageSize = 10;

  constructor(
    public _loaderService: LoaderService,
    private _stockService: StockService
  ) {}

  fetchInvoice() {
    this._stockService
      .getPaged({
        page: this.pageIndex,
        limit: this.pageSize,
      })
      .subscribe((stock) => {
        this.stocks = [...stock.items];
        this.total = stock.total;
      });
  }

  onQueryParamsChange(qp: NzTableQueryParams) {
    this.pageIndex = qp.pageIndex;
    this.pageSize = qp.pageSize;
    this.fetchInvoice();
  }

  deleteInvoice(id: string) {
    this._stockService.delete(id).subscribe(() => {
      this.fetchInvoice();
    });
  }
}
