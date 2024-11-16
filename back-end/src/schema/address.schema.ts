import { z } from 'zod';

export const AddressSchema = z.object({
  line1: z.string().max(50).optional(),
  line2: z.string().max(50).optional(),
  city: z.string().max(25).optional(),
  state: z.string().max(25).optional(),
  postalCode: z.string().max(10).optional()
});

export type AddressType = z.infer<typeof AddressSchema>;
