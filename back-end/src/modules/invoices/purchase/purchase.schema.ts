import { z } from 'zod';
import { AuditDatesSchema, AuditUsersSchema } from '../../../schema';

export const PurchaseLineItemSchema = z.object({
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

export type PurchaseLineItemType = z.infer<typeof PurchaseLineItemSchema>;

export const PurchaseSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.coerce.date(),
  supplierId: z.string().uuid(),
  refNumber: z.string().max(50).optional(),
  refDate: z.coerce.date().optional(),
  totalQty: z.coerce.number(),
  subtotal: z.coerce.number(),
  discountPct: z.coerce.number().optional(),
  discountAmt: z.coerce.number().optional(),
  //taxPct: z.coerce.number().optional(),
  totalTaxAmt: z.coerce.number().optional(),
  additionalCharges: z.coerce.number().optional(),
  netAmount: z.coerce.number().optional(),
  notes: z.string().max(255).optional(),
  companyId: z.string().uuid().optional(),
  yearId: z.string().uuid().optional(),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional(),
  lineItems: z.array(PurchaseLineItemSchema).optional()
});

export type PurchaseType = z.infer<typeof PurchaseSchema>;