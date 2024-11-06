import { z } from "zod";
import { AuditDatesSchema, AuditUsersSchema } from "../../schema/embedded/audit.schema";

export const YearSchema = z.object({
  companyId: z.string().uuid().optional(),
  yearId: z.string().uuid().optional(),
  code: z.string().min(1).max(15),
  description: z.string().max(255).optional(),
  beginDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type YearType = z.infer<typeof YearSchema>;
