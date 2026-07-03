export function waveSpeed(f: number, lambda: number): number { return f * lambda }
export function pathDiff(y: number, d: number, D: number): number {
  const r1 = Math.sqrt(Math.pow(D, 2) + Math.pow(y - d / 2, 2))
  const r2 = Math.sqrt(Math.pow(D, 2) + Math.pow(y + d / 2, 2))
  return r2 - r1
}
export function amplitudeAt(y: number, d: number, D: number, lambda: number, t: number): number {
  const k = (2 * Math.PI) / lambda
  const omega = 2 * Math.PI
  const r1 = Math.sqrt(Math.pow(D, 2) + Math.pow(y - d / 2, 2))
  const r2 = Math.sqrt(Math.pow(D, 2) + Math.pow(y + d / 2, 2))
  return Math.cos(k * r1 - omega * t) + Math.cos(k * r2 - omega * t)
}
export function constructivePoints(d: number, D: number, lambda: number, nMax: number): { m: number; yMm: number }[] {
  const pts: { m: number; yMm: number }[] = []
  for (let m = -nMax; m <= nMax; m++) {
    const y = (m * lambda * D) / d
    pts.push({ m, yMm: y * 1000 })
  }
  return pts
}
export function destructivePoints(d: number, D: number, lambda: number, nMax: number): { m: number; yMm: number }[] {
  const pts: { m: number; yMm: number }[] = []
  for (let m = -nMax; m < nMax; m++) {
    const y = ((m + 0.5) * lambda * D) / d
    pts.push({ m, yMm: y * 1000 })
  }
  return pts
}
