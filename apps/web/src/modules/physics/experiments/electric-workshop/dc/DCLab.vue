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
import { useLabActions } from '../shared/useLabActions'
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
const showNodeNumbers = ref(false)
const showReadings = ref(false)
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
  get showNodeNumbers() { return showNodeNumbers.value },
  get showReadings() { return showReadings.value },
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
    if (import.meta.env.DEV) console.error('loadExperiment error:', e)
  }
  if (workshop.running.value) workshop.solve()
  redraw()
}

function explainCalcs() {
  if (!currentExperiment.value) return
  showCalcDialog(buildCalcExplanation(currentExperiment.value, workshop, t))
}

const { showMNAExplanation, showCalcDialog, doExportSVG } = useLabActions(workshop, canvasRef, canvasSnapshot, calcExplanationHtml, showCalcExplanation, redraw, zoom, 'dc-circuit.svg')

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

const { onTouchStart, onTouchMove, onTouchEnd } = createTouchHandlers(onMouseDown, onMouseMove, onMouseUp, () => dragState, { zoom, panX, panY })
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
      :on-add-component="onAddComponent"
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
        :show-value-editor="showValueEditor"
        :editing-comp="editingComp"
        :edit-value="editValue"
        :edit-rotation="editRotation"
        :show-wire-editor="showWireEditor"
        :editing-wire="editingWire"
        :edit-wire-color="editWireColor"
        :edit-wire-thickness="editWireThickness"
        :render-mode="renderMode"
        :show-node-numbers="showNodeNumbers"
        :show-readings="showReadings"
        :redraw="redraw"
        @update:edit-value="editValue = $event"
        @update:edit-rotation="editRotation = $event"
        @update:edit-wire-color="editWireColor = $event"
        @update:edit-wire-thickness="editWireThickness = $event"
        @update:render-mode="renderMode = $event; redraw()"
        @apply-edit-value="applyEditValue"
        @apply-rotate="applyRotate"
        @zoom-comp="zoomComp"
        @zoom-comp-val="zoomCompVal"
        @show-resistor-tutorial="showResistorTutorial = true"
        @delete-selected-comp="deleteSelectedComp"
        @delete-selected-wire="deleteSelectedWire"
        @open-canvas-fullscreen="openCanvasFullscreen"
        @toggle-node-numbers="showNodeNumbers = !showNodeNumbers; redraw()"
        @toggle-readings="showReadings = !showReadings; redraw()"
        @export-s-v-g="doExportSVG"
      />

      <DCBottomBar
        :t="t"
        :workshop="workshop"
        :show-experiments="showExperiments"
        :current-experiment="currentExperiment"
        :elapsed-seconds="elapsedSeconds"
        :energy-k-wh="energyKWh"
        :has-danger="hasDanger"
        :has-warning="hasWarning"
        :redraw="redraw"
        @update:show-experiments="showExperiments = $event"
        @update:current-experiment="currentExperiment = $event as any"
        @toggle-run="toggleRun"
        @load-exp="loadExp($event as any)"
        @explain-calcs="explainCalcs"
        @show-save-dialog="showSaveDialog = true"
        @open-load-dialog="openLoadDialog"
        @export-p-n-g="exportPNG"
        @print-circuit="printCircuit"
        @show-help="showHelp = true"
        @explain-m-n-a="showMNAExplanation"
        @select-fault="selectedFault = $event"
      />
    </div>

    <!-- Right: Readings Panel -->
    <DCReadingsPanel
      :t="t"
      :workshop="workshop"
      :selected-comp-fault="selectedCompFault"
      :redraw="redraw"
    />
  </div>

  <DCDialogs
    :t="t"
    :workshop="workshop"
    :show-calc-explanation="showCalcExplanation"
    :calc-explanation-html="calcExplanationHtml"
    :canvas-snapshot="canvasSnapshot"
    :show-save-dialog="showSaveDialog"
    :show-load-dialog="showLoadDialog"
    :circuit-name="circuitName"
    :saved-circuits="savedCircuits"
    :show-resistor-tutorial="showResistorTutorial"
    :editing-comp="editingComp"
    :resistor-band-preview="resistorBandPreview"
    :resistor-band-explanation="resistorBandExplanation"
    :resistor-color-chart="resistorColorChart"
    :show-help="showHelp"
    :selected-fault="selectedFault"
    :canvas-fullscreen="canvasFullscreen"
    @update:show-calc-explanation="showCalcExplanation = $event"
    @update:show-save-dialog="showSaveDialog = $event"
    @update:show-load-dialog="showLoadDialog = $event"
    @update:circuit-name="circuitName = $event"
    @update:show-resistor-tutorial="showResistorTutorial = $event"
    @update:show-help="showHelp = $event"
    @update:selected-fault="selectedFault = $event"
    @update:canvas-fullscreen="canvasFullscreen = $event"
    @do-save-circuit="doSaveCircuit"
    @do-load-circuit="doLoadCircuit"
    @do-delete-circuit="doDeleteCircuit"
    @export-p-n-g="exportPNG"
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
