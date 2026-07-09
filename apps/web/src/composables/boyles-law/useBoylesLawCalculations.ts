export function boyleProduct(p: number, v: number): number { return p * v }

export function pressureAtVolume(p0: number, v0: number, v: number): number {
  if (v === 0) return 0
  return (p0 * v0) / v
}

export function volumeAtPressure(p0: number, v0: number, p: number): number {
  if (p === 0) return 0
  return (p0 * v0) / p
}
