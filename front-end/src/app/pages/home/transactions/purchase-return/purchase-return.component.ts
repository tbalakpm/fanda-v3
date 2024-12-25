import { Component } from '@angular/core';
import { OutwardInvoiceListComponent } from '../../../../components/outward-invoice/outward-invoice-list/outward-invoice-list.component';
import { PageHeaderComponent } from '../../../../components/page-header/page-header.component';

@Component({
  selector: 'purchase-return',
  standalone: true,
  imports: [PageHeaderComponent, OutwardInvoiceListComponent],
  template: ` <page-header
      title="Purchase Returns"
      [breadcrumbs]="['Transactions', 'Purchase Returns']"
      [extra]="{ route: 'add', text: 'Add Purchase Return' }"
    ></page-header>
    <outward-invoice-list invoiceType="purchasereturn"></outward-invoice-list>`,
})
export class PurchaseReturnComponent {}
