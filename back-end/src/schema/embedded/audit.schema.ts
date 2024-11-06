import { z } from "zod";

export const AuditDatesSchema = z.object({
  created: z.date().optional(),
  updated: z.date().optional()
});

export const AuditUsersSchema = z.object({
  created: z.string().uuid().optional(),
  updated: z.string().uuid().optional()
});
