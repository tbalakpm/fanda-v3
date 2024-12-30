import { Component } from '@angular/core';

import { OutwardInvoiceListComponent, PageHeaderComponent } from '@components';

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
