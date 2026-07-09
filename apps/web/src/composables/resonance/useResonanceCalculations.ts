const MU = 0.01

export function waveSpeedFromTension(tension: number): number {
  return Math.sqrt(tension / MU)
}

export function standingWaveFreq(length: number, harmonic: number, tension: number): number {
  const v = waveSpeedFromTension(tension)
  return (harmonic * v) / (2 * length)
}
export function wavelengthOpenString(length: number, harmonic: number): number {
  return (2 * length) / harmonic
}
