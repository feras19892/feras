export function speedOfSoundAir(tempC: number): number { return 331.3 + 0.6 * tempC }
export function wavelengthClosedEnd(lengthM: number, harmonic: 1 | 3): number { return (4 * lengthM) / harmonic }
export function speedFromResonance(lengthM: number, frequency: number, harmonic: 1 | 3): number {
  return frequency * wavelengthClosedEnd(lengthM, harmonic)
}

export function linearRegression(pts: { x: number; y: number }[]) {
  const n = pts.length
  if (n < 2) return { m: 0, b: 0, r2: 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (const p of pts) {
    sumX += p.x; sumY += p.y; sumXY += p.x * p.y
    sumX2 += p.x * p.x; sumY2 += p.y * p.y
  }
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n
  const ssTot = sumY2 - (sumY * sumY) / n
  const ssRes = sumY2 - 2 * m * sumXY - 2 * b * sumY + m * m * sumX2 + 2 * m * b * sumX + n * b * b
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { m, b, r2 }
}
