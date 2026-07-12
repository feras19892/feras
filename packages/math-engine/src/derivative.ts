import { parsePolynomial } from './parser.js';
import type { SolutionResult, SolutionStep } from './types.js';

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

export function differentiateExpression(input: string, variable = 'x'): SolutionResult {
  try {
    const poly = parsePolynomial(input, variable);
    const derived = new Map<number, number>();
    const steps: SolutionStep[] = [
      { title: 'Apply the power rule', expression: `\\frac{d}{d${variable}} ${variable}^n = n ${variable}^{n-1}`, explanation: 'Bring down the exponent and reduce it by one.' },
    ];

    const terms: string[] = [];
    const powers = Array.from(poly.coefficients.keys()).sort((a, b) => b - a);
    for (const power of powers) {
      const coef = poly.coefficients.get(power) ?? 0;
      if (power === 0) continue;
      const newCoef = coef * power;
      const newPower = power - 1;
      derived.set(newPower, (derived.get(newPower) ?? 0) + newCoef);

      let term = fmt(newCoef);
      if (newPower === 1) term += variable;
      else if (newPower > 1) term += `${variable}^${newPower}`;
      terms.push(term);
    }

    const result = terms.length ? terms.join(' + ').replace(/\+ -/g, '- ') : '0';
    steps.push({ title: 'Result', expression: result, explanation: 'Derivative of the polynomial.' });

    return {
      success: true,
      input,
      result,
      steps,
    };
  } catch (err) {
    return {
      success: false,
      input,
      result: '',
      steps: [],
      error: err instanceof Error ? err.message : 'Failed to differentiate',
    };
  }
}
