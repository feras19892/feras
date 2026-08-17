<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../../../composables/useI18n'
import { useWorkshop } from '../shared/useWorkshop'
import { useWorkshopCanvas } from '../shared/useWorkshopCanvas'
import { getSpec } from '../shared/componentSpecs'
import { useResistorData } from '../shared/useResistorData'
import { useCircuitDialogs } from '../shared/useCircuitDialogs'
import { useComponentEditor } from '../shared/useComponentEditor'
import { useEditActions } from '../shared/useEditActions'
import { useSelectionSync } from '../shared/useSelectionSync'
import { useAnimationLoop } from '../shared/useAnimationLoop'
import { createRedraw, resizeCanvas as _resizeCanvas } from '../shared/workshopRedraw'
import { exportPNG as _exportPNG, openCanvasFullscreen as _openCanvasFullscreen, printCircuit as _printCircuit } from '../shared/workshopExport'
import { useLabActions } from '../shared/useLabActions'
import type { WorkshopComponent, WorkshopWire, FaultInfo } from '../shared/types'
import { buildACCalcExplanation } from './acExplainCalcs'
import { createACCanvasState, type ACCanvasState } from './acCanvasState'
import { onMouseDown, onMouseMove, onMouseUp } from './acMouseEvents'
import { onWheel, onDblClick, onTouchStart, onTouchMove, onTouchEnd, onKeyDown } from './acOtherEvents'
import { useDevice } from '../../../../../composables/useDevice'
import ACDialogs from './ACDialogs.vue'
import ACReadingsPanel from './ACReadingsPanel.vue'
import ACPalette from './ACPalette.vue'
import ACTopBar from './ACTopBar.vue'
import ACBottomBar from './ACBottomBar.vue'

const workshop = useWorkshop('ac')
const device = useDevice()
const { t } = useI18n()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)

const dragState = { wireStart: null, junctionStart: null, tempWireEnd: { x: 0, y: 0 }, hoverWireId: null, pendingWireStart: null } as unknown as ACCanvasState

const showValueEditor = ref(false)
const editingComp = ref<WorkshopComponent | null>(null)
const editValue = ref(0)
const editRotation = ref(0)

const showWireEditor = ref(false)
const editingWire = ref<WorkshopWire | null>(null)
const editWireColor = ref('')
const editWireThickness = ref(3)

const showExperiments = ref(false)
const currentExperiment = ref<'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance' | null>(null)
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
const selectedFault = ref<FaultInfo | null>(null)

watch(() => workshop.faults.value, (newFaults) => {
  const sf = selectedFault.value;
  if (sf && !newFaults.some(f => f.componentId === sf.componentId && f.type === sf.type)) {
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

const { redraw: _redraw } = createRedraw(canvasRef, zoom, panX, panY, workshop, dragState, { worldToScreen, draw })
function redraw() { _redraw() }
function resizeCanvas() { _resizeCanvas(canvasRef, redraw) }

function onAddComponent(type: string) {
  const c = canvasRef.value; if (!c) return
  const x = c.width / 2 - panX.value
  const y = c.height / 2 - panY.value
  workshop.addComponent(type as unknown as WorkshopComponent['type'], x / zoom.value, y / zoom.value)
  redraw()
}

function loadExp(name: 'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance') {
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
  showCalcDialog(buildACCalcExplanation(currentExperiment.value, workshop))
}

const editor = useComponentEditor(workshop, redraw, selectedFault)
const applyEditValue = () => editor.applyEditValue(editingComp, editValue)
const applyRotate = () => editor.applyRotate(editingComp, editRotation)
const zoomComp = (delta: number) => editor.zoomComp(editingComp, delta)
const zoomCompVal = (val: number) => editor.zoomCompVal(editingComp, val)
const deleteSelectedComp = () => editor.deleteSelectedComp()
const deleteSelectedWire = () => editor.deleteSelectedWire(showWireEditor, editingWire)
useEditActions(workshop, redraw, editingComp, editValue, editRotation, editingWire, editWireColor, editWireThickness, showValueEditor, showWireEditor)

const { elapsedSeconds, energyKWh, toggleRun } = useAnimationLoop(workshop, redraw, runStartTime, animTime)

Object.assign(dragState, createACCanvasState(workshop, zoom, panX, panY, canvasRef, { worldToScreen, screenToWorld, hitTestComponent, hitTestTerminal, hitTestWire, hitTestWireJunction, hitTestWireSegment, hitTestProbe, hitTestClamp, draw }, redraw, toggleRun, editingWire, editWireColor, editWireThickness, showWireEditor))

const hasDanger = computed(() => workshop.faults.value.some(f => f.severity === 'danger'))
const hasWarning = computed(() => workshop.faults.value.some(f => f.severity === 'warning'))

function exportPNG() { _exportPNG(canvasRef) }
function openCanvasFullscreen() { _openCanvasFullscreen(canvasRef, canvasSnapshot, canvasFullscreen) }
function printCircuit() { _printCircuit(canvasRef, workshop, t) }
const { showMNAExplanation, showCalcDialog, doExportSVG } = useLabActions(workshop, canvasRef, canvasSnapshot, calcExplanationHtml, showCalcExplanation, redraw, zoom, 'ac-circuit.svg')

function doLoadCircuit(name: string) {
  workshop.loadCircuit(name)
  showLoadDialog.value = false
  currentExperiment.value = null
  if (workshop.running.value) workshop.solve()
  redraw()
}

const selectedSpec = computed(() => {
  if (!workshop.selectedComponentId.value) return null
  const comp = workshop.components.find(c => c.id === workshop.selectedComponentId.value)
  if (!comp) return null
  const spec = getSpec(comp.type)
  if (!spec) return null
  return { comp, spec }
})
const selectedCompFault = computed(() => {
  if (!workshop.selectedComponentId.value) return null
  const fault = workshop.faults.value.find(f => f.componentId === workshop.selectedComponentId.value)
  return fault ? t(fault.messageKey, fault.vars ?? {}) : null
})

useSelectionSync(workshop, editingComp, editValue, editRotation, showValueEditor, editingWire, editWireColor, editWireThickness, showWireEditor)

watch(() => [workshop.components, workshop.wires, workshop.running.value], redraw, { deep: true })

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('keydown', (e) => onKeyDown(dragState, e))
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('keydown', (e) => onKeyDown(dragState, e))
})
</script>

<template>
  <div class="ac-lab">
    <ACPalette
      :t="t"
      :workshop="workshop"
      @add-component="onAddComponent($event)"
    />

    <!-- Center: Canvas -->
    <div class="ac-canvas-wrap">
      <canvas
        ref="canvasRef"
        class="ac-canvas"
        @mousedown="(e) => onMouseDown(dragState, e)"
        @mousemove="(e) => onMouseMove(dragState, e)"
        @mouseup="(e) => onMouseUp(dragState, e)"
        @mouseleave="(e) => onMouseUp(dragState, e)"
        @wheel.prevent="(e) => onWheel(dragState, e)"
        @dblclick="(e) => onDblClick(dragState, e)"
        @touchstart.prevent="(e) => onTouchStart(dragState, e)"
        @touchmove.prevent="(e) => onTouchMove(dragState, e)"
        @touchend.prevent="(e) => onTouchEnd(dragState, e)"
      ></canvas>

      <ACTopBar
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
        @update:render-mode="renderMode = $event"
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
      <ACBottomBar
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
        @update:current-experiment="currentExperiment = $event"
        @toggle-run="toggleRun"
        @load-exp="loadExp"
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
    <ACReadingsPanel
      :t="t"
      :workshop="workshop"
      :selected-spec="selectedSpec"
      :selected-comp-fault="selectedCompFault"
      @select-component="workshop.selectedComponentId.value = $event; redraw()"
    />
  </div>

  <ACDialogs
    :t="t"
    :workshop="workshop"
    :show-calc-explanation="showCalcExplanation"
    :calc-explanation-html="calcExplanationHtml"
    :canvas-snapshot="canvasSnapshot"
    :show-save-dialog="showSaveDialog"
    :show-load-dialog="showLoadDialog"
    :circuit-name="circuitName"
    @update:circuit-name="circuitName = $event"
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

<style scoped src="./acLabScoped.css"></style>
<style src="./acLabLayout.css"></style>
<style src="../shared/workshopTopBar.css"></style>
<style src="../shared/workshopBottomBar.css"></style>
<style src="../shared/workshopPalette.css"></style>
<style src="../shared/workshopCanvas.css"></style>
<style src="../shared/workshopFaults.css"></style>
<style src="../shared/workshopReadings.css"></style>
<style src="../shared/workshopOverlays.css"></style>
<style src="../shared/workshopDialogs.css"></style>
<style src="../shared/workshopFullscreen.css"></style>
<style src="../shared/workshopResistor.css"></style>

