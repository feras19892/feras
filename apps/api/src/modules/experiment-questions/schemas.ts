import { z } from 'zod';

const questionTypes = ['multiple_choice', 'true_false', 'short_answer', 'fill_blank', 'ordering'] as const;
const templateStatuses = ['draft', 'published', 'archived'] as const;

export const createTemplateSchema = z.object({
  experiment_id: z.string().min(1),
  title: z.string().min(1).max(200),
});

export const updateTemplateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(templateStatuses).optional(),
});

export const addQuestionSchema = z.object({
  order_index: z.number().int().min(0).default(0),
  question_type: z.enum(questionTypes),
  question_text: z.string().min(1).max(3000),
  options: z.array(z.string().min(1).max(1000)).max(10).optional().nullable(),
  correct_answer: z.string().max(2000).optional().nullable(),
  points: z.number().int().min(1).max(100).default(1),
  is_required: z.boolean().default(true),
});

export const updateQuestionSchema = addQuestionSchema;

export const assignTemplateSchema = z.object({
  class_id: z.string().min(1),
});

export const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.number().int().positive(),
      answer_text: z.string().max(3000),
    }),
  ).min(1),
});
