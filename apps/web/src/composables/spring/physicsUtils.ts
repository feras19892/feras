export interface SpringDataRow {
  id: number
  massGrams: number
  forceNewton: number
  displacementCm: number
}

export function calculateStaticRow(id: number, massGrams: number, k: number, g = 9.81): SpringDataRow {
  if (massGrams <= 0 || k <= 0) {
    return { id, massGrams, forceNewton: 0, displacementCm: 0 }
  }

  const massKg = massGrams / 1000
  const forceNewton = massKg * g
  const displacementMeters = forceNewton / k
  const displacementCm = displacementMeters * 100

  return {
    id,
    massGrams,
    forceNewton: Number(forceNewton.toFixed(3)),
    displacementCm: Number(displacementCm.toFixed(2)),
  }
}
