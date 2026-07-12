import { parseEquation, parsePolynomial } from './parser.js';
import type { MathProblem, SolutionResult, SolutionStep } from './types.js';

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function buildLinearSteps(a: number, b: number, variable: string): SolutionStep[] {
  const x = -b / a;
  return [
    {
      title: 'Write the equation',
      expression: `${fmt(a)}${variable} + ${fmt(b)} = 0`,
      explanation: 'Move all terms to one side to get standard form.',
    },
    {
      title: 'Isolate the variable',
      expression: `${fmt(a)}${variable} = ${fmt(-b)}`,
      explanation: 'Subtract the constant term from both sides.',
    },
    {
      title: 'Solve',
      expression: `${variable} = ${fmt(x)}`,
      explanation: 'Divide both sides by the coefficient.',
    },
  ];
}

function buildQuadraticSteps(a: number, b: number, c: number, variable: string, x1: number, x2: number, discriminant: number): SolutionStep[] {
  const steps: SolutionStep[] = [
    {
      title: 'Identify coefficients',
      expression: `a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}`,
      explanation: 'Compare with the standard form ax^2 + bx + c = 0.',
    },
    {
      title: 'Calculate the discriminant',
      expression: `\\Delta = b^2 - 4ac = ${fmt(discriminant)}`,
      explanation: 'The discriminant determines the number of real solutions.',
    },
  ];
  if (discriminant < 0) {
    steps.push({
      title: 'No real solutions',
      expression: '\\Delta < 0',
      explanation: 'A negative discriminant means there are no real roots.',
    });
    return steps;
  }
  steps.push({
    title: 'Apply the quadratic formula',
    expression: `${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}`,
    explanation: 'Use the quadratic formula to find the roots.',
  });
  const result = x1 === x2 ? `${variable} = ${fmt(x1)}` : `${variable}_1 = ${fmt(x1)}, ${variable}_2 = ${fmt(x2)}`;
  steps.push({
    title: 'Solutions',
    expression: result,
    explanation: 'These are the roots of the equation.',
  });
  return steps;
}

function solveLinear(a: number, b: number, variable: string): SolutionResult {
  if (a === 0) {
    if (b === 0) {
      return { success: true, input: '', result: 'Infinite solutions', steps: [] };
    }
    return { success: true, input: '', result: 'No solution', steps: [] };
  }
  const x = -b / a;
  return {
    success: true,
    input: '',
    result: `${variable} = ${fmt(x)}`,
    steps: buildLinearSteps(a, b, variable),
  };
}

function solveQuadratic(a: number, b: number, c: number, variable: string): SolutionResult {
  const discriminant = b * b - 4 * a * c;
  let result: string;
  let x1 = 0;
  let x2 = 0;

  if (discriminant < 0) {
    result = 'No real solutions';
  } else {
    const sqrtD = Math.sqrt(discriminant);
    x1 = (-b + sqrtD) / (2 * a);
    x2 = (-b - sqrtD) / (2 * a);
    result = x1 === x2 ? `${variable} = ${fmt(x1)}` : `${variable}_1 = ${fmt(x1)}, ${variable}_2 = ${fmt(x2)}`;
  }

  return {
    success: true,
    input: '',
    result,
    steps: buildQuadraticSteps(a, b, c, variable, x1, x2, discriminant),
  };
}

function factorQuadratic(a: number, b: number, c: number, variable: string): SolutionResult {
  if (a === 0) {
    return { success: true, input: '', result: 'Not a quadratic expression', steps: [] };
  }

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return { success: true, input: '', result: 'Not factorable over the reals', steps: [] };
  }

  const sqrtD = Math.sqrt(discriminant);
  const x1 = (-b + sqrtD) / (2 * a);
  const x2 = (-b - sqrtD) / (2 * a);

  if (!Number.isInteger(x1) || !Number.isInteger(x2)) {
    return { success: true, input: '', result: 'Not factorable with integer roots', steps: [] };
  }

  const leading = a === 1 ? '' : String(a);
  const term1 = x1 >= 0 ? `${variable} - ${fmt(Math.abs(x1))}` : `${variable} + ${fmt(Math.abs(x1))}`;
  const term2 = x2 >= 0 ? `${variable} - ${fmt(Math.abs(x2))}` : `${variable} + ${fmt(Math.abs(x2))}`;
  const result = `${leading}(${term1})(${term2})`.trim();

  return {
    success: true,
    input: '',
    result,
    steps: [
      { title: 'Find the roots', expression: `${variable}_1 = ${fmt(x1)}, ${variable}_2 = ${fmt(x2)}`, explanation: 'Use the quadratic formula.' },
      { title: 'Write the factors', expression: result, explanation: 'Each root r gives a factor (x - r).' },
    ],
  };
}

function simplifyPolynomial(input: string, variable: string): SolutionResult {
  const poly = parsePolynomial(input, variable);
  const terms: string[] = [];
  const powers = Array.from(poly.coefficients.keys()).sort((p1, p2) => p2 - p1);
  for (const power of powers) {
    const coef = poly.coefficients.get(power) ?? 0;
    if (coef === 0) continue;
    let term = fmt(coef);
    if (power === 1) term += variable;
    else if (power > 1) term += `${variable}^${power}`;
    terms.push(term);
  }
  const result = terms.length ? terms.join(' + ').replace(/\+ -/g, '- ') : '0';
  return {
    success: true,
    input,
    result,
    steps: [
      { title: 'Combine like terms', expression: result, explanation: 'Add coefficients of terms with the same power.' },
    ],
  };
}

function getStandardForm(expression: string, variable: string): { a: number; b: number; c: number } {
  if (expression.includes('=')) {
    return parseEquation(expression, variable);
  }
  const poly = parsePolynomial(expression, variable);
  return {
    a: poly.coefficients.get(2) ?? 0,
    b: poly.coefficients.get(1) ?? 0,
    c: poly.coefficients.get(0) ?? 0,
  };
}

export function solveEquation(problem: MathProblem): SolutionResult {
  try {
    const variable = problem.variable || 'x';
    const { a, b, c } = getStandardForm(problem.expression, variable);
    let solved: SolutionResult;

    switch (problem.operation) {
      case 'factor':
        solved = factorQuadratic(a, b, c, variable);
        break;
      case 'simplify':
        solved = simplifyPolynomial(problem.expression, variable);
        break;
      default:
        if (a === 0) {
          solved = solveLinear(b, c, variable);
        } else {
          solved = solveQuadratic(a, b, c, variable);
        }
    }

    return { ...solved, input: problem.expression };
  } catch (err) {
    return {
      success: false,
      input: problem.expression,
      result: '',
      steps: [],
      error: err instanceof Error ? err.message : 'Failed to solve equation',
    };
  }
}
