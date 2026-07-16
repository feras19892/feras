import type { WorkshopComponent, WorkshopWire } from './types'
import { getTerminalWorldPos } from './drawWire'

const GRID = 20

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

  // Lead-out and lead-in: 2 grid cells for better clearance
  const LEAD = GRID * 2
  const s0x = sx + fromDir.x * LEAD
  const s0y = sy + fromDir.y * LEAD
  const e0x = ex + toDir.x * LEAD
  const e0y = ey + toDir.y * LEAD

  // Build obstacle rectangles for other components
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

  // Build wire segments for overlap detection
  const wireSegs: WireSegment[] = []
  for (const wire of allWires) {
    wireSegs.push(...getWireSegments(wire, allComponents))
  }

  // Generate candidates
  const candidates = generateCandidates(s0x, s0y, e0x, e0y, fromDir, toDir, obstacles)

  // Score and pick best
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

  // If best route is clean enough, use it
  if (bestScore < 100) {
    return cleanPoints([{ x: s0x, y: s0y }, ...bestRoute])
  }

  // Fallback: A* if all geometric routes blocked
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

interface Rect { x1: number; y1: number; x2: number; y2: number }

function generateCandidates(
  s0x: number, s0y: number,
  e0x: number, e0y: number,
  fromDir: { x: number; y: number },
  toDir: { x: number; y: number },
  _obstacles: Rect[],
): { x: number; y: number }[][] {
  const candidates: { x: number; y: number }[][] = []
  // Use obstacle-aware offsets: prefer midpoints that avoid obstacles
  const baseOffsets = [0, GRID * 2, -GRID * 2, GRID * 4, -GRID * 4, GRID * 6, -GRID * 6, GRID * 8, -GRID * 8]

  if (fromDir.x !== 0 && toDir.x !== 0) {
    // Both horizontal
    if (s0y === e0y) {
      candidates.push([{ x: e0x, y: e0y }])
    } else {
      // Z-route with different midX values
      for (const off of baseOffsets) {
        const midX = snapToGrid((s0x + e0x) / 2) + off
        candidates.push([
          { x: midX, y: s0y },
          { x: midX, y: e0y },
          { x: e0x, y: e0y },
        ])
      }
    }
  } else if (fromDir.y !== 0 && toDir.y !== 0) {
    // Both vertical
    if (s0x === e0x) {
      candidates.push([{ x: e0x, y: e0y }])
    } else {
      for (const off of baseOffsets) {
        const midY = snapToGrid((s0y + e0y) / 2) + off
        candidates.push([
          { x: s0x, y: midY },
          { x: e0x, y: midY },
          { x: e0x, y: e0y },
        ])
      }
    }
  } else if (fromDir.x !== 0 && toDir.y !== 0) {
    // Horizontal → vertical: L-route and Z-variants
    // Simple L at endpoint
    candidates.push([{ x: e0x, y: s0y }, { x: e0x, y: e0y }])
    // L at start point
    candidates.push([{ x: s0x, y: e0y }, { x: e0x, y: e0y }])
    // Z-routes with different turn points
    for (const off of baseOffsets) {
      const turnX = e0x + off
      candidates.push([
        { x: turnX, y: s0y },
        { x: turnX, y: e0y },
        { x: e0x, y: e0y },
      ])
    }
  } else if (fromDir.y !== 0 && toDir.x !== 0) {
    // Vertical → horizontal: L-route and Z-variants
    candidates.push([{ x: s0x, y: e0y }, { x: e0x, y: e0y }])
    candidates.push([{ x: e0x, y: s0y }, { x: e0x, y: e0y }])
    for (const off of baseOffsets) {
      const turnY = e0y + off
      candidates.push([
        { x: s0x, y: turnY },
        { x: e0x, y: turnY },
        { x: e0x, y: e0y },
      ])
    }
  } else {
    candidates.push([{ x: e0x, y: s0y }, { x: e0x, y: e0y }])
  }

  return candidates
}

function scoreRoute(
  route: { x: number; y: number }[],
  obstacles: Rect[],
  wireSegs: WireSegment[],
): number {
  let score = 0
  let length = 0
  let turns = 0

  for (let i = 0; i < route.length - 1; i++) {
    const seg: WireSegment = { x1: route[i].x, y1: route[i].y, x2: route[i + 1].x, y2: route[i + 1].y }
    length += Math.abs(seg.x2 - seg.x1) + Math.abs(seg.y2 - seg.y1)

    // Count turns (direction changes)
    if (i > 0) {
      const prevSeg: WireSegment = { x1: route[i - 1].x, y1: route[i - 1].y, x2: route[i].x, y2: route[i].y }
      const prevHoriz = prevSeg.y1 === prevSeg.y2
      const currHoriz = seg.y1 === seg.y2
      if (prevHoriz !== currHoriz) turns++
    }

    // Obstacle collisions: heavy penalty
    for (const obs of obstacles) {
      if (segmentIntersectsRect(seg, obs)) {
        score += 100
      }
    }

    // Wire overlap: moderate penalty
    for (const wSeg of wireSegs) {
      if (segmentsOverlap(seg, wSeg)) {
        score += 10
      } else if (segmentsCross(seg, wSeg)) {
        score += 2
      }
    }
  }

  // Prefer shorter + fewer turns
  score += length / 1000 + turns * 0.5
  return score
}

function segmentIntersectsRect(seg: { x1: number; y1: number; x2: number; y2: number }, rect: Rect): boolean {
  const segHoriz = seg.y1 === seg.y2
  const segVert = seg.x1 === seg.x2

  if (segHoriz) {
    const y = seg.y1
    if (y < rect.y1 || y > rect.y2) return false
    const segMinX = Math.min(seg.x1, seg.x2)
    const segMaxX = Math.max(seg.x1, seg.x2)
    return segMaxX > rect.x1 && segMinX < rect.x2
  }
  if (segVert) {
    const x = seg.x1
    if (x < rect.x1 || x > rect.x2) return false
    const segMinY = Math.min(seg.y1, seg.y2)
    const segMaxY = Math.max(seg.y1, seg.y2)
    return segMaxY > rect.y1 && segMinY < rect.y2
  }
  return false
}

function segmentsOverlap(a: WireSegment, b: WireSegment): boolean {
  const aHoriz = a.y1 === a.y2
  const bHoriz = b.y1 === b.y2

  if (aHoriz && bHoriz && a.y1 === b.y1) {
    const aMin = Math.min(a.x1, a.x2), aMax = Math.max(a.x1, a.x2)
    const bMin = Math.min(b.x1, b.x2), bMax = Math.max(b.x1, b.x2)
    return aMin < bMax && bMin < aMax
  }
  const aVert = a.x1 === a.x2
  const bVert = b.x1 === b.x2
  if (aVert && bVert && a.x1 === b.x1) {
    const aMin = Math.min(a.y1, a.y2), aMax = Math.max(a.y1, a.y2)
    const bMin = Math.min(b.y1, b.y2), bMax = Math.max(b.y1, b.y2)
    return aMin < bMax && bMin < aMax
  }
  return false
}

function segmentsCross(a: WireSegment, b: WireSegment): boolean {
  const aHoriz = a.y1 === a.y2
  const bHoriz = b.y1 === b.y2
  const aVert = a.x1 === a.x2
  const bVert = b.x1 === b.x2

  if ((aHoriz && bHoriz) || (aVert && bVert)) return false
  if (!aHoriz && !aVert && !bHoriz && !bVert) return false

  let hSeg: WireSegment, vSeg: WireSegment
  if (aHoriz && bVert) { hSeg = a; vSeg = b }
  else if (aVert && bHoriz) { hSeg = b; vSeg = a }
  else return false

  const hy = hSeg.y1
  const vx = vSeg.x1
  const hMinX = Math.min(hSeg.x1, hSeg.x2)
  const hMaxX = Math.max(hSeg.x1, hSeg.x2)
  const vMinY = Math.min(vSeg.y1, vSeg.y2)
  const vMaxY = Math.max(vSeg.y1, vSeg.y2)

  return vx > hMinX && vx < hMaxX && hy > vMinY && hy < vMaxY
}

function simplifyPath(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length <= 2) return points
  const result: { x: number; y: number }[] = [points[0]]
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]
    const dx1 = curr.x - prev.x
    const dy1 = curr.y - prev.y
    const dx2 = next.x - curr.x
    const dy2 = next.y - curr.y
    if (dx1 !== dx2 || dy1 !== dy2) {
      result.push(curr)
    }
  }
  result.push(points[points.length - 1])
  return result
}

function astar(
  startX: number, startY: number,
  endX: number, endY: number,
  obstacles: Set<string>,
  wireCosts: Map<string, number>,
  softCosts: Map<string, number>,
  startDir: { x: number; y: number },
): { x: number; y: number }[] {
  const key = (x: number, y: number) => `${x},${y}`
  const heuristic = (x: number, y: number) => Math.abs(x - endX) + Math.abs(y - endY)

  interface Node {
    x: number
    y: number
    g: number
    f: number
    dirX: number
    dirY: number
    parent: Node | null
  }

  const open: Node[] = []
  const closed = new Set<string>()
  const openMap = new Map<string, Node>()

  const startNode: Node = {
    x: startX, y: startY, g: 0, f: heuristic(startX, startY),
    dirX: startDir.x, dirY: startDir.y, parent: null,
  }
  open.push(startNode)
  openMap.set(key(startX, startY), startNode)

  const maxIterations = 3000
  let iter = 0

  while (open.length > 0 && iter < maxIterations) {
    iter++
    let bestIdx = 0
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i
    }
    const current = open[bestIdx]
    open.splice(bestIdx, 1)
    openMap.delete(key(current.x, current.y))
    closed.add(key(current.x, current.y))

    if (current.x === endX && current.y === endY) {
      const path: { x: number; y: number }[] = []
      let node: Node | null = current
      while (node) {
        path.unshift({ x: node.x, y: node.y })
        node = node.parent
      }
      return path
    }

    const dirs = [[GRID, 0], [-GRID, 0], [0, GRID], [0, -GRID]]
    for (const [dx, dy] of dirs) {
      const nx = current.x + dx
      const ny = current.y + dy
      const nkey = key(nx, ny)

      if (closed.has(nkey)) continue
      if (obstacles.has(nkey)) continue

      let turnPenalty = 0
      if (current.dirX !== dx || current.dirY !== dy) {
        turnPenalty = 2
      }

      const wirePenalty = wireCosts.get(nkey) ?? 0
      const softPenalty = softCosts.get(nkey) ?? 0
      const ng = current.g + 1 + turnPenalty + wirePenalty + softPenalty
      const nf = ng + heuristic(nx, ny)

      const existing = openMap.get(nkey)
      if (existing) {
        if (ng < existing.g) {
          existing.g = ng
          existing.f = nf
          existing.dirX = dx
          existing.dirY = dy
          existing.parent = current
        }
      } else {
        const node: Node = { x: nx, y: ny, g: ng, f: nf, dirX: dx, dirY: dy, parent: current }
        open.push(node)
        openMap.set(nkey, node)
      }
    }
  }

  return []
}

function snapToGrid(v: number): number {
  return Math.round(v / GRID) * GRID
}

function cleanPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  for (const p of points) {
    if (out.length === 0 || out[out.length - 1].x !== p.x || out[out.length - 1].y !== p.y) {
      out.push(p)
    }
  }
  const cleaned: { x: number; y: number }[] = []
  for (let i = 0; i < out.length; i++) {
    if (i > 0 && i < out.length - 1) {
      const prev = out[i - 1]
      const curr = out[i]
      const next = out[i + 1]
      if ((prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y)) {
        continue
      }
    }
    cleaned.push(out[i])
  }
  return cleaned
}

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
  if (!aHoriz && !aVert && !bHoriz && !bVert) return null

  let hSeg: WireSegment, vSeg: WireSegment
  if (aHoriz && bVert) { hSeg = a; vSeg = b }
  else if (aVert && bHoriz) { hSeg = b; vSeg = a }
  else return null

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
