import { z } from 'zod';
export const createReportSchema = z.object({
    class_id: z.string().min(1),
    experiment_type: z.string().min(1).max(50),
    experiment_name: z.string().min(1).max(100),
    experiment_id: z.string().optional(),
    readings: z.string(),
    params: z.string().optional(),
    // جديد:
    student_info: z.string().optional(),
    conclusion: z.string().optional(),
    conclusion_errors: z.string().optional(),
    conclusion_improvements: z.string().optional(),
    columns: z.string().optional(),
    equations: z.string().optional(),
    plots: z.string().optional(),
    chart_snapshot: z.string().max(500_000).optional(),
});
export const gradeReportSchema = z.object({
    grade: z.number().int().min(0).max(100),
    feedback: z.string().max(2000).optional(),
});
export const addCommentSchema = z.object({
    content: z.string().min(1).max(2000),
});
export const listReportsQuery = z.object({
    class_id: z.string().optional(),
    student_id: z.string().optional(),
    status: z.enum(['draft', 'submitted', 'graded', 'resubmitted']).optional(),
});
