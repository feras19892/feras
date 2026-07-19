import type { WireSegment } from './wireCrossings'

export const GRID = 20

export interface Rect { x1: number; y1: number; x2: number; y2: number }

export function snapToGrid(v: number): number {
  return Math.round(v / GRID) * GRID
}

export function generateCandidates(
  s0x: number, s0y: number,
  e0x: number, e0y: number,
  fromDir: { x: number; y: number },
  toDir: { x: number; y: number },
  _obstacles: Rect[],
): { x: number; y: number }[][] {
  const candidates: { x: number; y: number }[][] = []
  const baseOffsets = [0, GRID * 2, -GRID * 2, GRID * 4, -GRID * 4, GRID * 6, -GRID * 6, GRID * 8, -GRID * 8]

  if (fromDir.x !== 0 && toDir.x !== 0) {
    if (s0y === e0y) {
      candidates.push([{ x: e0x, y: e0y }])
    } else {
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
    candidates.push([{ x: e0x, y: s0y }, { x: e0x, y: e0y }])
    candidates.push([{ x: s0x, y: e0y }, { x: e0x, y: e0y }])
    for (const off of baseOffsets) {
      const turnX = e0x + off
      candidates.push([
        { x: turnX, y: s0y },
        { x: turnX, y: e0y },
        { x: e0x, y: e0y },
      ])
    }
  } else if (fromDir.y !== 0 && toDir.x !== 0) {
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

export function scoreRoute(
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

    if (i > 0) {
      const prevSeg: WireSegment = { x1: route[i - 1].x, y1: route[i - 1].y, x2: route[i].x, y2: route[i].y }
      const prevHoriz = prevSeg.y1 === prevSeg.y2
      const currHoriz = seg.y1 === seg.y2
      if (prevHoriz !== currHoriz) turns++
    }

    for (const obs of obstacles) {
      if (segmentIntersectsRect(seg, obs)) {
        score += 100
      }
    }

    for (const wSeg of wireSegs) {
      if (segmentsOverlap(seg, wSeg)) {
        score += 10
      } else if (segmentsCross(seg, wSeg)) {
        score += 2
      }
    }
  }

  score += length / 1000 + turns * 0.5
  return score
}

export function segmentIntersectsRect(seg: { x1: number; y1: number; x2: number; y2: number }, rect: Rect): boolean {
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

export function segmentsOverlap(a: WireSegment, b: WireSegment): boolean {
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

export function segmentsCross(a: WireSegment, b: WireSegment): boolean {
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

export function simplifyPath(points: { x: number; y: number }[]): { x: number; y: number }[] {
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

export function cleanPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
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

export function astar(
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
