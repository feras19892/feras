import type { Ref, Reactive } from 'vue'
import type { CircuitComponent, Trial } from './types'

interface RecordContext {
  components: Reactive<CircuitComponent[]>
  running: Ref<boolean>
  trials: Ref<Trial[]>
  voltage: { value: number }
  current: { value: number }
  resistance: { value: number }
  kirchhoffData: { value: any }
  parallelData: { value: any }
  powerData: { value: any }
  resistivityData: { value: any }
  lampData: { value: any }
  galvanometerData: { value: any }
  wheatstoneData: { value: any }
  voltageDividerData: { value: any }
  isPower: { value: boolean }
  isResistivity: { value: boolean }
  isKirchhoff: { value: boolean }
  isLamp: { value: boolean }
  isGalvanometer: { value: boolean }
  isWheatstone: { value: boolean }
  isVoltageDivider: { value: boolean }
  isRC: { value: boolean }
  isInternalResistance: { value: boolean }
  isSeries: { value: boolean }
  isNonOhmic: { value: boolean }
  isCapacitorsCombo: { value: boolean }
  isPotentiometer: { value: boolean }
  isMaxPower: { value: boolean }
  isJoulesLaw: { value: boolean }
  isAmmeterVoltmeter: { value: boolean }
  isCompound: { value: boolean }
  isEMF: { value: boolean }
  isTempR: { value: boolean }
  isCellsSeries: { value: boolean }
  isCellsParallel: { value: boolean }
  isRheostat: { value: boolean }
  isCurrentDivider: { value: boolean }
  isSourceEff: { value: boolean }
  isTwoSources: { value: boolean }
  isDiodeIV: { value: boolean }
  isTransformer: { value: boolean }
  isSelfInd: { value: boolean }
  isThermistor: { value: boolean }
  isMagneticForce: { value: boolean }
  isLCOsc: { value: boolean }
  rcVoltage: { value: number }
  rcCurrent: { value: number }
  rcData: { value: any }
  internalResistanceData: { value: any }
  seriesData: { value: any }
  nonOhmicData: { value: any }
  capacitorsComboData: { value: any }
  potentiometerData: { value: any }
  compoundData: { value: any }
  emfData: { value: any }
  tempRData: { value: any }
  maxPowerData: { value: any }
  joulesData: { value: any }
  ammeterVoltmeterData: { value: any }
  cellsSeriesData: { value: any }
  cellsParallelData: { value: any }
  rheostatData: { value: any }
  currentDividerData: { value: any }
  sourceEffData: { value: any }
  twoSourcesData: { value: any }
  diodeData: { value: any }
  transformerData: { value: any }
  selfIndData: { value: any }
  thermistorData: { value: any }
  magneticForceData: { value: any }
  lcOscData: { value: any }
}

export function createRecordTrial(ctx: RecordContext) {
  function recordTrial() {
    if (!ctx.running.value) return
    const kd = ctx.kirchhoffData.value
    const pd = ctx.parallelData.value
    ctx.trials.value.push({
      id: ctx.trials.value.length + 1,
      voltage: ctx.voltage.value, current: ctx.current.value, resistance: ctx.resistance.value,
      V1: kd?.V1, V2: kd?.V2,
      R1: kd?.R1 ?? pd?.R1, R2: kd?.R2 ?? pd?.R2, R3: kd?.R3,
      I1: kd?.I1 ?? pd?.I1, I2: kd?.I2 ?? pd?.I2, I3: kd?.I3 ?? pd?.Itotal,
    })
    const last = () => ctx.trials.value[ctx.trials.value.length - 1]
    if (ctx.isPower.value && ctx.powerData.value) { const l = last(); l.voltage = ctx.powerData.value.V; l.current = ctx.powerData.value.I; l.resistance = ctx.powerData.value.R }
    if (ctx.isResistivity.value && ctx.resistivityData.value) { const l = last(); l.voltage = ctx.resistivityData.value.V; l.current = ctx.resistivityData.value.I; l.resistance = ctx.resistivityData.value.R }
    if (ctx.isRC.value) { const l = last(); l.voltage = ctx.rcVoltage.value; l.current = ctx.rcCurrent.value; l.resistance = ctx.rcData.value?.tau ?? 0 }
    if (ctx.isLamp.value && ctx.lampData.value) { const l = last(); l.voltage = ctx.lampData.value.V; l.current = ctx.lampData.value.I; l.resistance = ctx.lampData.value.R }
    if (ctx.isGalvanometer.value && ctx.galvanometerData.value) { const l = last(); l.voltage = ctx.galvanometerData.value.emf; l.current = ctx.galvanometerData.value.I; l.resistance = ctx.galvanometerData.value.turns }
    if (ctx.isWheatstone.value && ctx.wheatstoneData.value) { const l = last(); l.voltage = ctx.wheatstoneData.value.Vg; l.current = ctx.wheatstoneData.value.Ig; l.resistance = ctx.wheatstoneData.value.R3 }
    if (ctx.isVoltageDivider.value && ctx.voltageDividerData.value) { const l = last(); l.voltage = ctx.voltageDividerData.value.V2; l.current = ctx.voltageDividerData.value.I; l.resistance = ctx.voltageDividerData.value.R2 }
    if (ctx.isInternalResistance.value && ctx.internalResistanceData.value) { const l = last(); l.voltage = ctx.internalResistanceData.value.Vt; l.current = ctx.internalResistanceData.value.I; l.resistance = ctx.internalResistanceData.value.R }
    if (ctx.isSeries.value && ctx.seriesData.value) { const l = last(); l.voltage = ctx.seriesData.value.V; l.current = ctx.seriesData.value.I; l.resistance = ctx.seriesData.value.Req }
    if (ctx.isNonOhmic.value && ctx.nonOhmicData.value) { const l = last(); l.voltage = ctx.nonOhmicData.value.V; l.current = ctx.nonOhmicData.value.I_lamp; l.resistance = ctx.nonOhmicData.value.R_dyn }
    if (ctx.isCapacitorsCombo.value && ctx.capacitorsComboData.value) { const l = last(); l.voltage = ctx.capacitorsComboData.value.V0; l.current = 0; l.resistance = ctx.capacitorsComboData.value.tau }
    if (ctx.isPotentiometer.value && ctx.potentiometerData.value) { const l = last(); l.voltage = ctx.potentiometerData.value.Vslide; l.current = ctx.potentiometerData.value.Ig; l.resistance = ctx.potentiometerData.value.R1 }
    if (ctx.isMaxPower.value && ctx.maxPowerData.value) { const l = last(); l.voltage = ctx.maxPowerData.value.Vload; l.current = ctx.maxPowerData.value.I; l.resistance = ctx.maxPowerData.value.R }
    if (ctx.isJoulesLaw.value && ctx.joulesData.value) { const l = last(); l.voltage = ctx.joulesData.value.V; l.current = ctx.joulesData.value.I; l.resistance = ctx.joulesData.value.R }
    if (ctx.isAmmeterVoltmeter.value && ctx.ammeterVoltmeterData.value) { const l = last(); l.voltage = ctx.ammeterVoltmeterData.value.Vm; l.current = ctx.ammeterVoltmeterData.value.I; l.resistance = ctx.ammeterVoltmeterData.value.Rx }
    if (ctx.isCompound.value && ctx.compoundData.value) { const l = last(); l.voltage = ctx.compoundData.value.V; l.current = ctx.compoundData.value.I; l.resistance = ctx.compoundData.value.Req }
    if (ctx.isEMF.value && ctx.emfData.value) { const l = last(); l.voltage = ctx.emfData.value.Vt; l.current = ctx.emfData.value.I; l.resistance = ctx.emfData.value.r }
    if (ctx.isTempR.value && ctx.tempRData.value) { const l = last(); l.voltage = ctx.tempRData.value.Vm; l.current = ctx.tempRData.value.I; l.resistance = ctx.tempRData.value.T }
    if (ctx.isCellsSeries.value && ctx.cellsSeriesData.value) { const l = last(); l.voltage = ctx.cellsSeriesData.value.Vt; l.current = ctx.cellsSeriesData.value.I; l.resistance = ctx.cellsSeriesData.value.R }
    if (ctx.isCellsParallel.value && ctx.cellsParallelData.value) { const l = last(); l.voltage = ctx.cellsParallelData.value.Vt; l.current = ctx.cellsParallelData.value.I; l.resistance = ctx.cellsParallelData.value.R }
    if (ctx.isRheostat.value && ctx.rheostatData.value) { const l = last(); l.voltage = ctx.rheostatData.value.Vm; l.current = ctx.rheostatData.value.I; l.resistance = ctx.rheostatData.value.R }
    if (ctx.isCurrentDivider.value && ctx.currentDividerData.value) { const l = last(); l.voltage = ctx.currentDividerData.value.V; l.current = ctx.currentDividerData.value.It; l.resistance = ctx.currentDividerData.value.Req }
    if (ctx.isSourceEff.value && ctx.sourceEffData.value) { const l = last(); l.voltage = ctx.sourceEffData.value.Vt; l.current = ctx.sourceEffData.value.I; l.resistance = ctx.sourceEffData.value.R }
    if (ctx.isTwoSources.value && ctx.twoSourcesData.value) { const l = last(); l.voltage = ctx.twoSourcesData.value.Vt; l.current = ctx.twoSourcesData.value.I; l.resistance = ctx.twoSourcesData.value.R }
    if (ctx.isDiodeIV.value && ctx.diodeData.value) { const l = last(); l.voltage = ctx.diodeData.value.Vd; l.current = ctx.diodeData.value.I; l.resistance = ctx.diodeData.value.R }
    if (ctx.isTransformer.value && ctx.transformerData.value) { const l = last(); l.voltage = ctx.transformerData.value.Vs; l.current = ctx.transformerData.value.Is; l.resistance = ctx.transformerData.value.Rload }
    if (ctx.isSelfInd.value && ctx.selfIndData.value) { const l = last(); l.voltage = ctx.selfIndData.value.V; l.current = ctx.selfIndData.value.I; l.resistance = ctx.selfIndData.value.R }
    if (ctx.isThermistor.value && ctx.thermistorData.value) { const l = last(); l.voltage = ctx.thermistorData.value.Vm; l.current = ctx.thermistorData.value.I; l.resistance = ctx.thermistorData.value.R }
    if (ctx.isMagneticForce.value && ctx.magneticForceData.value) { const l = last(); l.voltage = ctx.magneticForceData.value.V; l.current = ctx.magneticForceData.value.I; l.resistance = ctx.magneticForceData.value.R }
    if (ctx.isLCOsc.value && ctx.lcOscData.value) { const l = last(); l.voltage = ctx.lcOscData.value.V; l.current = ctx.lcOscData.value.I; l.resistance = ctx.lcOscData.value.R }
  }
  return { recordTrial }
}
