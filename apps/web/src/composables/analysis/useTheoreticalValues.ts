// القيم النظرية لكل تجربة
export interface TheoryResult {
  expected: number;
  unit: string;
  formula: string;
}

export function getTheoreticalValue(experimentName: string, variable: string, params: Record<string, number>): TheoryResult | null {
  const e = experimentName.toLowerCase();
  // Spring: T = 2π√(m/k)
  if (e.includes('spring') || e.includes('نابض')) {
    const m = params['m'] ?? params['mass'] ?? 0;
    const k = params['k'] ?? 20;
    if (variable === 'T' && m > 0 && k > 0) {
      return { expected: 2 * Math.PI * Math.sqrt(m / k), unit: 's', formula: 'T = 2π√(m/k)' };
    }
    if (variable === 'T2' || variable === 'T²') {
      const T = 2 * Math.PI * Math.sqrt(m / k);
      return { expected: T * T, unit: 's²', formula: 'T² = 4π²·m/k' };
    }
  }
  // Pendulum: T = 2π√(L/g)
  if (e.includes('pendulum') || e.includes('بندول')) {
    const L = params['L'] ?? params['length'] ?? 0;
    const g = params['g'] ?? 9.81;
    if (variable === 'T' && L > 0) {
      return { expected: 2 * Math.PI * Math.sqrt(L / g), unit: 's', formula: 'T = 2π√(L/g)' };
    }
    if (variable === 'g' && L > 0) {
      const T = params['T'] ?? 0;
      if (T > 0) return { expected: (4 * Math.PI * Math.PI * L) / (T * T), unit: 'm/s²', formula: 'g = 4π²L/T²' };
    }
  }
  // Free Fall: h = ½gt²
  if (e.includes('free') || e.includes('fall') || e.includes('سقوط')) {
    const h = params['h'] ?? params['height'] ?? 0;
    const t = params['t'] ?? params['time'] ?? 0;
    const g = params['g'] ?? 9.81;
    if (variable === 'g' && h > 0 && t > 0) {
      return { expected: (2 * h) / (t * t), unit: 'm/s²', formula: 'g = 2h/t²' };
    }
    if (variable === 't' && h > 0 && g > 0) {
      return { expected: Math.sqrt((2 * h) / g), unit: 's', formula: 't = √(2h/g)' };
    }
  }
  return null;
}

export function compareWithTheory(experimentName: string, variable: string, measured: number, params: Record<string, number>) {
  const theory = getTheoreticalValue(experimentName, variable, params);
  if (!theory) return null;
  const diff = Math.abs(measured - theory.expected);
  const pct = theory.expected !== 0 ? (diff / theory.expected) * 100 : 0;
  return {
    measured,
    expected: theory.expected,
    difference: diff,
    percentError: pct,
    unit: theory.unit,
    formula: theory.formula,
    quality: pct < 1 ? 'ممتاز' : pct < 5 ? 'جيد' : pct < 10 ? 'مقبول' : 'يحتاج مراجعة',
    qualityColor: pct < 1 ? '#4ade80' : pct < 5 ? '#fbbf24' : '#f87171',
  };
}
