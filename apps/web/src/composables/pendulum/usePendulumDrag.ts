/**
 * Aerodynamic drag force for pendulum bob
 * F_drag = ½ · ρ_air · C_d · A · v²
 * where A = π · r² (cross-sectional area of sphere)
 * C_d ≈ 0.47 for a smooth sphere
 */

export interface DragParams {
  bobRadius: number   // meters
  airDensity: number  // kg/m³ (0 = vacuum, 1.225 = sea level)
}

const DRAG_COEFFICIENT = 0.47

export function computeDragForce(velocity: number, params: DragParams): number {
  if (params.airDensity <= 0 || params.bobRadius <= 0) return 0
  const area = Math.PI * params.bobRadius * params.bobRadius
  const v = Math.abs(velocity)
  return 0.5 * params.airDensity * DRAG_COEFFICIENT * area * v * v
}

export function computeDragAcceleration(
  velocity: number,
  mass: number,
  length: number,
  params: DragParams,
): number {
  const force = computeDragForce(velocity, params)
  if (force === 0) return 0
  const safeMass = Math.max(mass, 1e-9)
  const safeLength = Math.max(length, 1e-9)
  const direction = velocity > 0 ? -1 : 1
  return (direction * force) / (safeMass * safeLength)
}
