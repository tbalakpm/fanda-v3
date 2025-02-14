import { Component } from '@angular/core';
import { OutwardInvoiceAddComponent } from '@components';

@Component({
  selector: 'sales-form',
  standalone: true,
  imports: [OutwardInvoiceAddComponent],
  template: `<outward-invoice-add invoiceType="sales"></outward-invoice-add>`,
})
export class SalesFormComponent {}
