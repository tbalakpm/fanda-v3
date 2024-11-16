import { z } from 'zod';
import { AuditDatesSchema, AuditUsersSchema } from '../../schema/embedded/audit.schema';

export const FinancialYearSchema = z.object({
  yearId: z.string().uuid().optional(),
  code: z.string().min(1).max(15),
  description: z.string().max(255).optional(),
  beginDate: z.coerce.date(),
  endDate: z.coerce.date(),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type YearType = z.infer<typeof FinancialYearSchema>;
