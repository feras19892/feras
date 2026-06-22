/**
 * Prism geometry utilities — ray–triangle intersection, normal vectors, angle helpers.
 */

export function toRad(deg: number) { return (deg * Math.PI) / 180 }
export function toDeg(rad: number) { return (rad * 180) / Math.PI }

export interface Point { x: number; y: number }

export function prismVertices(
  prismAngleDeg: number,
  prismSize: number,
  centerX: number,
  centerY: number
) {
  const A = toRad(prismAngleDeg)

  const halfBase = prismSize * Math.sin(A / 2)
  const height   = prismSize * Math.cos(A / 2)

  const pA: Point = { x: centerX,           y: centerY - height  * (2 / 3) }
  const pB: Point = { x: centerX - halfBase, y: centerY + height  * (1 / 3) }
  const pC: Point = { x: centerX + halfBase, y: centerY + height  * (1 / 3) }

  return { pA, pB, pC, edgeAB_angle: Math.atan2(pB.y - pA.y, pB.x - pA.x) }
}

export function lineIntersection(
  p0: Point, p1: Point,
  p2: Point, p3: Point,
  allowExtension = true
): Point | null {
  const s1_x = p1.x - p0.x
  const s1_y = p1.y - p0.y
  const s2_x = p3.x - p2.x
  const s2_y = p3.y - p2.y

  const denom = -s2_x * s1_y + s1_x * s2_y
  if (Math.abs(denom) < 1e-12) return null

  const s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / denom
  const t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / denom

  if (allowExtension) {
    return { x: p0.x + t * s1_x, y: p0.y + t * s1_y }
  }
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return { x: p0.x + t * s1_x, y: p0.y + t * s1_y }
  }
  return null
}
