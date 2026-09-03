import { z } from 'zod';

export const passwordComplexity = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(2),
  role: z.enum(['student', 'teacher']).optional().default('student'),
  school_code: z.string().optional().nullable(),
  invite_code: z.string().optional().nullable(),
  age: z.number().int().min(5).max(120).optional().nullable(),
  fingerprint: z.string().optional().nullable(),
  consent: z.boolean().optional().default(false),
});

export const schoolRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
  max_students: z.number().int().min(1).max(10000).optional().default(50),
  max_teachers: z.number().int().min(1).max(500).optional().default(10),
});

export const schoolLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(16),
});

export const passwordUpdateSchema = z.object({
  user_id: z.number().int().positive(),
  new_password: passwordComplexity,
  current_password: z.string().min(1).max(128).optional(),
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
