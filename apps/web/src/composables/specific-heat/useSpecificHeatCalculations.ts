// Water specific heat (J/kg·°C)
export const C_WATER = 4186

// Metal catalog (hidden from user in "unknown" mode)
export const METAL_CATALOG: Record<string, { c: number; nameAr: string; nameEn: string }> = {
  metalA: { c: 900, nameAr: 'ألمنيوم', nameEn: 'Aluminum' },
  metalB: { c: 385, nameAr: 'نحاس', nameEn: 'Copper' },
  metalC: { c: 450, nameAr: 'حديد', nameEn: 'Iron' },
  metalD: { c: 130, nameAr: 'رصاص', nameEn: 'Lead' },
  metalE: { c: 235, nameAr: 'زنك', nameEn: 'Zinc' },
}

/** Equilibrium temperature from mixing
 *  m_m·c_m·(T_m - Tf) = m_w·c_w·(Tf - T_w)
 *  Tf = (m_m·c_m·T_m + m_w·c_w·T_w) / (m_m·c_m + m_w·c_w)
 */
export function equilibriumTemp(
  metalMassKg: number, metalC: number, metalTemp: number,
  waterMassKg: number, waterTemp: number
): number {
  const num = metalMassKg * metalC * metalTemp + waterMassKg * C_WATER * waterTemp
  const den = metalMassKg * metalC + waterMassKg * C_WATER
  if (den === 0) return waterTemp
  return num / den
}

/** Extract c_m from measured Tf using method of mixtures:
 *  c_m = m_w·c_w·(Tf - T_w) / (m_m·(T_m - Tf))
 */
export function findMetalSpecificHeat(
  metalMassKg: number, metalTemp: number,
  waterMassKg: number, waterTemp: number,
  finalTemp: number
): number {
  const num = waterMassKg * C_WATER * (finalTemp - waterTemp)
  const den = metalMassKg * (metalTemp - finalTemp)
  if (den === 0 || num <= 0) return 0
  return num / den
}

export function linearRegression(pts: { x: number; y: number }[]) {
  const n = pts.length
  if (n < 2) return { m: 0, b: 0, r2: 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (const p of pts) { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x; sumY2 += p.y * p.y }
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n
  const ssTot = sumY2 - (sumY * sumY) / n
  const ssRes = sumY2 - 2 * m * sumXY - 2 * b * sumY + m * m * sumX2 + 2 * m * b * sumX + n * b * b
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { m, b, r2 }
}
