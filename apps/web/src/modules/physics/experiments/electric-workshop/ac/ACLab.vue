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
import type { WorkshopComponent, WorkshopWire } from '../shared/types'
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

const dragState: ACCanvasState = { wireStart: null, junctionStart: null, tempWireEnd: { x: 0, y: 0 }, hoverWireId: null, pendingWireStart: null } as any

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

const { redraw: _redraw } = createRedraw(canvasRef, zoom, panX, panY, workshop, dragState, { worldToScreen, draw })
function redraw() { _redraw() }
function resizeCanvas() { _resizeCanvas(canvasRef, redraw) }

function onAddComponent(type: string) {
  const c = canvasRef.value; if (!c) return
  const x = c.width / 2 - panX.value
  const y = c.height / 2 - panY.value
  workshop.addComponent(type as any, x / zoom.value, y / zoom.value)
  redraw()
}

function loadExp(name: 'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance') {
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
  return { comp, spec: getSpec(comp.type) }
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
      @addComponent="onAddComponent($event)"
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
        :showValueEditor="showValueEditor"
        :editingComp="editingComp"
        :editValue="editValue"
        :editRotation="editRotation"
        :showWireEditor="showWireEditor"
        :editingWire="editingWire"
        :editWireColor="editWireColor"
        :editWireThickness="editWireThickness"
        :renderMode="renderMode"
        :showNodeNumbers="showNodeNumbers"
        :showReadings="showReadings"
        :redraw="redraw"
        @update:editValue="editValue = $event"
        @update:editRotation="editRotation = $event"
        @update:editWireColor="editWireColor = $event"
        @update:editWireThickness="editWireThickness = $event"
        @update:renderMode="renderMode = $event"
        @applyEditValue="applyEditValue"
        @applyRotate="applyRotate"
        @zoomComp="zoomComp"
        @zoomCompVal="zoomCompVal"
        @showResistorTutorial="showResistorTutorial = true"
        @deleteSelectedComp="deleteSelectedComp"
        @deleteSelectedWire="deleteSelectedWire"
        @openCanvasFullscreen="openCanvasFullscreen"
        @toggleNodeNumbers="showNodeNumbers = !showNodeNumbers; redraw()"
        @toggleReadings="showReadings = !showReadings; redraw()"
        @exportSVG="doExportSVG"
      />
      <ACBottomBar
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
        @update:currentExperiment="currentExperiment = $event"
        @toggleRun="toggleRun"
        @loadExp="loadExp"
        @explainCalcs="explainCalcs"
        @showSaveDialog="showSaveDialog = true"
        @openLoadDialog="openLoadDialog"
        @exportPNG="exportPNG"
        @printCircuit="printCircuit"
        @showHelp="showHelp = true"
        @explainMNA="showMNAExplanation"
        @selectFault="selectedFault = $event"
      />

    </div>

    <!-- Right: Readings Panel -->
    <ACReadingsPanel
      :t="t"
      :workshop="workshop"
      :selectedSpec="selectedSpec"
      :selectedCompFault="selectedCompFault"
      @selectComponent="workshop.selectedComponentId.value = $event; redraw()"
    />
  </div>

  <ACDialogs
    :t="t"
    :workshop="workshop"
    :showCalcExplanation="showCalcExplanation"
    :calcExplanationHtml="calcExplanationHtml"
    :canvasSnapshot="canvasSnapshot"
    :showSaveDialog="showSaveDialog"
    :showLoadDialog="showLoadDialog"
    :circuitName="circuitName"
    @update:circuitName="circuitName = $event"
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

