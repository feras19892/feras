import type { RelatedExperiment } from './math-utils';

export interface Branch {
  id: string;
  name: string;
  color: string;
}

export interface Variable {
  name: string;
  label: string;
  type?: 'number' | 'list';
}

export interface Example {
  title: string;
  values: Record<string, number | string>;
  steps: string[];
}

export interface ApplicationProblem {
  question: string;
  hint: string;
  answer: string;
  variables: Record<string, number | string>;
  expectedValue?: number | string;
}

export interface SolverResult {
  result: string;
  steps: string[];
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphLine {
  fn?: (x: number, params: Record<string, number>) => number;
  verticalX?: (params: Record<string, number>) => number;
  params?: Record<string, number>;
  label?: string;
  color?: string;
}

export interface GraphConfig {
  fn: (x: number, params: Record<string, number>) => number;
  xRange: [number, number];
  yRange?: [number, number];
  label: string;
  params?: Record<string, number>;
  lines?: GraphLine[];
}

export interface Constant {
  label: string;
  value: string;
  description?: string;
}

export interface Equation {
  id: string;
  branchId: string;
  name: string;
  formula: string;
  description: string;
  examples: Example[];
  method: string;
  variables: Variable[];
  solve: (values: Record<string, string>, solveFor?: string) => SolverResult;
  defaultSolveFor?: string;
  relatedExperiments?: RelatedExperiment[];
  graph?: GraphConfig;
  constants?: Constant[];
  applicationProblems?: ApplicationProblem[];
}
