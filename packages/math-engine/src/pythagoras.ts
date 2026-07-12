import { parseAssignments } from './parser.js';
import type { SolutionResult, SolutionStep } from './types.js';

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

export function solvePythagoras(input: string): SolutionResult {
  try {
    const assignments = parseAssignments(input);
    const vars: Record<string, number | null> = { a: null, b: null, c: null };
    for (const { name, value } of assignments) {
      if (name in vars) vars[name] = value;
      else throw new Error(`Unknown variable: ${name}`);
    }

    const missing = Object.entries(vars).filter(([, v]) => v === null).map(([k]) => k);
    if (missing.length > 1) throw new Error('Exactly one side may be unknown');
    if (missing.length === 0) {
      const lhs = (vars.a! ** 2) + (vars.b! ** 2);
      const rhs = vars.c! ** 2;
      return {
        success: true,
        input,
        result: lhs === rhs ? 'Valid right triangle' : 'Not a right triangle',
        steps: [
          { title: 'Verify', expression: `a^2 + b^2 = c^2 \\Rightarrow ${fmt(vars.a!)}^2 + ${fmt(vars.b!)}^2 = ${fmt(vars.c!)}^2`, explanation: 'Check if the theorem holds.' },
        ],
      };
    }

    const unknown = missing[0];
    let result: number;
    let steps: SolutionStep[];

    if (unknown === 'c') {
      result = Math.sqrt(vars.a! ** 2 + vars.b! ** 2);
      steps = [
        { title: 'Write the theorem', expression: 'a^2 + b^2 = c^2', explanation: 'In a right triangle, the square of the hypotenuse equals the sum of the squares of the legs.' },
        { title: 'Substitute known values', expression: `${fmt(vars.a!)}^2 + ${fmt(vars.b!)}^2 = c^2`, explanation: 'Replace a and b with their values.' },
        { title: 'Solve for c', expression: `c = \\sqrt{${fmt(vars.a!)}^2 + ${fmt(vars.b!)}^2} = ${fmt(result)}`, explanation: 'Take the square root.' },
      ];
    } else if (unknown === 'a') {
      result = Math.sqrt(vars.c! ** 2 - vars.b! ** 2);
      steps = [
        { title: 'Write the theorem', expression: 'a^2 + b^2 = c^2', explanation: 'Pythagorean theorem.' },
        { title: 'Isolate a^2', expression: `a^2 = ${fmt(vars.c!)}^2 - ${fmt(vars.b!)}^2`, explanation: 'Subtract b^2 from both sides.' },
        { title: 'Solve for a', expression: `a = \\sqrt{${fmt(vars.c!)}^2 - ${fmt(vars.b!)}^2} = ${fmt(result)}`, explanation: 'Take the square root.' },
      ];
    } else {
      result = Math.sqrt(vars.c! ** 2 - vars.a! ** 2);
      steps = [
        { title: 'Write the theorem', expression: 'a^2 + b^2 = c^2', explanation: 'Pythagorean theorem.' },
        { title: 'Isolate b^2', expression: `b^2 = ${fmt(vars.c!)}^2 - ${fmt(vars.a!)}^2`, explanation: 'Subtract a^2 from both sides.' },
        { title: 'Solve for b', expression: `b = \\sqrt{${fmt(vars.c!)}^2 - ${fmt(vars.a!)}^2} = ${fmt(result)}`, explanation: 'Take the square root.' },
      ];
    }

    return { success: true, input, result: `${unknown} = ${fmt(result)}`, steps };
  } catch (err) {
    return {
      success: false,
      input,
      result: '',
      steps: [],
      error: err instanceof Error ? err.message : 'Failed to solve Pythagorean theorem',
    };
  }
}
