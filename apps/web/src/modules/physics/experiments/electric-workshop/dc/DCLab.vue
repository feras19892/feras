<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../../../composables/useI18n'
import { useWorkshop } from '../shared/useWorkshop'
import { useWorkshopCanvas } from '../shared/useWorkshopCanvas'
import { useResistorData } from '../shared/useResistorData'
import { useCircuitDialogs } from '../shared/useCircuitDialogs'
import { useComponentEditor } from '../shared/useComponentEditor'
import { useEditActions } from '../shared/useEditActions'
import { useSelectionSync } from '../shared/useSelectionSync'
import { useAnimationLoop } from '../shared/useAnimationLoop'
import { createRedraw, getMousePos as _getMousePos, resizeCanvas as _resizeCanvas } from '../shared/workshopRedraw'
import { exportPNG as _exportPNG, openCanvasFullscreen as _openCanvasFullscreen, printCircuit as _printCircuit } from '../shared/workshopExport'
import type { WorkshopComponent, WorkshopWire } from '../shared/types'
import DCDialogs from './DCDialogs.vue'
import DCReadingsPanel from './DCReadingsPanel.vue'
import DCPalette from './DCPalette.vue'
import DCTopBar from './DCTopBar.vue'
import DCBottomBar from './DCBottomBar.vue'
import { buildCalcExplanation } from './dcExplainCalcs'
import { createDCCanvasState, type DCCanvasState } from './dcCanvasState'
import { createMouseEvents } from './dcMouseEvents'
import { createOtherEvents } from './dcOtherEvents'
import { createTouchHandlers } from '../shared/useTouchEvents'
import { useDevice } from '../../../../../composables/useDevice'

const workshop = useWorkshop()
const device = useDevice()
const { t } = useI18n()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)

const dragState = createDCCanvasState()

const showValueEditor = ref(false)
const editingComp = ref<WorkshopComponent | null>(null)
const editValue = ref(0)
const editRotation = ref(0)

const showWireEditor = ref(false)
const editingWire = ref<WorkshopWire | null>(null)
const editWireColor = ref('')
const editWireThickness = ref(3)

const showExperiments = ref(false)
const currentExperiment = ref<'ohm' | 'series' | 'parallel' | 'mixed' | 'kvl' | 'kcl' | 'vdivider' | 'cdivider' | 'bseries' | 'bparallel' | 'relay' | 'rc_charge' | 'rl_transient' | 'wheatstone' | 'thevenin' | 'superposition' | 'maxpower' | null>(null)
const showCalcExplanation = ref(false)
const calcExplanationHtml = ref('')
const canvasSnapshot = ref('')
const runStartTime = ref(0)
const canvasFullscreen = ref(false)
const renderMode = ref<'3d' | '2d'>('3d')
const showResistorTutorial = ref(false)
const showHelp = ref(false)
const selectedFault = ref<any>(null)

watch(() => workshop.faults.value, (newFaults) => {
  if (selectedFault.value && !newFaults.some(f => f.componentId === selectedFault.value.componentId && f.type === selectedFault.value.type)) {
    selectedFault.value = null
  }
})

const { resistorBandPreview, resistorBandExplanation, resistorColorChart } = useResistorData(editingComp)
const { showSaveDialog, showLoadDialog, circuitName, savedCircuits, doSaveCircuit, openLoadDialog, doDeleteCircuit } = useCircuitDialogs(workshop)

const animTime = ref(0)
const wireCurrents = computed(() => {
  const map = new Map<number, number>()
  for (const wire of workshop.wires) {
    const fromComp = workshop.components.find(c => c.id === wire.fromCompId)
    if (fromComp) map.set(wire.id, fromComp.current)
  }
  return map
})

const canvasProps = {
  get components() { return workshop.components },
  get wires() { return workshop.wires },
  get running() { return workshop.running.value },
  get selectedWireColor() { return workshop.selectedWireColor.value },
  get renderMode() { return renderMode.value },
  get animTime() { return animTime.value },
  get wireCurrents() { return wireCurrents.value },
  t,
}

const { worldToScreen, screenToWorld, hitTestComponent, hitTestTerminal: _hitTestTerminal, hitTestWire, hitTestWireJunction, hitTestWireSegment, hitTestProbe, hitTestClamp, draw } = useWorkshopCanvas(
  zoom, panX, panY, canvasProps,
)

const hitTestTerminal = (sx: number, sy: number) => _hitTestTerminal(sx, sy, device.value.hitRadius)

const { redraw } = createRedraw(canvasRef, zoom, panX, panY, workshop, dragState, { worldToScreen, draw })
function resizeCanvas() { _resizeCanvas(canvasRef, redraw) }
function getMousePos(e: MouseEvent): [number, number] { return _getMousePos(canvasRef, e) }

function onAddComponent(type: string) {
  const c = canvasRef.value; if (!c) return
  const x = c.width / 2 - panX.value
  const y = c.height / 2 - panY.value
  workshop.addComponent(type as any, x / zoom.value, y / zoom.value)
  redraw()
}

function loadExp(name: 'ohm' | 'series' | 'parallel' | 'mixed' | 'kvl' | 'kcl' | 'vdivider' | 'cdivider' | 'bseries' | 'bparallel' | 'relay' | 'rc_charge' | 'rl_transient' | 'wheatstone' | 'thevenin' | 'superposition' | 'maxpower') {
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
  calcExplanationHtml.value = buildCalcExplanation(currentExperiment.value, workshop, t)
  showCalcExplanation.value = true
}

const editor = useComponentEditor(workshop, redraw, selectedFault)
const applyEditValue = () => editor.applyEditValue(editingComp, editValue)
const applyRotate = () => editor.applyRotate(editingComp, editRotation)
const zoomComp = (delta: number) => editor.zoomComp(editingComp, delta)
const zoomCompVal = (val: number) => editor.zoomCompVal(editingComp, val)
const deleteSelectedComp = () => editor.deleteSelectedComp()
const deleteSelectedWire = () => editor.deleteSelectedWire(showWireEditor, editingWire)
const { elapsedSeconds, energyKWh, toggleRun } = useAnimationLoop(workshop, redraw, runStartTime, animTime)

useEditActions(workshop, redraw, editingComp, editValue, editRotation, editingWire, editWireColor, editWireThickness, showValueEditor, showWireEditor)

watch(() => [workshop.components, workshop.wires, workshop.running.value], redraw, { deep: true })

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('keydown', onKeyDown)
})

const canvasState = Object.assign(dragState, {
  canvasRef, zoom, panX, panY, renderMode, workshop, t,
  editingWire, editWireColor, editWireThickness, showWireEditor,
  toggleRun,
  worldToScreen, screenToWorld, hitTestComponent, hitTestTerminal,
  hitTestWire, hitTestWireJunction, hitTestWireSegment, hitTestProbe, hitTestClamp,
  draw, redraw, getMousePos,
}) as DCCanvasState

const { onMouseDown, onMouseMove, onMouseUp } = createMouseEvents(canvasState)
const { onWheel, onDblClick, onKeyDown } = createOtherEvents(canvasState)

const { onTouchStart, onTouchMove, onTouchEnd } = createTouchHandlers(onMouseDown, onMouseMove, onMouseUp, () => dragState)
const hasDanger = computed(() => workshop.faults.value.some(f => f.severity === 'danger'))
const hasWarning = computed(() => workshop.faults.value.some(f => f.severity === 'warning'))
const selectedCompFault = computed(() => {
  if (!workshop.selectedComponentId.value) return null
  const fault = workshop.faults.value.find(f => f.componentId === workshop.selectedComponentId.value)
  return fault ? t(fault.messageKey, fault.vars ?? {}) : null
})

function exportPNG() { _exportPNG(canvasRef) }
function openCanvasFullscreen() { _openCanvasFullscreen(canvasRef, canvasSnapshot, canvasFullscreen) }
function printCircuit() { _printCircuit(canvasRef, workshop, t) }

function doLoadCircuit(name: string) {
  workshop.loadCircuit(name)
  showLoadDialog.value = false
  currentExperiment.value = null
  if (workshop.running.value) workshop.solve()
  redraw()
}

useSelectionSync(workshop, editingComp, editValue, editRotation, showValueEditor, editingWire, editWireColor, editWireThickness, showWireEditor)

</script>

<template>
  <div class="dc-lab">
    <!-- Left: Component Palette -->
    <DCPalette
      :t="t"
      :workshop="workshop"
      :onAddComponent="onAddComponent"
    />

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
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend.prevent="onTouchEnd"
      ></canvas>

      <DCTopBar
        :t="t"
        :workshop="workshop"
        :showValueEditor="showValueEditor"
        :editingComp="editingComp"
        :editValue="editValue"
        :editRotation="editRotation"
        :showWireEditor="showWireEditor"
        :editingWire="editingWire"
        :editWireColor="editWireColor"
        :editWireThickness="editWireThickness"
        :renderMode="renderMode"
        :redraw="redraw"
        @update:editValue="editValue = $event"
        @update:editRotation="editRotation = $event"
        @update:editWireColor="editWireColor = $event"
        @update:editWireThickness="editWireThickness = $event"
        @update:renderMode="renderMode = $event; redraw()"
        @applyEditValue="applyEditValue"
        @applyRotate="applyRotate"
        @zoomComp="zoomComp"
        @zoomCompVal="zoomCompVal"
        @showResistorTutorial="showResistorTutorial = true"
        @deleteSelectedComp="deleteSelectedComp"
        @deleteSelectedWire="deleteSelectedWire"
        @openCanvasFullscreen="openCanvasFullscreen"
      />

      <DCBottomBar
        :t="t"
        :workshop="workshop"
        :showExperiments="showExperiments"
        :currentExperiment="currentExperiment"
        :elapsedSeconds="elapsedSeconds"
        :energyKWh="energyKWh"
        :hasDanger="hasDanger"
        :hasWarning="hasWarning"
        :redraw="redraw"
        @update:showExperiments="showExperiments = $event"
        @update:currentExperiment="currentExperiment = $event as any"
        @toggleRun="toggleRun"
        @loadExp="loadExp($event as any)"
        @explainCalcs="explainCalcs"
        @showSaveDialog="showSaveDialog = true"
        @openLoadDialog="openLoadDialog"
        @exportPNG="exportPNG"
        @printCircuit="printCircuit"
        @showHelp="showHelp = true"
        @selectFault="selectedFault = $event"
      />
    </div>

    <!-- Right: Readings Panel -->
    <DCReadingsPanel
      :t="t"
      :workshop="workshop"
      :selectedCompFault="selectedCompFault"
      :redraw="redraw"
    />
  </div>

  <DCDialogs
    :t="t"
    :workshop="workshop"
    :showCalcExplanation="showCalcExplanation"
    :calcExplanationHtml="calcExplanationHtml"
    :canvasSnapshot="canvasSnapshot"
    :showSaveDialog="showSaveDialog"
    :showLoadDialog="showLoadDialog"
    :circuitName="circuitName"
    :savedCircuits="savedCircuits"
    :showResistorTutorial="showResistorTutorial"
    :editingComp="editingComp"
    :resistorBandPreview="resistorBandPreview"
    :resistorBandExplanation="resistorBandExplanation"
    :resistorColorChart="resistorColorChart"
    :showHelp="showHelp"
    :selectedFault="selectedFault"
    :canvasFullscreen="canvasFullscreen"
    @update:showCalcExplanation="showCalcExplanation = $event"
    @update:showSaveDialog="showSaveDialog = $event"
    @update:showLoadDialog="showLoadDialog = $event"
    @update:circuitName="circuitName = $event"
    @update:showResistorTutorial="showResistorTutorial = $event"
    @update:showHelp="showHelp = $event"
    @update:selectedFault="selectedFault = $event"
    @update:canvasFullscreen="canvasFullscreen = $event"
    @doSaveCircuit="doSaveCircuit"
    @doLoadCircuit="doLoadCircuit"
    @doDeleteCircuit="doDeleteCircuit"
    @exportPNG="exportPNG"
  />
</template>

<style scoped src="./dcLabScoped.css"></style>

<!-- Component layout styles (non-scoped so they apply to child components) -->
<style src="./dcLabLayout.css"></style>

<!-- Shared workshop styles (non-scoped so they apply to child components) -->
<style src="../shared/workshopTopBar.css"></style>
<style src="../shared/workshopBottomBar.css"></style>
<style src="../shared/workshopPalette.css"></style>
<style src="../shared/workshopCanvas.css"></style>
<style src="../shared/workshopFaults.css"></style>
<style src="../shared/workshopReadings.css"></style>

<!-- Non-scoped styles for teleported fullscreen overlay -->
<style src="../shared/workshopOverlays.css"></style>
<style src="../shared/workshopDialogs.css"></style>
<style src="../shared/workshopFullscreen.css"></style>
<style src="../shared/workshopResistor.css"></style>
