export function inducedEMF(N: number, dPhi: number, dt: number): number {
  if (dt === 0) return 0
  return -N * (dPhi / dt)
}

export function magneticFlux(B: number, A: number, theta: number): number {
  return B * A * Math.cos((theta * Math.PI) / 180)
}
