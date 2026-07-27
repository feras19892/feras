import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  role: z.enum(['student', 'teacher']).optional().default('student'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(16),
});

export const passwordUpdateSchema = z.object({
  user_id: z.number().int().positive(),
  new_password: z.string().min(8).max(128),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

export const nameRequestSchema = z.object({
  requested_name: z.string().min(2).max(100),
});
