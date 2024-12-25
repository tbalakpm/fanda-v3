import { LineItem } from './inwardInvoice';

export interface Stock {
  _id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  referenceNumber: string;
  referenceDate: Date | null;
  lineItems: LineItem[];
  totalQty: number;
  totalAmount: number;
  notes: string;
}
