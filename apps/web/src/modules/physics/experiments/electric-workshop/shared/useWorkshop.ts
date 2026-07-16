import { ref, reactive, computed, watch } from 'vue'
import type { WorkshopComponent, WorkshopWire, ComponentType, Terminal, SolveResult, FaultInfo } from './types'
import { WIRE_COLORS } from './types'
import { getDef } from './componentDefs'
import { solveCircuit, updateRelayStates } from './solver'
import { smartRoute } from './smartWire'
import { getTerminalWorldPos } from './drawWire'

const STORAGE_KEY = 'electric-workshop-state'
let idCounter = 1

function saveState(components: WorkshopComponent[], wires: WorkshopWire[]) {
  try {
    const data = {
      components: components.map(c => ({ ...c, terminals: c.terminals.map(t => ({ ...t })) })),
      wires: wires.map(w => ({ ...w, points: [...w.points] })),
      idCounter,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore storage errors
  }
}

function loadState(): { components: WorkshopComponent[]; wires: WorkshopWire[]; idCounter: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data.components || !data.wires) return null
    idCounter = data.idCounter || 1
    return { components: data.components, wires: data.wires, idCounter: data.idCounter }
  } catch (e) {
    return null
  }
}

export function useWorkshop() {
  const saved = loadState()
  const components = reactive<WorkshopComponent[]>(saved?.components ?? [])
  const wires = reactive<WorkshopWire[]>(saved?.wires ?? [])
  const running = ref(false)
  const selectedComponentId = ref<number | null>(null)
  const selectedWireId = ref<number | null>(null)
  const selectedWireColor = ref(WIRE_COLORS.blue)
  const selectedWireThickness = ref(3)
  const solveResult = ref<SolveResult | null>(null)
  const error = ref('')

  // Auto-save on changes (debounced)
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  watch([() => [...components], () => [...wires]], () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => saveState(components, wires), 500)
  }, { deep: true })
  const faults = ref<FaultInfo[]>([])

  function createTerminals(compId: number, type: ComponentType): Terminal[] {
    const def = getDef(type)
    const count = def?.terminalCount ?? 2

    // Terminal distance from center — at the very edge of each component's body
    const termDist: Record<string, number> = {
      battery: 22, resistor: 25, capacitor: 11, inductor: 25,
      diode: 14, switch: 16, lamp: 12, ammeter: 13, voltmeter: 13,
      breaker: 18, fuse: 22, ground: 12, multimeter: 22,
      relay: 28,
    }
    const d = termDist[type] ?? 26

    if (count === 2) {
      return [
        { id: idCounter++, compId, index: 0, dx: -d, dy: 0, nodeId: null },
        { id: idCounter++, compId, index: 1, dx: d, dy: 0, nodeId: null },
      ]
    } else {
      // 4 terminals: 0,1 = switch, 2,3 = coil
      return [
        { id: idCounter++, compId, index: 0, dx: -d, dy: -15, nodeId: null },
        { id: idCounter++, compId, index: 1, dx: d, dy: -15, nodeId: null },
        { id: idCounter++, compId, index: 2, dx: -d, dy: 15, nodeId: null },
        { id: idCounter++, compId, index: 3, dx: d, dy: 15, nodeId: null },
      ]
    }
  }

  function addComponent(type: ComponentType, x: number, y: number) {
    const def = getDef(type)
    if (!def) return
    const comp: WorkshopComponent = {
      id: idCounter++,
      type,
      x: Math.round(x / 20) * 20,
      y: Math.round(y / 20) * 20,
      rotation: 0,
      value: def.defaultValue,
      unit: def.unit,
      label: def.labelAr,
      closed: type === 'switch',
      terminals: [],
      voltage: 0,
      current: 0,
      breakerTripped: false,
      fuseBlown: false,
      relayState: false,
      breakerRating: def.defaultValue,
      multimeterMode: type === 'multimeter' ? 'voltage' : undefined,
    }
    comp.terminals = createTerminals(comp.id, type)
    components.push(comp)
    selectedComponentId.value = comp.id
  }

  function moveComponent(id: number, x: number, y: number) {
    const comp = components.find(c => c.id === id)
    if (comp) {
      comp.x = Math.round(x / 20) * 20
      comp.y = Math.round(y / 20) * 20
    }
  }

  function rotateComponent(id: number) {
    const comp = components.find(c => c.id === id)
    if (comp) comp.rotation = (comp.rotation + 90) % 360
  }

  function setComponentScale(id: number, scale: number) {
    const comp = components.find(c => c.id === id)
    if (comp) comp.scale = Math.max(0.3, Math.min(4, scale))
  }

  function removeComponent(id: number) {
    const comp = components.find(c => c.id === id)
    if (!comp) return

    // If ammeter: try to reconnect the two wires that pass through it
    if (comp.type === 'ammeter') {
      // Find wires connected to ammeter terminals
      const wiresIn = wires.filter(w => w.toCompId === id)
      const wiresOut = wires.filter(w => w.fromCompId === id)

      if (wiresIn.length >= 1 && wiresOut.length >= 1) {
        const w1 = wiresIn[0]
        const w2 = wiresOut[0]

        // w1 ends at ammeter: outer endpoint is w1.fromCompId
        // w2 starts from ammeter: outer endpoint is w2.toCompId
        if (w1.fromCompId !== id && w2.toCompId !== id) {
          // Remove both old wires
          const w1Idx = wires.indexOf(w1)
          if (w1Idx >= 0) wires.splice(w1Idx, 1)
          const w2Idx = wires.indexOf(w2)
          if (w2Idx >= 0) wires.splice(w2Idx, 1)
          // Remove component
          const idx = components.findIndex(c => c.id === id)
          if (idx >= 0) components.splice(idx, 1)
          // Create a single reconnecting wire
          addWire(w1.fromCompId, w1.fromTerminalIndex, w2.toCompId, w2.toTerminalIndex, w1.color)
          if (selectedComponentId.value === id) selectedComponentId.value = null
          rerouteAllWires()
          return
        }
      }
    }

    const idx = components.findIndex(c => c.id === id)
    if (idx >= 0) {
      components.splice(idx, 1)
      // Remove connected wires
      for (let i = wires.length - 1; i >= 0; i--) {
        if (wires[i].fromCompId === id || wires[i].toCompId === id) {
          wires.splice(i, 1)
        }
      }
      if (selectedComponentId.value === id) selectedComponentId.value = null
    }
  }

  function insertAmmeterIntoWire(wireId: number, ammeterId: number) {
    const wire = wires.find(w => w.id === wireId)
    if (!wire) return

    const comp = components.find(c => c.id === ammeterId)
    if (!comp || comp.type !== 'ammeter') return

    // Save original wire endpoints
    const origFromCompId = wire.fromCompId
    const origFromTerm = wire.fromTerminalIndex
    const origToCompId = wire.toCompId
    const origToTerm = wire.toTerminalIndex
    const origColor = wire.color

    // Get world positions of original endpoints
    const fromComp = components.find(c => c.id === origFromCompId)
    const toComp = components.find(c => c.id === origToCompId)
    if (!fromComp || !toComp) return
    const fromTerm = fromComp.terminals[origFromTerm]
    const toTerm = toComp.terminals[origToTerm]
    if (!fromTerm || !toTerm) return
    const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)

    // Find which ammeter terminal is closest to each original endpoint
    const ammTerms = comp.terminals
    if (ammTerms.length < 2) return
    const [a0x, a0y] = getTerminalWorldPos(comp, ammTerms[0])
    const [a1x, a1y] = getTerminalWorldPos(comp, ammTerms[1])
    const dist0From = Math.hypot(a0x - fx, a0y - fy)
    const dist1From = Math.hypot(a1x - fx, a1y - fy)
    // Terminal closest to 'from' endpoint
    const fromAmmTerm = dist0From <= dist1From ? 0 : 1
    const toAmmTerm = fromAmmTerm === 0 ? 1 : 0

    // Remove the original wire
    const wIdx = wires.indexOf(wire)
    if (wIdx >= 0) wires.splice(wIdx, 1)

    // Create two new wires: orig → ammeter (nearest terminal), ammeter (other terminal) → orig
    addWire(origFromCompId, origFromTerm, comp.id, fromAmmTerm, origColor)
    addWire(comp.id, toAmmTerm, origToCompId, origToTerm, origColor)

    selectedComponentId.value = comp.id
    rerouteAllWires()
  }

  function updateComponentValue(id: number, value: number) {
    const comp = components.find(c => c.id === id)
    if (comp) {
      comp.value = value
      if (comp.type === 'breaker') comp.breakerRating = value
    }
  }

  function toggleSwitch(id: number) {
    const comp = components.find(c => c.id === id)
    if (comp && comp.type === 'switch') comp.closed = !comp.closed
  }

  function setMultimeterMode(id: number, mode: 'voltage' | 'current' | 'resistance') {
    const comp = components.find(c => c.id === id)
    if (comp && comp.type === 'multimeter') {
      comp.multimeterMode = mode
      if (running.value) solve()
    }
  }

  function resetBreaker(id: number) {
    const comp = components.find(c => c.id === id)
    if (comp && comp.type === 'breaker') comp.breakerTripped = false
  }

  function resetFuse(id: number) {
    const comp = components.find(c => c.id === id)
    if (comp && comp.type === 'fuse') comp.fuseBlown = false
  }

  function addWire(
    fromCompId: number, fromTermIndex: number,
    toCompId: number, toTermIndex: number,
    color: string,
    manualPoints?: { x: number; y: number }[],
  ) {
    // Check if wire already exists
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
      id: idCounter++,
      fromCompId, fromTerminalIndex: fromTermIndex,
      toCompId, toTerminalIndex: toTermIndex,
      color,
      thickness: selectedWireThickness.value,
      points,
      manual: isManual || undefined,
    })
  }

  function addWireFromJunction(
    fromWireId: number, fromPointIndex: number,
    toCompId: number, toTermIndex: number,
    color: string,
  ) {
    const srcWire = wires.find(w => w.id === fromWireId)
    if (!srcWire) return
    // Use the "from" terminal of the source wire as the electrical connection point
    // (junction is on the same node as both endpoints)
    const fromCompId = srcWire.fromCompId
    const fromTermIndex = srcWire.fromTerminalIndex

    // Check if wire already exists
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

    // Route from the junction point position, not from the terminal
    const junctionPoint = srcWire.points[fromPointIndex]
    const toTerm = toComp.terminals[toTermIndex]
    if (!toTerm) return

    // Build route: start at junction, go to target terminal
    const [tx, ty] = getTerminalWorldPos(toComp, toTerm)
    const ex = Math.round(tx / 20) * 20
    const ey = Math.round(ty / 20) * 20

    // Simple L-route from junction to target
    const points: { x: number; y: number }[] = []
    const jx = junctionPoint.x
    const jy = junctionPoint.y

    // Determine target terminal direction
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
      id: idCounter++,
      fromCompId, fromTerminalIndex: fromTermIndex,
      toCompId, toTerminalIndex: toTermIndex,
      color,
      thickness: selectedWireThickness.value,
      points,
      fromWireId,
      fromWirePointIndex: fromPointIndex,
    })
  }

  function removeWire(id: number) {
    const idx = wires.findIndex(w => w.id === id)
    if (idx >= 0) {
      wires.splice(idx, 1)
      if (selectedWireId.value === id) selectedWireId.value = null
    }
  }

  function updateWireColor(id: number, color: string) {
    const wire = wires.find(w => w.id === id)
    if (wire) wire.color = color
  }

  function updateWireThickness(id: number, thickness: number) {
    const wire = wires.find(w => w.id === id)
    if (wire) wire.thickness = thickness
  }

  function moveWirePoint(wireId: number, pointIndex: number, x: number, y: number) {
    const wire = wires.find(w => w.id === wireId)
    if (!wire || pointIndex < 0 || pointIndex >= wire.points.length) return
    wire.points[pointIndex] = {
      x: Math.round(x / 20) * 20,
      y: Math.round(y / 20) * 20,
    }
  }

  function rerouteAllWires() {
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

  // Only re-route wires connected to this component (used during drag to avoid moving other wires)
  function rerouteWiresForComponent(compId: number) {
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

  function clearAll() {
    components.splice(0, components.length)
    wires.splice(0, wires.length)
    selectedComponentId.value = null
    selectedWireId.value = null
    solveResult.value = null
    error.value = ''
    faults.value = []
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) { /* ignore */ }
  }

  const CIRCUITS_KEY = 'electric-workshop-saved-circuits'

  function saveCircuit(name: string): boolean {
    try {
      const raw = localStorage.getItem(CIRCUITS_KEY)
      const list: { name: string; data: any }[] = raw ? JSON.parse(raw) : []
      const data = {
        components: components.map(c => ({ ...c, terminals: c.terminals.map(t => ({ ...t })) })),
        wires: wires.map(w => ({ ...w, points: [...w.points] })),
        idCounter,
      }
      const idx = list.findIndex(c => c.name === name)
      if (idx >= 0) list[idx].data = data
      else list.push({ name, data })
      localStorage.setItem(CIRCUITS_KEY, JSON.stringify(list))
      return true
    } catch (e) {
      return false
    }
  }

  function loadCircuit(name: string): boolean {
    try {
      const raw = localStorage.getItem(CIRCUITS_KEY)
      if (!raw) return false
      const list: { name: string; data: any }[] = JSON.parse(raw)
      const found = list.find(c => c.name === name)
      if (!found) return false
      clearAll()
      const d = found.data
      idCounter = d.idCounter ?? 1
      for (const c of d.components) {
        components.push({ ...c, terminals: c.terminals.map((t: any) => ({ ...t })) })
      }
      for (const w of d.wires) {
        wires.push({ ...w, points: [...w.points] })
      }
      if (running.value) solve()
      return true
    } catch (e) {
      return false
    }
  }

  function getSavedCircuits(): string[] {
    try {
      const raw = localStorage.getItem(CIRCUITS_KEY)
      if (!raw) return []
      const list: { name: string; data: any }[] = JSON.parse(raw)
      return list.map(c => c.name)
    } catch (e) {
      return []
    }
  }

  function deleteCircuit(name: string): boolean {
    try {
      const raw = localStorage.getItem(CIRCUITS_KEY)
      if (!raw) return false
      const list: { name: string; data: any }[] = JSON.parse(raw)
      const idx = list.findIndex(c => c.name === name)
      if (idx < 0) return false
      list.splice(idx, 1)
      localStorage.setItem(CIRCUITS_KEY, JSON.stringify(list))
      return true
    } catch (e) {
      return false
    }
  }

  function loadExperiment(name: 'ohm' | 'series' | 'parallel' | 'mixed' | 'kvl' | 'kcl' | 'vdivider' | 'cdivider' | 'bseries' | 'bparallel') {
    clearAll()

    if (name === 'ohm') {
      // Bat → Amm → R1 → return, V1 across R1
      addComponent('battery', 200, 400)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id) // +(200,378) -(200,422)

      addComponent('ammeter', 420, 300)
      const amm = components[components.length - 1] // L(407,300) R(433,300)

      addComponent('resistor', 660, 300)
      const r1 = components[components.length - 1]; r1.value = 10 // L(635,300) R(685,300)

      addComponent('voltmeter', 660, 160)
      const v1 = components[components.length - 1] // L(647,160) R(673,160)

      addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:320,y:378},{x:320,y:300}])
      addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
      addWire(r1.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:760,y:300},{x:760,y:520},{x:200,y:520}])
      addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:640,y:230}])
      addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:680,y:230}])
    }
    else if (name === 'series') {
      // Bat → Amm → R1 → Amm2 → R2 → return
      // V1 across R1, V2 across R2
      addComponent('battery', 200, 400)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id) // +(200,378) -(200,422)

      addComponent('ammeter', 320, 300)
      const amm = components[components.length - 1] // L(307,300) R(333,300)

      addComponent('resistor', 460, 300)
      const r1 = components[components.length - 1]; r1.value = 10 // L(435,300) R(485,300)

      addComponent('ammeter', 600, 300)
      const amm2 = components[components.length - 1] // L(587,300) R(613,300)

      addComponent('resistor', 740, 300)
      const r2 = components[components.length - 1]; r2.value = 20 // L(715,300) R(765,300)

      addComponent('voltmeter', 460, 160)
      const v1 = components[components.length - 1] // L(447,160) R(473,160)

      addComponent('voltmeter', 740, 160)
      const v2 = components[components.length - 1] // L(727,160) R(753,160)

      addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:250,y:378},{x:250,y:300}])
      addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
      addWire(r1.id, 1, amm2.id, 0, WIRE_COLORS.red, [])
      addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [])
      addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:820,y:300},{x:820,y:520},{x:200,y:520}])
      addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:440,y:230}])
      addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:480,y:230}])
      addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:720,y:230}])
      addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:760,y:230}])
    }
    else if (name === 'parallel') {
      // Bat → Amm → split → [Amm1 → R1] / [Amm2 → R2] → merge → return
      // V across parallel section
      addComponent('battery', 200, 420)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id) // +(200,398) -(200,442)

      addComponent('ammeter', 320, 300)
      const amm = components[components.length - 1] // L(307,300) R(333,300)

      // Top branch: Amm1 → R1
      addComponent('ammeter', 460, 200)
      const amm1 = components[components.length - 1] // L(447,200) R(473,200)

      addComponent('resistor', 640, 200)
      const r1 = components[components.length - 1]; r1.value = 10 // L(615,200) R(665,200)

      // Bottom branch: Amm2 → R2
      addComponent('ammeter', 460, 400)
      const amm2 = components[components.length - 1] // L(447,400) R(473,400)

      addComponent('resistor', 640, 400)
      const r2 = components[components.length - 1]; r2.value = 20 // L(615,400) R(665,400)

      addComponent('voltmeter', 540, 80)
      const v1 = components[components.length - 1] // L(527,80) R(553,80)

      // Bat+ → Amm-L
      addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:260,y:398},{x:260,y:300}])
      // Amm-R → Amm1-L (split up)
      addWire(amm.id, 1, amm1.id, 0, WIRE_COLORS.red, [{x:380,y:300},{x:380,y:200}])
      // Amm-R → Amm2-L (split down)
      addWire(amm.id, 1, amm2.id, 0, WIRE_COLORS.red, [{x:380,y:300},{x:380,y:400}])
      // Amm1-R → R1-L
      addWire(amm1.id, 1, r1.id, 0, WIRE_COLORS.red, [])
      // Amm2-R → R2-L
      addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [])
      // R2-R → R1-R (connect right ends)
      addWire(r2.id, 1, r1.id, 1, WIRE_COLORS.black, [{x:720,y:400},{x:720,y:200}])
      // R1-R → Bat- (return)
      addWire(r1.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:720,y:200},{x:720,y:540},{x:200,y:540}])
      // V across parallel: V-L → R1-L, V-R → R1-R
      addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:527,y:140},{x:615,y:140}])
      addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:553,y:120},{x:665,y:120}])
    }
    else if (name === 'mixed') {
      // Bat → Amm → R1 → Amm2 → R2 → split → [Amm3 → R3] / [Amm4 → R4] → merge → return
      // V1 across R1, V2 across R2, V3 across R3
      addComponent('battery', 200, 520)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id) // +(200,498) -(200,542)

      addComponent('ammeter', 300, 400)
      const amm = components[components.length - 1] // L(287,400) R(313,400)

      // R1 — series
      addComponent('resistor', 420, 400)
      const r1 = components[components.length - 1]; r1.value = 10 // L(395,400) R(445,400)

      // Amm2 — series
      addComponent('ammeter', 540, 400)
      const amm2 = components[components.length - 1] // L(527,400) R(553,400)

      // R2 — series
      addComponent('resistor', 660, 400)
      const r2 = components[components.length - 1]; r2.value = 20 // L(635,400) R(685,400)

      // Amm3 — parallel top branch
      addComponent('ammeter', 800, 300)
      const amm3 = components[components.length - 1] // L(787,300) R(813,300)

      // R3 — parallel top
      addComponent('resistor', 940, 300)
      const r3 = components[components.length - 1]; r3.value = 30 // L(915,300) R(965,300)

      // Amm4 — parallel bottom branch
      addComponent('ammeter', 800, 500)
      const amm4 = components[components.length - 1] // L(787,500) R(813,500)

      // R4 — parallel bottom
      addComponent('resistor', 940, 500)
      const r4 = components[components.length - 1]; r4.value = 40 // L(915,500) R(965,500)

      addComponent('voltmeter', 420, 260)
      const v1 = components[components.length - 1] // L(407,260) R(433,260)

      addComponent('voltmeter', 660, 260)
      const v2 = components[components.length - 1] // L(647,260) R(673,260)

      addComponent('voltmeter', 870, 140)
      const v3 = components[components.length - 1] // L(857,140) R(883,140)

      // Main loop: Bat+ → Amm → R1 → Amm2 → R2
      addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:240,y:498},{x:240,y:400}])
      addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
      addWire(r1.id, 1, amm2.id, 0, WIRE_COLORS.red, [])
      addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [])
      // R2 → split to Amm3 (up) and Amm4 (down)
      addWire(r2.id, 1, amm3.id, 0, WIRE_COLORS.red, [{x:740,y:400},{x:740,y:300}])
      addWire(r2.id, 1, amm4.id, 0, WIRE_COLORS.red, [{x:740,y:400},{x:740,y:500}])
      // Amm3 → R3, Amm4 → R4
      addWire(amm3.id, 1, r3.id, 0, WIRE_COLORS.red, [])
      addWire(amm4.id, 1, r4.id, 0, WIRE_COLORS.red, [])
      // R4-R → R3-R (connect right ends)
      addWire(r4.id, 1, r3.id, 1, WIRE_COLORS.black, [{x:1000,y:500},{x:1000,y:300}])
      // R3-R → Bat- (return)
      addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:1000,y:300},{x:1000,y:660},{x:200,y:660}])
      // V1 across R1
      addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:400,y:330}])
      addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:440,y:330}])
      // V2 across R2
      addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:640,y:330}])
      addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:680,y:330}])
      // V3 across R3 (same as across parallel section)
      addWire(v3.id, 0, r3.id, 0, WIRE_COLORS.blue, [{x:857,y:200},{x:915,y:200}])
      addWire(v3.id, 1, r3.id, 1, WIRE_COLORS.blue, [{x:883,y:200},{x:965,y:200}])
    }

    // KVL: Battery → Amm → R1 → R2 → R3 → return, V1/V2/V3 across each
    // Shows sum of voltages = battery voltage
    if (name === 'kvl') {
      addComponent('battery', 200, 400)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id)

      addComponent('ammeter', 420, 300)
      const amm = components[components.length - 1]; amm.value = 0
      rotateComponent(amm.id)

      addComponent('resistor', 560, 300)
      const r1 = components[components.length - 1]; r1.value = 2

      addComponent('resistor', 700, 300)
      const r2 = components[components.length - 1]; r2.value = 4

      addComponent('resistor', 840, 300)
      const r3 = components[components.length - 1]; r3.value = 6

      // Voltmeters
      addComponent('voltmeter', 560, 180)
      const v1 = components[components.length - 1]; v1.value = 0
      addComponent('voltmeter', 700, 180)
      const v2 = components[components.length - 1]; v2.value = 0
      addComponent('voltmeter', 840, 180)
      const v3 = components[components.length - 1]; v3.value = 0

      // Wires: Bat+ → Amm → R1 → R2 → R3 → Bat-
      addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:420,y:300}])
      addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:560,y:300}])
      addWire(r1.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:600,y:300},{x:700,y:300}])
      addWire(r2.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:740,y:300},{x:840,y:300}])
      addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:880,y:300},{x:880,y:422},{x:200,y:422}])

      // V1 across R1
      addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:560,y:180},{x:560,y:270}])
      addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:600,y:180},{x:600,y:270}])
      // V2 across R2
      addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:700,y:180},{x:700,y:270}])
      addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:740,y:180},{x:740,y:270}])
      // V3 across R3
      addWire(v3.id, 0, r3.id, 0, WIRE_COLORS.blue, [{x:840,y:180},{x:840,y:270}])
      addWire(v3.id, 1, r3.id, 1, WIRE_COLORS.blue, [{x:880,y:180},{x:880,y:270}])
    }

    // KCL: Battery → split into 3 parallel branches → merge → return
    // Shows sum of branch currents = total current
    if (name === 'kcl') {
      addComponent('battery', 200, 400)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id)

      // Main ammeter
      addComponent('ammeter', 380, 300)
      const amm0 = components[components.length - 1]; amm0.value = 0
      rotateComponent(amm0.id)

      // Branch 1: R1=6
      addComponent('resistor', 540, 200)
      const r1 = components[components.length - 1]; r1.value = 6
      addComponent('ammeter', 420, 200)
      const amm1 = components[components.length - 1]; amm1.value = 0
      rotateComponent(amm1.id)

      // Branch 2: R2=3
      addComponent('resistor', 540, 300)
      const r2 = components[components.length - 1]; r2.value = 3
      addComponent('ammeter', 420, 300)
      const amm2 = components[components.length - 1]; amm2.value = 0
      rotateComponent(amm2.id)

      // Branch 3: R3=2
      addComponent('resistor', 540, 400)
      const r3 = components[components.length - 1]; r3.value = 2
      addComponent('ammeter', 420, 400)
      const amm3 = components[components.length - 1]; amm3.value = 0
      rotateComponent(amm3.id)

      // Voltmeter across all branches
      addComponent('voltmeter', 700, 300)
      const v1 = components[components.length - 1]; v1.value = 0

      // Bat+ → Amm0 → junction (top)
      addWire(bat.id, 0, amm0.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:380,y:300}])
      // Amm0 → junction splits to 3 branches
      addWire(amm0.id, 1, amm1.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:420,y:200}])
      addWire(amm1.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:460,y:200},{x:540,y:200}])
      addWire(amm0.id, 1, amm2.id, 0, WIRE_COLORS.red, [{x:420,y:300}])
      addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:540,y:300}])
      addWire(amm0.id, 1, amm3.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:420,y:400}])
      addWire(amm3.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:460,y:400},{x:540,y:400}])

      // R1, R2, R3 → merge → Bat-
      addWire(r1.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:580,y:200},{x:880,y:200},{x:880,y:422},{x:200,y:422}])
      addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:580,y:300},{x:880,y:300}])
      addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:580,y:400},{x:880,y:400}])

      // Voltmeter across branches
      addWire(v1.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:700,y:270},{x:540,y:300}])
      addWire(v1.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:700,y:330},{x:580,y:300}])
    }

    // Voltage Divider: Battery → R1 → R2 → return, V across R2
    // Shows Vout = Vin * R2/(R1+R2)
    if (name === 'vdivider') {
      addComponent('battery', 200, 400)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id)

      addComponent('ammeter', 420, 300)
      const amm = components[components.length - 1]; amm.value = 0
      rotateComponent(amm.id)

      addComponent('resistor', 560, 300)
      const r1 = components[components.length - 1]; r1.value = 8

      addComponent('resistor', 720, 300)
      const r2 = components[components.length - 1]; r2.value = 4

      addComponent('voltmeter', 560, 180)
      const v1 = components[components.length - 1]; v1.value = 0
      addComponent('voltmeter', 720, 180)
      const v2 = components[components.length - 1]; v2.value = 0

      // Bat+ → Amm → R1 → R2 → Bat-
      addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:420,y:300}])
      addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:560,y:300}])
      addWire(r1.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:600,y:300},{x:720,y:300}])
      addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:760,y:300},{x:760,y:422},{x:200,y:422}])

      // V1 across R1
      addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:560,y:180},{x:560,y:270}])
      addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:600,y:180},{x:600,y:270}])
      // V2 across R2
      addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:720,y:180},{x:720,y:270}])
      addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:760,y:180},{x:760,y:270}])
    }

    // Current Divider: Battery → R1 in series, then R2||R3 parallel
    // Shows I_R2 = I_total * R3/(R2+R3)
    if (name === 'cdivider') {
      addComponent('battery', 200, 400)
      const bat = components[components.length - 1]; bat.value = 12
      rotateComponent(bat.id)

      // Main ammeter
      addComponent('ammeter', 380, 300)
      const amm0 = components[components.length - 1]; amm0.value = 0
      rotateComponent(amm0.id)

      // R1 in series
      addComponent('resistor', 520, 300)
      const r1 = components[components.length - 1]; r1.value = 2

      // Branch 1: Amm2 → R2
      addComponent('ammeter', 660, 220)
      const amm2 = components[components.length - 1]; amm2.value = 0
      rotateComponent(amm2.id)
      addComponent('resistor', 800, 220)
      const r2 = components[components.length - 1]; r2.value = 6

      // Branch 2: Amm3 → R3
      addComponent('ammeter', 660, 380)
      const amm3 = components[components.length - 1]; amm3.value = 0
      rotateComponent(amm3.id)
      addComponent('resistor', 800, 380)
      const r3 = components[components.length - 1]; r3.value = 3

      // Voltmeter across parallel section
      addComponent('voltmeter', 900, 300)
      const v1 = components[components.length - 1]; v1.value = 0

      // Bat+ → Amm0 → R1 → junction (splits up and down)
      addWire(bat.id, 0, amm0.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:380,y:300}])
      addWire(amm0.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:520,y:300}])
      // R1 → Amm2 (top branch)
      addWire(r1.id, 1, amm2.id, 0, WIRE_COLORS.red, [{x:560,y:300},{x:560,y:220},{x:660,y:220}])
      // R1 → Amm3 (bottom branch)
      addWire(r1.id, 1, amm3.id, 0, WIRE_COLORS.red, [{x:560,y:300},{x:560,y:380},{x:660,y:380}])
      // Amm2 → R2
      addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:700,y:220},{x:800,y:220}])
      // Amm3 → R3
      addWire(amm3.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:700,y:380},{x:800,y:380}])
      // R2 → merge → Bat-
      addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:840,y:220},{x:960,y:220},{x:960,y:422},{x:200,y:422}])
      // R3 → merge
      addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:840,y:380},{x:960,y:380}])

      // Voltmeter across parallel section (across R2)
      addWire(v1.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:900,y:270},{x:800,y:220}])
      addWire(v1.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:900,y:330},{x:840,y:220}])
    }

    // Battery Series: Two batteries + to - , total V = V1+V2
    if (name === 'bseries') {
      // Battery 1: 6V (rotated: +top, -bottom)
      addComponent('battery', 200, 400)
      const bat1 = components[components.length - 1]; bat1.value = 6
      rotateComponent(bat1.id)

      // Battery 2: 9V (rotated: +top, -bottom)
      addComponent('battery', 400, 400)
      const bat2 = components[components.length - 1]; bat2.value = 9
      rotateComponent(bat2.id)

      // Ammeter (horizontal, not rotated: L=left, R=right)
      addComponent('ammeter', 560, 400)
      const amm = components[components.length - 1]; amm.value = 0

      // Load resistor (horizontal)
      addComponent('resistor', 720, 400)
      const r1 = components[components.length - 1]; r1.value = 5

      // Voltmeter across both batteries
      addComponent('voltmeter', 300, 200)
      const v1 = components[components.length - 1]; v1.value = 0

      // Voltmeter across load
      addComponent('voltmeter', 720, 200)
      const v2 = components[components.length - 1]; v2.value = 0

      // Bat1+ → Bat2- — series: + of bat1 to - of bat2
      addWire(bat1.id, 0, bat2.id, 1, WIRE_COLORS.red)
      // Bat2+ → Amm L
      addWire(bat2.id, 0, amm.id, 0, WIRE_COLORS.red)
      // Amm R → R1 L
      addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red)
      // R1 R → Bat1-
      addWire(r1.id, 1, bat1.id, 1, WIRE_COLORS.black)

      // V1 across both batteries: + terminal is Bat2+, - terminal is Bat1-
      addWire(v1.id, 0, bat2.id, 0, WIRE_COLORS.blue)
      addWire(v1.id, 1, bat1.id, 1, WIRE_COLORS.blue)

      // V2 across R1
      addWire(v2.id, 0, r1.id, 0, WIRE_COLORS.blue)
      addWire(v2.id, 1, r1.id, 1, WIRE_COLORS.blue)
    }

    // Battery Parallel: Two batteries same voltage in parallel
    if (name === 'bparallel') {
      // Battery 1: 12V (rotated: +top, -bottom)
      addComponent('battery', 200, 400)
      const bat1 = components[components.length - 1]; bat1.value = 12
      rotateComponent(bat1.id)

      // Battery 2: 12V (rotated: +top, -bottom)
      addComponent('battery', 400, 400)
      const bat2 = components[components.length - 1]; bat2.value = 12
      rotateComponent(bat2.id)

      // Ammeter (horizontal: L=left, R=right)
      addComponent('ammeter', 560, 400)
      const amm = components[components.length - 1]; amm.value = 0

      // Load resistor (horizontal)
      addComponent('resistor', 720, 400)
      const r1 = components[components.length - 1]; r1.value = 4

      // Voltmeter
      addComponent('voltmeter', 720, 200)
      const v1 = components[components.length - 1]; v1.value = 0

      // Bat1+ → Bat2+ — parallel + (both positive terminals connected)
      addWire(bat1.id, 0, bat2.id, 0, WIRE_COLORS.red)
      // Bat2+ → Amm L
      addWire(bat2.id, 0, amm.id, 0, WIRE_COLORS.red)
      // Amm R → R1 L
      addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red)
      // R1 R → Bat1- and Bat2- — parallel -
      addWire(r1.id, 1, bat1.id, 1, WIRE_COLORS.black)
      addWire(bat1.id, 1, bat2.id, 1, WIRE_COLORS.black)

      // Voltmeter across R1
      addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue)
      addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue)
    }

    selectedComponentId.value = null
    selectedWireId.value = null
  }

  function run() {
    running.value = true
    solve()
  }

  function stop() {
    running.value = false
    for (const comp of components) {
      comp.voltage = 0
      comp.current = 0
    }
  }

  function solve() {
    // Iterative solve for relay/breaker state changes
    let maxIter = 5
    let changed = true
    while (changed && maxIter > 0) {
      const result = solveCircuit(components, wires)
      solveResult.value = result
      // Update component values
      for (const comp of components) {
        comp.voltage = result.componentVoltages.get(comp.id) ?? 0
        comp.current = result.componentCurrents.get(comp.id) ?? 0
      }
      changed = updateRelayStates(components)
      maxIter--
    }
    // Final solve with updated states
    const finalResult = solveCircuit(components, wires)
    solveResult.value = finalResult
    faults.value = finalResult.faults
    for (const comp of components) {
      comp.voltage = finalResult.componentVoltages.get(comp.id) ?? 0
      comp.current = finalResult.componentCurrents.get(comp.id) ?? 0
    }
    if (!finalResult.converged) {
      error.value = 'لم يتقارب الحل — تحقق من الدائرة'
    } else {
      error.value = ''
    }
  }

  const totalPower = computed(() => {
    let p = 0
    for (const comp of components) {
      if (comp.type === 'resistor' || comp.type === 'lamp') {
        p += Math.abs(comp.voltage * comp.current)
      }
    }
    return p
  })

  const totalCurrent = computed(() => {
    for (const comp of components) {
      if (comp.type === 'battery') return Math.abs(comp.current)
    }
    return 0
  })

  const totalVoltage = computed(() => {
    for (const comp of components) {
      if (comp.type === 'battery') return comp.value
    }
    return 0
  })

  return {
    components,
    wires,
    running,
    selectedComponentId,
    selectedWireId,
    selectedWireColor,
    solveResult,
    error,
    addComponent,
    moveComponent,
    rotateComponent,
    setComponentScale,
    removeComponent,
    insertAmmeterIntoWire,
    updateComponentValue,
    toggleSwitch,
    setMultimeterMode,
    resetBreaker,
    resetFuse,
    addWire,
    addWireFromJunction,
    removeWire,
    updateWireColor,
    updateWireThickness,
    moveWirePoint,
    rerouteAllWires,
    rerouteWiresForComponent,
    clearAll,
    saveCircuit,
    loadCircuit,
    getSavedCircuits,
    deleteCircuit,
    loadExperiment,
    run,
    stop,
    solve,
    faults,
    selectedWireThickness,
    totalPower,
    totalCurrent,
    totalVoltage,
  }
}
