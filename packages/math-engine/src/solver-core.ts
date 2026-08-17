import type {
  MathProblem,
  SolutionResult,
  SolutionStep,
} from './types.js'

/**
 * solveEquation — يحل معادلة رياضية ويعيد النتيجة مع الخطوات
 *
 * يدعم:
 *   • معادلات خطية: ax + b = 0
 *   • معادلات تربيعية: ax² + bx + c = 0
 *   • تبسيط تعبيرات بسيطة
 */
export function solveEquation(problem: MathProblem): SolutionResult {
  const { expression, variable = 'x', operation } = problem

  try {
    const cleaned = expression.replace(/\s/g, '')
    const v = variable

    if (operation === 'solve') {
      // محاولة حل معادلة تربيعية: ax² + bx + c = 0
      const quadMatch = matchQuadratic(cleaned, v)
      if (quadMatch) {
        return solveQuadratic(quadMatch.a, quadMatch.b, quadMatch.c, v, expression)
      }

      // محاولة حل معادلة خطية: ax + b = 0
      const linearMatch = matchLinear(cleaned, v)
      if (linearMatch) {
        return solveLinearEq(linearMatch.a, linearMatch.b, v, expression)
      }

      return {
        success: false,
        input: expression,
        result: '',
        steps: [],
        error: 'تعذر تحليل المعادلة. تأكد من الصيغة (مثال: 2x + 3 = 7)',
      }
    }

    if (operation === 'simplify') {
      return {
        success: true,
        input: expression,
        result: cleaned,
        steps: [
          {
            title: 'التبسيط',
            expression: cleaned,
            explanation: 'تمت إزالة المسافات وتبسيط التعبير.',
          },
        ],
      }
    }

    return {
      success: false,
      input: expression,
      result: '',
      steps: [],
      error: `العملية "${operation}" غير مدعومة حالياً`,
    }
  } catch (err) {
    return {
      success: false,
      input: expression,
      result: '',
      steps: [],
      error: `خطأ غير متوقع: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

// --- أدوات تحليل المعادلات ---

interface QuadCoeffs { a: number; b: number; c: number }

function matchQuadratic(expr: string, v: string): QuadCoeffs | null {
  // صيغة: ax²+bx+c=0 (مع وجود =0 أو =عدد)
  const eqIdx = expr.indexOf('=')
  if (eqIdx === -1) return null
  const lhs = expr.slice(0, eqIdx)
  const rhs = expr.slice(eqIdx + 1)

  // نقل rhs إلى اليسار (نطرح rhs)
  const combined = `${lhs}-(${rhs})`
  const coeffs = extractCoefficients(combined, v)
  if (coeffs && coeffs.a !== 0) return coeffs
  return null
}

function matchLinear(expr: string, v: string): { a: number; b: number } | null {
  const eqIdx = expr.indexOf('=')
  if (eqIdx === -1) return null
  const lhs = expr.slice(0, eqIdx)
  const rhs = expr.slice(eqIdx + 1)

  const combined = `${lhs}-(${rhs})`
  const coeffs = extractCoefficients(combined, v)
  if (coeffs && coeffs.a === 0 && coeffs.b !== 0) {
    return { a: coeffs.b, b: coeffs.c }
  }
  return null
}

export function extractCoefficients(expr: string, v: string): QuadCoeffs | null {
  // تحليل بسيط: نبحث عن معاملات v² و v والثابت
  let a = 0, b = 0, c = 0

  // تقسيم إلى حدود
  const terms = splitTerms(expr)

  for (const term of terms) {
    const t = term.trim()
    if (!t) continue

    // حد يحتوي v²
    if (t.includes(`${v}²`) || t.includes(`${v}^2`)) {
      const coeff = t.replace(`${v}²`, '').replace(`${v}^2`, '').replace(/\*/g, '')
      a += parseCoeff(coeff)
    }
    // حد يحتوي v (بدون ²)
    else if (t.includes(v)) {
      const coeff = t.replace(v, '').replace(/\*/g, '')
      b += parseCoeff(coeff)
    }
    // حد ثابت
    else {
      const val = parseFloat(t)
      if (!isNaN(val)) c += val
    }
  }

  return { a, b, c }
}

function splitTerms(expr: string): string[] {
  const terms: string[] = []
  let current = ''
  let depth = 0

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i]
    if (ch === '(') depth++
    if (ch === ')') depth--
    if ((ch === '+' || ch === '-') && depth === 0 && current) {
      terms.push(current)
      current = ch === '-' ? '-' : ''
    } else {
      current += ch
    }
  }
  if (current) terms.push(current)
  return terms
}

function parseCoeff(s: string): number {
  const trimmed = s.trim()
  if (trimmed === '' || trimmed === '+') return 1
  if (trimmed === '-') return -1
  const val = parseFloat(trimmed)
  return isNaN(val) ? 1 : val
}

function solveQuadratic(a: number, b: number, c: number, v: string, input: string): SolutionResult {
  const steps: SolutionStep[] = []
  steps.push({
    title: 'المعادلة التربيعية',
    expression: `${a}${v}² + ${b}${v} + ${c} = 0`,
    explanation: `المعادلة على الصيغة ax² + bx + c = 0 حيث a=${a}, b=${b}, c=${c}`,
  })

  const discriminant = b * b - 4 * a * c
  steps.push({
    title: 'المميز (Discriminant)',
    expression: `Δ = b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
    explanation: 'إذا Δ > 0 يوجد حلان حقيقيان، إذا Δ = 0 حل واحد، إذا Δ < 0 لا يوجد حل حقيقي.',
  })

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant)
    const x1 = (-b + sqrtD) / (2 * a)
    const x2 = (-b - sqrtD) / (2 * a)
    steps.push({
      title: 'الحل',
      expression: `${v}₁ = ${x1.toFixed(4)}, ${v}₂ = ${x2.toFixed(4)}`,
      explanation: `√Δ = ${sqrtD.toFixed(4)}، ثم ${v} = (-b ± √Δ) / (2a)`,
    })
    return { success: true, input, result: `${v}₁ = ${x1.toFixed(4)}, ${v}₂ = ${x2.toFixed(4)}`, steps }
  }

  if (discriminant === 0) {
    const x = -b / (2 * a)
    steps.push({
      title: 'الحل',
      expression: `${v} = ${x.toFixed(4)}`,
      explanation: 'Δ = 0 فيوجد حل واحد (حل مزدوج).',
    })
    return { success: true, input, result: `${v} = ${x.toFixed(4)}`, steps }
  }

  steps.push({
    title: 'النتيجة',
    expression: 'لا يوجد حل حقيقي',
    explanation: 'Δ < 0 فلا يوجد حل في الأعداد الحقيقية.',
  })
  return { success: true, input, result: 'لا يوجد حل حقيقي', steps }
}

function solveLinearEq(a: number, b: number, v: string, input: string): SolutionResult {
  const steps: SolutionStep[] = []
  steps.push({
    title: 'المعادلة الخطية',
    expression: `${a}${v} + ${b} = 0`,
    explanation: `المعادلة على الصيغة ax + b = 0 حيث a=${a}, b=${b}`,
  })

  if (a === 0) {
    return {
      success: false,
      input,
      result: '',
      steps,
      error: 'معامل المتغير صفر — لا يمكن الحل',
    }
  }

  const x = -b / a
  steps.push({
    title: 'الحل',
    expression: `${v} = -b / a = ${-b} / ${a} = ${x.toFixed(4)}`,
    explanation: 'نقل الثابت للطرف الآخر ثم القسمة على المعامل.',
  })

  return { success: true, input, result: `${v} = ${x.toFixed(4)}`, steps }
}
