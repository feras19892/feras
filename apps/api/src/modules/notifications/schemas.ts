import { z } from 'zod';

export const createNotificationSchema = z.object({
  user_id: z.number().int(),
  type: z.enum(['report_submitted', 'report_graded', 'report_resubmitted', 'comment_added', 'class_joined']),
  title: z.string().min(1).max(200),
  message: z.string().max(1000).optional(),
  report_id: z.number().int().optional(),
  class_id: z.string().optional(),
});
