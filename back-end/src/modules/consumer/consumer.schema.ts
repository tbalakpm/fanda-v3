import { z } from "zod";
import { AddressSchema } from "../../schema/address.schema";
import { ContactSchema } from "../../schema/contact.schema";
import { AuditDatesSchema, AuditUsersSchema } from "../../schema/embedded/audit.schema";
// import { AddressSchema, ContactSchema, AuditDatesSchema, AuditUsersSchema } from "../../schema";

export const ConsumerSchema = z.object({
  consumerId: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  address: AddressSchema.optional(),
  contact: ContactSchema.optional(),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional(),
  user: AuditUsersSchema.optional()
});

// extract the inferred type
export type ConsumerType = z.infer<typeof ConsumerSchema>;
