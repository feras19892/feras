import type { WorkshopComponent, WorkshopWire, ComponentType, Terminal } from './types'
import { getDef } from './componentDefs'
import { getTerminalWorldPos } from './drawWire'

export interface ComponentOpsContext {
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  idCounter: { value: number }
  selectedComponentId: { value: number | null }
  selectedWireThickness: { value: number }
  pushUndo: () => void
  addWire: (fromCompId: number, fromTermIndex: number, toCompId: number, toTermIndex: number, color: string, manualPoints?: { x: number; y: number }[]) => void
  rerouteAllWires: () => void
}

export function createTerminals(compId: number, type: ComponentType, idCounter: { value: number }): Terminal[] {
  const def = getDef(type)
  const count = def?.terminalCount ?? 2

  const termDist: Record<string, number> = {
    battery: 22, resistor: 25, capacitor: 11, inductor: 25,
    diode: 14, switch: 16, lamp: 12, ammeter: 13, voltmeter: 13,
    breaker: 18, fuse: 22, ground: 12, multimeter: 22,
    relay: 28, acsource: 22, transformer: 28, oscilloscope: 40,
    led: 14, potentiometer: 25, motor: 22,
    zener: 14, npn: 22, pnp: 22, opamp: 30,
    thermistor: 25, buzzer: 14, solarcell: 22,
  }
  const d = termDist[type] ?? 26

  if (count === 1) {
    return [
      { id: idCounter.value++, compId, index: 0, dx: 0, dy: -d, nodeId: null },
    ]
  } else if (count === 2) {
    return [
      { id: idCounter.value++, compId, index: 0, dx: -d, dy: 0, nodeId: null },
      { id: idCounter.value++, compId, index: 1, dx: d, dy: 0, nodeId: null },
    ]
  } else if (count === 3) {
    if (type === 'npn' || type === 'pnp') {
      return [
        { id: idCounter.value++, compId, index: 0, dx: -d, dy: 0, nodeId: null },
        { id: idCounter.value++, compId, index: 1, dx: d, dy: -15, nodeId: null },
        { id: idCounter.value++, compId, index: 2, dx: d, dy: 15, nodeId: null },
      ]
    }
    if (type === 'opamp') {
      return [
        { id: idCounter.value++, compId, index: 0, dx: -d, dy: -12, nodeId: null },
        { id: idCounter.value++, compId, index: 1, dx: -d, dy: 12, nodeId: null },
        { id: idCounter.value++, compId, index: 2, dx: d, dy: 0, nodeId: null },
      ]
    }
    return [
      { id: idCounter.value++, compId, index: 0, dx: -d, dy: 0, nodeId: null },
      { id: idCounter.value++, compId, index: 1, dx: d, dy: 0, nodeId: null },
      { id: idCounter.value++, compId, index: 2, dx: 0, dy: d, nodeId: null },
    ]
  } else if (count === 5) {
    return [
      { id: idCounter.value++, compId, index: 0, dx: -d, dy: -18, nodeId: null },
      { id: idCounter.value++, compId, index: 1, dx: d, dy: -18, nodeId: null },
      { id: idCounter.value++, compId, index: 2, dx: -d, dy: 18, nodeId: null },
      { id: idCounter.value++, compId, index: 3, dx: d, dy: 18, nodeId: null },
      { id: idCounter.value++, compId, index: 4, dx: 0, dy: 18, nodeId: null },
    ]
  } else if (count === 4) {
    return [
      { id: idCounter.value++, compId, index: 0, dx: -d, dy: -15, nodeId: null },
      { id: idCounter.value++, compId, index: 1, dx: d, dy: -15, nodeId: null },
      { id: idCounter.value++, compId, index: 2, dx: -d, dy: 15, nodeId: null },
      { id: idCounter.value++, compId, index: 3, dx: d, dy: 15, nodeId: null },
    ]
  } else {
    return [
      { id: idCounter.value++, compId, index: 0, dx: -d, dy: 0, nodeId: null },
      { id: idCounter.value++, compId, index: 1, dx: d, dy: 0, nodeId: null },
    ]
  }
}

export function addComponent(ctx: ComponentOpsContext, type: ComponentType, x: number, y: number) {
  ctx.pushUndo()
  const def = getDef(type)
  if (!def) return
  const comp: WorkshopComponent = {
    id: ctx.idCounter.value++,
    type,
    x: Math.round(x / 20) * 20,
    y: Math.round(y / 20) * 20,
    rotation: 0,
    value: def.defaultValue,
    unit: def.unit,
    label: def.type,
    closed: type === 'switch',
    terminals: [],
    voltage: 0,
    current: 0,
    breakerTripped: false,
    fuseBlown: false,
    relayState: false,
    relayManualOverride: false,
    breakerRating: def.defaultValue,
    multimeterMode: type === 'multimeter' ? 'voltage' : undefined,
    probeBlack: type === 'multimeter' ? { x: Math.round(x / 20) * 20 - 60, y: Math.round(y / 20) * 20 + 40 } : undefined,
    probeRed: type === 'multimeter' ? { x: Math.round(x / 20) * 20 + 60, y: Math.round(y / 20) * 20 + 40 } : undefined,
    clampPos: type === 'multimeter' ? { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 + 80 } : undefined,
    clampWireId: type === 'multimeter' ? null : undefined,
    acFrequency: type === 'acsource' ? 50 : undefined,
    acPhase: type === 'acsource' ? 0 : undefined,
    acAmplitude: type === 'acsource' ? def.defaultValue : undefined,
    transformerRatio: type === 'transformer' ? def.defaultValue : undefined,
    oscilloscopeTrace: type === 'oscilloscope' ? [] : undefined,
    beta: (type === 'npn' || type === 'pnp') ? def.defaultValue : undefined,
    opampGain: type === 'opamp' ? def.defaultValue : undefined,
  }
  comp.terminals = createTerminals(comp.id, type, ctx.idCounter)
  ctx.components.push(comp)
  ctx.selectedComponentId.value = comp.id
}

export function moveComponent(ctx: ComponentOpsContext, id: number, x: number, y: number) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp) {
    comp.x = Math.round(x / 20) * 20
    comp.y = Math.round(y / 20) * 20
  }
}

export function rotateComponent(ctx: ComponentOpsContext, id: number) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp) comp.rotation = (comp.rotation + 90) % 360
}

export function setComponentScale(ctx: ComponentOpsContext, id: number, scale: number) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp) {
    ctx.pushUndo()
    comp.scale = Math.max(0.3, Math.min(4, scale))
  }
}

export function removeComponent(ctx: ComponentOpsContext, id: number) {
  const { components, wires } = ctx
  const comp = components.find(c => c.id === id)
  if (!comp) return
  ctx.pushUndo()

  if (comp.type === 'ammeter') {
    const wiresIn = wires.filter(w => w.toCompId === id)
    const wiresOut = wires.filter(w => w.fromCompId === id)

    if (wiresIn.length >= 1 && wiresOut.length >= 1) {
      const w1 = wiresIn[0]
      const w2 = wiresOut[0]

      if (w1.fromCompId !== id && w2.toCompId !== id) {
        const w1Idx = wires.indexOf(w1)
        if (w1Idx >= 0) wires.splice(w1Idx, 1)
        const w2Idx = wires.indexOf(w2)
        if (w2Idx >= 0) wires.splice(w2Idx, 1)
        const idx = components.findIndex(c => c.id === id)
        if (idx >= 0) components.splice(idx, 1)
        ctx.addWire(w1.fromCompId, w1.fromTerminalIndex, w2.toCompId, w2.toTerminalIndex, w1.color)
        if (ctx.selectedComponentId.value === id) ctx.selectedComponentId.value = null
        ctx.rerouteAllWires()
        return
      }
    }
  }

  const idx = components.findIndex(c => c.id === id)
  if (idx >= 0) {
    components.splice(idx, 1)
    for (let i = wires.length - 1; i >= 0; i--) {
      if (wires[i].fromCompId === id || wires[i].toCompId === id) {
        wires.splice(i, 1)
      }
    }
    if (ctx.selectedComponentId.value === id) ctx.selectedComponentId.value = null
  }
}

export function insertAmmeterIntoWire(ctx: ComponentOpsContext, wireId: number, ammeterId: number) {
  const { components, wires } = ctx
  ctx.pushUndo()
  const wire = wires.find(w => w.id === wireId)
  if (!wire) return

  const comp = components.find(c => c.id === ammeterId)
  if (!comp || comp.type !== 'ammeter') return

  const origFromCompId = wire.fromCompId
  const origFromTerm = wire.fromTerminalIndex
  const origToCompId = wire.toCompId
  const origToTerm = wire.toTerminalIndex
  const origColor = wire.color

  const fromComp = components.find(c => c.id === origFromCompId)
  const toComp = components.find(c => c.id === origToCompId)
  if (!fromComp || !toComp) return
  const fromTerm = fromComp.terminals[origFromTerm]
  const toTerm = toComp.terminals[origToTerm]
  if (!fromTerm || !toTerm) return
  const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)

  const ammTerms = comp.terminals
  if (ammTerms.length < 2) return
  const [a0x, a0y] = getTerminalWorldPos(comp, ammTerms[0])
  const [a1x, a1y] = getTerminalWorldPos(comp, ammTerms[1])
  const dist0From = Math.hypot(a0x - fx, a0y - fy)
  const dist1From = Math.hypot(a1x - fx, a1y - fy)
  const fromAmmTerm = dist0From <= dist1From ? 0 : 1
  const toAmmTerm = fromAmmTerm === 0 ? 1 : 0

  const wIdx = wires.indexOf(wire)
  if (wIdx >= 0) wires.splice(wIdx, 1)

  ctx.addWire(origFromCompId, origFromTerm, comp.id, fromAmmTerm, origColor)
  ctx.addWire(comp.id, toAmmTerm, origToCompId, origToTerm, origColor)

  ctx.selectedComponentId.value = comp.id
  ctx.rerouteAllWires()
}

export function updateComponentValue(ctx: ComponentOpsContext, id: number, value: number) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp) {
    ctx.pushUndo()
    comp.value = value
    if (comp.type === 'breaker') comp.breakerRating = value
    if (comp.type === 'acsource') comp.acAmplitude = value
    if (comp.type === 'relay') comp.relayManualOverride = false
  }
}

export function toggleSwitch(ctx: ComponentOpsContext, id: number) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp && comp.type === 'switch') {
    ctx.pushUndo()
    comp.closed = !comp.closed
  }
}

export function setMultimeterMode(ctx: ComponentOpsContext, id: number, mode: 'voltage' | 'current' | 'resistance', running: boolean, solve: () => void) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp && comp.type === 'multimeter') {
    comp.multimeterMode = mode
    if (running) solve()
  }
}

export function resetBreaker(ctx: ComponentOpsContext, id: number) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp && comp.type === 'breaker') comp.breakerTripped = false
}

export function resetFuse(ctx: ComponentOpsContext, id: number) {
  const comp = ctx.components.find(c => c.id === id)
  if (comp && comp.type === 'fuse') comp.fuseBlown = false
}
