export interface FreeFallDataRow {
  id: number
  heightMeters: number
  timeSec: number
  timeSquaredSec2: number
  impactVelocityMs: number
}

export function calculateFreeFallRow(id: number, heightMeters: number, g = 9.81): FreeFallDataRow {
  if (heightMeters <= 0 || g <= 0) {
    return { id, heightMeters, timeSec: 0, timeSquaredSec2: 0, impactVelocityMs: 0 }
  }
  const timeSec = Math.sqrt((2 * heightMeters) / g)
  const timeSquaredSec2 = timeSec * timeSec
  const impactVelocityMs = Math.sqrt(2 * g * heightMeters)
  return {
    id,
    heightMeters,
    timeSec: Number(timeSec.toFixed(3)),
    timeSquaredSec2: Number(timeSquaredSec2.toFixed(4)),
    impactVelocityMs: Number(impactVelocityMs.toFixed(2)),
  }
}
