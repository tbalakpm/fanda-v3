import { LineItem, Party } from './';

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
