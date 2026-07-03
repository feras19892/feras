/* Linear thermal expansion coefficient α (×10⁻⁶ /K) */
export const ALPHA: Record<string, number> = {
  copper: 16.5,
  aluminum: 23,
  iron: 12,
  steel: 13,
  brass: 19,
  glass: 9,
}

export function deltaL(L0: number, alpha: number, deltaT: number): number {
  return L0 * (alpha * 1e-6) * deltaT
}

export function finalLength(L0: number, alpha: number, deltaT: number): number {
  return L0 + deltaL(L0, alpha, deltaT)
}

export function findAlpha(deltaL: number, L0: number, deltaT: number): number {
  return (deltaL / (L0 * deltaT)) * 1e6
}
