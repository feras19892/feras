import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1).max(100),
});

export const joinClassSchema = z.object({
  code: z.string().min(1).max(20),
});

export const leaveClassSchema = z.object({
  class_id: z.string().min(1).max(100),
});

export const updateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});
