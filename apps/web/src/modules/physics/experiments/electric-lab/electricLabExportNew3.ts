import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'
import type { ExportContext } from './electricLabExportBasic'

export function exportNew3(router: any, ctx: ExportContext): boolean {
  if (ctx.isCurrentDivider.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-current-divider', sourceNameAr: 'مقسم التيار', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, It: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'It', label: 'It', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Current Divider', formula: 'I₁ = It×R₂/(R₁+R₂), I₂ = It×R₁/(R₁+R₂)', variables: [{ symbol: 'I1', label: 'Current R1' }, { symbol: 'I2', label: 'Current R2' }, { symbol: 'It', label: 'Total I' }, { symbol: 'R1', label: 'R1' }, { symbol: 'R2', label: 'R2' }], solveFor: ['I1', 'I2'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'It', xLabel: 'R (Ω)', yLabel: 'It (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isSourceEff.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-source-eff', sourceNameAr: 'كفاءة المصدر الكهربائي', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance, eta: t.resistance > 0 ? t.resistance / (t.resistance + 2) : 0 })),
      columns: [{ key: 'V', label: 'Vt', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }, { key: 'eta', label: 'η', unit: '%' }],
      equations: [{ name: 'Efficiency', formula: 'η = R/(R+r), P_load = I²R', variables: [{ symbol: 'eta', label: 'Efficiency' }, { symbol: 'R', label: 'Load R' }, { symbol: 'r', label: 'Internal r' }, { symbol: 'Pload', label: 'Load Power' }], solveFor: ['eta', 'Pload'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'eta', xLabel: 'R (Ω)', yLabel: 'η', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isTwoSources.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-two-sources', sourceNameAr: 'دائرة بمصدرين متضادين', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'Vt', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: 'Opposing Sources', formula: 'I = (EMF₁−EMF₂)/(R+r₁+r₂)', variables: [{ symbol: 'I', label: 'Current' }, { symbol: 'EMF1', label: 'EMF 1' }, { symbol: 'EMF2', label: 'EMF 2' }, { symbol: 'R', label: 'Load R' }, { symbol: 'r1', label: 'r1' }, { symbol: 'r2', label: 'r2' }], solveFor: ['I'] }],
      suggestedPlots: [{ xKey: 'R', yKey: 'I', xLabel: 'R (Ω)', yLabel: 'I (A)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  return false
}
