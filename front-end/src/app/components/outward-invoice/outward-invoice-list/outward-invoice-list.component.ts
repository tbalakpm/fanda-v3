import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { GST_TREATMENTS_OUT_DICT, INVOICE_TYPES_DICT } from '@constants';
import { OutwardInvoice } from '@models';
import { LoaderService, OutwardInvoiceService } from '@services';

@Component({
  selector: 'outward-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzIconModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './outward-invoice-list.component.html',
  styleUrl: './outward-invoice-list.component.scss',
})
export class OutwardInvoiceListComponent {
  @Input()
  invoiceType: 'sales' | 'purchasereturn' | 'stock' | 'transfer';

  purchases: OutwardInvoice[] = [];

  invoiceTypes = INVOICE_TYPES_DICT;
  gstTreatments = GST_TREATMENTS_OUT_DICT;

  total: number;
  pageIndex = 1;
  pageSize = 10;

  constructor(
    public _loaderService: LoaderService,
    private _outwardInvoiceService: OutwardInvoiceService,
    private http: HttpClient
  ) {}

  fetchInvoice() {
    // this._loaderService.showLoader();
    this._outwardInvoiceService
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

  printInvoice(id: string) {
    // this._outwardInvoiceService.printInvoice(id);
    const url = 'http://localhost:8080/reports/full-invoice'; // e.g localhost:3000 + "/download?access_token=" + "sample access token";
    this.http
      .get(url, {
        // observe: 'response',
        responseType: 'blob',
      })
      .subscribe((pdfBlob: any) => {
        // console.log(response);
        // // download file
        // var blob = new Blob([response], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
        iframe.contentWindow?.print();

        // const fileURL = URL.createObjectURL(pdfBlob);
        // const pdfWindow = window.open(fileURL); // Open PDF in a new tab
        // if (pdfWindow) {
        //   // Wait for the window to load, then trigger the print dialog
        //   pdfWindow.onload = () => {
        //     pdfWindow.print();
        //   };
        // }
      });
  }

  deleteInvoice(id: string) {
    this._outwardInvoiceService.delete(id).subscribe(() => {
      this.fetchInvoice();
    });
  }
}
