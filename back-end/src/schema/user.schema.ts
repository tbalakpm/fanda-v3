import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().min(1).max(25),
  password: z.string().min(1).max(100),
  email: z.string().max(100).email().optional(),
  phone: z.string().max(25).optional(),
  firstName: z.string().max(25).optional(),
  lastName: z.string().max(25).optional(),
  role: z.string().max(15).default("user"),
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
});

// extract the inferred type
export type UserType = z.infer<typeof UserSchema>;
