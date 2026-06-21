/**
 * Exact intersection of a ray (x1,y1)→(x2,y2) with the mirror arc (circle).
 * The mirror arc is part of a circle centred at (h,cy) with radius R.
 */
export function arcHit(
  x1: number, y1: number,
  x2: number, y2: number,
  cx: number, cy: number,
  R: number, mirrorH: number,
  isConcave: boolean
): { x: number; y: number } {
  const h = isConcave ? cx - R : cx + R
  const k = cy
  const dx = x2 - x1
  const dy = y2 - y1
  const a = dx * dx + dy * dy
  const b = 2 * (dx * (x1 - h) + dy * (y1 - k))
  const c0 = (x1 - h) * (x1 - h) + (y1 - k) * (y1 - k) - R * R
  const disc = b * b - 4 * a * c0
  if (disc < 0 || a === 0) return { x: cx, y: y1 }
  const sqrtDisc = Math.sqrt(disc)
  const t1 = (-b - sqrtDisc) / (2 * a)
  const t2 = (-b + sqrtDisc) / (2 * a)
  const p1 = { x: x1 + t1 * dx, y: y1 + t1 * dy }
  const p2 = { x: x1 + t2 * dx, y: y1 + t2 * dy }
  // Pick the first valid intersection (smallest positive t, or closest to vertex)
  const valid1 = t1 > 0.001 && Math.abs(p1.y - cy) <= mirrorH
  const valid2 = t2 > 0.001 && Math.abs(p2.y - cy) <= mirrorH
  if (valid1 && valid2) return t1 < t2 ? p1 : p2
  if (valid1) return p1
  if (valid2) return p2
  // Fallback: closest to vertex
  const d1 = (p1.x - cx) ** 2 + (p1.y - cy) ** 2
  const d2 = (p2.x - cx) ** 2 + (p2.y - cy) ** 2
  return d1 < d2 ? p1 : p2
}
