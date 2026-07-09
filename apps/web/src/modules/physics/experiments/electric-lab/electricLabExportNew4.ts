import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'
import type { ExportContext } from './electricLabExportBasic'

export function exportNew4(router: any, ctx: ExportContext): boolean {
  if (ctx.isDiodeIV.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-diode-iv', sourceNameAr: 'خصائص الدايود', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current })),
      columns: [{ key: 'V', label: 'Vd', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }],
      equations: [{ name: 'Shockley Equation', formula: 'I = Is×(e^(V/ηVt) − 1)', variables: [{ symbol: 'I', label: 'Current' }, { symbol: 'V', label: 'Diode V' }, { symbol: 'Is', label: 'Saturation I' }, { symbol: 'Vt', label: 'Thermal V' }, { symbol: 'eta', label: 'Ideality' }], solveFor: ['I'] }],
      suggestedPlots: [{ xKey: 'V', yKey: 'I', xLabel: 'Vd (V)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isTransformer.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-transformer', sourceNameAr: 'نسبة المحوّل', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'Vs', unit: 'V' }, { key: 'I', label: 'Is', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Transformer Ratio', formula: 'Vs/Vp = Ns/Np, Is/Ip = Np/Ns', variables: [{ symbol: 'Vs', label: 'Secondary V' }, { symbol: 'Vp', label: 'Primary V' }, { symbol: 'Ns', label: 'N secondary' }, { symbol: 'Np', label: 'N primary' }, { symbol: 'Is', label: 'Secondary I' }, { symbol: 'Ip', label: 'Primary I' }], solveFor: ['Vs', 'Is'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'Is (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isSelfInd.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-self-inductance', sourceNameAr: 'التحريض الذاتي', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Self-Inductance', formula: 'V = −L(dI/dt), E = ½LI², τ = L/R', variables: [{ symbol: 'L', label: 'Inductance' }, { symbol: 'I', label: 'Current' }, { symbol: 'E', label: 'Energy' }, { symbol: 'tau', label: 'Time const' }], solveFor: ['E', 'tau'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  return false
}
