export function standingWaveFreq(length: number, harmonic: number): number {
  const vString = 60
  return (harmonic * vString) / (2 * length)
}
export function wavelengthOpenString(length: number, harmonic: number): number {
  return (2 * length) / harmonic
}
