import type { WorkshopWire, WorkshopComponent } from './types'
import type { CrossingPoint } from './smartWire'

interface DrawCtx {
  zoom: number
  panX: number
  panY: number
  worldToScreen: (x: number, y: number) => [number, number]
  running?: boolean
  animTime?: number
  wireCurrents?: Map<number, number>
}

export function drawWire(
  ctx: CanvasRenderingContext2D,
  wire: WorkshopWire,
  components: WorkshopComponent[],
  dc: DrawCtx,
  selected: boolean,
  crossings?: CrossingPoint[],
) {
  const { worldToScreen, zoom } = dc
  const z = zoom

  const fromComp = components.find(c => c.id === wire.fromCompId)
  const toComp = components.find(c => c.id === wire.toCompId)
  if (!fromComp || !toComp) return

  const fromTerm = fromComp.terminals[wire.fromTerminalIndex]
  const toTerm = toComp.terminals[wire.toTerminalIndex]
  if (!fromTerm || !toTerm) return

  // Get world positions of terminals (accounting for component position and rotation)
  const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)
  const [tx, ty] = getTerminalWorldPos(toComp, toTerm)
  const [sfx, sfy] = worldToScreen(fx, fy)
  const [stx, sty] = worldToScreen(tx, ty)

  const color = wire.color || '#64748b'

  // Build the full point list in screen coords
  const screenPts: { x: number; y: number }[] = [{ x: sfx, y: sfy }]
  for (const p of wire.points) {
    const [px, py] = worldToScreen(p.x, p.y)
    screenPts.push({ x: px, y: py })
  }
  screenPts.push({ x: stx, y: sty })

  // Find crossing positions in screen coords
  const hopPoints = new Set<string>()
  if (crossings) {
    for (const cp of crossings) {
      const [cx, cy] = worldToScreen(cp.x, cp.y)
      hopPoints.add(`${Math.round(cx)},${Math.round(cy)}`)
    }
  }

  // Helper: draw a path segment, inserting hop arcs at crossings
  function drawPath(startIdx: number, endIdx: number) {
    for (let i = startIdx; i < endIdx; i++) {
      const p0 = screenPts[i]
      const p1 = screenPts[i + 1]
      // Check if any crossing point lies on this segment
      let hopOnSeg: { x: number; y: number } | null = null
      for (const hp of hopPoints) {
        const [hx, hy] = hp.split(',').map(Number)
        // Check if point is on segment (horizontal or vertical)
        if (p0.y === p1.y && Math.abs(hy - p0.y) < 2 && hx > Math.min(p0.x, p1.x) && hx < Math.max(p0.x, p1.x)) {
          hopOnSeg = { x: hx, y: hy }
          break
        }
        if (p0.x === p1.x && Math.abs(hx - p0.x) < 2 && hy > Math.min(p0.y, p1.y) && hy < Math.max(p0.y, p1.y)) {
          hopOnSeg = { x: hx, y: hy }
          break
        }
      }

      if (hopOnSeg) {
        // Draw up to the hop point
        ctx.lineTo(hopOnSeg.x - 6 * z, hopOnSeg.y)
        // Draw hop arc (semicircle)
        const isHorizontal = p0.y === p1.y
        if (isHorizontal) {
          ctx.arc(hopOnSeg.x, hopOnSeg.y, 6 * z, Math.PI, 0, false)
        } else {
          ctx.arc(hopOnSeg.x, hopOnSeg.y, 6 * z, -Math.PI / 2, Math.PI / 2, false)
        }
        ctx.lineTo(p1.x, p1.y)
      } else {
        ctx.lineTo(p1.x, p1.y)
      }
    }
  }

  // Shadow
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'
  ctx.lineWidth = (wire.thickness + 2) * z
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(screenPts[0].x, screenPts[0].y)
  drawPath(0, screenPts.length - 1)
  ctx.stroke()

  // Main wire with gradient (3D effect)
  const grad = ctx.createLinearGradient(sfx, sfy, stx, sty)
  grad.addColorStop(0, lightenColor(color, 30))
  grad.addColorStop(0.5, color)
  grad.addColorStop(1, lightenColor(color, 20))
  ctx.strokeStyle = grad
  ctx.lineWidth = (selected ? wire.thickness + 1 : wire.thickness) * z
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(screenPts[0].x, screenPts[0].y)
  drawPath(0, screenPts.length - 1)
  ctx.stroke()

  // Highlight (top edge for 3D) - also with hops
  ctx.strokeStyle = `rgba(255,255,255,${selected ? 0.4 : 0.15})`
  ctx.lineWidth = 1 * z
  ctx.beginPath()
  ctx.moveTo(screenPts[0].x, screenPts[0].y - 1 * z)
  for (let i = 0; i < screenPts.length - 1; i++) {
    ctx.lineTo(screenPts[i + 1].x, screenPts[i + 1].y - 1 * z)
  }
  ctx.stroke()

  // Current flow animation — moving dots along the wire
  if (dc.running && dc.animTime !== undefined) {
    const current = dc.wireCurrents?.get(wire.id) ?? 0
    if (Math.abs(current) > 1e-10) {
      const direction = current > 0 ? 1 : -1
      const speed = Math.min(Math.abs(current) * 0.5 + 0.3, 3)
      const dotSpacing = 30 * z
      const numDots = Math.max(1, Math.ceil(200 / dotSpacing))
      const offset = (dc.animTime * speed * direction) % dotSpacing

      ctx.fillStyle = 'rgba(255, 235, 59, 0.85)'
      for (let d = 0; d < numDots; d++) {
        const targetDist = d * dotSpacing + offset
        const pt = pointAlongPath(screenPts, targetDist)
        if (pt) {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2.5 * z, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  // Connection dots at endpoints
  for (const [px, py] of [[sfx, sfy], [stx, sty]]) {
    const dotGrad = ctx.createRadialGradient(px, py, 0, px, py, 5 * z)
    dotGrad.addColorStop(0, lightenColor(color, 40))
    dotGrad.addColorStop(1, color)
    ctx.fillStyle = dotGrad
    ctx.beginPath()
    ctx.arc(px, py, 4 * z, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 1 * z
    ctx.stroke()
  }

  // Junction dots at corner/bend points (only on selected wire)
  if (selected) {
    for (const p of wire.points) {
      const [px, py] = worldToScreen(p.x, p.y)
      // Outer ring
      ctx.fillStyle = 'rgba(14,165,233,0.15)'
      ctx.beginPath()
      ctx.arc(px, py, 6 * z, 0, Math.PI * 2)
      ctx.fill()
      // Inner dot
      const jGrad = ctx.createRadialGradient(px, py, 0, px, py, 4 * z)
      jGrad.addColorStop(0, '#7dd3fc')
      jGrad.addColorStop(1, '#0ea5e9')
      ctx.fillStyle = jGrad
      ctx.beginPath()
      ctx.arc(px, py, 3.5 * z, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1 * z
      ctx.stroke()
    }
  }
}

export function drawTempWire(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  z: number,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2 * z
  ctx.setLineDash([6 * z, 4 * z])
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
  ctx.setLineDash([])
}

function getTerminalWorldPos(comp: WorkshopComponent, term: { dx: number; dy: number }): [number, number] {
  const s = comp.scale ?? 1
  const r = comp.rotation * Math.PI / 180
  const cos = Math.cos(r)
  const sin = Math.sin(r)
  const dx = term.dx * s
  const dy = term.dy * s
  return [
    comp.x + dx * cos - dy * sin,
    comp.y + dx * sin + dy * cos,
  ]
}

export { getTerminalWorldPos }

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function pointAlongPath(pts: { x: number; y: number }[], dist: number): { x: number; y: number } | null {
  let remaining = dist
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x
    const dy = pts[i + 1].y - pts[i].y
    const segLen = Math.sqrt(dx * dx + dy * dy)
    if (segLen === 0) continue
    if (remaining <= segLen) {
      const t = remaining / segLen
      return { x: pts[i].x + dx * t, y: pts[i].y + dy * t }
    }
    remaining -= segLen
  }
  return null
}
