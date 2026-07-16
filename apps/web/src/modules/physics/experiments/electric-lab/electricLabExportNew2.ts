import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'
import type { ExportContext } from './electricLabExportBasic'

export function exportNew2(router: any, ctx: ExportContext): boolean {
  if (ctx.isCompound.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-compound', sourceNameAr: 'الدائرة المختلطة', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, Req: t.voltage / t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'Req', label: 'Req', unit: 'Ω' }],
      equations: [
        { name: 'Compound Req', formula: 'Req = R1 + (R2×R3)/(R2+R3)', variables: [{ symbol: 'Req', label: 'Equivalent R' }, { symbol: 'R1', label: 'Series R' }, { symbol: 'R2', label: 'Parallel R1' }, { symbol: 'R3', label: 'Parallel R2' }], solveFor: ['Req'] },
      ],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'V (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isEMF.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-emf', sourceNameAr: 'قياس القوة الدافعة', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ EMF: t.EMF ?? t.voltage, Vt: t.Vt ?? t.voltage, I: t.current, r: t.r ?? t.resistance })),
      columns: [{ key: 'EMF', label: 'EMF', unit: 'V' }, { key: 'Vt', label: 'Vt', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'r', label: 'r', unit: 'Ω' }],
      equations: [
        { name: 'Internal Resistance', formula: 'r = (EMF - Vt) / I', variables: [{ symbol: 'r', label: 'Internal R' }, { symbol: 'EMF', label: 'EMF' }, { symbol: 'Vt', label: 'Terminal V' }, { symbol: 'I', label: 'Current' }], solveFor: ['r'] },
      ],
      suggestedPlots: [{ xKey: 'I', yKey: 'Vt', xLabel: 'I (A)', yLabel: 'Vt (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isTempR.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-temp-r', sourceNameAr: 'تأثير الحرارة على المقاومة', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ T: t.resistance, R: t.voltage / t.current, V: t.voltage, I: t.current })),
      columns: [{ key: 'T', label: 'T', unit: '°C' }, { key: 'R', label: 'R', unit: 'Ω' }, { key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }],
      equations: [
        { name: 'Temp Dependence', formula: 'R = R₀(1 + αΔT)', variables: [{ symbol: 'R', label: 'Resistance' }, { symbol: 'R0', label: 'Base R' }, { symbol: 'alpha', label: 'Coeff' }, { symbol: 'T', label: 'Temp' }], solveFor: ['R'] },
      ],
      suggestedPlots: [{ xKey: 'T', yKey: 'R', xLabel: 'T (°C)', yLabel: 'R (Ω)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isCellsSeries.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-cells-series', sourceNameAr: 'توصيل الخلايا على التوالي', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Series Cells', formula: 'EMF = EMF₁ + EMF₂, I = EMF/(R+r)', variables: [{ symbol: 'EMF', label: 'Total EMF' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Load R' }, { symbol: 'r', label: 'Internal R' }], solveFor: ['EMF', 'I'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isCellsParallel.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-cells-parallel', sourceNameAr: 'توصيل الخلايا على التوازي', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Parallel Cells', formula: 'r = (r₁×r₂)/(r₁+r₂), I = EMF/(R+r)', variables: [{ symbol: 'r', label: 'Total r' }, { symbol: 'EMF', label: 'EMF' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Load R' }], solveFor: ['r', 'I'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isRheostat.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-rheostat', sourceNameAr: 'المقاومة المتغيرة', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Rheostat', formula: 'R = ρL/A, I = V/R', variables: [{ symbol: 'R', label: 'Resistance' }, { symbol: 'I', label: 'Current' }, { symbol: 'V', label: 'Voltage' }], solveFor: ['R', 'I'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  return false
}
