export interface PendulumDataRow {
  id: number
  lengthCm: number
  timeFor20Osc: number
  periodT: number
  periodSquared: number
}

export function calculatePendulumRow(id: number, lengthCm: number, g = 9.81): PendulumDataRow {
  if (lengthCm <= 0 || g <= 0) {
    return { id, lengthCm, timeFor20Osc: 0, periodT: 0, periodSquared: 0 }
  }
  const lengthMeters = lengthCm / 100
  const periodT = 2 * Math.PI * Math.sqrt(lengthMeters / g)
  const timeFor20Osc = periodT * 20
  const periodSquared = periodT * periodT
  return {
    id,
    lengthCm,
    timeFor20Osc: Number(timeFor20Osc.toFixed(2)),
    periodT: Number(periodT.toFixed(3)),
    periodSquared: Number(periodSquared.toFixed(3)),
  }
}
