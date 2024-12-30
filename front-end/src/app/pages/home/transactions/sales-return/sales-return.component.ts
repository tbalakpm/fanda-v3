import { Component } from '@angular/core';

import { InwardInvoiceListComponent, PageHeaderComponent } from '@components';

@Component({
  selector: 'sales-return',
  standalone: true,
  imports: [PageHeaderComponent, InwardInvoiceListComponent],
  template: ` <page-header
      title="Sales Returns"
      [breadcrumbs]="['Transactions', 'Sales Returns']"
      [extra]="{ route: 'add', text: 'Add Sales' }"
    ></page-header>
    <inward-invoice-list invoiceType="salesreturn"></inward-invoice-list>`,
})
export class SalesReturnComponent {}
