import { ref, reactive, computed, watch } from 'vue'
import type { WorkshopComponent, WorkshopWire, ComponentType, SolveResult, FaultInfo, TransientResult } from './types'
import { WIRE_COLORS } from './types'
import { solve as solverSolve, solveAC as solverSolveAC, solveTransient as solverSolveTransient, solveTransientDC as solverSolveTransientDC, getPower as solverGetPower, type SolverContext } from './workshopSolver'
import {
  STORAGE_KEY_DC, STORAGE_KEY_AC,
  saveState, loadState, saveCircuit as storageSaveCircuit,
  getSavedCircuits as storageGetSavedCircuits,
  deleteCircuit as storageDeleteCircuit,
  loadCircuitData,
} from './workshopStorage'
import { WorkshopHistory } from './workshopHistory'
import { loadDCExperiment, type ExperimentName } from './workshopExperimentsDC'
import { loadACExperiment, type ACExperimentName } from './workshopExperimentsAC'
import * as compOps from './workshopComponents'
import * as wireOps from './workshopWires'

export function useWorkshop(labId: 'dc' | 'ac' = 'dc') {
  const storageKey = labId === 'ac' ? STORAGE_KEY_AC : STORAGE_KEY_DC
  const saved = loadState(storageKey)
  const idCounterRef = { value: saved?.idCounter || 1 }

  const components = reactive<WorkshopComponent[]>(saved?.components ?? [])
  const wires = reactive<WorkshopWire[]>(saved?.wires ?? [])
  const running = ref(false)
  const selectedComponentId = ref<number | null>(null)
  const selectedWireId = ref<number | null>(null)
  const selectedWireColor = ref(WIRE_COLORS.blue)
  const selectedWireThickness = ref(3)
  const solveResult = ref<SolveResult | null>(null)
  const error = ref('')
  const faults = ref<FaultInfo[]>([])

  const history = new WorkshopHistory(
    () => components,
    () => wires,
    () => idCounterRef.value,
    (n) => { idCounterRef.value = n },
  )

  function pushUndo() { history.pushUndo() }

  function undo() {
    history.undo(components, wires)
    selectedComponentId.value = null
    selectedWireId.value = null
    if (running.value) solve()
  }

  function redo() {
    history.redo(components, wires)
    selectedComponentId.value = null
    selectedWireId.value = null
    if (running.value) solve()
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  watch([() => [...components], () => [...wires]], () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => saveState(components, wires, storageKey, idCounterRef.value), 500)
  }, { deep: true })

  const compCtx: compOps.ComponentOpsContext = {
    components, wires, idCounter: idCounterRef,
    selectedComponentId,
    selectedWireThickness,
    pushUndo,
    addWire: (fc, ft, tc, tt, c, mp?) => addWire(fc, ft, tc, tt, c, mp),
    rerouteAllWires: () => rerouteAllWires(),
  }

  const wireCtx: wireOps.WireOpsContext = {
    components, wires, idCounter: idCounterRef,
    selectedWireId, selectedWireThickness,
    pushUndo,
  }

  function addComponent(type: ComponentType, x: number, y: number) {
    compOps.addComponent(compCtx, type, x, y)
  }
  function moveComponent(id: number, x: number, y: number) {
    compOps.moveComponent(compCtx, id, x, y)
  }
  function rotateComponent(id: number) {
    compOps.rotateComponent(compCtx, id)
  }
  function setComponentScale(id: number, scale: number) {
    compOps.setComponentScale(compCtx, id, scale)
  }
  function removeComponent(id: number) {
    compOps.removeComponent(compCtx, id)
    if (running.value) solve()
  }
  function insertAmmeterIntoWire(wireId: number, ammeterId: number) {
    compOps.insertAmmeterIntoWire(compCtx, wireId, ammeterId)
  }
  function updateComponentValue(id: number, value: number) {
    compOps.updateComponentValue(compCtx, id, value)
  }
  function toggleSwitch(id: number) {
    compOps.toggleSwitch(compCtx, id)
  }
  function setMultimeterMode(id: number, mode: 'voltage' | 'current' | 'resistance') {
    compOps.setMultimeterMode(compCtx, id, mode, running.value, solve)
  }
  function resetBreaker(id: number) {
    compOps.resetBreaker(compCtx, id)
  }
  function resetFuse(id: number) {
    compOps.resetFuse(compCtx, id)
  }

  function addWire(
    fromCompId: number, fromTermIndex: number,
    toCompId: number, toTermIndex: number,
    color: string,
    manualPoints?: { x: number; y: number }[],
  ) {
    wireOps.addWire(wireCtx, fromCompId, fromTermIndex, toCompId, toTermIndex, color, manualPoints)
  }
  function addWireFromJunction(
    fromWireId: number, fromPointIndex: number,
    toCompId: number, toTermIndex: number,
    color: string,
  ) {
    wireOps.addWireFromJunction(wireCtx, fromWireId, fromPointIndex, toCompId, toTermIndex, color)
  }
  function removeWire(id: number) {
    wireOps.removeWire(wireCtx, id)
    if (running.value) solve()
  }
  function updateWireColor(id: number, color: string) {
    wireOps.updateWireColor(wireCtx, id, color)
  }
  function updateWireThickness(id: number, thickness: number) {
    wireOps.updateWireThickness(wireCtx, id, thickness)
  }
  function moveWirePoint(wireId: number, pointIndex: number, x: number, y: number) {
    wireOps.moveWirePoint(wireCtx, wireId, pointIndex, x, y)
  }
  function rerouteAllWires() {
    wireOps.rerouteAllWires(wireCtx)
  }
  function rerouteWiresForComponent(compId: number) {
    wireOps.rerouteWiresForComponent(wireCtx, compId)
  }

  function clearAll() {
    pushUndo()
    components.splice(0, components.length)
    wires.splice(0, wires.length)
    selectedComponentId.value = null
    selectedWireId.value = null
    solveResult.value = null
    error.value = ''
    faults.value = []
    try { localStorage.removeItem(storageKey) } catch (e) { /* ignore */ }
  }

  function saveCircuit(name: string): boolean {
    return storageSaveCircuit(name, components, wires, idCounterRef.value)
  }

  function loadCircuit(name: string): boolean {
    pushUndo()
    const data = loadCircuitData(name)
    if (!data) return false
    clearAll()
    idCounterRef.value = data.idCounter ?? 1
    for (const c of data.components) {
      components.push({ ...c, terminals: c.terminals.map((t: any) => ({ ...t })) })
    }
    for (const w of data.wires) {
      wires.push({ ...w, points: [...w.points] })
    }
    if (running.value) solve()
    return true
  }

  function getSavedCircuits(): string[] {
    return storageGetSavedCircuits()
  }

  function deleteCircuit(name: string): boolean {
    return storageDeleteCircuit(name)
  }

  function loadExperiment(name: ExperimentName | ACExperimentName) {
    pushUndo()
    clearAll()

    const ctx = { components, wires, addComponent, rotateComponent, addWire }

    const dcNames: string[] = ['ohm', 'series', 'parallel', 'mixed', 'kvl', 'kcl', 'vdivider', 'cdivider', 'bseries', 'bparallel', 'relay', 'rc_charge', 'rl_transient', 'wheatstone', 'thevenin', 'superposition', 'maxpower']
    const acNames: string[] = ['ac_rl', 'ac_rc', 'ac_rlc', 'ac_transformer', 'ac_filter', 'ac_powerfactor', 'ac_resonance']

    if (dcNames.includes(name)) {
      loadDCExperiment(name as ExperimentName, ctx)
    } else if (acNames.includes(name)) {
      loadACExperiment(name as ACExperimentName, ctx)
    }

    const firstBat = components.find(c => c.type === 'battery')
    const hasGround = components.some(c => c.type === 'ground')
    if (firstBat && !hasGround) {
      const negTerm = firstBat.terminals.find(t => t.index === 1)
      if (negTerm) {
        const gx = firstBat.x + negTerm.dx + 40
        const gy = firstBat.y + negTerm.dy + 40
        addComponent('ground', gx, gy)
        const gnd = components[components.length - 1]
        addWire(gnd.id, 0, firstBat.id, 1, WIRE_COLORS.black, [])
      }
    }

    selectedComponentId.value = null
    selectedWireId.value = null
  }

  function run() {
    running.value = true
    if (isACMode.value) {
      solveAC()
      solveTransient()
    } else {
      solve()
      solveTransientDC()
    }
  }

  function stop() {
    running.value = false
    for (const comp of components) {
      comp.voltage = 0
      comp.current = 0
    }
    faults.value = []
  }

  const isACMode = computed(() => components.some(c => c.type === 'acsource'))

  const solverCtx: SolverContext = {
    components, wires, solveResult, error, faults, isACMode,
  }

  function solve() { solverSolve(solverCtx) }
  function solveAC() { solverSolveAC(solverCtx) }
  function solveTransient(): TransientResult | null { return solverSolveTransient(solverCtx) }
  function solveTransientDC(): TransientResult | null { return solverSolveTransientDC(solverCtx) }
  function getPower(comp: WorkshopComponent): number { return solverGetPower(comp) }

  const totalPower = computed(() => {
    let p = 0
    for (const comp of components) {
      if (comp.type === 'resistor' || comp.type === 'lamp' || comp.type === 'led' || comp.type === 'motor' || comp.type === 'potentiometer') p += getPower(comp)
      if (comp.type === 'relay') p += getPower(comp)
    }
    return p
  })

  const totalCurrent = computed(() => {
    for (const comp of components) {
      if (comp.type === 'battery' || comp.type === 'acsource') {
        return Math.abs(comp.current)
      }
    }
    return 0
  })

  const totalVoltage = computed(() => {
    const sources = components.filter(c => c.type === 'battery' || c.type === 'acsource')
    if (sources.length === 0) return 0
    if (sources.length === 1) return sources[0].value
    const allSameNode = sources.every((s, i, arr) => {
      if (i === 0) return true
      return s.terminals[0]?.nodeId === arr[0].terminals[0]?.nodeId &&
             s.terminals[1]?.nodeId === arr[0].terminals[1]?.nodeId
    })
    if (allSameNode) {
      return Math.max(...sources.map(s => s.value))
    }
    return sources.reduce((sum, s) => sum + s.value, 0)
  })

  return {
    components, wires, running,
    selectedComponentId, selectedWireId, selectedWireColor,
    solveResult, error,
    addComponent, moveComponent, rotateComponent, setComponentScale,
    removeComponent, insertAmmeterIntoWire,
    updateComponentValue, toggleSwitch, setMultimeterMode,
    resetBreaker, resetFuse,
    addWire, addWireFromJunction, removeWire,
    updateWireColor, updateWireThickness, moveWirePoint,
    rerouteAllWires, rerouteWiresForComponent,
    clearAll, saveCircuit, loadCircuit, getSavedCircuits, deleteCircuit,
    loadExperiment, run, stop, solve, solveAC, solveTransient, solveTransientDC,
    isACMode, faults, selectedWireThickness,
    getPower, totalPower, totalCurrent, totalVoltage,
    undo, redo, pushUndo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  }
}
