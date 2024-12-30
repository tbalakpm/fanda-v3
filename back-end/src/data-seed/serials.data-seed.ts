import { InvoiceTypes } from '../modules/invoices/invoice-type.enum';

export const DefaultSerials = [
  {
    key: InvoiceTypes.Purchase,
    prefix: 'I',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.Sales,
    prefix: 'B',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.SalesReturn,
    prefix: 'R',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.PurchaseReturn,
    prefix: 'U',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.Stock,
    prefix: 'K',
    current: 1,
    length: 7
  },
  {
    key: InvoiceTypes.Transfer,
    prefix: 'T',
    current: 1,
    length: 7
  },
  {
    key: 'gtn',
    prefix: 'A',
    current: 1,
    length: 7
  }
];
