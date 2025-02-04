import { LineItem } from './';

export interface Stock {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  referenceNumber: string;
  referenceDate: Date | null;
  lineItems: LineItem[];
  totalQty: number;
  totalAmount: number;
  notes: string;
}
