import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { CircuitComponent, ComponentType, Trial } from './types'
import { presetDefs } from './electricLabPresets'
import { createComputeds } from './electricLabComputeds'
import { createExporter } from './electricLabExport'
import { createRecordTrial } from './electricLabRecordTrial'
import { useElectricLabRC } from './useElectricLabRC'

export function useElectricLab() {
  const components = reactive<CircuitComponent[]>([])
  const running = ref(false)
  const trials = ref<Trial[]>([])
  let nextId = 1

  const componentDefs: Record<ComponentType, { label: string; defaultValue: number; unit: string; icon: string }> = {
    battery:      { label: 'بطارية',      defaultValue: 6,     unit: 'V',  icon: '🔋' },
    resistor:     { label: 'مقاومة',      defaultValue: 100,   unit: 'Ω',  icon: '🔲' },
    ammeter:      { label: 'أميتر',       defaultValue: 0,     unit: 'A',  icon: '📊' },
    voltmeter:    { label: 'فولتميتر',    defaultValue: 0,     unit: 'V',  icon: '📈' },
    wire:         { label: 'سلك',         defaultValue: 0,     unit: '',   icon: '➖' },
    capacitor:    { label: 'مكثف',        defaultValue: 100,   unit: 'µF', icon: '🔌' },
    switch:       { label: 'مفتاح',       defaultValue: 0,     unit: '',   icon: '🔘' },
    lamp:         { label: 'مصباح',       defaultValue: 6,     unit: 'V',  icon: '💡' },
    galvanometer: { label: 'جلفانوميتر',  defaultValue: 0,     unit: 'µA', icon: '📐' },
  }

  function addComponent(type: ComponentType, x: number, y: number) {
    const def = componentDefs[type]
    components.push({ id: nextId++, type, x, y, label: def.label, value: def.defaultValue, unit: def.unit })
  }

  function removeComponent(id: number) {
    const idx = components.findIndex(comp => comp.id === id)
    if (idx >= 0) components.splice(idx, 1)
  }

  function updateComponent(id: number, value: number) {
    const comp = components.find(c => c.id === id)
    if (comp) comp.value = value
  }

  function moveComponent(id: number, x: number, y: number) {
    const comp = components.find(c => c.id === id)
    if (comp) { comp.x = x; comp.y = y }
  }

  const activePresetId = ref<string | null>(null)
  const c = createComputeds(components, running, activePresetId)
  const rc = useElectricLabRC(components, running, activePresetId)
  const isRC = rc.isRC

  const MATERIALS = [
    { name: 'نحاس (Copper)',   rho: 1.68e-8,  color: '#b87333' },
    { name: 'ألمنيوم (Aluminum)', rho: 2.82e-8,  color: '#a0a0a0' },
    { name: 'حديد (Iron)',     rho: 9.71e-8,   color: '#8b4513' },
    { name: 'تنجستن (Tungsten)', rho: 5.6e-8,  color: '#4a4a4a' },
    { name: 'نيكل (Nickel)',   rho: 6.99e-8,   color: '#c0c0c0' },
  ]

  function toggleRun() {
    running.value = !running.value
    if (isRC.value) { if (running.value) rc.startRC(); else rc.stopRC() }
  }

  const { recordTrial } = createRecordTrial({
    components, running, trials,
    voltage: c.voltage, current: c.current, resistance: c.resistance,
    kirchhoffData: c.kirchhoffData, parallelData: c.parallelData, powerData: c.powerData,
    resistivityData: c.resistivityData, lampData: c.lampData, galvanometerData: c.galvanometerData,
    wheatstoneData: c.wheatstoneData, voltageDividerData: c.voltageDividerData,
    isPower: c.isPower, isResistivity: c.isResistivity, isKirchhoff: c.isKirchhoff,
    isLamp: c.isLamp, isGalvanometer: c.isGalvanometer, isWheatstone: c.isWheatstone,
    isVoltageDivider: c.isVoltageDivider, isRC,
    isInternalResistance: c.isInternalResistance, isSeries: c.isSeries, isNonOhmic: c.isNonOhmic,
    isCapacitorsCombo: c.isCapacitorsCombo, isCapacitorsSeries: c.isCapacitorsSeries, isPotentiometer: c.isPotentiometer, isMaxPower: c.isMaxPower,
    isJoulesLaw: c.isJoulesLaw,
    isAmmeterVoltmeter: c.isAmmeterVoltmeter,
    isCompound: c.isCompound, isEMF: c.isEMF, isTempR: c.isTempR,
    isCellsSeries: c.isCellsSeries, isCellsParallel: c.isCellsParallel, isRheostat: c.isRheostat,
    isCurrentDivider: c.isCurrentDivider, isSourceEff: c.isSourceEff, isTwoSources: c.isTwoSources,
    isDiodeIV: c.isDiodeIV, isTransformer: c.isTransformer, isSelfInd: c.isSelfInd,
    isThermistor: c.isThermistor, isMagneticForce: c.isMagneticForce, isLCOsc: c.isLCOsc,
    rcVoltage: rc.rcVoltage, rcCurrent: rc.rcCurrent, rcData: rc.rcData,
    internalResistanceData: c.internalResistanceData, seriesData: c.seriesData, nonOhmicData: c.nonOhmicData,
    capacitorsComboData: c.capacitorsComboData, potentiometerData: c.potentiometerData,
    maxPowerData: c.maxPowerData,
    joulesData: c.joulesData,
    ammeterVoltmeterData: c.ammeterVoltmeterData,
    compoundData: c.compoundData, emfData: c.emfData, tempRData: c.tempRData,
    cellsSeriesData: c.cellsSeriesData, cellsParallelData: c.cellsParallelData, rheostatData: c.rheostatData,
    currentDividerData: c.currentDividerData, sourceEffData: c.sourceEffData, twoSourcesData: c.twoSourcesData,
    diodeData: c.diodeData, transformerData: c.transformerData, selfIndData: c.selfIndData,
    thermistorData: c.thermistorData, magneticForceData: c.magneticForceData, lcOscData: c.lcOscData,
  })

  function clearTrials() { trials.value = [] }

  function reset() {
    running.value = false; rc.stopRC(); components.splice(0); trials.value = []; nextId = 1
  }

  const presets = presetDefs.map(p => ({
    id: p.id, name: p.name, nameAr: p.nameAr, level: p.level, instructions: p.instructions,
    build: () => { p.build(components, reset) },
  }))

  const activeInstructions = computed(() => {
    if (!activePresetId.value) return []
    return presets.find(p => p.id === activePresetId.value)?.instructions ?? []
  })

  function loadPreset(id: string) {
    const p = presets.find(p => p.id === id)
    if (p) { p.build(); activePresetId.value = id }
  }

  const router = useRouter()
  const { exportToAnalysis } = createExporter(router, {
    trials, isKirchhoff: c.isKirchhoff, isParallel: c.isParallel, isPower: c.isPower,
    isLamp: c.isLamp, isGalvanometer: c.isGalvanometer, isWheatstone: c.isWheatstone,
    isVoltageDivider: c.isVoltageDivider, isResistivity: c.isResistivity, isRC,
    isInternalResistance: c.isInternalResistance, isSeries: c.isSeries,
    isCapacitorsCombo: c.isCapacitorsCombo, isCapacitorsSeries: c.isCapacitorsSeries, isPotentiometer: c.isPotentiometer, isNonOhmic: c.isNonOhmic,
    isMaxPower: c.isMaxPower, isJoulesLaw: c.isJoulesLaw,
    isAmmeterVoltmeter: c.isAmmeterVoltmeter,
    isCompound: c.isCompound, isEMF: c.isEMF, isTempR: c.isTempR,
    isCellsSeries: c.isCellsSeries, isCellsParallel: c.isCellsParallel, isRheostat: c.isRheostat,
    isCurrentDivider: c.isCurrentDivider, isSourceEff: c.isSourceEff, isTwoSources: c.isTwoSources,
    isDiodeIV: c.isDiodeIV, isTransformer: c.isTransformer, isSelfInd: c.isSelfInd,
    isThermistor: c.isThermistor, isMagneticForce: c.isMagneticForce, isLCOsc: c.isLCOsc,
    sourceEffData: c.sourceEffData,
    rcData: rc.rcData, rcHistory: rc.rcHistory, kirchhoffData: c.kirchhoffData, parallelData: c.parallelData,
    powerData: c.powerData, lampData: c.lampData, galvanometerData: c.galvanometerData,
    wheatstoneData: c.wheatstoneData, voltageDividerData: c.voltageDividerData,
    resistivityData: c.resistivityData,
  })

  return {
    components, running, trials, componentDefs, presets, activeInstructions,
    isKirchhoff: c.isKirchhoff, kirchhoffCurrents: c.kirchhoffCurrents,
    isParallel: c.isParallel, parallelCurrents: c.parallelCurrents,
    isPower: c.isPower, powerReading: c.powerReading,
    isLamp: c.isLamp, lampReading: c.lampReading,
    isGalvanometer: c.isGalvanometer, galvanometerReading: c.galvanometerReading,
    isWheatstone: c.isWheatstone, wheatstoneReading: c.wheatstoneReading,
    isVoltageDivider: c.isVoltageDivider, voltageDividerReading: c.voltageDividerReading,
    isResistivity: c.isResistivity, resistivityReading: c.resistivityReading,
    isInternalResistance: c.isInternalResistance, internalResistanceReading: c.internalResistanceReading,
    isSeries: c.isSeries, seriesReading: c.seriesReading,
    isCapacitorsCombo: c.isCapacitorsCombo, isCapacitorsSeries: c.isCapacitorsSeries, capacitorsComboReading: c.capacitorsComboReading,
    isPotentiometer: c.isPotentiometer, potentiometerReading: c.potentiometerReading,
    isNonOhmic: c.isNonOhmic, nonOhmicReading: c.nonOhmicReading,
    isMaxPower: c.isMaxPower, maxPowerReading: c.maxPowerReading,
    isJoulesLaw: c.isJoulesLaw, joulesReading: c.joulesReading,
    isAmmeterVoltmeter: c.isAmmeterVoltmeter, ammeterVoltmeterReading: c.ammeterVoltmeterReading,
    isCompound: c.isCompound, compoundReading: c.compoundReading,
    isEMF: c.isEMF, emfReading: c.emfReading,
    isTempR: c.isTempR, tempRReading: c.tempRReading,
    isCellsSeries: c.isCellsSeries, cellsSeriesReading: c.cellsSeriesReading,
    isCellsParallel: c.isCellsParallel, cellsParallelReading: c.cellsParallelReading,
    isRheostat: c.isRheostat, rheostatReading: c.rheostatReading,
    isCurrentDivider: c.isCurrentDivider, currentDividerReading: c.currentDividerReading,
    isSourceEff: c.isSourceEff, sourceEffReading: c.sourceEffReading,
    isTwoSources: c.isTwoSources, twoSourcesReading: c.twoSourcesReading,
    isDiodeIV: c.isDiodeIV, diodeReading: c.diodeReading,
    isTransformer: c.isTransformer, transformerReading: c.transformerReading,
    isSelfInd: c.isSelfInd, selfIndReading: c.selfIndReading,
    isThermistor: c.isThermistor, thermistorReading: c.thermistorReading,
    isMagneticForce: c.isMagneticForce, magneticForceReading: c.magneticForceReading,
    isLCOsc: c.isLCOsc, lcOscReading: c.lcOscReading,
    MATERIALS, isRC, rcReading: rc.rcReading, rcHistory: rc.rcHistory, toggleSwitch: rc.toggleSwitch,
    voltage: c.voltage, resistance: c.resistance, current: c.current,
    addComponent, removeComponent, updateComponent, moveComponent,
    toggleRun, recordTrial, clearTrials, reset, loadPreset, exportToAnalysis,
  }
}
