export interface Quiz {
  id: number;
  class_id: string;
  teacher_id: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  points: number;
}

export interface QuizSubmission {
  id: number;
  quiz_id: number;
  student_id: number;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total_points: number | null;
}
