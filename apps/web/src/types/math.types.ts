export interface MathBranch {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface MathEquation {
  id: string;
  branchId: string;
  slug: string;
  title: string;
  latex: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MathSolutionStep {
  title: string;
  expression: string;
  explanation: string;
}

export interface MathSolutionResult {
  success: boolean;
  input: string;
  result: string;
  steps: MathSolutionStep[];
  error?: string;
}

export interface MathGraphPoint {
  x: number;
  y: number;
}

export interface MathGraphData {
  function: string;
  points: MathGraphPoint[];
  roots?: number[];
  vertex?: MathGraphPoint;
  xRange: [number, number];
  yRange: [number, number];
}

export interface MathPracticeProblem {
  id: string;
  problemText: string;
  answer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SolvePayload {
  expression: string;
  operation?: 'solve' | 'factor' | 'expand' | 'differentiate' | 'simplify';
  variable?: string;
}

export interface GraphPayload {
  expression: string;
  xMin?: number;
  xMax?: number;
  step?: number;
}

export interface PracticePayload {
  equationId?: string;
  branch?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
