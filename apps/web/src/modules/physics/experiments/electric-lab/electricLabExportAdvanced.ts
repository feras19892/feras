import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'
import type { ExportContext } from './electricLabExportBasic'

export function exportAdvanced(router: any, ctx: ExportContext): boolean {
  if (ctx.isWheatstone.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-wheatstone', sourceNameAr: 'جسر ويستون لقياس المقاومة', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ R3: t.resistance, Vg: t.voltage, Ig: t.current })),
      columns: [{ key: 'R3', label: 'R3', unit: 'Ω' }, { key: 'Vg', label: 'Vg', unit: 'V' }, { key: 'Ig', label: 'Ig', unit: 'mA' }],
      equations: [{ name: 'Bridge Balance', formula: 'R1/R2 = R3/Rx', variables: [{ symbol: 'R1', label: 'R1' }, { symbol: 'R2', label: 'R2' }, { symbol: 'R3', label: 'R3' }, { symbol: 'Rx', label: 'Unknown R' }], solveFor: ['Rx'] }, { name: 'Unknown Resistance', formula: 'Rx = R2 × R3 / R1', variables: [{ symbol: 'Rx', label: 'Unknown R' }, { symbol: 'R2', label: 'R2' }, { symbol: 'R3', label: 'R3' }, { symbol: 'R1', label: 'R1' }], solveFor: ['Rx'] }],
      suggestedPlots: [{ xKey: 'R3', yKey: 'Vg', xLabel: 'R3 (Ω)', yLabel: 'Vg (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isVoltageDivider.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-voltage-divider', sourceNameAr: 'مقسم الجهد', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ R2: t.resistance, V2: t.voltage, I: t.current })),
      columns: [{ key: 'R2', label: 'R2', unit: 'Ω' }, { key: 'V2', label: 'V2', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }],
      equations: [{ name: 'Voltage Divider', formula: 'V2 = V × R2/(R1+R2)', variables: [{ symbol: 'V2', label: 'Output V' }, { symbol: 'V', label: 'Source V' }, { symbol: 'R1', label: 'R1' }, { symbol: 'R2', label: 'R2' }], solveFor: ['V2'] }],
      suggestedPlots: [{ xKey: 'R2', yKey: 'V2', xLabel: 'R2 (Ω)', yLabel: 'V2 (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isGalvanometer.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-galvanometer', sourceNameAr: 'الجلفانوميتر والحث الكهرومغناطيسي', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ N: t.resistance, speed: t.voltage, emf: t.voltage * t.resistance * 0.001, IuA: (t.voltage * t.resistance * 0.001 / 50) * 1e6 })),
      columns: [{ key: 'N', label: 'N (turns)', unit: '' }, { key: 'speed', label: 'speed', unit: 'm/s' }, { key: 'emf', label: 'ε', unit: 'V' }, { key: 'IuA', label: 'I', unit: 'µA' }],
      equations: [{ name: "Faraday's Law", formula: 'ε = -N × ΔΦ/Δt', variables: [{ symbol: 'epsilon', label: 'Induced EMF' }, { symbol: 'N', label: 'Number of Turns' }, { symbol: 'dPhi/dt', label: 'Rate of Flux Change' }], solveFor: ['epsilon'] }, { name: 'Induced Current', formula: 'I = ε / R', variables: [{ symbol: 'I', label: 'Current' }, { symbol: 'epsilon', label: 'EMF' }, { symbol: 'R', label: 'Resistance' }], solveFor: ['I'] }],
      suggestedPlots: [{ xKey: 'N', yKey: 'emf', xLabel: 'N (turns)', yLabel: 'ε (V)', type: 'scatter' }, { xKey: 'speed', yKey: 'IuA', xLabel: 'speed (m/s)', yLabel: 'I (µA)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isLamp.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-lamp', sourceNameAr: 'دائرة المصباح والكفاءة', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance, P: t.voltage * t.current, PLight: t.voltage * t.current * 0.05, PHeat: t.voltage * t.current * 0.95 })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }, { key: 'P', label: 'P', unit: 'W' }, { key: 'PLight', label: 'P_light', unit: 'W' }, { key: 'PHeat', label: 'P_heat', unit: 'W' }],
      equations: [{ name: 'Power', formula: 'P = V × I', variables: [{ symbol: 'P', label: 'Power' }, { symbol: 'V', label: 'Voltage' }, { symbol: 'I', label: 'Current' }], solveFor: ['P'] }, { name: 'Light Power', formula: 'P_light = P × 0.05', variables: [{ symbol: 'PLight', label: 'Light Power' }, { symbol: 'P', label: 'Total Power' }], solveFor: ['PLight'] }, { name: 'Heat Power', formula: 'P_heat = P × 0.95', variables: [{ symbol: 'PHeat', label: 'Heat Power' }, { symbol: 'P', label: 'Total Power' }], solveFor: ['PHeat'] }],
      suggestedPlots: [{ xKey: 'V', yKey: 'P', xLabel: 'V (V)', yLabel: 'P (W)', type: 'scatter' }, { xKey: 'V', yKey: 'PLight', xLabel: 'V (V)', yLabel: 'P_light (W)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isRC.value) {
    const d = ctx.rcData.value
    const V0 = d?.V0 ?? 0, R = d?.R ?? 0, C = (d?.C ?? 0) * 1e6, tau = d?.tau ?? 0
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-rc', sourceNameAr: 'شحن وتفريغ مكثف', hasCalcTab: true,
      readings: ctx.rcHistory.value.map(h => ({ t: h.t, V: h.V, I: h.I, V0, R, C, tau })),
      columns: [{ key: 't', label: 't', unit: 's' }, { key: 'V', label: 'Vc', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }],
      equations: [{ name: 'Charging Vc', formula: 'Vc = V0 × (1 - e^(-t/τ))', variables: [{ symbol: 'Vc', label: 'Capacitor Voltage' }, { symbol: 'V0', label: 'Source Voltage' }, { symbol: 't', label: 'Time' }, { symbol: 'tau', label: 'Time Constant' }], solveFor: ['Vc'] }, { name: 'Discharging Vc', formula: 'Vc = V0 × e^(-t/τ)', variables: [{ symbol: 'Vc', label: 'Capacitor Voltage' }, { symbol: 'V0', label: 'Initial Voltage' }, { symbol: 't', label: 'Time' }, { symbol: 'tau', label: 'Time Constant' }], solveFor: ['Vc'] }, { name: 'Time Constant', formula: 'τ = R × C', variables: [{ symbol: 'tau', label: 'Time Constant' }, { symbol: 'R', label: 'Resistance' }, { symbol: 'C', label: 'Capacitance' }], solveFor: ['tau'] }],
      suggestedPlots: [{ xKey: 't', yKey: 'V', xLabel: 't (s)', yLabel: 'Vc (V)', type: 'line' }],
    } as AnalysisPayload)
    return true
  }
  return false
}
