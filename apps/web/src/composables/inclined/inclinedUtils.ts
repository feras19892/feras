export interface BodyType {
  id: string
  name: string
  nameAr: string
  cd: number
  area: number
}

export const bodyTypes: BodyType[] = [
  { id: 'block', name: 'Block', nameAr: 'experiments.bodyTypeBlock', cd: 1.05, area: 0.01 },
  { id: 'sphere', name: 'Sphere', nameAr: 'experiments.bodyTypeSphere', cd: 0.47, area: 0.01 },
  { id: 'streamlined', name: 'Streamlined', nameAr: 'experiments.bodyTypeStreamlined', cd: 0.04, area: 0.008 },
  { id: 'feather', name: 'Feather', nameAr: 'experiments.bodyTypeFeather', cd: 1.5, area: 0.03 },
]

export interface InclinedSummary {
  acceleration: number
  timeOfArrival: number
  finalVelocity: number
  normalForce: number
  parallelForce: number
  frictionForce: number
  dragForce: number
}

export interface InclinedPoint {
  t: number
  s: number
  v: number
}

export function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function calculateDragForce(v: number, cd: number, area: number, rho = 1.225) {
  return 0.5 * rho * cd * area * v * v
}

export function calculateInclinedSummary(
  thetaDeg: number,
  length: number,
  mass: number,
  g = 9.81,
  mu = 0,
  airResistance = false,
  cd = 0,
  area = 0,
): InclinedSummary {
  const thetaRad = toRad(thetaDeg)
  const sin = Math.sin(thetaRad)
  const cos = Math.cos(thetaRad)

  const n = mass * g * cos
  const fp = mass * g * sin
  const f = mu * n

  if (!airResistance) {
    const a = g * (sin - mu * cos)
    const t = a > 0.001 ? Math.sqrt((2 * length) / a) : 0
    const v = a > 0.001 ? Math.sqrt(2 * a * length) : 0
    return {
      acceleration: Number(a.toFixed(3)),
      timeOfArrival: Number(t.toFixed(3)),
      finalVelocity: Number(v.toFixed(2)),
      normalForce: Number(n.toFixed(2)),
      parallelForce: Number(fp.toFixed(2)),
      frictionForce: Number(f.toFixed(2)),
      dragForce: 0,
    }
  }

  // With air resistance: solve numerically (Euler)
  const dt = 0.001
  let s = 0, v = 0, t = 0
  while (s < length && t < 60) {
    const fd = calculateDragForce(v, cd, area)
    const a = g * (sin - mu * cos) - fd / mass
    if (a <= 0 && v <= 0.001) break
    v += a * dt
    s += v * dt
    t += dt
  }

  return {
    acceleration: Number((g * (sin - mu * cos)).toFixed(3)),
    timeOfArrival: Number(t.toFixed(3)),
    finalVelocity: Number(v.toFixed(2)),
    normalForce: Number(n.toFixed(2)),
    parallelForce: Number(fp.toFixed(2)),
    frictionForce: Number(f.toFixed(2)),
    dragForce: Number(calculateDragForce(v, cd, area).toFixed(2)),
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

export function inclinedStepWithDrag(
  s: number,
  v: number,
  dt: number,
  g: number,
  sin: number,
  mu: number,
  cos: number,
  mass: number,
  cd: number,
  area: number,
): { s: number; v: number; a: number; fd: number } {
  const fd = calculateDragForce(v, cd, area)
  const a = g * (sin - mu * cos) - fd / Math.max(mass, 1e-9)
  const newV = v + a * dt
  const newS = s + v * dt + 0.5 * a * dt * dt
  return { s: newS, v: newV, a, fd }
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
