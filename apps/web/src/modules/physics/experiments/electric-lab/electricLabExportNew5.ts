import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'
import type { ExportContext } from './electricLabExportBasic'

export function exportNew5(router: any, ctx: ExportContext): boolean {
  if (ctx.isThermistor.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-thermistor', sourceNameAr: 'الثيرميستور (NTC)', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'NTC Thermistor', formula: 'R = R₀×e^(β×(1/T − 1/T₀))', variables: [{ symbol: 'R', label: 'Resistance' }, { symbol: 'R0', label: 'R at T0' }, { symbol: 'beta', label: 'Beta' }, { symbol: 'T', label: 'Temp K' }, { symbol: 'T0', label: 'Ref Temp' }], solveFor: ['R'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isMagneticForce.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-magnetic-force', sourceNameAr: 'القوة المغناطيسية', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Magnetic Force', formula: 'F = B×I×L×sin(θ)', variables: [{ symbol: 'F', label: 'Force' }, { symbol: 'B', label: 'Magnetic Field' }, { symbol: 'I', label: 'Current' }, { symbol: 'L', label: 'Wire Length' }, { symbol: 'theta', label: 'Angle' }], solveFor: ['F'] }],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'V (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isLCOsc.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-lc-oscillation', sourceNameAr: 'دائرة LC المتذبذبة', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'LC Oscillation', formula: 'f = 1/(2π√(LC)), E = ½CV² + ½LI²', variables: [{ symbol: 'f', label: 'Frequency' }, { symbol: 'L', label: 'Inductance' }, { symbol: 'C', label: 'Capacitance' }, { symbol: 'E', label: 'Total Energy' }], solveFor: ['f', 'E'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  return false
}
