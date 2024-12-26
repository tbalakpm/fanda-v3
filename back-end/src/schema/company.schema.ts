// import { Company } from "../entity/company.entity";
import { z } from 'zod';
import { AddressSchema } from './address.schema';
import { ContactSchema } from './contact.schema';
import { AuditDatesSchema, AuditUsersSchema } from './embedded/audit.schema';

export const CompanySchema = z.object({
  companyId: z.union([z.null(), z.string().uuid().optional()]),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  address: AddressSchema.optional(),
  contact: ContactSchema.optional(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type CompanyType = z.infer<typeof CompanySchema>;
