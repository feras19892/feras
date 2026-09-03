import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../../../composables/useI18n'
import { useDevice } from '../../../../../composables/useDevice'
import { useWorkshop } from './useWorkshop'
import { useWorkshopCanvas } from './useWorkshopCanvas'
import { useResistorData } from './useResistorData'
import { useCircuitDialogs } from './useCircuitDialogs'
import { useComponentEditor } from './useComponentEditor'
import { useEditActions } from './useEditActions'
import { useSelectionSync } from './useSelectionSync'
import { useAnimationLoop } from './useAnimationLoop'
import { createRedraw, getMousePos as _getMousePos, resizeCanvas as _resizeCanvas } from './workshopRedraw'
import { exportPNG as _exportPNG, openCanvasFullscreen as _openCanvasFullscreen, printCircuit as _printCircuit } from './workshopExport'
import { useLabActions } from './useLabActions'
import { createTouchHandlers } from './useTouchEvents'
import type { WorkshopComponent, WorkshopWire } from './types'
import { buildCalcExplanation } from '../dc/dcExplainCalcs'
import { createDCCanvasState, type DCCanvasState } from '../dc/dcCanvasState'
import { createMouseEvents } from '../dc/dcMouseEvents'
import { createOtherEvents } from '../dc/dcOtherEvents'

export function useDCLab() {
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

  return {
    workshop, t, canvasRef, onMouseDown, onMouseMove, onMouseUp, onWheel, onDblClick,
    onTouchStart, onTouchMove, onTouchEnd, showValueEditor, editingComp, editValue, editRotation,
    showWireEditor, editingWire, editWireColor, editWireThickness, renderMode, showNodeNumbers,
    showReadings, showResistorTutorial, showHelp, selectedFault, showCalcExplanation, calcExplanationHtml,
    canvasSnapshot, canvasFullscreen, showExperiments, currentExperiment, elapsedSeconds, energyKWh,
    hasDanger, hasWarning, selectedCompFault, redraw, applyEditValue, applyRotate, zoomComp, zoomCompVal,
    deleteSelectedComp, deleteSelectedWire, onAddComponent, loadExp, explainCalcs, exportPNG,
    openCanvasFullscreen, printCircuit, doLoadCircuit, showSaveDialog, showLoadDialog, circuitName,
    savedCircuits, doSaveCircuit, openLoadDialog, doDeleteCircuit, toggleRun, showMNAExplanation, doExportSVG,
    resistorBandPreview, resistorBandExplanation, resistorColorChart,
  }
}
