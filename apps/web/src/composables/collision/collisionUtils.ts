import type { CollisionParams } from '../../modules/physics/experiments/collision/useCollisionPhysics'

export interface CollisionResult {
  v1f: number
  v2f: number
  Pi: number
  Pf: number
  KEi: number
  KEf: number
  lossPercent: number
}

export function detectCollision(x1: number, x2: number, r1: number, r2: number): boolean {
  return Math.abs(x1 - x2) <= (r1 + r2)
}

export function separateBalls(x1: number, x2: number, r1: number, r2: number): { x1: number; x2: number } {
  const overlap = (r1 + r2) - Math.abs(x1 - x2)
  if (overlap <= 0) return { x1, x2 }
  const shift = overlap / 2
  if (x1 < x2) {
    return { x1: x1 - shift, x2: x2 + shift }
  }
  return { x1: x1 + shift, x2: x2 - shift }
}

export function computeFinalVelocities(
  m1: number,
  m2: number,
  v1i: number,
  v2i: number,
  e: number,
): { v1f: number; v2f: number } {
  const denom = m1 + m2
  if (denom === 0) return { v1f: 0, v2f: 0 }
  const v1f = ((m1 - e * m2) * v1i + (1 + e) * m2 * v2i) / denom
  const v2f = ((m2 - e * m1) * v2i + (1 + e) * m1 * v1i) / denom
  return { v1f, v2f }
}

export function computeMomentum(m: number, v: number): number {
  return m * v
}

export function computeKE(m: number, v: number): number {
  return 0.5 * m * v * v
}

export function computeTotalKE(m1: number, v1: number, m2: number, v2: number): number {
  return computeKE(m1, v1) + computeKE(m2, v2)
}

export function computeEnergyLoss(KEi: number, KEf: number): number {
  if (KEi <= 0) return 0
  const loss = ((KEi - KEf) / KEi) * 100
  // Clamp floating-point epsilon so physically-zero loss reports as 0
  if (Math.abs(loss) < 1e-6) return 0
  // Negative loss is physically impossible (floating-point artefact)
  if (loss < 0) return 0
  return loss
}

export function computeCollisionResult(params: CollisionParams): CollisionResult {
  const { m1, m2, v1i, v2i, e } = params
  const { v1f, v2f } = computeFinalVelocities(m1, m2, v1i, v2i, e)
  const Pi = computeMomentum(m1, v1i) + computeMomentum(m2, v2i)
  const Pf = computeMomentum(m1, v1f) + computeMomentum(m2, v2f)
  const KEi = computeTotalKE(m1, v1i, m2, v2i)
  const KEf = computeTotalKE(m1, v1f, m2, v2f)
  const lossPercent = computeEnergyLoss(KEi, KEf)
  return { v1f, v2f, Pi, Pf, KEi, KEf, lossPercent }
}
