import { z } from 'zod';
import { AuditDatesSchema } from './embedded/audit.schema';

export const UserSchema = z.object({
  userId: z.string().uuid().optional(),
  username: z.string().min(1).max(25),
  password: z.string().min(1).max(25),
  email: z.union([z.literal(''), z.string().max(100).email()]),
  phone: z.string().max(25).optional(),
  firstName: z.string().max(25).optional(),
  lastName: z.string().max(25).optional(),
  role: z.string().max(15).default('user'),
  isActive: z.boolean().default(true),
  date: AuditDatesSchema.optional()
});

// extract the inferred type
export type UserType = z.infer<typeof UserSchema>;
