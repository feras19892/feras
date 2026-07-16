<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useWorkshop } from '../shared/useWorkshop'
import { useWorkshopCanvas } from '../shared/useWorkshopCanvas'
import { componentDefs, getComponentsByCategory } from '../shared/componentDefs'
import { getSpec } from '../shared/componentSpecs'
import { WIRE_COLOR_NAMES } from '../shared/types'
import type { WorkshopComponent, WorkshopWire } from '../shared/types'

const workshop = useWorkshop()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)

let isPanning = false
let isDraggingComp = false
let isDraggingWire = false
let isDraggingWirePoint = false
let draggingWireId = 0
let draggingPointIndex = 0
let isDraggingWireSegment = false
let dragSegWireId = 0
let dragSegIndex = 0
let dragSegLastWX = 0
let dragSegLastWY = 0
let lastMouseX = 0
let lastMouseY = 0
let dragOffsetX = 0
let dragOffsetY = 0
let wireStart: { comp: WorkshopComponent; termIndex: number } | null = null
let junctionStart: { wireId: number; pointIndex: number; worldX: number; worldY: number } | null = null
let tempWireEnd = { x: 0, y: 0 }

const showValueEditor = ref(false)
const editingComp = ref<WorkshopComponent | null>(null)
const editValue = ref(0)
const editRotation = ref(0)

const showWireEditor = ref(false)
const editingWire = ref<WorkshopWire | null>(null)
const editWireColor = ref('')
const editWireThickness = ref(3)

const showExperiments = ref(false)
const currentExperiment = ref<'ohm' | 'series' | 'parallel' | 'mixed' | 'kvl' | 'kcl' | 'vdivider' | 'cdivider' | 'bseries' | 'bparallel' | null>(null)
const showCalcExplanation = ref(false)
const calcExplanationHtml = ref('')
const canvasSnapshot = ref('')
const showSaveDialog = ref(false)
const showLoadDialog = ref(false)
const circuitName = ref('')
const savedCircuits = ref<string[]>([])
const runStartTime = ref(0)
const elapsedSeconds = ref(0)
const canvasFullscreen = ref(false)

const dcComponents = getComponentsByCategory('dc')

const canvasProps = {
  get components() { return workshop.components },
  get wires() { return workshop.wires },
  get running() { return workshop.running.value },
  get selectedWireColor() { return workshop.selectedWireColor.value },
}

const { worldToScreen, screenToWorld, hitTestComponent, hitTestTerminal, hitTestWire, hitTestWireJunction, hitTestWireSegment, draw } = useWorkshopCanvas(
  zoom, panX, panY, canvasProps,
)

function resizeCanvas() {
  const c = canvasRef.value; if (!c) return
  const parent = c.parentElement; if (!parent) return
  c.width = parent.clientWidth
  c.height = parent.clientHeight
  redraw()
}

function redraw() {
  if (!canvasRef.value) return
  const tempW = wireStart || junctionStart ? { fromX: 0, fromY: 0, toX: tempWireEnd.x, toY: tempWireEnd.y } : null
  if (wireStart && canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      const comp = wireStart.comp
      const term = comp.terminals[wireStart.termIndex]
      const s = comp.scale ?? 1
      const r = comp.rotation * Math.PI / 180
      const cos = Math.cos(r), sin = Math.sin(r)
      const dx = term.dx * s
      const dy = term.dy * s
      const wx = comp.x + dx * cos - dy * sin
      const wy = comp.y + dx * sin + dy * cos
      const [sfx, sfy] = [wx * zoom.value + panX.value, wy * zoom.value + panY.value]
      if (tempW) { tempW.fromX = sfx; tempW.fromY = sfy }
    }
  } else if (junctionStart && canvasRef.value) {
    if (tempW) {
      tempW.fromX = junctionStart.worldX * zoom.value + panX.value
      tempW.fromY = junctionStart.worldY * zoom.value + panY.value
    }
  }
  draw(canvasRef.value, workshop.selectedComponentId.value, workshop.selectedWireId.value, tempW)

  // Highlight wire when ammeter is hovering over it (drag-to-cut feedback)
  if (hoverWireId !== null && canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      const wire = workshop.wires.find(w => w.id === hoverWireId)
      if (wire) {
        const fromComp = workshop.components.find(c => c.id === wire.fromCompId)
        const toComp = workshop.components.find(c => c.id === wire.toCompId)
        if (fromComp && toComp) {
          const fromTerm = fromComp.terminals[wire.fromTerminalIndex]
          const toTerm = toComp.terminals[wire.toTerminalIndex]
          if (fromTerm && toTerm) {
            const s = fromComp.scale ?? 1
            const r1 = fromComp.rotation * Math.PI / 180
            const r2 = toComp.rotation * Math.PI / 180
            const fwx = fromComp.x + fromTerm.dx * s * Math.cos(r1) - fromTerm.dy * s * Math.sin(r1)
            const fwy = fromComp.y + fromTerm.dx * s * Math.sin(r1) + fromTerm.dy * s * Math.cos(r1)
            const twx = toComp.x + toTerm.dx * s * Math.cos(r2) - toTerm.dy * s * Math.sin(r2)
            const twy = toComp.y + toTerm.dx * s * Math.sin(r2) + toTerm.dy * s * Math.cos(r2)
            ctx.strokeStyle = 'rgba(34,197,94,0.6)'
            ctx.lineWidth = 6 * zoom.value
            ctx.lineCap = 'round'
            ctx.beginPath()
            const [sfx, sfy] = worldToScreen(fwx, fwy)
            ctx.moveTo(sfx, sfy)
            for (const p of wire.points) {
              const [px, py] = worldToScreen(p.x, p.y)
              ctx.lineTo(px, py)
            }
            const [stx, sty] = worldToScreen(twx, twy)
            ctx.lineTo(stx, sty)
            ctx.stroke()
          }
        }
      }
    }
  }
}

function getMousePos(e: MouseEvent): [number, number] {
  const c = canvasRef.value; if (!c) return [0, 0]
  const rect = c.getBoundingClientRect()
  return [e.clientX - rect.left, e.clientY - rect.top]
}

// Track drag state for ammeter-on-wire detection
let draggedCompType: string | null = null
let _dragStartX = 0
let _dragStartY = 0
let hoverWireId: number | null = null

function onMouseDown(e: MouseEvent) {
  const [sx, sy] = getMousePos(e)

  // Check wire point drag first (if a wire is selected, allow dragging its points)
  if (workshop.selectedWireId.value !== null) {
    const jHit = hitTestWireJunction(sx, sy)
    if (jHit && jHit.wire.id === workshop.selectedWireId.value) {
      isDraggingWirePoint = true
      draggingWireId = jHit.wire.id
      draggingPointIndex = jHit.pointIndex
      return
    }
  }

  // Check terminal hit first (for wire drawing)
  const termHit = hitTestTerminal(sx, sy)
  if (termHit) {
    isDraggingWire = true
    wireStart = termHit
    junctionStart = null
    tempWireEnd = { x: sx, y: sy }
    return
  }

  // Check wire junction hit (for branching from a wire corner)
  const jHit = hitTestWireJunction(sx, sy)
  if (jHit) {
    isDraggingWire = true
    junctionStart = { wireId: jHit.wire.id, pointIndex: jHit.pointIndex, worldX: jHit.worldX, worldY: jHit.worldY }
    wireStart = null
    tempWireEnd = { x: sx, y: sy }
    return
  }

  // Check component hit
  const compHit = hitTestComponent(sx, sy)
  if (compHit) {
    isDraggingComp = true
    draggedCompType = compHit.type
    _dragStartX = sx
    _dragStartY = sy
    workshop.selectedComponentId.value = compHit.id
    workshop.selectedWireId.value = null
    const [wx, wy] = screenToWorld(sx, sy)
    dragOffsetX = compHit.x - wx
    dragOffsetY = compHit.y - wy
  } else {
    // Check wire hit
    const wireHit = hitTestWire(sx, sy)
    if (wireHit) {
      const wasSelected = workshop.selectedWireId.value === wireHit.id
      workshop.selectedWireId.value = wireHit.id
      workshop.selectedComponentId.value = null
      // Only start segment drag if wire was already selected (second click on same wire)
      if (wasSelected) {
        const segHit = hitTestWireSegment(sx, sy)
        if (segHit && segHit.wire.id === wireHit.id && wireHit.points.length > 0) {
          isDraggingWireSegment = true
          dragSegWireId = wireHit.id
          dragSegIndex = segHit.segIndex
          const [wx, wy] = screenToWorld(sx, sy)
          dragSegLastWX = wx
          dragSegLastWY = wy
        }
      }
    } else {
      isPanning = true
      workshop.selectedComponentId.value = null
      workshop.selectedWireId.value = null
    }
  }
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  redraw()
}

function onMouseMove(e: MouseEvent) {
  const [sx, sy] = getMousePos(e)

  if (isDraggingWire && wireStart) {
    tempWireEnd = { x: sx, y: sy }
    redraw()
    return
  }

  if (isDraggingWirePoint) {
    const [wx, wy] = screenToWorld(sx, sy)
    workshop.moveWirePoint(draggingWireId, draggingPointIndex, wx, wy)
    if (workshop.running.value) workshop.solve()
    redraw()
    return
  }

  if (isDraggingWireSegment) {
    const [wx, wy] = screenToWorld(sx, sy)
    const dx = wx - dragSegLastWX
    const dy = wy - dragSegLastWY
    // Move the two points that form this segment
    // segIndex 0 = between terminal-from and points[0]
    // segIndex i (1..n-1) = between points[i-1] and points[i]
    // segIndex n = between points[n-1] and terminal-to
    const wire = workshop.wires.find(w => w.id === dragSegWireId)
    if (wire) {
      if (dragSegIndex === 0) {
        // Move points[0] only (segment from terminal to points[0])
        if (wire.points.length > 0) {
          workshop.moveWirePoint(dragSegWireId, 0, wire.points[0].x + dx, wire.points[0].y + dy)
        }
      } else if (dragSegIndex === wire.points.length) {
        // Move last point (segment from points[n-1] to terminal)
        if (wire.points.length > 0) {
          const lastIdx = wire.points.length - 1
          workshop.moveWirePoint(dragSegWireId, lastIdx, wire.points[lastIdx].x + dx, wire.points[lastIdx].y + dy)
        }
      } else {
        // Move both points[segIndex-1] and points[segIndex]
        if (wire.points[dragSegIndex - 1]) {
          workshop.moveWirePoint(dragSegWireId, dragSegIndex - 1, wire.points[dragSegIndex - 1].x + dx, wire.points[dragSegIndex - 1].y + dy)
        }
        if (wire.points[dragSegIndex]) {
          workshop.moveWirePoint(dragSegWireId, dragSegIndex, wire.points[dragSegIndex].x + dx, wire.points[dragSegIndex].y + dy)
        }
      }
    }
    dragSegLastWX = wx
    dragSegLastWY = wy
    if (workshop.running.value) workshop.solve()
    redraw()
    return
  }

  if (isDraggingComp && workshop.selectedComponentId.value !== null) {
    const [wx, wy] = screenToWorld(sx, sy)
    workshop.moveComponent(workshop.selectedComponentId.value, wx + dragOffsetX, wy + dragOffsetY)
    workshop.rerouteWiresForComponent(workshop.selectedComponentId.value)
    if (workshop.running.value) workshop.solve()

    // If dragging an ammeter, check if hovering over a wire (for visual feedback)
    if (draggedCompType === 'ammeter') {
      const wireHit = hitTestWire(sx, sy)
      const compId = workshop.selectedComponentId.value
      hoverWireId = (wireHit && wireHit.fromCompId !== compId && wireHit.toCompId !== compId) ? wireHit.id : null
    }

    redraw()
    return
  }

  if (isPanning) {
    panX.value += e.clientX - lastMouseX
    panY.value += e.clientY - lastMouseY
  }
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  redraw()
}

function onMouseUp(e: MouseEvent) {
  const [sx, sy] = getMousePos(e)
  if (isDraggingWire && (wireStart || junctionStart)) {
    const termHit = hitTestTerminal(sx, sy)
    if (wireStart && termHit && termHit.comp.id !== wireStart.comp.id) {
      workshop.addWire(
        wireStart.comp.id, wireStart.termIndex,
        termHit.comp.id, termHit.termIndex,
        workshop.selectedWireColor.value,
      )
      if (workshop.running.value) workshop.solve()
    } else if (junctionStart && termHit) {
      workshop.addWireFromJunction(
        junctionStart.wireId, junctionStart.pointIndex,
        termHit.comp.id, termHit.termIndex,
        workshop.selectedWireColor.value,
      )
      if (workshop.running.value) workshop.solve()
    }
    wireStart = null
    junctionStart = null
    isDraggingWire = false
  }
  isPanning = false
  isDraggingComp = false
  isDraggingWirePoint = false
  isDraggingWireSegment = false

  // Check if an ammeter was dragged onto a wire
  if (draggedCompType === 'ammeter' && workshop.selectedComponentId.value !== null) {
    const comp = workshop.components.find(c => c.id === workshop.selectedComponentId.value)
    if (comp && comp.type === 'ammeter') {
      // Use the ammeter's center position to test against wires (not mouse position)
      const [csx, csy] = worldToScreen(comp.x, comp.y)
      const wireHit = hitTestWire(csx, csy)
      if (wireHit && wireHit.fromCompId !== comp.id && wireHit.toCompId !== comp.id) {
        workshop.insertAmmeterIntoWire(wireHit.id, comp.id)
        if (workshop.running.value) workshop.solve()
      }
    }
  }

  draggedCompType = null
  hoverWireId = null
  redraw()
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const [sx, sy] = getMousePos(e)

  // If a component is selected, zoom that component individually
  if (workshop.selectedComponentId.value !== null) {
    const comp = workshop.components.find(c => c.id === workshop.selectedComponentId.value)
    if (comp) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = (comp.scale ?? 1) * delta
      workshop.setComponentScale(comp.id, newScale)
      workshop.rerouteAllWires()
      if (workshop.running.value) workshop.solve()
      redraw()
      return
    }
  }

  // Otherwise, zoom the whole canvas
  const [wxBefore, wyBefore] = screenToWorld(sx, sy)
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.3, Math.min(3, zoom.value * delta))
  const [wxAfter, wyAfter] = screenToWorld(sx, sy)
  panX.value += (wxAfter - wxBefore) * zoom.value
  panY.value += (wyAfter - wyBefore) * zoom.value
  redraw()
}

function onDblClick(e: MouseEvent) {
  const [sx, sy] = getMousePos(e)
  // Check wire first - open wire editor inline
  const wireHit = hitTestWire(sx, sy)
  if (wireHit) {
    workshop.selectedWireId.value = wireHit.id
    workshop.selectedComponentId.value = null
    editingWire.value = wireHit
    editWireColor.value = wireHit.color
    editWireThickness.value = wireHit.thickness
    showWireEditor.value = true
    return
  }
  // Then component - only special actions on dbl click
  const hit = hitTestComponent(sx, sy)
  if (hit) {
    if (hit.type === 'switch') {
      workshop.toggleSwitch(hit.id)
      if (workshop.running.value) workshop.solve()
    } else if (hit.type === 'multimeter') {
      const modes = ['voltage', 'current', 'resistance'] as const
      const cur = hit.multimeterMode || 'voltage'
      const idx = modes.indexOf(cur)
      const next = modes[(idx + 1) % modes.length]
      workshop.setMultimeterMode(hit.id, next)
    } else if (hit.type === 'breaker' && hit.breakerTripped) {
      workshop.resetBreaker(hit.id)
      if (workshop.running.value) workshop.solve()
    } else if (hit.type === 'fuse' && hit.fuseBlown) {
      workshop.resetFuse(hit.id)
      if (workshop.running.value) workshop.solve()
    }
    redraw()
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (workshop.selectedComponentId.value !== null) {
      workshop.removeComponent(workshop.selectedComponentId.value)
      if (workshop.running.value) workshop.solve()
    } else if (workshop.selectedWireId.value !== null) {
      workshop.removeWire(workshop.selectedWireId.value)
      if (workshop.running.value) workshop.solve()
    }
    redraw()
  } else if (e.key === 'r' || e.key === 'R') {
    if (workshop.selectedComponentId.value !== null) {
      workshop.rotateComponent(workshop.selectedComponentId.value)
      redraw()
    }
  }
}

function onAddComponent(type: string) {
  const c = canvasRef.value; if (!c) return
  const x = c.width / 2 - panX.value
  const y = c.height / 2 - panY.value
  workshop.addComponent(type as any, x / zoom.value, y / zoom.value)
  redraw()
}

function loadExp(name: 'ohm' | 'series' | 'parallel' | 'mixed' | 'kvl' | 'kcl' | 'vdivider' | 'cdivider' | 'bseries' | 'bparallel') {
  currentExperiment.value = name
  showExperiments.value = false
  try {
    workshop.loadExperiment(name)
  } catch (e) {
    console.error('loadExperiment error:', e)
  }
  if (workshop.running.value) workshop.solve()
  redraw()
}

function explainCalcs() {
  if (!currentExperiment.value) return
  if (workshop.running.value) workshop.solve()
  redraw()
  if (canvasRef.value) {
    canvasSnapshot.value = canvasRef.value.toDataURL('image/png')
  }
  const exp = currentExperiment.value
  const V = workshop.totalVoltage.value
  const I = workshop.totalCurrent.value
  const P = workshop.totalPower.value
  const comps = workshop.components
  const resistors = comps.filter(c => c.type === 'resistor')
  const batteries = comps.filter(c => c.type === 'battery')
  const ammeters = comps.filter(c => c.type === 'ammeter')
  const voltmeters = comps.filter(c => c.type === 'voltmeter')
  const batV = batteries[0]?.value ?? 0

  let html = ''

  if (exp === 'ohm') {
    const R = resistors[0]?.value ?? 0
    const Icalc = V / R
    const Vr = Icalc * R
    const Pcalc = Vr * Icalc
    html = `
      <h3>📐 شرح حسابات قانون أوم</h3>
      <div class="ce-section">
        <h4>1) المعطيات</h4>
        <ul>
          <li>جهد البطارية: V = ${V} V</li>
          <li>المقاومة: R₁ = ${R} Ω</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) حساب التيار الكلي (قانون أوم)</h4>
        <div class="ce-formula">I = V / R</div>
        <div class="ce-calc">I = ${V} / ${R} = ${Icalc.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>3) حساب الجهد عبر المقاومة</h4>
        <div class="ce-formula">V<sub>R1</sub> = I × R₁</div>
        <div class="ce-calc">V<sub>R1</sub> = ${Icalc.toFixed(4)} × ${R} = ${Vr.toFixed(4)} V</div>
        <div class="ce-note">✅ الجهد عبر المقاومة يساوي جهد البطارية (توصيل واحد)</div>
      </div>
      <div class="ce-section">
        <h4>4) حساب القدرة المستهلكة</h4>
        <div class="ce-formula">P = V × I = I² × R</div>
        <div class="ce-calc">P = ${Vr.toFixed(4)} × ${Icalc.toFixed(4)} = ${Pcalc.toFixed(4)} W</div>
        <div class="ce-calc">P = ${Icalc.toFixed(4)}² × ${R} = ${Pcalc.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>5) قراءات الأجهزة</h4>
        <ul>
          <li>📋 الأميتر يقرأ: ${Icalc.toFixed(4)} A</li>
          <li>📋 الفولتميتر يقرأ: ${Vr.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>التيار الكلي: I = ${Icalc.toFixed(4)} A</li>
          <li>الجهد عبر R₁: V = ${Vr.toFixed(4)} V</li>
          <li>القدرة: P = ${Pcalc.toFixed(4)} W</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'series') {
    const R1 = resistors[0]?.value ?? 0
    const R2 = resistors[1]?.value ?? 0
    const Rtotal = R1 + R2
    const Icalc = V / Rtotal
    const V1 = Icalc * R1
    const V2 = Icalc * R2
    const P1 = V1 * Icalc
    const P2 = V2 * Icalc
    const Ptotal = P1 + P2
    html = `
      <h3>📐 شرح حسابات توصيل المقاومات على التوالي</h3>
      <div class="ce-section">
        <h4>1) المعطيات</h4>
        <ul>
          <li>جهد البطارية: V = ${V} V</li>
          <li>المقاومة الأولى: R₁ = ${R1} Ω</li>
          <li>المقاومة الثانية: R₂ = ${R2} Ω</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) حساب المقاومة المكافئة</h4>
        <div class="ce-formula">R<sub>eq</sub> = R₁ + R₂</div>
        <div class="ce-calc">R<sub>eq</sub> = ${R1} + ${R2} = ${Rtotal} Ω</div>
        <div class="ce-note">📌 في التوالي: المقاومات تُجمع مباشرة</div>
      </div>
      <div class="ce-section">
        <h4>3) حساب التيار الكلي</h4>
        <div class="ce-formula">I = V / R<sub>eq</sub></div>
        <div class="ce-calc">I = ${V} / ${Rtotal} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-note">📌 في التوالي: التيار واحد في جميع المقاومات</div>
      </div>
      <div class="ce-section">
        <h4>4) حساب الجهد عبر كل مقاومة</h4>
        <div class="ce-formula">V<sub>n</sub> = I × R<sub>n</sub></div>
        <div class="ce-calc">V<sub>R1</sub> = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V<sub>R2</sub> = ${Icalc.toFixed(4)} × ${R2} = ${V2.toFixed(4)} V</div>
        <div class="ce-note">✅ التحقق: V<sub>R1</sub> + V<sub>R2</sub> = ${(V1+V2).toFixed(4)} V = ${V} V</div>
      </div>
      <div class="ce-section">
        <h4>5) حساب القدرة لكل مقاومة</h4>
        <div class="ce-formula">P<sub>n</sub> = V<sub>n</sub> × I = I² × R<sub>n</sub></div>
        <div class="ce-calc">P<sub>R1</sub> = ${V1.toFixed(4)} × ${Icalc.toFixed(4)} = ${P1.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R2</sub> = ${V2.toFixed(4)} × ${Icalc.toFixed(4)} = ${P2.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>total</sub> = ${P1.toFixed(4)} + ${P2.toFixed(4)} = ${Ptotal.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>6) قراءات الأجهزة</h4>
        <ul>
          <li>📋 الأميتر الأول: ${Icalc.toFixed(4)} A</li>
          <li>📋 الأميتر الثاني: ${Icalc.toFixed(4)} A (نفس التيار)</li>
          <li>📋 الفولتميتر الأول (عبر R₁): ${V1.toFixed(4)} V</li>
          <li>📋 الفولتميتر الثاني (عبر R₂): ${V2.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>المقاومة المكافئة: R<sub>eq</sub> = ${Rtotal} Ω</li>
          <li>التيار الكلي: I = ${Icalc.toFixed(4)} A</li>
          <li>الجهد عبر R₁: ${V1.toFixed(4)} V</li>
          <li>الجهد عبر R₂: ${V2.toFixed(4)} V</li>
          <li>القدرة الكلية: P = ${Ptotal.toFixed(4)} W</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'parallel') {
    const R1 = resistors[0]?.value ?? 0
    const R2 = resistors[1]?.value ?? 0
    const Vr = V
    const I1 = Vr / R1
    const I2 = Vr / R2
    const Itotal = I1 + I2
    const Req = (R1 * R2) / (R1 + R2)
    const P1 = Vr * I1
    const P2 = Vr * I2
    const Ptotal = P1 + P2
    html = `
      <h3>📐 شرح حسابات توصيل المقاومات على التفرع (التوازي)</h3>
      <div class="ce-section">
        <h4>1) المعطيات</h4>
        <ul>
          <li>جهد البطارية: V = ${V} V</li>
          <li>المقاومة الأولى: R₁ = ${R1} Ω</li>
          <li>المقاومة الثانية: R₂ = ${R2} Ω</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) حساب الجهد عبر كل مقاومة</h4>
        <div class="ce-note">📌 في التوازي: الجهد واحد عبر جميع الفروع = جهد البطارية</div>
        <div class="ce-calc">V<sub>R1</sub> = V<sub>R2</sub> = V = ${Vr} V</div>
      </div>
      <div class="ce-section">
        <h4>3) حساب التيار في كل فرع</h4>
        <div class="ce-formula">I<sub>n</sub> = V / R<sub>n</sub></div>
        <div class="ce-calc">I<sub>1</sub> = ${Vr} / ${R1} = ${I1.toFixed(4)} A</div>
        <div class="ce-calc">I<sub>2</sub> = ${Vr} / ${R2} = ${I2.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>4) حساب التيار الكلي</h4>
        <div class="ce-formula">I<sub>total</sub> = I₁ + I₂</div>
        <div class="ce-calc">I<sub>total</sub> = ${I1.toFixed(4)} + ${I2.toFixed(4)} = ${Itotal.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>5) حساب المقاومة المكافئة</h4>
        <div class="ce-formula">1/R<sub>eq</sub> = 1/R₁ + 1/R₂ &nbsp; ⇒ &nbsp; R<sub>eq</sub> = (R₁ × R₂) / (R₁ + R₂)</div>
        <div class="ce-calc">R<sub>eq</sub> = (${R1} × ${R2}) / (${R1} + ${R2}) = ${Req.toFixed(4)} Ω</div>
        <div class="ce-note">✅ التحقق: I<sub>total</sub> = V / R<sub>eq</sub> = ${Vr} / ${Req.toFixed(4)} = ${(Vr/Req).toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>6) حساب القدرة</h4>
        <div class="ce-formula">P<sub>n</sub> = V × I<sub>n</sub> = V² / R<sub>n</sub></div>
        <div class="ce-calc">P<sub>1</sub> = ${Vr}² / ${R1} = ${P1.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>2</sub> = ${Vr}² / ${R2} = ${P2.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>total</sub> = ${P1.toFixed(4)} + ${P2.toFixed(4)} = ${Ptotal.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>7) قراءات الأجهزة</h4>
        <ul>
          <li>📋 الأميتر الرئيسي: ${Itotal.toFixed(4)} A</li>
          <li>📋 الأميتر الفرع الأول (R₁): ${I1.toFixed(4)} A</li>
          <li>📋 الأميتر الفرع الثاني (R₂): ${I2.toFixed(4)} A</li>
          <li>📋 الفولتميتر: ${Vr.toFixed(4)} V (نفس الجهد لكل فرع)</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>المقاومة المكافئة: R<sub>eq</sub> = ${Req.toFixed(4)} Ω</li>
          <li>التيار الكلي: I = ${Itotal.toFixed(4)} A</li>
          <li>تيار R₁: ${I1.toFixed(4)} A | تيار R₂: ${I2.toFixed(4)} A</li>
          <li>الجهد: ${Vr} V (مشترك)</li>
          <li>القدرة الكلية: P = ${Ptotal.toFixed(4)} W</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'mixed') {
    const R1 = resistors[0]?.value ?? 0
    const R2 = resistors[1]?.value ?? 0
    const R3 = resistors[2]?.value ?? 0
    const R4 = resistors[3]?.value ?? 0
    const Rparallel = (R3 * R4) / (R3 + R4)
    const Rseries = R1 + R2
    const Rtotal = Rseries + Rparallel
    const Icalc = V / Rtotal
    const V1 = Icalc * R1
    const V2 = Icalc * R2
    const Vparallel = Icalc * Rparallel
    const I3 = Vparallel / R3
    const I4 = Vparallel / R4
    const P1 = V1 * Icalc
    const P2 = V2 * Icalc
    const P3 = Vparallel * I3
    const P4 = Vparallel * I4
    const Ptotal = P1 + P2 + P3 + P4
    html = `
      <h3>📐 شرح حسابات التوصيل المختلط (توالي + توازي)</h3>
      <div class="ce-section">
        <h4>1) المعطيات</h4>
        <ul>
          <li>جهد البطارية: V = ${V} V</li>
          <li>R₁ = ${R1} Ω (توالي)</li>
          <li>R₂ = ${R2} Ω (توالي)</li>
          <li>R₃ = ${R3} Ω (توازي)</li>
          <li>R₄ = ${R4} Ω (توازي)</li>
        </ul>
        <div class="ce-note">📌 الترتيب: R₁ و R₂ على التوالي، ثم R₃ و R₄ على التوازي</div>
      </div>
      <div class="ce-section">
        <h4>2) حساب المقاومة المكافئة للفرعين على التوازي (R₃ و R₄)</h4>
        <div class="ce-formula">R<sub>p</sub> = (R₃ × R₄) / (R₃ + R₄)</div>
        <div class="ce-calc">R<sub>p</sub> = (${R3} × ${R4}) / (${R3} + ${R4}) = ${Rparallel.toFixed(4)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>3) حساب المقاومة المكافئة الكلية</h4>
        <div class="ce-formula">R<sub>total</sub> = R₁ + R₂ + R<sub>p</sub></div>
        <div class="ce-calc">R<sub>total</sub> = ${R1} + ${R2} + ${Rparallel.toFixed(4)} = ${Rtotal.toFixed(4)} Ω</div>
        <div class="ce-note">📌 R₁ و R₂ على التوالي يُجمعان مع R<sub>p</sub> (توازي)</div>
      </div>
      <div class="ce-section">
        <h4>4) حساب التيار الكلي</h4>
        <div class="ce-formula">I = V / R<sub>total</sub></div>
        <div class="ce-calc">I = ${V} / ${Rtotal.toFixed(4)} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-note">📌 هذا التيار يمر في R₁ و R₂ (لأنهما على التوالي)</div>
      </div>
      <div class="ce-section">
        <h4>5) حساب الجهد عبر R₁ و R₂</h4>
        <div class="ce-formula">V<sub>n</sub> = I × R<sub>n</sub></div>
        <div class="ce-calc">V<sub>R1</sub> = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V<sub>R2</sub> = ${Icalc.toFixed(4)} × ${R2} = ${V2.toFixed(4)} V</div>
      </div>
      <div class="ce-section">
        <h4>6) حساب الجهد عبر قسم التوازي</h4>
        <div class="ce-formula">V<sub>p</sub> = I × R<sub>p</sub></div>
        <div class="ce-calc">V<sub>p</sub> = ${Icalc.toFixed(4)} × ${Rparallel.toFixed(4)} = ${Vparallel.toFixed(4)} V</div>
        <div class="ce-note">✅ التحقق: V<sub>R1</sub> + V<sub>R2</sub> + V<sub>p</sub> = ${(V1+V2+Vparallel).toFixed(4)} V ≈ ${V} V</div>
      </div>
      <div class="ce-section">
        <h4>7) حساب التيار في كل فرع من فروع التوازي</h4>
        <div class="ce-formula">I<sub>n</sub> = V<sub>p</sub> / R<sub>n</sub></div>
        <div class="ce-calc">I<sub>3</sub> = ${Vparallel.toFixed(4)} / ${R3} = ${I3.toFixed(4)} A</div>
        <div class="ce-calc">I<sub>4</sub> = ${Vparallel.toFixed(4)} / ${R4} = ${I4.toFixed(4)} A</div>
        <div class="ce-note">✅ التحقق: I₃ + I₄ = ${(I3+I4).toFixed(4)} A ≈ ${Icalc.toFixed(4)} A (التيار الكلي)</div>
      </div>
      <div class="ce-section">
        <h4>8) حساب القدرة</h4>
        <div class="ce-formula">P<sub>n</sub> = V<sub>n</sub> × I<sub>n</sub></div>
        <div class="ce-calc">P<sub>R1</sub> = ${V1.toFixed(4)} × ${Icalc.toFixed(4)} = ${P1.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R2</sub> = ${V2.toFixed(4)} × ${Icalc.toFixed(4)} = ${P2.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R3</sub> = ${Vparallel.toFixed(4)} × ${I3.toFixed(4)} = ${P3.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R4</sub> = ${Vparallel.toFixed(4)} × ${I4.toFixed(4)} = ${P4.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>total</sub> = ${P1.toFixed(4)} + ${P2.toFixed(4)} + ${P3.toFixed(4)} + ${P4.toFixed(4)} = ${Ptotal.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>9) قراءات الأجهزة</h4>
        <ul>
          <li>📋 الأميتر الرئيسي: ${Icalc.toFixed(4)} A</li>
          <li>📋 الأميتر الثاني (بين R₁ و R₂): ${Icalc.toFixed(4)} A (نفس التيار)</li>
          <li>📋 الأميتر الفرع R₃: ${I3.toFixed(4)} A</li>
          <li>📋 الأميتر الفرع R₄: ${I4.toFixed(4)} A</li>
          <li>📋 الفولتميتر 1 (عبر R₁): ${V1.toFixed(4)} V</li>
          <li>📋 الفولتميتر 2 (عبر R₂): ${V2.toFixed(4)} V</li>
          <li>📋 الفولتميتر 3 (عبر التوازي): ${Vparallel.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>المقاومة المكافئة: R<sub>total</sub> = ${Rtotal.toFixed(4)} Ω</li>
          <li>التيار الكلي: I = ${Icalc.toFixed(4)} A</li>
          <li>الجهد عبر R₁: ${V1.toFixed(4)} V | عبر R₂: ${V2.toFixed(4)} V | عبر التوازي: ${Vparallel.toFixed(4)} V</li>
          <li>تيار R₃: ${I3.toFixed(4)} A | تيار R₄: ${I4.toFixed(4)} A</li>
          <li>القدرة الكلية: P = ${Ptotal.toFixed(4)} W</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'kvl') {
    const R1 = resistors[0]?.value ?? 0
    const R2 = resistors[1]?.value ?? 0
    const R3 = resistors[2]?.value ?? 0
    const Rtotal = R1 + R2 + R3
    const Icalc = V / Rtotal
    const V1 = Icalc * R1
    const V2 = Icalc * R2
    const V3 = Icalc * R3
    const Vsum = V1 + V2 + V3
    html = `
      <h3>⚖️ قانون كيرشوف للجهد (KVL)</h3>
      <div class="ce-section">
        <h4>📋 المعطيات</h4>
        <ul>
          <li>جهد البطارية: V = ${V} V</li>
          <li>R₁ = ${R1} Ω | R₂ = ${R2} Ω | R₃ = ${R3} Ω</li>
          <li>التوصيل: R₁ و R₂ و R₃ على التوالي</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 القانون</h4>
        <div class="ce-formula">KVL: ΣV = 0 → V_البطارية = V₁ + V₂ + V₃</div>
        <div class="ce-note">مجموع فروق الجهد في أي حلقة مغلقة = صفر</div>
      </div>
      <div class="ce-section">
        <h4>🧮 الحسابات</h4>
        <div class="ce-calc">R_total = R₁ + R₂ + R₃ = ${R1} + ${R2} + ${R3} = ${Rtotal} Ω</div>
        <div class="ce-calc">I = V / R_total = ${V} / ${Rtotal} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">V₁ = I × R₁ = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V₂ = I × R₂ = ${Icalc.toFixed(4)} × ${R2} = ${V2.toFixed(4)} V</div>
        <div class="ce-calc">V₃ = I × R₃ = ${Icalc.toFixed(4)} × ${R3} = ${V3.toFixed(4)} V</div>
        <div class="ce-calc">V₁ + V₂ + V₃ = ${V1.toFixed(4)} + ${V2.toFixed(4)} + ${V3.toFixed(4)} = ${Vsum.toFixed(4)} V</div>
        <div class="ce-note">✅ تحقق: ${Vsum.toFixed(4)} V ≈ ${V} V = جهد البطارية</div>
      </div>
      <div class="ce-section">
        <h4>📟 قراءات الأجهزة</h4>
        <ul>
          <li>الأميتر: ${I.toFixed(4)} A</li>
          <li>فولتميتر 1 (عبر R₁): ${V1.toFixed(4)} V</li>
          <li>فولتميتر 2 (عبر R₂): ${V2.toFixed(4)} V</li>
          <li>فولتميتر 3 (عبر R₃): ${V3.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>المقاومة الكلية: ${Rtotal} Ω</li>
          <li>التيار: ${Icalc.toFixed(4)} A</li>
          <li>V₁ = ${V1.toFixed(4)} V | V₂ = ${V2.toFixed(4)} V | V₃ = ${V3.toFixed(4)} V</li>
          <li>تحقق KVL: V₁+V₂+V₃ = ${Vsum.toFixed(4)} V = ${V} V ✓</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'kcl') {
    const R1 = resistors[0]?.value ?? 0
    const R2 = resistors[1]?.value ?? 0
    const R3 = resistors[2]?.value ?? 0
    const I1 = V / R1
    const I2 = V / R2
    const I3 = V / R3
    const Itotal = I1 + I2 + I3
    html = `
      <h3>⚖️ قانون كيرشوف للتيار (KCL)</h3>
      <div class="ce-section">
        <h4>📋 المعطيات</h4>
        <ul>
          <li>جهد البطارية: V = ${V} V</li>
          <li>R₁ = ${R1} Ω | R₂ = ${R2} Ω | R₃ = ${R3} Ω (على التفرع)</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 القانون</h4>
        <div class="ce-formula">KCL: ΣI = 0 → I_الداخل = I_الخارج</div>
        <div class="ce-note">مجموع التيارات الداخلة لعقدة = مجموع التيارات الخارجة منها</div>
      </div>
      <div class="ce-section">
        <h4>🧮 الحسابات</h4>
        <div class="ce-calc">I₁ = V / R₁ = ${V} / ${R1} = ${I1.toFixed(4)} A</div>
        <div class="ce-calc">I₂ = V / R₂ = ${V} / ${R2} = ${I2.toFixed(4)} A</div>
        <div class="ce-calc">I₃ = V / R₃ = ${V} / ${R3} = ${I3.toFixed(4)} A</div>
        <div class="ce-calc">I_total = I₁ + I₂ + I₃ = ${I1.toFixed(4)} + ${I2.toFixed(4)} + ${I3.toFixed(4)} = ${Itotal.toFixed(4)} A</div>
        <div class="ce-note">✅ تحقق: التيار الكلي = مجموع تيارات الفروع</div>
      </div>
      <div class="ce-section">
        <h4>📟 قراءات الأجهزة</h4>
        <ul>
          <li>الأميتر الرئيسي: ${I.toFixed(4)} A</li>
          <li>أميتر 1 (فرع R₁): ${I1.toFixed(4)} A</li>
          <li>أميتر 2 (فرع R₂): ${I2.toFixed(4)} A</li>
          <li>أميتر 3 (فرع R₃): ${I3.toFixed(4)} A</li>
          <li>الفولتميتر: ${V} V (مشترك لكل الفروع)</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>I₁ = ${I1.toFixed(4)} A | I₂ = ${I2.toFixed(4)} A | I₃ = ${I3.toFixed(4)} A</li>
          <li>التيار الكلي: ${Itotal.toFixed(4)} A</li>
          <li>تحقق KCL: I₁+I₂+I₃ = ${Itotal.toFixed(4)} A ✓</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'vdivider') {
    const R1 = resistors[0]?.value ?? 0
    const R2 = resistors[1]?.value ?? 0
    const Rtotal = R1 + R2
    const Icalc = V / Rtotal
    const V1 = Icalc * R1
    const Vout = Icalc * R2
    html = `
      <h3>📐 مقسم الجهد (Voltage Divider)</h3>
      <div class="ce-section">
        <h4>📋 المعطيات</h4>
        <ul>
          <li>جهد الدخل: V<sub>in</sub> = ${V} V</li>
          <li>R₁ = ${R1} Ω | R₂ = ${R2} Ω (على التوالي)</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 القانون</h4>
        <div class="ce-formula">V_out = V_in × R₂ / (R₁ + R₂)</div>
        <div class="ce-note">الجهد عبر R₂ يتناسب مع نسبتها من المقاومة الكلية</div>
      </div>
      <div class="ce-section">
        <h4>🧮 الحسابات</h4>
        <div class="ce-calc">R_total = R₁ + R₂ = ${R1} + ${R2} = ${Rtotal} Ω</div>
        <div class="ce-calc">I = V_in / R_total = ${V} / ${Rtotal} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">V₁ = I × R₁ = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V_out = I × R₂ = ${Icalc.toFixed(4)} × ${R2} = ${Vout.toFixed(4)} V</div>
        <div class="ce-calc">V_out = V_in × R₂/(R₁+R₂) = ${V} × ${R2}/${Rtotal} = ${Vout.toFixed(4)} V</div>
        <div class="ce-note">✅ تحقق: V₁ + V_out = ${V1.toFixed(4)} + ${Vout.toFixed(4)} = ${(V1+Vout).toFixed(4)} V = ${V} V</div>
      </div>
      <div class="ce-section">
        <h4>📟 قراءات الأجهزة</h4>
        <ul>
          <li>الأميتر: ${I.toFixed(4)} A</li>
          <li>فولتميتر 1 (عبر R₁): ${V1.toFixed(4)} V</li>
          <li>فولتميتر 2 (عبر R₂ = V_out): ${Vout.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>الجهد الناتج: V_out = ${Vout.toFixed(4)} V</li>
          <li>نسبة التقسيم: R₂/(R₁+R₂) = ${R2}/${Rtotal} = ${(R2/Rtotal*100).toFixed(1)}%</li>
          <li>التيار: ${Icalc.toFixed(4)} A</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'cdivider') {
    const R1 = resistors[0]?.value ?? 0
    const R2 = resistors[1]?.value ?? 0
    const R3 = resistors[2]?.value ?? 0
    const Rparallel = (R2 * R3) / (R2 + R3)
    const Rtotal = R1 + Rparallel
    const Itotal = V / Rtotal
    const Vparallel = Itotal * Rparallel
    const I2 = Vparallel / R2
    const I3 = Vparallel / R3
    html = `
      <h3>📐 مقسم التيار (Current Divider)</h3>
      <div class="ce-section">
        <h4>📋 المعطيات</h4>
        <ul>
          <li>جهد البطارية: V = ${V} V</li>
          <li>R₁ = ${R1} Ω (توالي) | R₂ = ${R2} Ω | R₃ = ${R3} Ω (تفرع)</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 القانون</h4>
        <div class="ce-formula">I_R₂ = I_total × R₃ / (R₂ + R₃)</div>
        <div class="ce-formula">I_R₃ = I_total × R₂ / (R₂ + R₃)</div>
        <div class="ce-note">تيار كل فرع يتناسب عكسياً مع مقاومته</div>
      </div>
      <div class="ce-section">
        <h4>🧮 الحسابات</h4>
        <div class="ce-calc">R_parallel = (R₂ × R₃)/(R₂ + R₃) = (${R2} × ${R3})/(${R2}+${R3}) = ${Rparallel.toFixed(4)} Ω</div>
        <div class="ce-calc">R_total = R₁ + R_parallel = ${R1} + ${Rparallel.toFixed(4)} = ${Rtotal.toFixed(4)} Ω</div>
        <div class="ce-calc">I_total = V / R_total = ${V} / ${Rtotal.toFixed(4)} = ${Itotal.toFixed(4)} A</div>
        <div class="ce-calc">V_parallel = I_total × R_parallel = ${Itotal.toFixed(4)} × ${Rparallel.toFixed(4)} = ${Vparallel.toFixed(4)} V</div>
        <div class="ce-calc">I_R₂ = V_parallel / R₂ = ${Vparallel.toFixed(4)} / ${R2} = ${I2.toFixed(4)} A</div>
        <div class="ce-calc">I_R₃ = V_parallel / R₃ = ${Vparallel.toFixed(4)} / ${R3} = ${I3.toFixed(4)} A</div>
        <div class="ce-calc">I_R₂ = I_total × R₃/(R₂+R₃) = ${Itotal.toFixed(4)} × ${R3}/${R2+R3} = ${(Itotal*R3/(R2+R3)).toFixed(4)} A</div>
        <div class="ce-note">✅ تحقق: I_R₂ + I_R₃ = ${I2.toFixed(4)} + ${I3.toFixed(4)} = ${(I2+I3).toFixed(4)} A ≈ I_total</div>
      </div>
      <div class="ce-section">
        <h4>📟 قراءات الأجهزة</h4>
        <ul>
          <li>الأميتر الرئيسي: ${I.toFixed(4)} A</li>
          <li>أميتر فرع R₂: ${I2.toFixed(4)} A</li>
          <li>أميتر فرع R₃: ${I3.toFixed(4)} A</li>
          <li>الفولتميتر (عبر التوازي): ${Vparallel.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>التيار الكلي: ${Itotal.toFixed(4)} A</li>
          <li>I_R₂ = ${I2.toFixed(4)} A | I_R₃ = ${I3.toFixed(4)} A</li>
          <li>تحقق: I_R₂ + I_R₃ = ${(I2+I3).toFixed(4)} A = I_total ✓</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'bseries') {
    const batteries = comps.filter(c => c.type === 'battery')
    const V1 = batteries[0]?.value ?? 0
    const V2 = batteries[1]?.value ?? 0
    const Vtotal = V1 + V2
    const R = resistors[0]?.value ?? 0
    const Icalc = Vtotal / R
    const Vr = Icalc * R
    html = `
      <h3>🔋 منابع الجهد على التوالي</h3>
      <div class="ce-section">
        <h4>📋 المعطيات</h4>
        <ul>
          <li>بطارية 1: V₁ = ${V1} V</li>
          <li>بطارية 2: V₂ = ${V2} V</li>
          <li>مقاومة الحمل: R = ${R} Ω</li>
          <li>التوصيل: البطاريات + إلى — على التوالي</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 القانون</h4>
        <div class="ce-formula">V_total = V₁ + V₂ (عند الوصل بنفس القطبية)</div>
        <div class="ce-note">عند توصيل البطارية الثانية بالعكس، تُطرح: V_total = V₁ - V₂</div>
      </div>
      <div class="ce-section">
        <h4>🧮 الحسابات</h4>
        <div class="ce-calc">V_total = V₁ + V₂ = ${V1} + ${V2} = ${Vtotal} V</div>
        <div class="ce-calc">I = V_total / R = ${Vtotal} / ${R} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">V_R = I × R = ${Icalc.toFixed(4)} × ${R} = ${Vr.toFixed(4)} V</div>
        <div class="ce-note">✅ تحقق: V_R = V_total = ${Vr.toFixed(4)} V ≈ ${Vtotal} V</div>
      </div>
      <div class="ce-section">
        <h4>📟 قراءات الأجهزة</h4>
        <ul>
          <li>الأميتر: ${I.toFixed(4)} A</li>
          <li>فولتميتر 1 (عبر البطاريات): ${Vtotal.toFixed(4)} V</li>
          <li>فولتميتر 2 (عبر الحمل): ${Vr.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>الجهد الكلي: ${Vtotal} V = ${V1} + ${V2}</li>
          <li>التيار: ${Icalc.toFixed(4)} A</li>
          <li>القدرة: ${(Vtotal * Icalc).toFixed(4)} W</li>
        </ul>
      </div>
      <div class="ce-section" style="border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05)">
        <h4 style="color: #fca5a5">⚠️ تحذيرات والمخاطر</h4>
        <ul>
          <li>لا تصل بطاريتين على التفرع بجهود مختلفة — يسبب تيار عالي جداً</li>
          <li>لا تصل القطب الموجب بالسالب مباشرة — قصر وتلف</li>
          <li>تأكد من القطبية: + إلى — للتوليد، + إلى + للمعارضة</li>
        </ul>
      </div>
    `
  }
  else if (exp === 'bparallel') {
    const batteries = comps.filter(c => c.type === 'battery')
    const V1 = batteries[0]?.value ?? 0
    const V2 = batteries[1]?.value ?? 0
    const Vtotal = Math.max(V1, V2)
    const R = resistors[0]?.value ?? 0
    const Icalc = Vtotal / R
    const IperBat = Icalc / batteries.length
    html = `
      <h3>🔋 منابع الجهد على التفرع</h3>
      <div class="ce-section">
        <h4>📋 المعطيات</h4>
        <ul>
          <li>بطارية 1: V₁ = ${V1} V</li>
          <li>بطارية 2: V₂ = ${V2} V</li>
          <li>مقاومة الحمل: R = ${R} Ω</li>
          <li>التوصيل: + إلى + و — إلى — (نفس القطبية)</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 القانون</h4>
        <div class="ce-formula">V_total = V₁ = V₂ (يجب أن تكون متساوية)</div>
        <div class="ce-note">التيار يتوزع على البطاريات: I_total = I₁ + I₂</div>
      </div>
      <div class="ce-section">
        <h4>🧮 الحسابات</h4>
        <div class="ce-calc">V_total = ${Vtotal} V (نفس الجهد لكل بطارية)</div>
        <div class="ce-calc">I_total = V_total / R = ${Vtotal} / ${R} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">I_per_battery = I_total / 2 = ${Icalc.toFixed(4)} / 2 = ${IperBat.toFixed(4)} A</div>
        <div class="ce-note">✅ كل بطارية توفر نصف التيار — عمر أطول للبطاريات</div>
      </div>
      <div class="ce-section">
        <h4>📟 قراءات الأجهزة</h4>
        <ul>
          <li>الأميتر الرئيسي: ${I.toFixed(4)} A</li>
          <li>الفولتميتر: ${Vtotal.toFixed(4)} V</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ النتيجة النهائية</h4>
        <ul>
          <li>الجهد: ${Vtotal} V (ثابت)</li>
          <li>التيار الكلي: ${Icalc.toFixed(4)} A</li>
          <li>تيار كل بطارية: ${IperBat.toFixed(4)} A</li>
        </ul>
      </div>
      <div class="ce-section" style="border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05)">
        <h4 style="color: #fca5a5">⚠️ تحذيرات والمخاطر</h4>
        <ul>
          <li>🚫 بطاريتان بجهود مختلفة على التفرع = تيار عالي بينهما (قصر)</li>
          <li>🚫 عكس القطبية = جهد مضاعف عبر مقاومة صفر = انفجار!</li>
          <li>✅ استخدم بطاريات متطابقة دائماً في التفرع</li>
          <li>✅ أضف فيوز لكل بطارية للحماية</li>
        </ul>
      </div>
    `
  }

  calcExplanationHtml.value = html
  showCalcExplanation.value = true
}

function _saveEdit() {
  if (editingComp.value) {
    workshop.updateComponentValue(editingComp.value.id, editValue.value)
    while (editingComp.value.rotation !== editRotation.value) {
      workshop.rotateComponent(editingComp.value.id)
    }
    workshop.rerouteAllWires()
    if (workshop.running.value) workshop.solve()
  }
  showValueEditor.value = false
  editingComp.value = null
  redraw()
}

function applyEditValue() {
  if (editingComp.value) {
    workshop.updateComponentValue(editingComp.value.id, editValue.value)
    if (workshop.running.value) workshop.solve()
    redraw()
  }
}

function applyRotate() {
  if (editingComp.value) {
    while (editingComp.value.rotation !== editRotation.value) {
      workshop.rotateComponent(editingComp.value.id)
    }
    workshop.rerouteAllWires()
    if (workshop.running.value) workshop.solve()
    redraw()
  }
}

function zoomComp(delta: number) {
  if (editingComp.value) {
    const cur = editingComp.value.scale ?? 1
    workshop.setComponentScale(editingComp.value.id, cur + delta)
    workshop.rerouteAllWires()
    redraw()
  }
}

function zoomCompVal(val: number) {
  if (editingComp.value) {
    workshop.setComponentScale(editingComp.value.id, val)
    workshop.rerouteAllWires()
    redraw()
  }
}

function deleteSelectedComp() {
  if (workshop.selectedComponentId.value !== null) {
    workshop.removeComponent(workshop.selectedComponentId.value)
    if (workshop.running.value) workshop.solve()
    redraw()
  }
}

function _saveWireEdit() {
  if (editingWire.value) {
    workshop.updateWireColor(editingWire.value.id, editWireColor.value)
    workshop.updateWireThickness(editingWire.value.id, editWireThickness.value)
  }
  showWireEditor.value = false
  editingWire.value = null
  redraw()
}

function _deleteEditingComp() {
  if (editingComp.value) {
    workshop.removeComponent(editingComp.value.id)
    if (workshop.running.value) workshop.solve()
  }
  showValueEditor.value = false
  editingComp.value = null
  redraw()
}

function deleteSelectedWire() {
  if (workshop.selectedWireId.value !== null) {
    workshop.removeWire(workshop.selectedWireId.value)
    if (workshop.running.value) workshop.solve()
    showWireEditor.value = false
    editingWire.value = null
    redraw()
  }
}

function _deleteEditingWire() {
  if (editingWire.value) {
    workshop.removeWire(editingWire.value.id)
    if (workshop.running.value) workshop.solve()
  }
  showWireEditor.value = false
  editingWire.value = null
  redraw()
}

function toggleRun() {
  if (workshop.running.value) {
    workshop.stop()
    elapsedSeconds.value = 0
  } else {
    workshop.run()
    runStartTime.value = Date.now()
  }
  redraw()
}

const hasDanger = computed(() => workshop.faults.value.some(f => f.severity === 'danger'))
const hasWarning = computed(() => workshop.faults.value.some(f => f.severity === 'warning'))

const energyKWh = computed(() => {
  if (!workshop.running.value || elapsedSeconds.value === 0) return 0
  const hours = elapsedSeconds.value / 3600
  return workshop.totalPower.value * hours / 1000
})

function doSaveCircuit() {
  const name = circuitName.value.trim()
  if (!name) return
  workshop.saveCircuit(name)
  circuitName.value = ''
  showSaveDialog.value = false
}

function openLoadDialog() {
  savedCircuits.value = workshop.getSavedCircuits()
  showLoadDialog.value = true
}

function doLoadCircuit(name: string) {
  workshop.loadCircuit(name)
  showLoadDialog.value = false
  currentExperiment.value = null
  if (workshop.running.value) workshop.solve()
  redraw()
}

function doDeleteCircuit(name: string) {
  workshop.deleteCircuit(name)
  savedCircuits.value = workshop.getSavedCircuits()
}

function exportPNG() {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = 'circuit-' + Date.now() + '.png'
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}

function openCanvasFullscreen() {
  if (!canvasRef.value) return
  canvasSnapshot.value = canvasRef.value.toDataURL('image/png')
  canvasFullscreen.value = true
}

function printCircuit() {
  if (!canvasRef.value) return
  const w = window.open('', '_blank')
  if (!w) return
  const img = canvasRef.value.toDataURL('image/png')
  w.document.write(`
    <html dir="rtl"><head><title>طباعة الدائرة</title>
    <style>body{margin:0;display:flex;flex-direction:column;align-items:center;padding:20px;font-family:Arial}
    h2{color:#333}img{max-width:90%;border:1px solid #ccc}
    .info{margin-top:10px;font-size:14px;color:#666}</style></head>
    <body><h2>🛠️ ورشة الكهرباء — الدائرة الكهربائية</h2>
    <img src="${img}"/>
    <div class="info">V=${workshop.totalVoltage.value}V | I=${workshop.totalCurrent.value.toFixed(3)}A | P=${workshop.totalPower.value.toFixed(2)}W</div>
    </body></html>`)
  w.document.close()
  w.print()
}

const selectedSpec = computed(() => {
  if (!workshop.selectedComponentId.value) return null
  const comp = workshop.components.find(c => c.id === workshop.selectedComponentId.value)
  if (!comp) return null
  return { comp, spec: getSpec(comp.type) }
})

// Sync editing state with selection
watch(() => workshop.selectedComponentId.value, (id) => {
  if (id !== null) {
    const comp = workshop.components.find(c => c.id === id)
    if (comp) {
      editingComp.value = comp
      editValue.value = comp.value
      editRotation.value = comp.rotation
      showValueEditor.value = true
      showWireEditor.value = false
    }
  } else {
    showValueEditor.value = false
    editingComp.value = null
  }
})

watch(() => workshop.selectedWireId.value, (id) => {
  if (id !== null) {
    const wire = workshop.wires.find(w => w.id === id)
    if (wire) {
      editingWire.value = wire
      editWireColor.value = wire.color
      editWireThickness.value = wire.thickness
      showWireEditor.value = true
      showValueEditor.value = false
    }
  } else {
    showWireEditor.value = false
    editingWire.value = null
  }
})

const selectedCompFault = computed(() => {
  if (!workshop.selectedComponentId.value) return null
  const fault = workshop.faults.value.find(f => f.componentId === workshop.selectedComponentId.value)
  return fault?.message ?? null
})

// Animation loop for live readings
let animFrame = 0
function animLoop() {
  if (workshop.running.value) {
    redraw()
    elapsedSeconds.value = Math.floor((Date.now() - runStartTime.value) / 1000)
  }
  animFrame = requestAnimationFrame(animLoop)
}

watch(() => [workshop.components, workshop.wires, workshop.running.value], redraw, { deep: true })

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('keydown', onKeyDown)
  animLoop()
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('keydown', onKeyDown)
  cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div class="dc-lab">
    <!-- Left: Component Palette -->
    <div class="dc-palette">
      <h3 class="palette-title">🧰 المكونات</h3>
      <div class="palette-grid">
        <button
          v-for="def in dcComponents"
          :key="def.type"
          class="palette-item"
          :style="{ '--accent': def.color }"
          @click="onAddComponent(def.type)"
        >
          <span class="pi-icon">{{ def.icon }}</span>
          <span class="pi-label">{{ def.labelAr }}</span>
          <span class="pi-unit">{{ def.defaultValue }}{{ def.unit }}</span>
        </button>
      </div>

      <h3 class="palette-title">🧵 لون السلك</h3>
      <div class="wire-colors">
        <button
          v-for="wc in WIRE_COLOR_NAMES"
          :key="wc.key"
          class="wire-color-btn"
          :class="{ active: workshop.selectedWireColor.value === wc.color }"
          :style="{ '--wc': wc.color }"
          @click="workshop.selectedWireColor.value = wc.color"
        >
          <span class="wc-dot"></span>
          <span class="wc-label">{{ wc.label }}</span>
        </button>
      </div>
    </div>

    <!-- Center: Canvas -->
    <div class="dc-canvas-wrap">
      <canvas
        ref="canvasRef"
        class="dc-canvas"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @wheel.prevent="onWheel"
        @dblclick="onDblClick"
      ></canvas>

      <!-- Top Control Bar (always visible, content changes by selection) -->
      <div class="dc-top-bar">
        <!-- Component selected -->
        <template v-if="showValueEditor && editingComp">
          <div class="tb-section tb-name">
            <span class="tb-icon">{{ componentDefs.find(d => d.type === editingComp?.type)?.icon }}</span>
            <span class="tb-label">{{ editingComp?.label }}</span>
          </div>

          <div class="tb-section" v-if="editingComp?.unit">
            <label class="tb-field">القيمة</label>
            <div class="tb-input-grp">
              <input type="number" v-model.number="editValue" @input="applyEditValue" step="0.1" class="tb-input" />
              <span class="tb-unit">{{ editingComp?.unit }}</span>
            </div>
          </div>

          <div class="tb-section">
            <label class="tb-field">التدوير</label>
            <div class="tb-btn-grp">
              <button class="tb-mini-btn" @click="editRotation = (editRotation + 270) % 360; applyRotate()">↺</button>
              <span class="tb-rot-val">{{ editRotation }}°</span>
              <button class="tb-mini-btn" @click="editRotation = (editRotation + 90) % 360; applyRotate()">↻</button>
            </div>
          </div>

          <div class="tb-section">
            <label class="tb-field">الحجم {{ Math.round((editingComp?.scale ?? 1) * 100) }}%</label>
            <div class="tb-btn-grp">
              <button class="tb-mini-btn" @click="zoomComp(-0.2)">−</button>
              <input type="range" min="0.3" max="4" step="0.1" :value="editingComp?.scale ?? 1" @input="zoomCompVal(Number(($event.target as HTMLInputElement).value))" class="tb-slider" />
              <button class="tb-mini-btn" @click="zoomComp(0.2)">+</button>
            </div>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'switch'">
            <button class="tb-action-btn" @click="workshop.toggleSwitch(editingComp!.id); if (workshop.running.value) workshop.solve()">
              {{ editingComp?.closed ? '🟢 ON' : '🔴 OFF' }}
            </button>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'breaker' && editingComp?.breakerTripped">
            <button class="tb-action-btn warn" @click="workshop.resetBreaker(editingComp!.id); if (workshop.running.value) workshop.solve()">🔧 ضبط القاطع</button>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'fuse' && editingComp?.fuseBlown">
            <button class="tb-action-btn warn" @click="workshop.resetFuse(editingComp!.id); if (workshop.running.value) workshop.solve()">🔧 استبدال المصهر</button>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'multimeter'">
            <div class="tb-mm-grp">
              <button class="tb-mm-btn" :class="{ active: editingComp?.multimeterMode === 'voltage' }" @click="workshop.setMultimeterMode(editingComp!.id, 'voltage')">V</button>
              <button class="tb-mm-btn" :class="{ active: editingComp?.multimeterMode === 'current' }" @click="workshop.setMultimeterMode(editingComp!.id, 'current')">A</button>
              <button class="tb-mm-btn" :class="{ active: editingComp?.multimeterMode === 'resistance' }" @click="workshop.setMultimeterMode(editingComp!.id, 'resistance')">Ω</button>
            </div>
          </div>

          <div class="tb-section tb-readings" v-if="workshop.running.value">
            <span class="tb-rd">V: {{ editingComp?.voltage.toFixed(3) }}</span>
            <span class="tb-rd">A: {{ editingComp?.current.toFixed(4) }}</span>
            <span class="tb-rd">W: {{ (Math.abs((editingComp?.voltage ?? 0) * (editingComp?.current ?? 0))).toFixed(3) }}</span>
          </div>

          <div class="tb-section tb-actions">
            <button class="tb-delete-btn" @click="deleteSelectedComp">🗑</button>
          </div>
        </template>

        <!-- Wire selected -->
        <template v-else-if="showWireEditor && editingWire">
          <div class="tb-section tb-name">
            <span class="tb-icon">🧵</span>
            <span class="tb-label">خصائص السلك</span>
          </div>

          <div class="tb-section">
            <label class="tb-field">اللون</label>
            <div class="tb-color-grp">
              <button
                v-for="wc in WIRE_COLOR_NAMES"
                :key="wc.key"
                class="tb-color-dot"
                :class="{ active: editWireColor === wc.color }"
                :style="{ '--wc': wc.color }"
                @click="editWireColor = wc.color; workshop.updateWireColor(editingWire!.id, wc.color); redraw()"
              ></button>
            </div>
          </div>

          <div class="tb-section">
            <label class="tb-field">السماكة: {{ editWireThickness }}px</label>
            <input type="range" min="1" max="8" v-model.number="editWireThickness" @input="workshop.updateWireThickness(editingWire!.id, editWireThickness); redraw()" class="tb-slider" />
          </div>

          <div class="tb-section">
            <span class="tb-info">{{ editingWire?.points.length }} نقطة زاوية</span>
          </div>

          <div class="tb-section">
            <button class="tb-action-btn" @click="workshop.rerouteAllWires(); redraw()">🔄 إعادة التوجيه</button>
          </div>

          <div class="tb-section tb-actions">
            <button class="tb-delete-btn" @click="deleteSelectedWire">🗑</button>
          </div>
        </template>

        <!-- Nothing selected -->
        <template v-else>
          <div class="tb-section tb-name">
            <span class="tb-icon">⚙️</span>
            <span class="tb-label">لوحة التحكم</span>
          </div>
          <div class="tb-section">
            <span class="tb-info">اختر عنصراً أو سلكاً لعرض خصائصه هنا</span>
          </div>
          <div class="tb-section tb-actions">
            <button class="tb-fs-btn" @click="openCanvasFullscreen" title="تكبير الشاشة">⛶ ملء الشاشة</button>
          </div>
        </template>

      </div>

      <!-- Bottom Bar: run/stop + clear + experiments + readings -->
      <div class="dc-bottom-bar">
        <button class="bb-run-btn" :class="{ active: workshop.running.value }" @click="toggleRun">
          {{ workshop.running.value ? '⏹ إيقاف' : '▶ تشغيل' }}
        </button>
        <button class="bb-clear-btn" @click="currentExperiment = null; workshop.clearAll(); redraw()">🗑 مسح الكل</button>
        <div class="bb-exp-wrap">
          <button class="bb-exp-btn" @click="showExperiments = !showExperiments">📚 تجارب جاهزة ▾</button>
          <div class="bb-exp-menu" v-if="showExperiments">
            <button class="bb-exp-item" @click="loadExp('ohm')">📐 قانون أوم</button>
            <button class="bb-exp-item" @click="loadExp('series')">🔗 توصيل على التوالي</button>
            <button class="bb-exp-item" @click="loadExp('parallel')">⏏ توصيل على التفرع</button>
            <button class="bb-exp-item" @click="loadExp('mixed')">🔀 توصيل مختلط</button>
            <div class="bb-exp-divider"></div>
            <button class="bb-exp-item" @click="loadExp('kvl')">⚖️ قانون كيرشوف للجهد (KVL)</button>
            <button class="bb-exp-item" @click="loadExp('kcl')">⚖️ قانون كيرشوف للتيار (KCL)</button>
            <button class="bb-exp-item" @click="loadExp('vdivider')">📐 مقسم الجهد</button>
            <button class="bb-exp-item" @click="loadExp('cdivider')">📐 مقسم التيار</button>
            <div class="bb-exp-divider"></div>
            <button class="bb-exp-item" @click="loadExp('bseries')">🔋 منابع على التوالي</button>
            <button class="bb-exp-item" @click="loadExp('bparallel')">🔋 منابع على التفرع</button>
          </div>
        </div>
        <button class="bb-explain-btn" v-if="currentExperiment" @click="explainCalcs">📝 شرح الحسابات</button>
        <button class="bb-tool-btn" @click="showSaveDialog = true">💾 حفظ</button>
        <button class="bb-tool-btn" @click="openLoadDialog">📂 تحميل</button>
        <button class="bb-tool-btn" @click="exportPNG">🖼 PNG</button>
        <button class="bb-tool-btn" @click="printCircuit">🖨 طباعة</button>
        <span class="bb-rd" v-if="workshop.running.value && !workshop.error.value">
          I: {{ workshop.totalCurrent.value.toFixed(3) }}A | V: {{ workshop.totalVoltage.value.toFixed(1) }}V | P: {{ workshop.totalPower.value.toFixed(2) }}W
          <span class="bb-energy" v-if="elapsedSeconds > 0">| ⏱ {{ elapsedSeconds }}s | ⚡ {{ (energyKWh * 1000).toFixed(4) }}mWh</span>
        </span>
        <span class="bb-error" v-if="workshop.error.value">{{ workshop.error.value }}</span>
      </div>

      <!-- Danger Visual Overlay -->
      <div class="danger-overlay" v-if="workshop.running.value && hasDanger">
        <div class="danger-pulse"></div>
        <div class="danger-banner">⚠️ خطر — اوقف الدائرة فوراً!</div>
      </div>

      <!-- Warning Lamps (top-right corner) -->
      <div class="warning-lamps" v-if="workshop.running.value">
        <div class="wlamp" :class="{ on: hasDanger, off: !hasDanger }" title="خطر">
          <span class="wl-icon">🔴</span>
          <span class="wl-label" v-if="hasDanger">خطر</span>
        </div>
        <div class="wlamp" :class="{ on: hasWarning && !hasDanger, off: !hasWarning }" title="تحذير">
          <span class="wl-icon">🟡</span>
          <span class="wl-label" v-if="hasWarning && !hasDanger">تحذير</span>
        </div>
        <div class="wlamp" :class="{ on: !hasDanger && !hasWarning }" title="سليم">
          <span class="wl-icon">🟢</span>
          <span class="wl-label" v-if="!hasDanger && !hasWarning">سليم</span>
        </div>
      </div>

      <!-- Fault Messages -->
      <div class="fault-list" v-if="workshop.running.value && workshop.faults.value.length > 0">
        <div v-for="(fault, i) in workshop.faults.value" :key="i" class="fault-item" :class="fault.severity">
          <span class="fi-icon">{{ fault.severity === 'danger' ? '🔴' : '🟡' }}</span>
          <span class="fi-msg">{{ fault.message }}</span>
        </div>
      </div>
    </div>

    <!-- Right: Readings Panel -->
    <div class="dc-readings">
      <h3 class="readings-title">📊 القراءات</h3>
      <div v-if="!workshop.running.value" class="no-readings">
        اضغط ▶ تشغيل لعرض القراءات
      </div>
      <div v-else class="readings-list">
        <div
          v-for="comp in workshop.components"
          :key="comp.id"
          class="reading-item"
          :class="{ selected: workshop.selectedComponentId.value === comp.id }"
          @click="workshop.selectedComponentId.value = comp.id; redraw()"
        >
          <span class="ri-icon">{{ componentDefs.find(d => d.type === comp.type)?.icon }}</span>
          <span class="ri-label">{{ comp.label }}</span>
          <span class="ri-v">{{ comp.voltage.toFixed(3) }}V</span>
          <span class="ri-i">{{ comp.current.toFixed(4) }}A</span>
        </div>
      </div>

      <div class="readings-summary" v-if="workshop.running.value">
        <div class="rs-row">
          <span>التيار الكلي:</span>
          <span class="rs-val">{{ workshop.totalCurrent.value.toFixed(4) }} A</span>
        </div>
        <div class="rs-row">
          <span>الجهد الكلي:</span>
          <span class="rs-val">{{ workshop.totalVoltage.value.toFixed(2) }} V</span>
        </div>
        <div class="rs-row">
          <span>القدرة الكلية:</span>
          <span class="rs-val">{{ workshop.totalPower.value.toFixed(3) }} W</span>
        </div>
      </div>

      <!-- Component Properties & Mechanism -->
      <div v-if="selectedSpec" class="comp-info">
        <div class="comp-info-header">
          <span class="ci-icon">{{ componentDefs.find(d => d.type === selectedSpec?.comp.type)?.icon }}</span>
          <h4>{{ selectedSpec?.comp.label }}</h4>
        </div>

        <!-- Properties Table -->
        <div class="ci-section">
          <h5 class="ci-title">📋 الخصائص</h5>
          <table class="ci-table">
            <tbody>
              <tr v-for="(prop, i) in selectedSpec.spec?.properties" :key="i">
                <td class="ci-key">{{ prop.label }}</td>
                <td class="ci-val">{{ prop.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mechanism Table -->
        <div class="ci-section">
          <h5 class="ci-title">⚙️ آلية العمل</h5>
          <table class="ci-table">
            <thead>
              <tr><th>الخطوة</th><th>الوصف</th></tr>
            </thead>
            <tbody>
              <tr v-for="(step, i) in selectedSpec.spec?.mechanism" :key="i">
                <td class="ci-step">{{ step.step }}</td>
                <td class="ci-desc">{{ step.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Formula -->
        <div class="ci-section" v-if="selectedSpec.spec?.formula">
          <h5 class="ci-title">📐 المعادلة</h5>
          <div class="ci-formula">{{ selectedSpec.spec.formula }}</div>
          <div class="ci-formula-desc">{{ selectedSpec.spec.formulaDesc }}</div>
        </div>

        <!-- Live Readings -->
        <div class="ci-section" v-if="workshop.running.value">
          <h5 class="ci-title">📊 القراءات اللحظية</h5>
          <table class="ci-table">
            <tbody>
              <tr><td class="ci-key">الجهد</td><td class="ci-val">{{ selectedSpec?.comp.voltage.toFixed(4) }} V</td></tr>
              <tr><td class="ci-key">التيار</td><td class="ci-val">{{ selectedSpec?.comp.current.toFixed(4) }} A</td></tr>
              <tr><td class="ci-key">القدرة</td><td class="ci-val">{{ (Math.abs((selectedSpec?.comp.voltage ?? 0) * (selectedSpec?.comp.current ?? 0))).toFixed(4) }} W</td></tr>
              <tr><td class="ci-key">الحالة</td><td class="ci-val" :class="{ 'ci-ok': !selectedCompFault, 'ci-fault': selectedCompFault }">{{ selectedCompFault ? '⚠ ' + selectedCompFault : '✓ سليم' }}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Applications -->
        <div class="ci-section">
          <h5 class="ci-title">🔧 التطبيقات</h5>
          <div class="ci-apps">
            <span v-for="(app, i) in selectedSpec.spec?.applications" :key="i" class="ci-app-tag">{{ app }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Fullscreen Calc Explanation -->
  <Teleport to="body">
    <div class="fs-overlay" v-if="showCalcExplanation" @click.self="showCalcExplanation = false">
      <div class="fs-container">
        <div class="fs-header">
          <span class="fs-title">📝 شرح الحسابات التفصيلي</span>
          <button class="fs-close" @click="showCalcExplanation = false">✕ إغلاق</button>
        </div>
        <div class="fs-body">
          <div class="fs-canvas-side">
            <img v-if="canvasSnapshot" :src="canvasSnapshot" class="fs-snapshot" alt="circuit" />
          </div>
          <div class="fs-calc-side" v-html="calcExplanationHtml"></div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Save Circuit Dialog -->
  <Teleport to="body">
    <div class="dlg-overlay" v-if="showSaveDialog" @click.self="showSaveDialog = false">
      <div class="dlg-box">
        <div class="dlg-header">💾 حفظ الدائرة</div>
        <div class="dlg-content">
          <input class="dlg-input" v-model="circuitName" placeholder="اسم الدائرة..." @keyup.enter="doSaveCircuit" />
        </div>
        <div class="dlg-actions">
          <button class="dlg-btn dlg-cancel" @click="showSaveDialog = false">إلغاء</button>
          <button class="dlg-btn dlg-ok" @click="doSaveCircuit">حفظ</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Load Circuit Dialog -->
  <Teleport to="body">
    <div class="dlg-overlay" v-if="showLoadDialog" @click.self="showLoadDialog = false">
      <div class="dlg-box">
        <div class="dlg-header">📂 تحميل دائرة محفوظة</div>
        <div class="dlg-content">
          <div v-if="savedCircuits.length === 0" class="dlg-empty">لا توجد دوائر محفوظة</div>
          <div v-else class="dlg-list">
            <div v-for="name in savedCircuits" :key="name" class="dlg-list-item">
              <span class="dlg-item-name" @click="doLoadCircuit(name)">{{ name }}</span>
              <button class="dlg-del" @click="doDeleteCircuit(name)">🗑</button>
            </div>
          </div>
        </div>
        <div class="dlg-actions">
          <button class="dlg-btn dlg-cancel" @click="showLoadDialog = false">إغلاق</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Fullscreen Canvas View -->
  <Teleport to="body">
    <div class="cv-fs-overlay" v-if="canvasFullscreen" @click.self="canvasFullscreen = false">
      <div class="cv-fs-container">
        <div class="cv-fs-header">
          <span class="cv-fs-title">🔍 معاينة الدائرة بملء الشاشة</span>
          <div class="cv-fs-actions">
            <button class="cv-fs-btn" @click="exportPNG">🖼 حفظ PNG</button>
            <button class="cv-fs-close" @click="canvasFullscreen = false">✕ إغلاق</button>
          </div>
        </div>
        <div class="cv-fs-body">
          <img v-if="canvasSnapshot" :src="canvasSnapshot" class="cv-fs-img" alt="circuit fullscreen" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dc-lab {
  display: flex;
  height: 100%;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow: hidden;
}

/* Palette */
.dc-palette {
  width: 200px;
  flex-shrink: 0;
  overflow-y: auto;
  background: #0d1526;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

/* Top control bar (horizontal, fixed at top of canvas) */
.dc-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.6rem;
  background: rgba(13, 21, 38, 0.95);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  z-index: 20;
  flex-wrap: wrap;
  backdrop-filter: blur(8px);
}

.tb-section {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.tb-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: #e2e8f0;
  min-width: 80px;
}

.tb-icon { font-size: 1rem; }
.tb-label { white-space: nowrap; }

.tb-field {
  font-size: 0.65rem;
  color: #94a3b8;
  white-space: nowrap;
}

.tb-input-grp {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.tb-input {
  width: 60px;
  padding: 0.15rem 0.3rem;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.25rem;
  color: #e2e8f0;
  font-size: 0.75rem;
}

.tb-unit {
  font-size: 0.65rem;
  color: #94a3b8;
}

.tb-btn-grp {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.tb-mini-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.25rem;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.8rem;
}

.tb-mini-btn:hover {
  background: #334155;
}

.tb-rot-val {
  font-size: 0.7rem;
  color: #94a3b8;
  min-width: 30px;
  text-align: center;
}

.tb-slider {
  width: 80px;
  accent-color: #0ea5e9;
}

.tb-action-btn {
  padding: 0.2rem 0.5rem;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.25rem;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.7rem;
  white-space: nowrap;
}

.tb-action-btn:hover { background: #334155; }
.tb-action-btn.warn { border-color: #f59e0b; color: #fbbf24; }

.tb-mm-grp { display: flex; gap: 0.15rem; }

.tb-mm-btn {
  width: 28px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.25rem;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.7rem;
}

.tb-mm-btn.active {
  background: #0ea5e9;
  color: #fff;
  border-color: #0ea5e9;
}

.tb-readings {
  gap: 0.5rem;
}

.tb-rd {
  font-size: 0.65rem;
  color: #7dd3fc;
  background: rgba(14,165,233,0.1);
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  white-space: nowrap;
}

.tb-info {
  font-size: 0.65rem;
  color: #94a3b8;
  white-space: nowrap;
}

.tb-color-grp { display: flex; gap: 0.2rem; }

.tb-color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--wc);
  border: 2px solid transparent;
  cursor: pointer;
}

.tb-color-dot.active {
  border-color: #fff;
}

.tb-actions {
  margin-right: 0;
  margin-left: auto;
  gap: 0.3rem;
}

.tb-delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.tb-delete-btn:hover { background: rgba(239,68,68,0.3); }

.tb-close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.25rem;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
}

.tb-close-btn:hover { background: #334155; color: #e2e8f0; }

.tb-global {
  margin-left: auto;
  gap: 0.4rem;
}

.tb-run-btn {
  padding: 0.2rem 0.6rem;
  background: #166534;
  border: 1px solid #22c55e;
  border-radius: 0.25rem;
  color: #fff;
  cursor: pointer;
  font-size: 0.75rem;
  white-space: nowrap;
}

.tb-run-btn.active {
  background: #991b1b;
  border-color: #ef4444;
}

.tb-run-btn:hover { opacity: 0.85; }

.tb-clear-btn {
  padding: 0.2rem 0.5rem;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.25rem;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.7rem;
  white-space: nowrap;
}

.tb-clear-btn:hover { background: #334155; }

.tb-error {
  font-size: 0.65rem;
  color: #ef4444;
  white-space: nowrap;
}

/* Bottom bar (run/stop + clear) */
.dc-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: rgba(13, 21, 38, 0.95);
  border-top: 1px solid rgba(255,255,255,0.1);
  z-index: 20;
  backdrop-filter: blur(8px);
}

.bb-run-btn {
  padding: 0.3rem 0.8rem;
  background: #166534;
  border: 1px solid #22c55e;
  border-radius: 0.3rem;
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
}

.bb-run-btn.active {
  background: #991b1b;
  border-color: #ef4444;
}

.bb-run-btn:hover { opacity: 0.85; }

.bb-clear-btn {
  padding: 0.3rem 0.6rem;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.3rem;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.75rem;
  white-space: nowrap;
}

.bb-clear-btn:hover { background: #334155; }

.bb-rd {
  font-size: 0.7rem;
  color: #7dd3fc;
  background: rgba(14,165,233,0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 0.2rem;
  white-space: nowrap;
}

.bb-error {
  font-size: 0.7rem;
  color: #ef4444;
  white-space: nowrap;
}

/* Experiments dropdown */
.bb-exp-wrap {
  position: relative;
}

.bb-exp-btn {
  padding: 0.3rem 0.6rem;
  background: #1e3a5f;
  border: 1px solid #0ea5e9;
  border-radius: 0.3rem;
  color: #7dd3fc;
  cursor: pointer;
  font-size: 0.75rem;
  white-space: nowrap;
}

.bb-exp-btn:hover { background: #254870; }

.bb-exp-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.3rem;
  background: #0d1526;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0.4rem;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.5);
  overflow: hidden;
  z-index: 30;
  min-width: 200px;
}

.bb-exp-item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.7rem;
  background: transparent;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.75rem;
  text-align: right;
  white-space: nowrap;
}

.bb-exp-item:hover {
  background: rgba(14,165,233,0.15);
}

.bb-exp-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 0.3rem 0;
}

.palette-title {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0.5rem 0 0.3rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.palette-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
}

.palette-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 0.2rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.15s;
  color: #e2e8f0;
}

.palette-item:hover {
  background: var(--accent, #3b82f6);
  border-color: var(--accent, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.pi-icon { font-size: 1.2rem; }
.pi-label { font-size: 0.65rem; margin-top: 0.2rem; }
.pi-unit { font-size: 0.55rem; color: #64748b; }

/* Wire colors */
.wire-colors {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.wire-color-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.5rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.3rem;
  cursor: pointer;
  color: #e2e8f0;
  font-size: 0.7rem;
  transition: all 0.15s;
}

.wire-color-btn:hover { background: rgba(255,255,255,0.05); }
.wire-color-btn.active { border-color: var(--wc); background: rgba(255,255,255,0.06); }

.wc-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--wc);
  box-shadow: 0 0 6px var(--wc);
}

.wc-label { font-size: 0.65rem; }

/* Canvas */
.dc-canvas-wrap {
  flex: 1;
  position: relative;
  display: flex;
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
}

.dc-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  user-select: none;
}

/* Toolbar */
.dc-toolbar {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(13,21,38,0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.5rem;
  padding: 0.4rem 0.7rem;
  z-index: 10;
}

.tb-btn {
  background: rgba(34,197,94,0.12);
  border: 1px solid rgba(34,197,94,0.3);
  color: #4ade80;
  padding: 0.3rem 0.8rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s;
}

.tb-btn:hover { background: rgba(34,197,94,0.2); }
.tb-btn.active {
  background: rgba(239,68,68,0.15);
  border-color: rgba(239,68,68,0.4);
  color: #f87171;
}

.tb-info {
  font-size: 0.7rem;
  color: #94a3b8;
  font-family: monospace;
}

.tb-error {
  font-size: 0.7rem;
  color: #f87171;
  font-weight: 600;
}

/* Property Editor */
.prop-editor-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.prop-editor {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.6rem;
  padding: 1.2rem;
  min-width: 280px;
  max-width: 320px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.pe-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.pe-icon { font-size: 1.3rem; }
.pe-header h4 { margin: 0; color: #e2e8f0; font-size: 0.95rem; }

.pe-section { margin-bottom: 0.8rem; }
.pe-label { display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.3rem; }

.pe-input-row { display: flex; align-items: center; gap: 0.4rem; }
.pe-input {
  width: 100px; padding: 0.4rem;
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.3rem;
  color: #e2e8f0;
  font-size: 1rem;
  text-align: center;
}
.pe-unit { color: #94a3b8; font-size: 0.8rem; }

.pe-rotation { display: flex; align-items: center; gap: 0.5rem; }
.rot-btn {
  background: rgba(59,130,246,0.12);
  border: 1px solid rgba(59,130,246,0.3);
  color: #60a5fa;
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.75rem;
}
.rot-btn:hover { background: rgba(59,130,246,0.2); }
.rot-val { color: #e2e8f0; font-size: 0.85rem; font-weight: 600; min-width: 40px; text-align: center; }

.pe-toggle {
  background: rgba(34,197,94,0.12);
  border: 1px solid rgba(34,197,94,0.3);
  color: #4ade80;
  padding: 0.4rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  width: 100%;
}

.pe-reset {
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.3);
  color: #fbbf24;
  padding: 0.4rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.8rem;
  width: 100%;
}

.mm-mode-selector {
  display: flex;
  gap: 0.3rem;
}

.mm-mode-btn {
  flex: 1;
  background: rgba(14,165,233,0.08);
  border: 1px solid rgba(14,165,233,0.2);
  color: #64748b;
  padding: 0.35rem 0.3rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 600;
  transition: all 0.2s;
}

.mm-mode-btn.active {
  background: rgba(14,165,233,0.2);
  border-color: rgba(14,165,233,0.5);
  color: #38bdf8;
  box-shadow: 0 0 8px rgba(14,165,233,0.2);
}

.pe-readings {
  background: rgba(0,0,0,0.2);
  border-radius: 0.3rem;
  padding: 0.5rem;
}
.pe-reading-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  padding: 0.15rem 0;
  color: #94a3b8;
}
.pe-r-val { color: #fbbf24; font-family: monospace; font-weight: 600; }

.pe-actions { display: flex; gap: 0.4rem; margin-top: 1rem; }
.pe-delete {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #f87171;
  padding: 0.4rem 0.8rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.78rem;
}
.pe-cancel {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  padding: 0.4rem 0.8rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.78rem;
  flex: 1;
}
.pe-save {
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.3);
  color: #4ade80;
  padding: 0.4rem 0.8rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  flex: 1;
}

/* Wire color picker in modal */
.wire-color-picker { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.wcp-btn {
  width: 32px; height: 32px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 0.3rem;
  cursor: pointer;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.wcp-btn.active { border-color: #fbbf24; }
.wcp-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--wc);
  box-shadow: 0 0 8px var(--wc);
}

.pe-slider {
  width: 100%;
  accent-color: #3b82f6;
}

/* Danger Visual Overlay */
.danger-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
}

.danger-pulse {
  position: absolute;
  inset: 0;
  border: 3px solid rgba(239, 68, 68, 0.6);
  border-radius: 0.4rem;
  animation: danger-pulse-anim 0.8s ease-in-out infinite;
}

@keyframes danger-pulse-anim {
  0%, 100% { box-shadow: inset 0 0 20px rgba(239,68,68,0.1); opacity: 0.5; }
  50% { box-shadow: inset 0 0 60px rgba(239,68,68,0.3); opacity: 1; }
}

.danger-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  padding: 0.6rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  animation: danger-banner-blink 0.5s ease-in-out infinite alternate;
  box-shadow: 0 4px 20px rgba(239,68,68,0.5);
}

@keyframes danger-banner-blink {
  from { opacity: 0.7; transform: translate(-50%, -50%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}

/* Warning Lamps */
.warning-lamps {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  z-index: 10;
}

.wlamp {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.4rem;
  background: rgba(13,21,38,0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.3s;
}

.wlamp.on {
  animation: pulse-warn 1s ease-in-out infinite;
}
.wlamp.off { opacity: 0.3; }

@keyframes pulse-warn {
  0%, 100% { box-shadow: 0 0 4px currentColor; }
  50% { box-shadow: 0 0 16px currentColor; }
}

.wl-icon { font-size: 0.9rem; }
.wl-label { font-size: 0.65rem; font-weight: 700; color: #e2e8f0; }

/* Fault List */
.fault-list {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  z-index: 10;
  max-width: 300px;
}

.fault-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  background: rgba(13,21,38,0.9);
  backdrop-filter: blur(8px);
  font-size: 0.7rem;
  animation: slide-in 0.3s ease-out;
}

.fault-item.danger {
  border: 1px solid rgba(239,68,68,0.4);
  box-shadow: 0 0 8px rgba(239,68,68,0.2);
}

.fault-item.warning {
  border: 1px solid rgba(245,158,11,0.3);
}

.fi-icon { font-size: 0.8rem; }
.fi-msg { color: #e2e8f0; }

@keyframes slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Readings */
.dc-readings {
  width: 240px;
  flex-shrink: 0;
  overflow-y: auto;
  background: #0d1526;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.readings-title {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0.5rem 0 0.3rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.no-readings {
  color: #475569;
  font-size: 0.75rem;
  text-align: center;
  padding: 2rem 0.5rem;
}

.readings-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.reading-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.4rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.65rem;
  transition: all 0.15s;
}

.reading-item:hover { background: rgba(255,255,255,0.05); }
.reading-item.selected { border-color: #f59e0b; background: rgba(245,158,11,0.05); }

.ri-icon { font-size: 0.8rem; }
.ri-label { color: #e2e8f0; flex: 1; }
.ri-v { color: #a78bfa; font-family: monospace; }
.ri-i { color: #4ade80; font-family: monospace; }

.readings-summary {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(245,158,11,0.05);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: 0.3rem;
}

.rs-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  padding: 0.15rem 0;
  color: #94a3b8;
}

.rs-val {
  color: #fbbf24;
  font-family: monospace;
  font-weight: 600;
}

/* Inline Control Panel */
.inline-control {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(14,165,233,0.06);
  border: 1px solid rgba(14,165,233,0.2);
  border-radius: 0.4rem;
}

.ic-header {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.ic-icon { font-size: 1rem; }
.ic-header h4 { margin: 0; font-size: 0.8rem; color: #38bdf8; flex: 1; }
.ic-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1rem;
  cursor: pointer;
  padding: 0 0.3rem;
  border-radius: 0.2rem;
}
.ic-close:hover { color: #f87171; background: rgba(239,68,68,0.1); }

.ic-row { margin-bottom: 0.5rem; }
.ic-label { display: block; font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.2rem; }

.ic-input-grp { display: flex; align-items: center; gap: 0.3rem; }
.ic-input {
  width: 80px;
  padding: 0.3rem;
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.3rem;
  color: #e2e8f0;
  font-size: 0.85rem;
  text-align: center;
}
.ic-unit { color: #94a3b8; font-size: 0.7rem; }

.ic-rotation { display: flex; align-items: center; gap: 0.4rem; }
.ic-btn-sm {
  background: rgba(59,130,246,0.12);
  border: 1px solid rgba(59,130,246,0.3);
  color: #60a5fa;
  width: 28px; height: 28px;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ic-btn-sm:hover { background: rgba(59,130,246,0.2); }
.ic-rot-val { color: #e2e8f0; font-size: 0.8rem; font-weight: 600; min-width: 35px; text-align: center; }

.ic-action-btn {
  width: 100%;
  background: rgba(34,197,94,0.12);
  border: 1px solid rgba(34,197,94,0.3);
  color: #4ade80;
  padding: 0.35rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
}
.ic-action-btn.warn {
  background: rgba(245,158,11,0.12);
  border-color: rgba(245,158,11,0.3);
  color: #fbbf24;
}

.ic-readings {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}
.ic-rd {
  flex: 1;
  text-align: center;
  background: rgba(0,0,0,0.2);
  border-radius: 0.3rem;
  padding: 0.25rem;
  font-size: 0.6rem;
  color: #64748b;
}
.ic-rd-val {
  display: block;
  color: #fbbf24;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 0.1rem;
}

.ic-delete-btn {
  width: 100%;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  color: #f87171;
  padding: 0.35rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
}
.ic-delete-btn:hover { background: rgba(239,68,68,0.2); }

.wire-info {
  font-size: 0.7rem;
  color: #38bdf8;
  background: rgba(14,165,233,0.08);
  padding: 0.25rem 0.4rem;
  border-radius: 0.3rem;
  text-align: center;
}

.ic-actions-row {
  display: flex;
  gap: 0.3rem;
}

.ic-junction-hint {
  font-size: 0.6rem;
  color: #7dd3fc;
  background: rgba(14,165,233,0.06);
  border: 1px dashed rgba(14,165,233,0.2);
  border-radius: 0.3rem;
  padding: 0.3rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.readings-help {
  margin-top: 0.8rem;
  padding: 0.5rem;
  background: rgba(59,130,246,0.05);
  border: 1px solid rgba(59,130,246,0.1);
  border-radius: 0.3rem;
}

.readings-help h4 {
  font-size: 0.75rem;
  color: #60a5fa;
  margin: 0 0 0.3rem;
}

.readings-help ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.readings-help li {
  font-size: 0.62rem;
  color: #64748b;
  padding: 0.1rem 0;
}

/* Component Info */
.comp-info {
  margin-top: 0.8rem;
  padding: 0.5rem;
  background: rgba(99,102,241,0.05);
  border: 1px solid rgba(99,102,241,0.15);
  border-radius: 0.4rem;
}

.comp-info-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.ci-icon { font-size: 1.1rem; }
.comp-info-header h4 { margin: 0; font-size: 0.85rem; color: #a5b4fc; }

.ci-section { margin-bottom: 0.6rem; }
.ci-title {
  font-size: 0.7rem;
  color: #818cf8;
  margin: 0 0 0.3rem;
  font-weight: 600;
}

.ci-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.62rem;
}

.ci-table th {
  text-align: right;
  padding: 0.2rem 0.3rem;
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.ci-table td {
  padding: 0.2rem 0.3rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.ci-key { color: #64748b; white-space: nowrap; }
.ci-val { color: #e2e8f0; text-align: left; }
.ci-step { color: #fbbf24; font-weight: 700; text-align: center; width: 24px; }
.ci-desc { color: #cbd5e1; }

.ci-ok { color: #4ade80 !important; font-weight: 600; }
.ci-fault { color: #f87171 !important; font-weight: 600; }

.ci-formula {
  font-family: monospace;
  font-size: 0.68rem;
  color: #fbbf24;
  background: rgba(0,0,0,0.2);
  padding: 0.3rem 0.4rem;
  border-radius: 0.3rem;
  margin-bottom: 0.2rem;
}

.ci-formula-desc {
  font-size: 0.6rem;
  color: #94a3b8;
}

.ci-apps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}

.ci-app-tag {
  font-size: 0.58rem;
  color: #818cf8;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  padding: 0.15rem 0.4rem;
  border-radius: 0.2rem;
}

/* Explain Calculations Button */
.bb-explain-btn {
  padding: 0.3rem 0.6rem;
  background: #1e3a5f;
  border: 1px solid #f59e0b;
  border-radius: 0.3rem;
  color: #fcd34d;
  cursor: pointer;
  font-size: 0.75rem;
  white-space: nowrap;
}

.bb-explain-btn:hover { background: #254870; }
</style>

<!-- Non-scoped styles for teleported fullscreen overlay -->
<style>
.fs-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fs-fade-in 0.2s ease;
}

@keyframes fs-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fs-container {
  background: #0d1526;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.8rem;
  width: 96%;
  max-width: 1400px;
  height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.fs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(245, 158, 11, 0.08);
}

.fs-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fcd34d;
}

.fs-close {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.3rem;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
}

.fs-close:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fff;
}

.fs-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.fs-canvas-side {
  flex: 0 0 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0f1a;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1rem;
  overflow: hidden;
}

.fs-snapshot {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.4rem;
}

.fs-calc-side {
  flex: 1;
  padding: 1rem 1.5rem;
  overflow-y: auto;
  color: #e2e8f0;
  font-size: 0.82rem;
  line-height: 1.8;
}

.fs-calc-side h3 {
  color: #fcd34d;
  font-size: 1.1rem;
  margin: 0 0 1rem;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
}

.fs-calc-side .ce-section {
  margin-bottom: 1rem;
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.fs-calc-side .ce-section h4 {
  color: #7dd3fc;
  font-size: 0.88rem;
  margin: 0 0 0.5rem;
}

.fs-calc-side .ce-section ul {
  margin: 0;
  padding-right: 1.2rem;
}

.fs-calc-side .ce-section li {
  margin-bottom: 0.25rem;
}

.fs-calc-side .ce-formula {
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 0.4rem;
  padding: 0.4rem 0.8rem;
  font-family: 'Courier New', monospace;
  font-size: 0.88rem;
  color: #7dd3fc;
  margin: 0.3rem 0;
  text-align: center;
}

.fs-calc-side .ce-calc {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  color: #a5f3fc;
  padding: 0.2rem 0.5rem;
  margin: 0.15rem 0;
}

.fs-calc-side .ce-note {
  font-size: 0.75rem;
  color: #86efac;
  padding: 0.25rem 0.5rem;
  margin: 0.3rem 0;
  background: rgba(34, 197, 94, 0.08);
  border-radius: 0.3rem;
}

.fs-calc-side .ce-summary {
  background: rgba(245, 158, 11, 0.1) !important;
  border-color: rgba(245, 158, 11, 0.25) !important;
}

.fs-calc-side .ce-summary h4 {
  color: #fcd34d !important;
}

.fs-calc-side .ce-summary li {
  font-weight: 600;
  color: #fde68a;
}

/* Scrollbar styling */
.fs-calc-side::-webkit-scrollbar {
  width: 6px;
}

.fs-calc-side::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
}

.fs-calc-side::-webkit-scrollbar-thumb {
  background: rgba(245, 158, 11, 0.3);
  border-radius: 3px;
}

.fs-calc-side::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.5);
}

/* Tool buttons in bottom bar */
.bb-tool-btn {
  padding: 0.3rem 0.5rem;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.3rem;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.72rem;
  white-space: nowrap;
}

.bb-tool-btn:hover {
  background: #334155;
  color: #e2e8f0;
}

.bb-energy {
  color: #86efac;
  font-size: 0.7rem;
}

/* Save/Load Dialogs */
.dlg-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.dlg-box {
  background: #0d1526;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0.6rem;
  width: 360px;
  max-width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

.dlg-header {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 0.9rem;
  font-weight: 600;
  color: #fcd34d;
  background: rgba(245,158,11,0.06);
  border-radius: 0.6rem 0.6rem 0 0;
}

.dlg-content {
  padding: 1rem;
}

.dlg-input {
  width: 100%;
  padding: 0.5rem 0.7rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 0.3rem;
  color: #e2e8f0;
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box;
}

.dlg-input:focus {
  border-color: #f59e0b;
}

.dlg-empty {
  text-align: center;
  color: #64748b;
  padding: 1.5rem 0;
  font-size: 0.85rem;
}

.dlg-list {
  max-height: 300px;
  overflow-y: auto;
}

.dlg-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.7rem;
  border-radius: 0.3rem;
  margin-bottom: 0.3rem;
  background: rgba(255,255,255,0.03);
}

.dlg-list-item:hover {
  background: rgba(255,255,255,0.06);
}

.dlg-item-name {
  cursor: pointer;
  color: #e2e8f0;
  font-size: 0.85rem;
  flex: 1;
}

.dlg-item-name:hover {
  color: #fcd34d;
}

.dlg-del {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.2rem;
}

.dlg-del:hover {
  background: rgba(239,68,68,0.15);
}

.dlg-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
  justify-content: flex-end;
}

.dlg-btn {
  padding: 0.4rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.82rem;
  border: 1px solid;
}

.dlg-cancel {
  background: transparent;
  border-color: rgba(255,255,255,0.15);
  color: #94a3b8;
}

.dlg-cancel:hover {
  background: rgba(255,255,255,0.05);
}

.dlg-ok {
  background: rgba(34,197,94,0.15);
  border-color: rgba(34,197,94,0.3);
  color: #86efac;
}

.dlg-ok:hover {
  background: rgba(34,197,94,0.25);
}

/* Fullscreen button in top bar */
.tb-fs-btn {
  padding: 0.25rem 0.6rem;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.3rem;
  color: #93c5fd;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.tb-fs-btn:hover {
  background: rgba(59, 130, 246, 0.25);
  color: #bfdbfe;
}

/* Fullscreen Canvas View */
.cv-fs-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  animation: cv-fs-fade 0.2s ease;
}

@keyframes cv-fs-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cv-fs-container {
  background: #0a0f1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.6rem;
  width: 96%;
  max-width: 1600px;
  height: 94vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

.cv-fs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(59, 130, 246, 0.06);
}

.cv-fs-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #93c5fd;
}

.cv-fs-actions {
  display: flex;
  gap: 0.5rem;
}

.cv-fs-btn {
  padding: 0.3rem 0.7rem;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.3rem;
  color: #93c5fd;
  cursor: pointer;
  font-size: 0.75rem;
}

.cv-fs-btn:hover {
  background: rgba(59, 130, 246, 0.25);
}

.cv-fs-close {
  padding: 0.3rem 0.7rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.3rem;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.75rem;
}

.cv-fs-close:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fff;
}

.cv-fs-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1rem;
  background: #060a12;
}

.cv-fs-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.4rem;
}
</style>
