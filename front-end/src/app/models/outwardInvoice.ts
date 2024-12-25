import { LineItem } from './inwardInvoice';
import { Party } from './party';

export interface OutwardInvoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  referenceNumber?: string;
  referenceDate?: Date;
  customer: Party;
  invoiceType: string;
  lineItems: LineItem[];
  gstTreatment: string;
}
