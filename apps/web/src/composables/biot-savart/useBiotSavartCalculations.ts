const MU_0 = 4 * Math.PI * 1e-7

export function magneticFieldWire(I: number, r: number): number {
  if (r === 0) return 0
  return (MU_0 * I) / (2 * Math.PI * r)
}

export function magneticFieldLoop(I: number, R: number, x: number): number {
  if (R === 0) return 0
  return (MU_0 * I * R * R) / (2 * Math.pow(R * R + x * x, 1.5))
}

export function magneticFieldSolenoid(I: number, n: number): number {
  return MU_0 * n * I
}
