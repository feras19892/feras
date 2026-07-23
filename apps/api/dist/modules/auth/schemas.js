import { z } from 'zod';
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
export const registerSchema = loginSchema.extend({
    name: z.string().min(2),
    role: z.enum(['student', 'teacher']).optional().default('student'),
});
export const passwordUpdateSchema = z.object({
    user_id: z.number().int().positive(),
    new_password: z.string().min(8).max(128),
});
