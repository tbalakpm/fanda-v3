import { z } from 'zod';
import { AuditDatesSchema, AuditUsersSchema } from '../../../schema';

export const StockLineItemSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  lineItemId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  unitId: z.string().uuid(),
  description: z.string().max(255).optional(),
  gtn: z.string().max(50),
  mfdDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  qty: z.coerce.number(),
  rate: z.coerce.number(),
  price: z.coerce.number().optional(),
  marginPct: z.coerce.number().optional(),
  marginAmt: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().optional(),
  discountPct: z.coerce.number().optional(),
  discountAmt: z.coerce.number().optional(),
  taxCode: z.string().optional(),
  taxPct: z.coerce.number().optional(),
  taxAmt: z.coerce.number().optional(),
  lineTotal: z.coerce.number().optional()
});

export type StockLineItemType = z.infer<typeof StockLineItemSchema>;

export const StockInvoiceSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.coerce.date(),
  totalQty: z.coerce.number(),
  totalAmount: z.coerce.number(),
  notes: z.string().max(255).optional(),
  companyId: z.string().uuid().optional(),
  yearId: z.string().uuid().optional(),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional(),
  lineItems: z.array(StockLineItemSchema).optional()
});

export type StockInvoiceType = z.infer<typeof StockInvoiceSchema>;
