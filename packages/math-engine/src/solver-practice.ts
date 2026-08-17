import type { PracticeProblem } from './types.js'

/**
 * generatePracticeProblem — يولّد مسألة تدريب عشوائية
 */
export function generatePracticeProblem(
  branch: string,
  difficulty: 'easy' | 'medium' | 'hard',
): PracticeProblem | null {
  const problems = getProblemsForBranch(branch, difficulty)
  if (problems.length === 0) return null
  const idx = Math.floor(Math.random() * problems.length)
  return problems[idx]
}

function getProblemsForBranch(
  branch: string,
  difficulty: 'easy' | 'medium' | 'hard',
): PracticeProblem[] {
  const bank: Record<string, Record<string, PracticeProblem[]>> = {
    algebra: {
      easy: [
        { id: 'alg-e1', problemText: 'حل: 2x + 5 = 11', answer: 'x = 3', hint: 'اطرح 5 ثم اقسم على 2', difficulty: 'easy' },
        { id: 'alg-e2', problemText: 'حل: 3x - 7 = 8', answer: 'x = 5', hint: 'اجمع 7 ثم اقسم على 3', difficulty: 'easy' },
        { id: 'alg-e3', problemText: 'حل: x/2 = 6', answer: 'x = 12', hint: 'اضرب الطرفين في 2', difficulty: 'easy' },
      ],
      medium: [
        { id: 'alg-m1', problemText: 'حل: x² - 5x + 6 = 0', answer: 'x = 2, x = 3', hint: 'حلل إلى (x-2)(x-3)', difficulty: 'medium' },
        { id: 'alg-m2', problemText: 'حل: x² + 7x + 12 = 0', answer: 'x = -3, x = -4', hint: 'حلل إلى (x+3)(x+4)', difficulty: 'medium' },
        { id: 'alg-m3', problemText: 'حل: 2x² - 8 = 0', answer: 'x = ±2', hint: 'قسم على 2 ثم خذ الجذر', difficulty: 'medium' },
      ],
      hard: [
        { id: 'alg-h1', problemText: 'حل: x² - 4x + 1 = 0', answer: 'x = 2±√3', hint: 'استخدم القانون العام', difficulty: 'hard' },
        { id: 'alg-h2', problemText: 'حل: 3x² + 2x - 5 = 0', answer: 'x = 1, x = -5/3', hint: 'استخدم القانون العام', difficulty: 'hard' },
      ],
    },
    calculus: {
      easy: [
        { id: 'cal-e1', problemText: 'أوجد مشتقة: f(x) = 3x²', answer: "f'(x) = 6x", hint: 'قوة القاعدة: ضعف الأس × المعامل', difficulty: 'easy' },
        { id: 'cal-e2', problemText: 'أوجد مشتقة: f(x) = 5x', answer: "f'(x) = 5", hint: 'مشتقة الدالة الخطية = المعامل', difficulty: 'easy' },
      ],
      medium: [
        { id: 'cal-m1', problemText: 'أوجد مشتقة: f(x) = x³ - 2x² + x', answer: "f'(x) = 3x² - 4x + 1", hint: 'طبق قاعدة القوة على كل حد', difficulty: 'medium' },
        { id: 'cal-m2', problemText: 'أوجد مشتقة: f(x) = sin(x)', answer: "f'(x) = cos(x)", hint: 'مشتقة الجيب = جيب تمام', difficulty: 'medium' },
      ],
      hard: [
        { id: 'cal-h1', problemText: 'أوجد مشتقة: f(x) = x·sin(x)', answer: "f'(x) = sin(x) + x·cos(x)", hint: 'استخدم قاعدة الضرب', difficulty: 'hard' },
        { id: 'cal-h2', problemText: 'أوجد مشتقة: f(x) = e^(2x)', answer: "f'(x) = 2e^(2x)", hint: 'قاعدة السلسلة', difficulty: 'hard' },
      ],
    },
    geometry: {
      easy: [
        { id: 'geo-e1', problemText: 'مساحة دائرة نصف قطرها 5؟', answer: '25π ≈ 78.54', hint: 'A = πr²', difficulty: 'easy' },
        { id: 'geo-e2', problemText: 'محيط مربع ضلعه 7؟', answer: '28', hint: 'P = 4 × الضلع', difficulty: 'easy' },
      ],
      medium: [
        { id: 'geo-m1', problemText: 'مساحة مثلث قاعدته 10 وارتفاعه 6؟', answer: '30', hint: 'A = ½ × القاعدة × الارتفاع', difficulty: 'medium' },
        { id: 'geo-m2', problemText: 'حجم مكعب حرفه 4؟', answer: '64', hint: 'V = الحرف³', difficulty: 'medium' },
      ],
      hard: [
        { id: 'geo-h1', problemText: 'حجم كرة نصف قطرها 3؟', answer: '36π ≈ 113.1', hint: 'V = (4/3)πr³', difficulty: 'hard' },
      ],
    },
  }

  return bank[branch]?.[difficulty] ?? []
}
