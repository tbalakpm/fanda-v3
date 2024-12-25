import { Party } from './party';

export interface InwardInvoice {
  _id?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  referenceNumber?: string;
  referenceDate?: Date;
  supplier: Party; // ObjectId reference to Supplier
  invoiceType: string;
  lineItems: LineItem[];
  gstTreatment:
    | 'seller'
    | 'unreg'
    | 'regd'
    | 'sez'
    | 'composition'
    | 'overseas';
  taxPreference?: string;
  subtotal?: number;
  totalQty?: number;
  discountPct?: number;
  discountAmt?: number;
  totalInterTaxAmt?: number;
  totalIntraTaxAmt?: number;
  totalCentralTaxAmt?: number;
  roundOff?: number;
  netAmount?: number;
  notes?: string;
  terms?: string;
  yearId: string; // ObjectId reference to AccountYear
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LineItem {
  inventoryId: string; // ObjectId reference to Inventory
  productId: string; // ObjectId reference to Product
  unitId: string; // ObjectId reference to Unit
  gtn?: string;
  description?: string;
  qty: number;
  rate: number;
  price: number;
  discountPct?: number;
  discountAmt?: number;
  taxCode?: string;
  taxAmt?: number;
  taxPct?: number;
  lineTotal: number;

  disPctOrAmt?: string;
  discount?: number;
}
