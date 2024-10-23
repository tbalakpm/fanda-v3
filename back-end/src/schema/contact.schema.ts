import { z } from "zod";

export const ContactSchema = z.object({
  salutation: z.string().max(10).optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  mobile: z.string().max(25).optional(),
  email: z.string().max(100).optional()
});

export type ContactType = z.infer<typeof ContactSchema>;
