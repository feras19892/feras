import { z } from 'zod';
export const SolveSchema = z.object({
    expression: z.string().min(1),
    operation: z.enum(['solve', 'factor', 'expand', 'differentiate', 'simplify', 'pythagoras', 'evaluate']).default('solve'),
    variable: z.string().default('x'),
    branch: z.string().optional(),
});
export const GraphDataSchema = z.object({
    expression: z.string().min(1),
    xMin: z.number().default(-10),
    xMax: z.number().default(10),
    step: z.number().default(0.1),
});
export const PracticeSchema = z.object({
    equationId: z.string().optional(),
    branch: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});
