export const LATENT_HEAT = {
  fusion: 334000,    // J/kg (ice → water at 0°C)
  vaporization: 2260000, // J/kg (water → steam at 100°C)
}

export function meltedMass(Q: number, L: number, totalM: number): number {
  return Math.min(totalM, Q / L)
}

export function remainingIce(Q: number, L: number, totalM: number): number {
  return Math.max(0, totalM - Q / L)
}

export function phaseRatio(Q: number, L: number, totalM: number): number {
  return Math.min(1, Q / (totalM * L))
}

export function tempForPhase(phaseType: 'fusion' | 'vaporization'): number {
  return phaseType === 'fusion' ? 0 : 100
}

export function totalEnergyNeeded(m: number, L: number): number {
  return m * L
}
