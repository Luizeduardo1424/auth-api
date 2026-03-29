import { z } from 'zod';

export const updateUserSchema = z
  .object({
    email: z.string().email('Invalid email format').optional(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(100)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
      .optional(),
  })
  .refine((data) => data.email || data.username, {
    message: 'At least one field must be provided',
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
