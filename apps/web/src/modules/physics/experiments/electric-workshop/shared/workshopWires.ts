import type { WorkshopComponent, WorkshopWire } from './types'
import { getTerminalWorldPos } from './drawWire'
import { smartRoute } from './smartWire'

export interface WireOpsContext {
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  idCounter: { value: number }
  selectedWireId: { value: number | null }
  selectedWireThickness: { value: number }
  pushUndo: () => void
}

export function addWire(
  ctx: WireOpsContext,
  fromCompId: number, fromTermIndex: number,
  toCompId: number, toTermIndex: number,
  color: string,
  manualPoints?: { x: number; y: number }[],
) {
  const { components, wires } = ctx
  ctx.pushUndo()
  const exists = wires.find(w =>
    (w.fromCompId === fromCompId && w.fromTerminalIndex === fromTermIndex &&
     w.toCompId === toCompId && w.toTerminalIndex === toTermIndex) ||
    (w.fromCompId === toCompId && w.fromTerminalIndex === toTermIndex &&
     w.toCompId === fromCompId && w.toTerminalIndex === fromTermIndex)
  )
  if (exists) return
  const fromComp = components.find(c => c.id === fromCompId)
  const toComp = components.find(c => c.id === toCompId)
  const isManual = !!manualPoints
  const points = manualPoints ?? (fromComp && toComp ? smartRoute(fromComp, fromTermIndex, toComp, toTermIndex, components, wires.filter(() => true)) : [])
  wires.push({
    id: ctx.idCounter.value++,
    fromCompId, fromTerminalIndex: fromTermIndex,
    toCompId, toTerminalIndex: toTermIndex,
    color,
    thickness: ctx.selectedWireThickness.value,
    points,
    manual: isManual || undefined,
  })
}

export function addWireFromJunction(
  ctx: WireOpsContext,
  fromWireId: number, fromPointIndex: number,
  toCompId: number, toTermIndex: number,
  color: string,
) {
  const { components, wires } = ctx
  ctx.pushUndo()
  const srcWire = wires.find(w => w.id === fromWireId)
  if (!srcWire) return
  const fromCompId = srcWire.fromCompId
  const fromTermIndex = srcWire.fromTerminalIndex

  const exists = wires.find(w =>
    (w.fromCompId === fromCompId && w.fromTerminalIndex === fromTermIndex &&
     w.toCompId === toCompId && w.toTerminalIndex === toTermIndex) ||
    (w.fromCompId === toCompId && w.fromTerminalIndex === toTermIndex &&
     w.toCompId === fromCompId && w.toTerminalIndex === fromTermIndex)
  )
  if (exists) return

  const fromComp = components.find(c => c.id === fromCompId)
  const toComp = components.find(c => c.id === toCompId)
  if (!fromComp || !toComp) return

  const junctionPoint = srcWire.points[fromPointIndex]
  const toTerm = toComp.terminals[toTermIndex]
  if (!toTerm) return

  const [tx, ty] = getTerminalWorldPos(toComp, toTerm)
  const ex = Math.round(tx / 20) * 20
  const ey = Math.round(ty / 20) * 20

  const points: { x: number; y: number }[] = []
  const jx = junctionPoint.x
  const jy = junctionPoint.y

  const r = toComp.rotation * Math.PI / 180
  const cos = Math.cos(r), sin = Math.sin(r)
  const tdx = toTerm.dx * cos - toTerm.dy * sin
  const tdy = toTerm.dx * sin + toTerm.dy * cos
  const tDir = Math.abs(tdx) > Math.abs(tdy)
    ? { x: tdx > 0 ? 1 : -1, y: 0 }
    : { x: 0, y: tdy > 0 ? 1 : -1 }

  const e0x = ex + tDir.x * 20
  const e0y = ey + tDir.y * 20

  if (tDir.x !== 0) {
    points.push({ x: e0x, y: jy })
    points.push({ x: e0x, y: e0y })
  } else {
    points.push({ x: jx, y: e0y })
    points.push({ x: e0x, y: e0y })
  }

  wires.push({
    id: ctx.idCounter.value++,
    fromCompId, fromTerminalIndex: fromTermIndex,
    toCompId, toTerminalIndex: toTermIndex,
    color,
    thickness: ctx.selectedWireThickness.value,
    points,
    fromWireId,
    fromWirePointIndex: fromPointIndex,
  })
}

export function removeWire(ctx: WireOpsContext, id: number) {
  ctx.pushUndo()
  const idx = ctx.wires.findIndex(w => w.id === id)
  if (idx >= 0) {
    ctx.wires.splice(idx, 1)
    if (ctx.selectedWireId.value === id) ctx.selectedWireId.value = null
  }
}

export function updateWireColor(ctx: WireOpsContext, id: number, color: string) {
  const wire = ctx.wires.find(w => w.id === id)
  if (wire) wire.color = color
}

export function updateWireThickness(ctx: WireOpsContext, id: number, thickness: number) {
  const wire = ctx.wires.find(w => w.id === id)
  if (wire) wire.thickness = thickness
}

export function moveWirePoint(ctx: WireOpsContext, wireId: number, pointIndex: number, x: number, y: number) {
  const wire = ctx.wires.find(w => w.id === wireId)
  if (!wire || pointIndex < 0 || pointIndex >= wire.points.length) return
  wire.points[pointIndex] = {
    x: Math.round(x / 20) * 20,
    y: Math.round(y / 20) * 20,
  }
}

export function rerouteAllWires(ctx: WireOpsContext) {
  const { components, wires } = ctx
  for (const wire of wires) {
    if (wire.manual) continue
    const fromComp = components.find(c => c.id === wire.fromCompId)
    const toComp = components.find(c => c.id === wire.toCompId)
    if (fromComp && toComp) {
      const otherWires = wires.filter(w => w.id !== wire.id)
      wire.points = smartRoute(fromComp, wire.fromTerminalIndex, toComp, wire.toTerminalIndex, components, otherWires)
    }
  }
}

export function rerouteWiresForComponent(ctx: WireOpsContext, compId: number) {
  const { components, wires } = ctx
  for (const wire of wires) {
    if (wire.manual) continue
    if (wire.fromCompId !== compId && wire.toCompId !== compId) continue
    const fromComp = components.find(c => c.id === wire.fromCompId)
    const toComp = components.find(c => c.id === wire.toCompId)
    if (fromComp && toComp) {
      const otherWires = wires.filter(w => w.id !== wire.id)
      wire.points = smartRoute(fromComp, wire.fromTerminalIndex, toComp, wire.toTerminalIndex, components, otherWires)
    }
  }
}
