import { z } from 'zod';
import { AuditDatesSchema, AuditUsersSchema } from '../../schema/embedded/audit.schema';
import { ProductTypes } from './product-type.enum';
import { TaxPreferences } from './tax-preference.enum';

export const ProductSchema = z.object({
  productId: z.string().uuid().optional(),
  code: z.string().min(1).max(15),
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  productType: z.nativeEnum(ProductTypes),
  categoryId: z.string().uuid().optional(),
  baseUnitId: z.string().uuid().optional(),
  buyingPrice: z.number().optional(),
  marginPct: z.number().optional(),
  marginAmt: z.number().optional(),
  sellingPrice: z.number().optional(),
  taxCode: z.string().optional(),
  taxPct: z.number().optional(),
  taxPreference: z.nativeEnum(TaxPreferences),
  isPriceInclusiveTax: z.boolean().default(false),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type ProductType = z.infer<typeof ProductSchema>;
