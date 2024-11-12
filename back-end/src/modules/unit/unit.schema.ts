import { z } from "zod";
import { AuditDatesSchema, AuditUsersSchema } from "../../schema/embedded/audit.schema";

export const UnitSchema = z.object({
  unitId: z.string().uuid().optional(),
  code: z.string().min(1).max(15),
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  baseUnitId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type UnitType = z.infer<typeof UnitSchema>;
