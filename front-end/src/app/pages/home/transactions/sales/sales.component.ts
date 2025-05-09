import { Component } from '@angular/core';

import { OutwardInvoiceListComponent, PageHeaderComponent } from '@components';

@Component({
  selector: 'sales',
  standalone: true,
  imports: [PageHeaderComponent, OutwardInvoiceListComponent],
  template: `
    <page-header
      title="Sales"
      [breadcrumbs]="['Transactions', 'Sales']"
      [extra]="{ route: 'add', text: 'Add Sales' }"
    ></page-header>
    <outward-invoice-list invoiceType="sales"></outward-invoice-list>
  `,
})
export class SalesComponent {}
