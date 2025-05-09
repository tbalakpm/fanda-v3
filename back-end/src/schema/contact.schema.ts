import { z } from 'zod';

export const ContactSchema = z.object({
  salutation: z.string().max(10).optional(),
  firstName: z.string().max(25).optional(),
  lastName: z.string().max(25).optional(),
  mobile: z.string().max(25).optional(),
  email: z.union([z.literal(''), z.string().max(100).email().optional()])
});

export type ContactType = z.infer<typeof ContactSchema>;
