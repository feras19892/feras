export function wavelengthToColor(nm: number): string {
  if (nm < 400) return '#8B00FF'
  if (nm < 450) return '#4B0082'
  if (nm < 490) return '#0000FF'
  if (nm < 520) return '#00FF00'
  if (nm < 570) return '#FFFF00'
  if (nm < 590) return '#FF7F00'
  if (nm < 620) return '#FF0000'
  return '#8B0000'
}

export function sincSq(beta: number): number {
  if (Math.abs(beta) < 1e-6) return 1
  const s = Math.sin(beta)
  return (s / beta) ** 2
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
