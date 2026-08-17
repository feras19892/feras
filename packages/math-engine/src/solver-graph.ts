import type {
  GraphOptions,
  GraphPoint,
  GraphData,
} from './types.js'
import { extractCoefficients } from './solver-core.js'

/**
 * generateGraphData — يولّد نقاط الرسم لدالة معينة
 *
 * يدعم:
 *   • دوال تربيعية: ax² + bx + c
 *   • دوال خطية: ax + b
 *   • دوال أسية: a*e^(bx)
 *   • دوال مثلثية: a*sin(bx) / a*cos(bx)
 */
export function generateGraphData(expression: string, options: GraphOptions): GraphData {
  const { xMin, xMax, step } = options
  const points: GraphPoint[] = []
  const roots: number[] = []

  const fn = parseFunction(expression)

  for (let x = xMin; x <= xMax + step / 2; x += step) {
    const y = fn(x)
    if (isFinite(y)) {
      points.push({ x: round(x, 6), y: round(y, 6) })
    }
  }

  // البحث عن الجذور (نقاط تقاطع المحور x)
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    if (prev.y === 0) {
      roots.push(prev.x)
    } else if (prev.y * curr.y < 0) {
      // تقاطع — استيفاء خطي
      const rootX = prev.x + (0 - prev.y) * (curr.x - prev.x) / (curr.y - prev.y)
      roots.push(round(rootX, 6))
    }
  }

  // حساب yRange
  const ys = points.map(p => p.y)
  const yMin = ys.length ? Math.min(...ys) : 0
  const yMax = ys.length ? Math.max(...ys) : 0

  // محاولة إيجاد الرأس للدالة التربيعية
  let vertex: GraphPoint | undefined
  const quad = tryParseQuadratic(expression)
  if (quad && quad.a !== 0) {
    const vx = -quad.b / (2 * quad.a)
    const vy = fn(vx)
    vertex = { x: round(vx, 6), y: round(vy, 6) }
  }

  return {
    function: expression,
    points,
    roots: roots.length ? roots : undefined,
    vertex,
    xRange: [xMin, xMax],
    yRange: [yMin, yMax],
  }
}

function parseFunction(expr: string): (x: number) => number {
  const cleaned = expr.replace(/\s/g, '')

  // دالة تربيعية: ax²+bx+c
  const quad = tryParseQuadratic(cleaned)
  if (quad) {
    return (x: number) => quad.a * x * x + quad.b * x + quad.c
  }

  // دالة خطية: ax+b
  const linMatch = cleaned.match(/^([+-]?\d*\.?\d*)\*?x([+-]\d*\.?\d*)?$/)
  if (linMatch) {
    const a = linMatch[1] === '' || linMatch[1] === '+' ? 1 : linMatch[1] === '-' ? -1 : parseFloat(linMatch[1])
    const b = linMatch[2] ? parseFloat(linMatch[2]) : 0
    return (x: number) => a * x + b
  }

  // دالة مثلثية: a*sin(bx) أو a*cos(bx)
  const sinMatch = cleaned.match(/^([+-]?\d*\.?\d*)\*?sin\(([+-]?\d*\.?\d*)\*?x\)$/)
  if (sinMatch) {
    const a = sinMatch[1] === '' || sinMatch[1] === '+' ? 1 : sinMatch[1] === '-' ? -1 : parseFloat(sinMatch[1])
    const b = sinMatch[2] === '' || sinMatch[2] === '+' ? 1 : parseFloat(sinMatch[2])
    return (x: number) => a * Math.sin(b * x)
  }

  const cosMatch = cleaned.match(/^([+-]?\d*\.?\d*)\*?cos\(([+-]?\d*\.?\d*)\*?x\)$/)
  if (cosMatch) {
    const a = cosMatch[1] === '' || cosMatch[1] === '+' ? 1 : cosMatch[1] === '-' ? -1 : parseFloat(cosMatch[1])
    const b = cosMatch[2] === '' || cosMatch[2] === '+' ? 1 : parseFloat(cosMatch[2])
    return (x: number) => a * Math.cos(b * x)
  }

  // دالة أسية: a*e^(bx)
  const expMatch = cleaned.match(/^([+-]?\d*\.?\d*)\*?e\^\(([+-]?\d*\.?\d*)\*?x\)$/)
  if (expMatch) {
    const a = expMatch[1] === '' || expMatch[1] === '+' ? 1 : expMatch[1] === '-' ? -1 : parseFloat(expMatch[1])
    const b = expMatch[2] === '' || expMatch[2] === '+' ? 1 : parseFloat(expMatch[2])
    return (x: number) => a * Math.exp(b * x)
  }

  // افتراضي: إرجاع 0
  return () => 0
}

function tryParseQuadratic(expr: string): { a: number; b: number; c: number } | null {
  const v = 'x'
  if (!expr.includes(`${v}²`) && !expr.includes(`${v}^2`)) return null
  const coeffs = extractCoefficients(expr, v)
  return coeffs
}

function round(n: number, digits: number): number {
  const f = Math.pow(10, digits)
  return Math.round(n * f) / f
}
