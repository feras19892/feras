import type { PracticeProblem } from './types.js';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function linearProblem(difficulty: 'easy' | 'medium' | 'hard'): PracticeProblem {
  const max = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50;
  const a = randomInt(2, max);
  const x = randomInt(1, max);
  const b = randomInt(1, max);
  const c = a * x + b;
  return {
    id: `linear-${Date.now()}`,
    problemText: `\text{Solve for } x: ${a}x + ${b} = ${c}`,
    answer: String(x),
    hint: 'Subtract the constant from both sides, then divide by the coefficient of x.',
    difficulty,
  };
}

function quadraticProblem(difficulty: 'easy' | 'medium' | 'hard'): PracticeProblem {
  const max = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
  const r1 = randomInt(1, max);
  const r2 = randomInt(1, max);
  const a = randomInt(1, max);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const bSign = b >= 0 ? '+' : '-';
  const cSign = c >= 0 ? '+' : '-';
  const bAbs = Math.abs(b);
  const cAbs = Math.abs(c);
  return {
    id: `quadratic-${Date.now()}`,
    problemText: `\text{Find the roots of: } ${a}x^2 ${bSign} ${bAbs === 1 ? '' : bAbs}x ${cSign} ${cAbs} = 0`,
    answer: `${r1}, ${r2}`,
    hint: 'Use the quadratic formula or factor the expression.',
    difficulty,
  };
}

function derivativeProblem(difficulty: 'easy' | 'medium' | 'hard'): PracticeProblem {
  const n = difficulty === 'easy' ? randomInt(2, 4) : difficulty === 'medium' ? randomInt(2, 6) : randomInt(3, 8);
  return {
    id: `derivative-${Date.now()}`,
    problemText: `\\frac{d}{dx} x^{${n}}`,
    answer: `${n}x^{${n - 1}}`,
    hint: 'Use the power rule: d/dx x^n = n x^(n-1).',
    difficulty,
  };
}

function pythagorasProblem(difficulty: 'easy' | 'medium' | 'hard'): PracticeProblem {
  const min = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
  const a = randomInt(min, min + 6);
  const b = randomInt(min, min + 6);
  const c = Math.round(Math.sqrt(a * a + b * b));
  return {
    id: `pythagoras-${Date.now()}`,
    problemText: `\\text{A right triangle has legs } a=${a} \text{ and } b=${b}. \\text{ Find } c.`,
    answer: String(c),
    hint: 'Use c = sqrt(a^2 + b^2).',
    difficulty,
  };
}

export function generatePracticeProblem(
  branch: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): PracticeProblem | null {
  switch (branch) {
    case 'algebra':
      return Math.random() > 0.5 ? linearProblem(difficulty) : quadraticProblem(difficulty);
    case 'calculus':
      return derivativeProblem(difficulty);
    case 'geometry':
      return pythagorasProblem(difficulty);
    default:
      return linearProblem(difficulty);
  }
}
