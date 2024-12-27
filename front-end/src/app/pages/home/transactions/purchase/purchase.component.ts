import { Component } from '@angular/core';

import { InwardInvoiceListComponent, PageHeaderComponent } from '@components';

@Component({
  selector: 'purchase',
  standalone: true,
  imports: [PageHeaderComponent, InwardInvoiceListComponent],
  template: ` <page-header
      title="Purchases"
      [breadcrumbs]="['Transactions', 'Purchases']"
      [extra]="{ route: 'add', text: 'Add Purchase' }"
    ></page-header>
    <inward-invoice-list invoiceType="purchase"></inward-invoice-list>`,
})
export class PurchaseComponent {}
