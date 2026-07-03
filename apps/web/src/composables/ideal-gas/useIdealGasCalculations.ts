export const GAS_CONSTANT = 8.314 // J/(mol·K)

export function pressure(n: number, T: number, V: number): number {
  return (n * GAS_CONSTANT * T) / V
}

export function volume(n: number, T: number, P: number): number {
  return (n * GAS_CONSTANT * T) / P
}

export function temperature(n: number, P: number, V: number): number {
  return (P * V) / (n * GAS_CONSTANT)
}

export function particleSpeed(T: number): number {
  // rms speed proportional to sqrt(T)
  return Math.sqrt(T / 300) * 3
}

export function kineticEnergyPerMolecule(T: number): number {
  return (3 / 2) * 1.38e-23 * T
}
