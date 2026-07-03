export function speedOfSoundAir(tempC: number): number { return 331.3 + 0.6 * tempC }
export function wavelengthClosedEnd(lengthM: number, harmonic: 1 | 3): number { return (4 * lengthM) / harmonic }
export function speedFromResonance(lengthM: number, frequency: number, harmonic: 1 | 3): number {
  return frequency * wavelengthClosedEnd(lengthM, harmonic)
}
