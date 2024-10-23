import { z } from "zod";

export const YearSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(15),
  description: z.string().max(255).optional(),
  beginDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  companyId: z.string().uuid().optional(),
  user: z
    .object({
      created: z.string().uuid().optional(),
      updated: z.string().uuid().optional()
    })
    .optional(),
  date: z
    .object({
      created: z.string().optional(),
      updated: z.string().optional()
    })
    .optional()
});

// extract the inferred type
export type YearType = z.infer<typeof YearSchema>;
