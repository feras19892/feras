import type { WorkshopComponent, WorkshopWire } from './types'
import { getTerminalWorldPos } from './drawWire'
import { getWireSegments, findWireCrossings, type WireSegment, type CrossingPoint } from './wireCrossings'
import {
  GRID, snapToGrid, cleanPoints, simplifyPath,
  generateCandidates, scoreRoute, astar,
  type Rect,
} from './smartWireHelpers'

export { findWireCrossings, type CrossingPoint }

export function smartRoute(
  fromComp: WorkshopComponent,
  fromTermIndex: number,
  toComp: WorkshopComponent,
  toTermIndex: number,
  allComponents: WorkshopComponent[],
  allWires: WorkshopWire[] = [],
): { x: number; y: number }[] {
  const fromTerm = fromComp.terminals[fromTermIndex]
  const toTerm = toComp.terminals[toTermIndex]
  if (!fromTerm || !toTerm) return []

  const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)
  const [tx, ty] = getTerminalWorldPos(toComp, toTerm)

  const sx = snapToGrid(fx)
  const sy = snapToGrid(fy)
  const ex = snapToGrid(tx)
  const ey = snapToGrid(ty)

  if (sx === ex && sy === ey) return []

  const fromDir = getTerminalDirection(fromComp, fromTermIndex)
  const toDir = getTerminalDirection(toComp, toTermIndex)

  const LEAD = GRID * 2
  const s0x = sx + fromDir.x * LEAD
  const s0y = sy + fromDir.y * LEAD
  const e0x = ex + toDir.x * LEAD
  const e0y = ey + toDir.y * LEAD

  const obstacles: Rect[] = []
  for (const comp of allComponents) {
    if (comp.id === fromComp.id || comp.id === toComp.id) continue
    const cs = comp.scale ?? 1
    const halfW = snapToGrid(30 * cs)
    const halfH = snapToGrid(20 * cs)
    obstacles.push({
      x1: snapToGrid(comp.x) - halfW,
      y1: snapToGrid(comp.y) - halfH,
      x2: snapToGrid(comp.x) + halfW,
      y2: snapToGrid(comp.y) + halfH,
    })
  }

  const wireSegs: WireSegment[] = []
  for (const wire of allWires) {
    wireSegs.push(...getWireSegments(wire, allComponents))
  }

  const candidates = generateCandidates(s0x, s0y, e0x, e0y, fromDir, toDir, obstacles)

  let bestRoute: { x: number; y: number }[] = []
  let bestScore = Infinity

  for (const candidate of candidates) {
    const fullRoute = [{ x: s0x, y: s0y }, ...candidate]
    const score = scoreRoute(fullRoute, obstacles, wireSegs)
    if (score < bestScore) {
      bestScore = score
      bestRoute = candidate
    }
  }

  if (bestScore < 100) {
    return cleanPoints([{ x: s0x, y: s0y }, ...bestRoute])
  }

  const obstacleCells = new Set<string>()
  const softCosts = new Map<string, number>()
  for (const comp of allComponents) {
    const cx = snapToGrid(comp.x)
    const cy = snapToGrid(comp.y)
    const isFromOrTo = comp.id === fromComp.id || comp.id === toComp.id
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (isFromOrTo) {
          softCosts.set(`${cx + dx * GRID},${cy + dy * GRID}`, 3)
        } else {
          obstacleCells.add(`${cx + dx * GRID},${cy + dy * GRID}`)
        }
      }
    }
  }

  const wireCosts = new Map<string, number>()
  for (const seg of wireSegs) {
    if (seg.y1 === seg.y2) {
      const y = snapToGrid(seg.y1)
      for (let x = Math.min(seg.x1, seg.x2); x <= Math.max(seg.x1, seg.x2); x += GRID) {
        wireCosts.set(`${x},${y}`, (wireCosts.get(`${x},${y}`) ?? 0) + 5)
      }
    } else {
      const x = snapToGrid(seg.x1)
      for (let y = Math.min(seg.y1, seg.y2); y <= Math.max(seg.y1, seg.y2); y += GRID) {
        wireCosts.set(`${x},${y}`, (wireCosts.get(`${x},${y}`) ?? 0) + 5)
      }
    }
  }

  const path = astar(s0x, s0y, e0x, e0y, obstacleCells, wireCosts, softCosts, fromDir)
  if (path.length > 0) {
    return simplifyPath(cleanPoints(path))
  }

  return cleanPoints([{ x: s0x, y: s0y }, ...bestRoute])
}

function getTerminalDirection(comp: WorkshopComponent, termIndex: number): { x: number; y: number } {
  const term = comp.terminals[termIndex]
  if (!term) return { x: 1, y: 0 }
  const r = comp.rotation * Math.PI / 180
  const cos = Math.cos(r)
  const sin = Math.sin(r)
  const dx = term.dx * cos - term.dy * sin
  const dy = term.dx * sin + term.dy * cos
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx > 0 ? 1 : -1, y: 0 }
  } else {
    return { x: 0, y: dy > 0 ? 1 : -1 }
  }
}
