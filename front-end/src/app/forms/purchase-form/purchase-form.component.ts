import { Component } from '@angular/core';

import { InwardInvoiceAddComponent } from '@components';

@Component({
  selector: 'purchase-form',
  standalone: true,
  imports: [InwardInvoiceAddComponent],
  template: `<inward-invoice-add invoiceType="purchase"></inward-invoice-add>`,
})
export class PurchaseFormComponent {}
