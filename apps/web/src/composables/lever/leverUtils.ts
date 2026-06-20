/**
 * Lever Physics Utilities - Hybrid Model
 * عزم الكرة: τ = m · g · x
 * عزم القوة: τ = F · x (دائماً لأسفل، مثل الوزن)
 */

export interface LeverBall {
  id: number
  mass: number
  x: number
  color: string
  isUnknown?: boolean
}

export interface LeverForce {
  id: number
  force: number
  x: number
  direction: 1 | -1
  color: string
  isUnknown?: boolean
}

export function calculateNetTorque(
  balls: Pick<LeverBall, 'mass' | 'x'>[],
  forces: Pick<LeverForce, 'force' | 'x' | 'direction'>[],
  g: number,
): number {
  const ballT = balls.reduce((sum, b) => sum + b.mass * g * b.x, 0)
  const forceT = forces.reduce((sum, f) => sum + f.force * f.x * f.direction, 0)
  return ballT + forceT
}

export function snapPosition(x: number, step: number, beamLength: number): number {
  const half = beamLength / 2
  const snapped = Math.round(x / step) * step
  return Math.max(-half, Math.min(half, snapped))
}

export function isBalanced(torque: number, threshold = 0.05): boolean {
  return Math.abs(torque) < threshold
}

export function calculateTilt(torque: number, maxTorque: number, maxTiltDeg: number): number {
  if (maxTorque <= 0) return 0
  const ratio = torque / maxTorque
  const deg = ratio * maxTiltDeg
  return Math.max(-maxTiltDeg, Math.min(maxTiltDeg, deg))
}

export function maxReferenceTorque(beamLength: number, g: number): number {
  const maxMass = 10
  const maxArm = beamLength / 2
  return maxMass * g * maxArm + 100 * maxArm // balls + forces
}

export function ballColor(mass: number, maxMass = 10): string {
  const t = Math.min(mass / maxMass, 1)
  const hue = 220 - t * 60
  const lightness = 60 - t * 20
  return `hsl(${hue}, 80%, ${lightness}%)`
}

export function forceColor(force: number): string {
  const intensity = Math.min(force / 50, 1)
  return `hsl(0, ${60 + intensity * 40}%, ${45 + intensity * 15}%)`
}

/** Unique distinct color for each object ID */
export function uniqueColorPerId(id: number): string {
  const hue = ((id * 137.508) % 360)
  return `hsl(${hue}, 70%, 55%)`
}

let _nextId = 1
export function createLeverBall(mass: number, x: number, id?: number, isUnknown = false): LeverBall {
  return {
    id: id ?? _nextId++,
    mass,
    x,
    color: ballColor(mass),
    isUnknown,
  }
}

export function createLeverForce(
  force: number, x: number, direction: 1 | -1 = 1, id?: number, isUnknown = false,
): LeverForce {
  return {
    id: id ?? _nextId++,
    force: Math.max(0, Math.min(100, force)),
    x,
    direction,
    color: forceColor(force),
    isUnknown,
  }
}

export function resetLeverIdCounter() {
  _nextId = 1
}
