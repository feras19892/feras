export type MathOperation = 'solve' | 'factor' | 'expand' | 'differentiate' | 'simplify' | 'pythagoras' | 'evaluate';

export interface MathProblem {
  expression: string;
  variable?: string;
  operation: MathOperation;
}

export interface SolutionStep {
  title: string;
  expression: string;
  explanation: string;
}

export interface SolutionResult {
  success: boolean;
  input: string;
  result: string;
  steps: SolutionStep[];
  error?: string;
}

export interface GraphOptions {
  xMin: number;
  xMax: number;
  step: number;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphData {
  function: string;
  points: GraphPoint[];
  roots?: number[];
  vertex?: GraphPoint;
  xRange: [number, number];
  yRange: [number, number];
}

export interface PracticeProblem {
  id: string;
  problemText: string;
  answer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
