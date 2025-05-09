import { z } from 'zod';
import { AuditDatesSchema, AuditUsersSchema } from '../../schema/embedded/audit.schema';

export const ProductCategorySchema = z.object({
  categoryId: z.union([z.null(), z.string().uuid().optional()]),
  code: z.string().min(1).max(15),
  name: z.string().min(1).max(50),
  description: z.union([z.null(), z.string().max(255).optional()]),
  parentId: z.union([z.null(), z.string().uuid().optional()]),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type ProductCategoryType = z.infer<typeof ProductCategorySchema>;
