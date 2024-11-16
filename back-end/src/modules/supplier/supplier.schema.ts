import { z } from 'zod';
import { AddressSchema } from '../../schema/address.schema';
import { ContactSchema } from '../../schema/contact.schema';
import { AuditDatesSchema, AuditUsersSchema } from '../../schema/embedded/audit.schema';
// import { AddressSchema, ContactSchema, AuditDatesSchema, AuditUsersSchema } from "../../schema";

export const SupplierSchema = z.object({
  supplierId: z.string().uuid().optional(),
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
export type SupplierType = z.infer<typeof SupplierSchema>;
