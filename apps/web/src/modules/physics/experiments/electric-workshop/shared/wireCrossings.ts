import type { WorkshopComponent, WorkshopWire } from './types'
import { getTerminalWorldPos } from './drawWire'

export interface WireSegment {
  x1: number; y1: number
  x2: number; y2: number
}

export interface CrossingPoint {
  x: number
  y: number
  hopWireId: number
}

export function getWireSegments(wire: WorkshopWire, components: WorkshopComponent[]): WireSegment[] {
  const fromComp = components.find(c => c.id === wire.fromCompId)
  const toComp = components.find(c => c.id === wire.toCompId)
  if (!fromComp || !toComp) return []

  const fromTerm = fromComp.terminals[wire.fromTerminalIndex]
  const toTerm = toComp.terminals[wire.toTerminalIndex]
  if (!fromTerm || !toTerm) return []

  const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)
  const [tx, ty] = getTerminalWorldPos(toComp, toTerm)

  const pts: { x: number; y: number }[] = [{ x: fx, y: fy }, ...wire.points, { x: tx, y: ty }]

  const segs: WireSegment[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[i + 1].x, y2: pts[i + 1].y })
  }
  return segs
}

export function findWireCrossings(
  wires: WorkshopWire[],
  components: WorkshopComponent[],
): Map<number, CrossingPoint[]> {
  const result = new Map<number, CrossingPoint[]>()

  for (let i = 0; i < wires.length; i++) {
    for (let j = i + 1; j < wires.length; j++) {
      const segsA = getWireSegments(wires[i], components)
      const segsB = getWireSegments(wires[j], components)

      for (const segA of segsA) {
        for (const segB of segsB) {
          const cross = segmentCrossing(segA, segB)
          if (cross) {
            const hopId = wires[j].id
            if (!result.has(hopId)) result.set(hopId, [])
            result.get(hopId)!.push({ x: cross.x, y: cross.y, hopWireId: hopId })
          }
        }
      }
    }
  }

  return result
}

function segmentCrossing(a: WireSegment, b: WireSegment): { x: number; y: number } | null {
  const aHoriz = a.y1 === a.y2
  const bHoriz = b.y1 === b.y2
  const aVert = a.x1 === a.x2
  const bVert = b.x1 === b.x2

  if ((aHoriz && bHoriz) || (aVert && bVert)) return null

  let hSeg: WireSegment, vSeg: WireSegment
  if (aHoriz && bVert) { hSeg = a; vSeg = b }
  else if (aVert && bHoriz) { hSeg = b; vSeg = a }
  else {
    const d1x = a.x2 - a.x1, d1y = a.y2 - a.y1
    const d2x = b.x2 - b.x1, d2y = b.y2 - b.y1
    const denom = d1x * d2y - d1y * d2x
    if (Math.abs(denom) < 1e-10) return null
    const t = ((b.x1 - a.x1) * d2y - (b.y1 - a.y1) * d2x) / denom
    const s = ((b.x1 - a.x1) * d1y - (b.y1 - a.y1) * d1x) / denom
    if (t > 0.01 && t < 0.99 && s > 0.01 && s < 0.99) {
      return { x: a.x1 + t * d1x, y: a.y1 + t * d1y }
    }
    return null
  }

  const hy = hSeg.y1
  const vx = vSeg.x1

  const hMinX = Math.min(hSeg.x1, hSeg.x2)
  const hMaxX = Math.max(hSeg.x1, hSeg.x2)
  const vMinY = Math.min(vSeg.y1, vSeg.y2)
  const vMaxY = Math.max(vSeg.y1, vSeg.y2)

  if (vx > hMinX && vx < hMaxX && hy > vMinY && hy < vMaxY) {
    return { x: vx, y: hy }
  }
  return null
}
