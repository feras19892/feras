import type { MathProblem, SolutionResult, SolutionStep } from './types.js';
import { solveEquation as solveAlgebra } from './equation.js';
import { differentiateExpression } from './derivative.js';
import { solvePythagoras } from './pythagoras.js';
import { evaluateExpression } from './evaluator.js';
import { parseAssignments } from './parser.js';

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function solveEvaluation(problem: MathProblem): SolutionResult {
  try {
    const assignments = parseAssignments(problem.expression);
    const vars: Record<string, number> = {};
    for (const { name, value } of assignments) {
      if (value === null) throw new Error(`Value for ${name} is required`);
      vars[name] = value;
    }
    const expr = problem.variable ?? 'x';
    const result = evaluateExpression(expr, vars);
    const steps: SolutionStep[] = [
      { title: 'Substitute values', expression: problem.expression, explanation: 'Replace each variable with its given value.' },
      { title: 'Evaluate', expression: `${expr} = ${fmt(result)}`, explanation: 'Compute the final value.' },
    ];
    return { success: true, input: problem.expression, result: fmt(result), steps };
  } catch (err) {
    return {
      success: false,
      input: problem.expression,
      result: '',
      steps: [],
      error: err instanceof Error ? err.message : 'Failed to evaluate expression',
    };
  }
}

export function solveEquation(problem: MathProblem): SolutionResult {
  if (problem.operation === 'differentiate') {
    return differentiateExpression(problem.expression, problem.variable);
  }
  if (problem.operation === 'pythagoras') {
    return solvePythagoras(problem.expression);
  }
  if (problem.operation === 'evaluate') {
    return solveEvaluation(problem);
  }
  return solveAlgebra(problem);
}
