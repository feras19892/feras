export interface InclinedSummary {
  acceleration: number
  timeOfArrival: number
  finalVelocity: number
  normalForce: number
  parallelForce: number
  frictionForce: number
}

export interface InclinedPoint {
  t: number
  s: number
  v: number
}

export function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function calculateInclinedSummary(
  thetaDeg: number,
  length: number,
  mass: number,
  g = 9.81,
  mu = 0,
): InclinedSummary {
  const thetaRad = toRad(thetaDeg)
  const sin = Math.sin(thetaRad)
  const cos = Math.cos(thetaRad)

  const a = g * (sin - mu * cos)
  const t = a > 0.001 ? Math.sqrt((2 * length) / a) : 0
  const v = a > 0.001 ? Math.sqrt(2 * a * length) : 0
  const n = mass * g * cos
  const fp = mass * g * sin
  const f = mu * n

  return {
    acceleration: Number(a.toFixed(3)),
    timeOfArrival: Number(t.toFixed(3)),
    finalVelocity: Number(v.toFixed(2)),
    normalForce: Number(n.toFixed(2)),
    parallelForce: Number(fp.toFixed(2)),
    frictionForce: Number(f.toFixed(2)),
  }
}

export function inclinedStep(
  s: number,
  v: number,
  dt: number,
  a: number,
): { s: number; v: number } {
  const newV = v + a * dt
  const newS = s + v * dt + 0.5 * a * dt * dt
  return { s: newS, v: newV }
}

export function generateInclinedTrajectory(
  thetaDeg: number,
  length: number,
  g: number,
  mu: number,
  steps = 100,
): InclinedPoint[] {
  const summary = calculateInclinedSummary(thetaDeg, length, 1, g, mu)
  const a = summary.acceleration
  const tTotal = summary.timeOfArrival
  if (tTotal <= 0 || a <= 0) return []

  const points: InclinedPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tTotal
    const s = 0.5 * a * t * t
    const v = a * t
    points.push({ t: Number(t.toFixed(4)), s: Number(s.toFixed(4)), v: Number(v.toFixed(4)) })
  }
  return points
}
