import { Component } from '@angular/core';
import { OutwardInvoiceAddComponent } from '../../components/outward-invoice/outward-invoice-add/outward-invoice-add.component';

@Component({
  selector: 'purchase-return-form',
  standalone: true,
  imports: [OutwardInvoiceAddComponent],
  template: `<outward-invoice-add
    invoiceType="purchasereturn"
  ></outward-invoice-add>`,
})
export class PurchaseReturnFormComponent {}