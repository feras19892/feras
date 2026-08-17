export function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

export interface ForceComponent {
  fx: number
  fy: number
}

export interface NetForceResult {
  fx: number
  fy: number
  mag: number
  dir: number
}

export function resolveForce(magnitude: number, angleDeg: number): ForceComponent {
  const rad = toRad(angleDeg)
  return {
    fx: magnitude * Math.cos(rad),
    fy: magnitude * Math.sin(rad),
  }
}

export function calcNetForce(forces: ForceComponent[]): NetForceResult {
  const fx = forces.reduce((sum, f) => sum + f.fx, 0)
  const fy = forces.reduce((sum, f) => sum + f.fy, 0)
  const mag = Math.sqrt(fx * fx + fy * fy)
  const dir = mag < 1e-9 ? 0 : toDeg(Math.atan2(fy, fx))
  return { fx, fy, mag, dir }
}

export interface CentripetalResult {
  fc: number
  ac: number
  v: number
  period: number
}

export function calcCentripetal(m: number, omega: number, r: number): CentripetalResult {
  const v = omega * r
  const ac = omega * omega * r
  const fc = m * ac
  const period = omega > 1e-9 ? (2 * Math.PI) / omega : Infinity
  return { fc, ac, v, period }
}

export interface EquilibriumResult {
  weight: number
  normalForce: number
  frictionForce: number
  maxStaticFriction: number
  appliedParallel: number
  appliedPerp: number
  netForce: NetForceResult
  isBalanced: boolean
  isStatic: boolean
  isSliding: boolean
}

export interface CustomForce {
  id: number
  magnitude: number
  angle: number
  label: string
}

export function calcEquilibrium(
  mass: number,
  g: number,
  appliedForce: number,
  appliedAngleDeg: number,
  mu: number,
  surfaceAngleDeg: number,
  tension: number,
  tensionAngleDeg: number,
  customForces: CustomForce[] = [],
): EquilibriumResult {
  const surfRad = toRad(surfaceAngleDeg)
  const weight = mass * g

  // Physics coordinates: Y is UP
  // Weight always points straight down: (0, -mg)
  const wFx = 0, wFy = -weight

  const app = resolveForce(appliedForce, appliedAngleDeg)
  const ten = resolveForce(tension, tensionAngleDeg)
  const customComps = customForces.map(cf => resolveForce(cf.magnitude, cf.angle))

  // Surface tangent: (cos α, sin α)
  // Surface normal (pointing UP from surface): (-sin α, cos α)
  const tx = Math.cos(surfRad), ty = Math.sin(surfRad)
  const nx = -Math.sin(surfRad), ny = Math.cos(surfRad)

  // Sum of all forces except normal and friction
  const otherFx = app.fx + ten.fx + wFx + customComps.reduce((s, f) => s + f.fx, 0)
  const otherFy = app.fy + ten.fy + wFy + customComps.reduce((s, f) => s + f.fy, 0)

  // Normal force = -(projection of other forces onto normal direction)
  const normalForce = Math.max(0, -(otherFx * nx + otherFy * ny))

  // Parallel component along surface
  const totalParallel = otherFx * tx + otherFy * ty

  // Friction opposes parallel motion
  // Static friction: matches applied force up to maxStaticFriction
  // Kinetic friction: constant at mu * N (opposing motion direction)
  const maxStaticFriction = mu * normalForce
  const isStatic = Math.abs(totalParallel) <= maxStaticFriction
  let frictionForce: number
  if (Math.abs(totalParallel) < 1e-6) {
    frictionForce = 0
  } else if (isStatic) {
    frictionForce = -totalParallel
  } else {
    frictionForce = -Math.sign(totalParallel) * maxStaticFriction
  }

  // Net force = all forces including normal and friction
  const allForces: ForceComponent[] = [
    { fx: app.fx, fy: app.fy },
    { fx: ten.fx, fy: ten.fy },
    { fx: wFx, fy: wFy },
    { fx: nx * normalForce, fy: ny * normalForce },
    { fx: tx * frictionForce, fy: ty * frictionForce },
    ...customComps,
  ]

  const netForce = calcNetForce(allForces)
  const isBalanced = netForce.mag < 0.01

  const appliedParallel = app.fx * tx + app.fy * ty
  const appliedPerp = app.fx * nx + app.fy * ny

  return {
    weight,
    normalForce,
    frictionForce,
    maxStaticFriction,
    appliedParallel,
    appliedPerp,
    netForce,
    isBalanced,
    isStatic,
    isSliding: !isStatic,
  }
}

export function calcAutoBalance(
  mass: number,
  g: number,
  appliedAngleDeg: number,
  mu: number,
  surfaceAngleDeg: number,
  tension: number,
  tensionAngleDeg: number,
  customForces: CustomForce[] = [],
): number {
  const surfRad = toRad(surfaceAngleDeg)
  const weight = mass * g

  const tx = Math.cos(surfRad), ty = Math.sin(surfRad)
  const nx = -Math.sin(surfRad), ny = Math.cos(surfRad)

  const ten = resolveForce(tension, tensionAngleDeg)
  const customComps = customForces.map(cf => resolveForce(cf.magnitude, cf.angle))

  // Other forces (without applied): weight + tension + custom
  const otherFx = ten.fx + customComps.reduce((s, f) => s + f.fx, 0)
  const otherFy = -weight + ten.fy + customComps.reduce((s, f) => s + f.fy, 0)

  const otherParallel = otherFx * tx + otherFy * ty
  const otherPerp = otherFx * nx + otherFy * ny

  const appRad = toRad(appliedAngleDeg)
  const cosParallel = Math.cos(appRad) * tx + Math.sin(appRad) * ty
  const cosPerp = Math.cos(appRad) * nx + Math.sin(appRad) * ny

  // Try to zero the parallel component first (friction = 0 → balanced)
  if (Math.abs(cosParallel) > 1e-6) {
    const F = -otherParallel / cosParallel
    const normalForce = Math.max(0, -(otherPerp + F * cosPerp))
    if (normalForce > 0 || Math.abs(otherPerp + F * cosPerp) < 0.01) {
      return Math.max(0, Math.round(F * 100) / 100)
    }
  }

  // Fallback: try to zero the perpendicular component
  if (Math.abs(cosPerp) > 1e-6) {
    const F = -otherPerp / cosPerp
    return Math.max(0, Math.round(F * 100) / 100)
  }

  return 0
}
