import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  role: z.enum(['student', 'teacher']).optional().default('student'),
  school_code: z.string().optional().nullable(),
});

export const schoolRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  max_students: z.number().int().min(1).max(10000).optional().default(50),
  max_teachers: z.number().int().min(1).max(500).optional().default(10),
});

export const schoolLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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
