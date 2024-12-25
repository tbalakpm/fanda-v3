import { Component } from '@angular/core';
import { InwardInvoiceAddComponent } from '../../components/inward-invoice/inward-invoice-add/inward-invoice-add.component';

@Component({
  selector: 'purchase-form',
  standalone: true,
  imports: [InwardInvoiceAddComponent],
  template: `<inward-invoice-add invoiceType="purchase"></inward-invoice-add>`,
})
export class PurchaseFormComponent {}
