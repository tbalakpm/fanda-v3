import { Component } from '@angular/core';

import { InwardInvoiceAddComponent } from '@components';

@Component({
  selector: 'sales-return-form',
  standalone: true,
  imports: [InwardInvoiceAddComponent],
  template: `<inward-invoice-add
    invoiceType="salesreturn"
  ></inward-invoice-add>`,
})
export class SalesReturnFormComponent {}
