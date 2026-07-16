import type { Ref } from 'vue'
import type { WorkshopComponent, WorkshopWire } from './types'
import { drawComponent } from './drawComponent'
import { drawWire, drawTempWire, getTerminalWorldPos } from './drawWire'
import { findWireCrossings } from './smartWire'

const GRID_SIZE = 20

export interface WorkshopCanvasProps {
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  running: boolean
  selectedWireColor: string
}

export function useWorkshopCanvas(
  zoom: Ref<number>,
  panX: Ref<number>,
  panY: Ref<number>,
  props: WorkshopCanvasProps,
) {
  function worldToScreen(x: number, y: number): [number, number] {
    return [x * zoom.value + panX.value, y * zoom.value + panY.value]
  }

  function screenToWorld(sx: number, sy: number): [number, number] {
    return [(sx - panX.value) / zoom.value, (sy - panY.value) / zoom.value]
  }

  function hitTestComponent(sx: number, sy: number): WorkshopComponent | null {
    for (let i = props.components.length - 1; i >= 0; i--) {
      const c = props.components[i]
      const [cx, cy] = worldToScreen(c.x, c.y)
      const cs = c.scale ?? 1
      // Round components (ammeter, voltmeter, lamp) use circular hit test
      const roundTypes = ['ammeter', 'voltmeter', 'lamp']
      if (roundTypes.includes(c.type)) {
        const r = 16 * cs * zoom.value
        const dist = Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2)
        if (dist <= r) return c
        continue
      }
      const halfW = 30 * cs * zoom.value
      const halfH = 22 * cs * zoom.value
      if (sx >= cx - halfW && sx <= cx + halfW && sy >= cy - halfH && sy <= cy + halfH) {
        return c
      }
    }
    return null
  }

  function hitTestTerminal(sx: number, sy: number): { comp: WorkshopComponent; termIndex: number } | null {
    for (let i = props.components.length - 1; i >= 0; i--) {
      const c = props.components[i]
      const cs = c.scale ?? 1
      const [ccx, ccy] = worldToScreen(c.x, c.y)
      const clickDistFromCenter = Math.sqrt((sx - ccx) ** 2 + (sy - ccy) ** 2)

      // For round components, don't catch terminal hits inside the body
      const roundTypes = ['ammeter', 'voltmeter', 'lamp']
      if (roundTypes.includes(c.type)) {
        const bodyR = 10 * cs * zoom.value
        if (clickDistFromCenter < bodyR) continue // skip — let hitTestComponent handle it
      }

      for (let ti = 0; ti < c.terminals.length; ti++) {
        const t = c.terminals[ti]
        const [wx, wy] = getTerminalWorldPos(c, t)
        const [tsx, tsy] = worldToScreen(wx, wy)
        const dist = Math.sqrt((sx - tsx) ** 2 + (sy - tsy) ** 2)
        if (dist < 9 * cs * zoom.value) {
          return { comp: c, termIndex: ti }
        }
      }
    }
    return null
  }

  function hitTestWire(sx: number, sy: number): WorkshopWire | null {
    for (let i = props.wires.length - 1; i >= 0; i--) {
      const wire = props.wires[i]
      const fromComp = props.components.find(c => c.id === wire.fromCompId)
      const toComp = props.components.find(c => c.id === wire.toCompId)
      if (!fromComp || !toComp) continue
      const fromTerm = fromComp.terminals[wire.fromTerminalIndex]
      const toTerm = toComp.terminals[wire.toTerminalIndex]
      if (!fromTerm || !toTerm) continue
      const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)
      const [tx, ty] = getTerminalWorldPos(toComp, toTerm)
      const [sfx, sfy] = worldToScreen(fx, fy)
      const [stx, sty] = worldToScreen(tx, ty)
      // Build full point list
      const pts: { x: number; y: number }[] = [{ x: sfx, y: sfy }]
      for (const p of wire.points) {
        const [px, py] = worldToScreen(p.x, p.y)
        pts.push({ x: px, y: py })
      }
      pts.push({ x: stx, y: sty })
      // Distance from point to each segment
      for (let j = 0; j < pts.length - 1; j++) {
        const dist = distToSegment(sx, sy, pts[j].x, pts[j].y, pts[j + 1].x, pts[j + 1].y)
        if (dist < 8 * zoom.value) return wire
      }
    }
    return null
  }

  function hitTestWireJunction(sx: number, sy: number): { wire: WorkshopWire; pointIndex: number; worldX: number; worldY: number } | null {
    for (let i = props.wires.length - 1; i >= 0; i--) {
      const wire = props.wires[i]
      for (let j = 0; j < wire.points.length; j++) {
        const p = wire.points[j]
        const [px, py] = worldToScreen(p.x, p.y)
        const dist = Math.sqrt((sx - px) ** 2 + (sy - py) ** 2)
        if (dist < 8 * zoom.value) {
          return { wire, pointIndex: j, worldX: p.x, worldY: p.y }
        }
      }
    }
    return null
  }

  function hitTestWireSegment(sx: number, sy: number): { wire: WorkshopWire; segIndex: number } | null {
    for (let i = props.wires.length - 1; i >= 0; i--) {
      const wire = props.wires[i]
      const fromComp = props.components.find(c => c.id === wire.fromCompId)
      const toComp = props.components.find(c => c.id === wire.toCompId)
      if (!fromComp || !toComp) continue
      const fromTerm = fromComp.terminals[wire.fromTerminalIndex]
      const toTerm = toComp.terminals[wire.toTerminalIndex]
      if (!fromTerm || !toTerm) continue
      const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)
      const [tx, ty] = getTerminalWorldPos(toComp, toTerm)
      const [sfx, sfy] = worldToScreen(fx, fy)
      const [stx, sty] = worldToScreen(tx, ty)
      const pts: { x: number; y: number }[] = [{ x: sfx, y: sfy }]
      for (const p of wire.points) {
        const [px, py] = worldToScreen(p.x, p.y)
        pts.push({ x: px, y: py })
      }
      pts.push({ x: stx, y: sty })
      for (let j = 0; j < pts.length - 1; j++) {
        const dist = distToSegment(sx, sy, pts[j].x, pts[j].y, pts[j + 1].x, pts[j + 1].y)
        if (dist < 8 * zoom.value) {
          return { wire, segIndex: j }
        }
      }
    }
    return null
  }

  function draw(
    canvas: HTMLCanvasElement,
    selectedId: number | null,
    selectedWireId: number | null,
    tempWire: { fromX: number; fromY: number; toX: number; toY: number } | null,
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, W, H)

    // Grid
    const gs = GRID_SIZE * zoom.value
    const ox = panX.value % gs, oy = panY.value % gs
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = ox; x < W; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, H) }
    for (let y = oy; y < H; y += gs) { ctx.moveTo(0, y); ctx.lineTo(W, y) }
    ctx.stroke()

    // Create dc with current values
    const dc = { zoom: zoom.value, panX: panX.value, panY: panY.value, worldToScreen }

    // Compute wire crossings for hop-over arcs
    const crossingMap = findWireCrossings(props.wires, props.components)

    // Wires
    for (const wire of props.wires) {
      const crossings = crossingMap.get(wire.id) ?? []
      drawWire(ctx, wire, props.components, dc, selectedWireId === wire.id, crossings)
    }

    // Temp wire (being drawn)
    if (tempWire) {
      drawTempWire(ctx, tempWire.fromX, tempWire.fromY, tempWire.toX, tempWire.toY, props.selectedWireColor, zoom.value)
    }

    // Components
    for (const comp of props.components) {
      drawComponent(ctx, comp, selectedId, dc, props.running)
    }

    // Status bar
    ctx.fillStyle = '#475569'
    ctx.font = '0.7rem sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Zoom: ${zoom.value.toFixed(2)}x`, 10, 20)
    ctx.fillText(`مكونات: ${props.components.length} | أسلاك: ${props.wires.length}`, 10, 38)

    if (props.components.length === 0 && props.wires.length === 0) {
      ctx.fillStyle = '#334155'
      ctx.font = '0.85rem sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('اسحب مكوناً من القائمة أو انقر لإضافته', W / 2, H / 2)
    }
  }

  return { worldToScreen, screenToWorld, hitTestComponent, hitTestTerminal, hitTestWire, hitTestWireJunction, hitTestWireSegment, draw }
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2)
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx, cy = ay + t * dy
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
}
