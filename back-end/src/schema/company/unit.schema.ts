import { z } from "zod";
import { AuditDatesSchema, AuditUsersSchema } from "../embedded/audit.schema";

export const UnitSchema = z.object({
  companyId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  code: z.string().min(1).max(15),
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type UnitType = z.infer<typeof UnitSchema>;
