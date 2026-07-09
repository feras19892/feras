import type { Trial } from './types'
import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'

export interface ExportContext {
  trials: { value: Trial[] }
  isKirchhoff: { value: boolean }
  isParallel: { value: boolean }
  isPower: { value: boolean }
  isResistivity: { value: boolean }
  isRC: { value: boolean }
  isLamp: { value: boolean }
  isGalvanometer: { value: boolean }
  isWheatstone: { value: boolean }
  isVoltageDivider: { value: boolean }
  isInternalResistance: { value: boolean }
  isSeries: { value: boolean }
  isCapacitorsCombo: { value: boolean }
  isPotentiometer: { value: boolean }
  isNonOhmic: { value: boolean }
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
  rcData: { value: any }
  rcHistory: { value: { t: number; V: number; I: number }[] }
  kirchhoffData: { value: any }
  parallelData: { value: any }
  powerData: { value: any }
  lampData: { value: any }
  galvanometerData: { value: any }
  wheatstoneData: { value: any }
  voltageDividerData: { value: any }
  resistivityData: { value: any }
}

export function exportBasic(router: any, ctx: ExportContext): boolean {
  if (ctx.isResistivity.value) {
    const rd = ctx.resistivityData.value
    const L = rd?.L ?? 1.0, A = rd?.A ?? 1e-6
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-resistivity', sourceNameAr: 'مقاومية الموصل', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance, L, A, rho: t.resistance * A / L })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }, { key: 'L', label: 'L', unit: 'm' }, { key: 'A', label: 'A', unit: 'm²' }, { key: 'rho', label: 'ρ', unit: 'Ω·m' }],
      equations: [{ name: 'Resistivity', formula: 'ρ = R × A / L', variables: [{ symbol: 'rho', label: 'Resistivity' }, { symbol: 'R', label: 'Resistance' }, { symbol: 'A', label: 'Cross-section Area' }, { symbol: 'L', label: 'Length' }], solveFor: ['rho'] }, { name: "Ohm's Law", formula: 'R = V / I', variables: [{ symbol: 'R', label: 'Resistance' }, { symbol: 'V', label: 'Voltage' }, { symbol: 'I', label: 'Current' }], solveFor: ['R'] }],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'V (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isPower.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-power', sourceNameAr: 'القدرة الكهربائية', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance, P: t.voltage * t.current })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }, { key: 'P', label: 'P', unit: 'W' }],
      equations: [{ name: 'Power', formula: 'P = V × I', variables: [{ symbol: 'P', label: 'Power' }, { symbol: 'V', label: 'Voltage' }, { symbol: 'I', label: 'Current' }], solveFor: ['P'] }, { name: 'Power (I,R)', formula: 'P = I² × R', variables: [{ symbol: 'P', label: 'Power' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Resistance' }], solveFor: ['P'] }, { name: 'Power (V,R)', formula: 'P = V² / R', variables: [{ symbol: 'P', label: 'Power' }, { symbol: 'V', label: 'Voltage' }, { symbol: 'R', label: 'Resistance' }], solveFor: ['P'] }],
      suggestedPlots: [{ xKey: 'V', yKey: 'P', xLabel: 'V (V)', yLabel: 'P (W)', type: 'scatter' }, { xKey: 'I', yKey: 'P', xLabel: 'I (A)', yLabel: 'P (W)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isParallel.value) {
    const pd = ctx.parallelData.value
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-parallel', sourceNameAr: 'قانون أوم — توازي', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, R1: t.R1 ?? 0, R2: t.R2 ?? 0, I1: t.I1 ?? 0, I2: t.I2 ?? 0, Itotal: t.I3 ?? 0, Req: pd ? (pd.R1 * pd.R2) / (pd.R1 + pd.R2) : 0 })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'R1', label: 'R1', unit: 'Ω' }, { key: 'R2', label: 'R2', unit: 'Ω' }, { key: 'I1', label: 'I1', unit: 'A' }, { key: 'I2', label: 'I2', unit: 'A' }, { key: 'Itotal', label: 'Itotal', unit: 'A' }, { key: 'Req', label: 'Req', unit: 'Ω' }],
      equations: [{ name: 'Ohm R1', formula: 'I1 = V / R1', variables: [{ symbol: 'V', label: 'Voltage' }, { symbol: 'R1', label: 'Resistance 1' }, { symbol: 'I1', label: 'Current 1' }], solveFor: ['I1'] }, { name: 'Ohm R2', formula: 'I2 = V / R2', variables: [{ symbol: 'V', label: 'Voltage' }, { symbol: 'R2', label: 'Resistance 2' }, { symbol: 'I2', label: 'Current 2' }], solveFor: ['I2'] }, { name: 'KCL', formula: 'Itotal = I1 + I2', variables: [{ symbol: 'I1', label: 'Current 1' }, { symbol: 'I2', label: 'Current 2' }, { symbol: 'Itotal', label: 'Total Current' }], solveFor: ['Itotal'] }, { name: 'Parallel Req', formula: '1/Req = 1/R1 + 1/R2', variables: [{ symbol: 'R1', label: 'Resistance 1' }, { symbol: 'R2', label: 'Resistance 2' }, { symbol: 'Req', label: 'Equivalent R' }], solveFor: ['Req'] }],
      suggestedPlots: [{ xKey: 'V', yKey: 'Itotal', xLabel: 'V (V)', yLabel: 'Itotal (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isKirchhoff.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-kirchhoff', sourceNameAr: 'قانون كيرشوف', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V1: t.V1 ?? 0, V2: t.V2 ?? 0, R1: t.R1 ?? 0, R2: t.R2 ?? 0, R3: t.R3 ?? 0, I1: t.I1 ?? 0, I2: t.I2 ?? 0, I3: t.I3 ?? 0 })),
      columns: [{ key: 'V1', label: 'V1', unit: 'V' }, { key: 'V2', label: 'V2', unit: 'V' }, { key: 'R1', label: 'R1', unit: 'Ω' }, { key: 'R2', label: 'R2', unit: 'Ω' }, { key: 'R3', label: 'R3', unit: 'Ω' }, { key: 'I1', label: 'I1', unit: 'A' }, { key: 'I2', label: 'I2', unit: 'A' }, { key: 'I3', label: 'I3', unit: 'A' }],
      equations: [{ name: 'KCL', formula: 'I1 + I2 = I3', variables: [{ symbol: 'I1', label: 'Current 1' }, { symbol: 'I2', label: 'Current 2' }, { symbol: 'I3', label: 'Current 3' }], solveFor: ['I3'] }, { name: 'KVL Loop1', formula: 'V1 - I1·R1 - I3·R3 = 0', variables: [{ symbol: 'V1', label: 'Voltage 1' }, { symbol: 'I1', label: 'Current 1' }, { symbol: 'R1', label: 'Resistance 1' }], solveFor: ['I1'] }, { name: 'KVL Loop2', formula: 'V2 - I2·R2 - I3·R3 = 0', variables: [{ symbol: 'V2', label: 'Voltage 2' }, { symbol: 'I2', label: 'Current 2' }, { symbol: 'R2', label: 'Resistance 2' }], solveFor: ['I2'] }],
      suggestedPlots: [{ xKey: 'V1', yKey: 'I1', xLabel: 'V1 (V)', yLabel: 'I1 (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  return false
}
