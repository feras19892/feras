import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'
import { exportBasic, type ExportContext } from './electricLabExportBasic'
import { exportAdvanced } from './electricLabExportAdvanced'
import { exportNew } from './electricLabExportNew'
import { exportNew2 } from './electricLabExportNew2'
import { exportNew3 } from './electricLabExportNew3'
import { exportNew4 } from './electricLabExportNew4'
import { exportNew5 } from './electricLabExportNew5'

export { type ExportContext } from './electricLabExportBasic'

export function createExporter(router: any, ctx: ExportContext) {
  function exportToAnalysis() {
    if (ctx.trials.value.length < 2) return
    if (exportBasic(router, ctx)) return
    if (exportAdvanced(router, ctx)) return
    if (exportNew(router, ctx)) return
    if (exportNew2(router, ctx)) return
    if (exportNew3(router, ctx)) return
    if (exportNew4(router, ctx)) return
    if (exportNew5(router, ctx)) return
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab', sourceNameAr: 'قانون أوم', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [{ name: "Ohm's Law", formula: 'V = I × R', variables: [{ symbol: 'V', label: 'Voltage' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Resistance' }], solveFor: ['R'] }],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'V (V)', type: 'scatter' }],
    } as AnalysisPayload)
  }
  return { exportToAnalysis }
}
