import { fetchJson } from './http';
import type {
  MathBranch,
  MathEquation,
  MathGraphData,
  MathPracticeProblem,
  MathSolutionResult,
  GraphPayload,
  PracticePayload,
  SolvePayload,
} from '../types/math.types.js';

export async function fetchBranches(): Promise<MathBranch[]> {
  return fetchJson('/api/math/branches');
}

export async function fetchEquations(branchSlug: string): Promise<MathEquation[]> {
  return fetchJson(`/api/math/branches/${encodeURIComponent(branchSlug)}/equations`);
}

export async function fetchEquation(id: string): Promise<MathEquation> {
  return fetchJson(`/api/math/equations/${encodeURIComponent(id)}`);
}

export async function solveProblem(payload: SolvePayload): Promise<MathSolutionResult> {
  return fetchJson('/api/math/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function fetchGraphData(payload: GraphPayload): Promise<MathGraphData> {
  return fetchJson('/api/math/graph-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function fetchPracticeProblem(payload: PracticePayload): Promise<MathPracticeProblem> {
  return fetchJson('/api/math/practice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
