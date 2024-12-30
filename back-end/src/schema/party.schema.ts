import { z } from 'zod';
import { AddressSchema } from './address.schema';
import { ContactSchema } from './contact.schema';

export const PartySchema = z.object({
  id: z.union([z.null(), z.string().uuid().optional()]),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  address: AddressSchema.optional(),
  contact: ContactSchema.optional(),
  isActive: z.boolean().default(true)
});
