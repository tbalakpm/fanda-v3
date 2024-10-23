// import { Company } from "../entity/company.entity";
import { z } from "zod";
import { AddressSchema } from "./address.schema";
import { ContactSchema } from "./contact.schema";

export const CompanySchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  address: AddressSchema.optional(),
  contact: ContactSchema.optional(),
  isActive: z.boolean().default(true),
  date: z
    .object({
      created: z.date().optional(),
      updated: z.date().optional()
    })
    .optional(),
  user: z
    .object({
      created: z.string().uuid().optional(),
      updated: z.string().uuid().optional()
    })
    .optional()
  // createdBy: z.string().uuid().optional(),
  // updatedBy: z.string().uuid().optional()
});

// extract the inferred type
export type CompanyType = z.infer<typeof CompanySchema>;
