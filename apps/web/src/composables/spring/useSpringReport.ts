import { useExperimentReport } from '../useExperimentReport'
import { useI18n } from '../useI18n'
import type { SpringTrial } from './useSpringTrials'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

interface SpringReading { mass: number; deltaY: number; force: number }
interface SpringDynamicTrial { mass: number; t1: number; t2: number; t3: number; tAvg: number; T: number; T2: number }
interface SpringReportInput { params: { k: number; mass: number; amplitude: number; measureCycles: number }; staticK: { value: number | null }; kDynamic: { value: number | null }; staticReadings: { value: SpringReading[] }; dynamicTrials: { value: SpringDynamicTrial[] }; trials: { trials: { value: SpringTrial[] }; trialStats: { value: { t_mean: number; k_mean: number; T_std: number } }; calcResult: { value: string } } }

export function useSpringReport() {
  const { t } = useI18n()
  const rep = useExperimentReport('spring_report_student')

  function openFullReport(ex: SpringReportInput) {
    const staticReadings = ex.staticReadings.value
    const dynamicTrials = ex.dynamicTrials.value

    const staticTable: LabReportTable = {
      caption: t('experiments.springStaticCaption'),
      headers: ['#', 'm (g)', 'Δy (cm)', 'F = mg (N)'],
      rows: staticReadings.map((r, i: number) => [
        i + 1,
        (r.mass * 1000).toFixed(0),
        (r.deltaY ?? 0).toFixed(2),
        (r.force ?? 0).toFixed(3),
      ]),
    }

    const dynamicTable: LabReportTable = {
      caption: t('experiments.springDynamicCaption'),
      headers: ['#', 'm (g)', 't₁ (s)', 't₂ (s)', 't₃ (s)', 't̄ (s)', 'T (s)', 'T² (s²)'],
      rows: dynamicTrials.map((t, i: number) => [
        i + 1,
        (t.mass * 1000).toFixed(0),
        (t.t1 ?? 0).toFixed(2),
        (t.t2 ?? 0).toFixed(2),
        (t.t3 ?? 0).toFixed(2),
        (t.tAvg ?? 0).toFixed(2),
        (t.T ?? 0).toFixed(3),
        (t.T2 ?? 0).toFixed(4),
      ]),
    }

    const kAvg = (ex.staticK.value && ex.kDynamic.value)
      ? (ex.staticK.value + ex.kDynamic.value) / 2
      : (ex.staticK.value || ex.kDynamic.value || null)
    const errorPercent = (kAvg && ex.params.k > 0)
      ? Math.abs((kAvg - ex.params.k) / ex.params.k) * 100
      : null

    const stats: LabReportStat[] = []
    if (kAvg) stats.push({ label: t('experiments.kAverage'), value: kAvg.toFixed(2), unit: 'N/m', highlight: true })
    if (ex.staticK.value) stats.push({ label: t('experiments.kStatic'), value: ex.staticK.value.toFixed(2), unit: 'N/m' })
    if (ex.kDynamic.value) stats.push({ label: t('experiments.kDynamic'), value: ex.kDynamic.value.toFixed(2), unit: 'N/m' })
    if (errorPercent !== null) stats.push({ label: t('experiments.errorPercentage'), value: errorPercent.toFixed(2), unit: '%' })

    const calcHtml = ex.trials.calcResult.value || ''
    const calculationsBlock = calcHtml
      ? `<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">${calcHtml}</div>`
      : ''

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>${t('experiments.hookesLaw')}:</b> k = F/Δy</div>
  <div><b>SHM:</b> T = 2π√(m/k) → k = 4π²m/T²</div>
  <div><b>f₀</b> = (1/2π)·√(k/m) &nbsp; <b>E</b> = ½kA² &nbsp; <b>vₘₐₓ</b> = A√(k/m)</div>
</div>`

    const statsVal = ex.trials.trialStats.value
    let regressionBlock = ''
    if (statsVal.k_mean > 0) {
      regressionBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div>• ${t('experiments.slopeLabel')} = ${statsVal.k_mean.toFixed(2)} N/m</div>
  <div>• ${t('experiments.rSquaredLabel')} = ${(statsVal.T_std < 0.01 ? '0.999+' : (1 - statsVal.T_std).toFixed(3))}</div>
  <div>• ${t('experiments.equationLabel')}: y = ${statsVal.k_mean.toFixed(2)} · x + b</div>
</div>`
    }

    rep.openFullReport({
      title: t('experiments.springReportTitle'),
      icon: '🧪',
      experimentName: t('experiments.springShmTitle'),
      dir: 'rtl',
      dateLocale: 'ar',
      meta: {
        [t('experiments.branchLabel')]: t('experiments.branchMechanics'),
        [t('experiments.experimentLabel')]: t('experiments.springConstant'),
        [t('experiments.kTheoretical')]: ex.params.k.toFixed(2) + ' N/m',
      },
      params: [
        { label: t('experiments.massLabel'), value: ex.params.mass.toFixed(2), unit: 'kg' },
        { label: t('experiments.springConstantTheoretical'), value: ex.params.k.toFixed(2), unit: 'N/m' },
        { label: t('experiments.amplitudeLabel'), value: ex.params.amplitude.toFixed(3), unit: 'm' },
        { label: t('experiments.measuredCyclesLabel'), value: ex.params.measureCycles },
        { label: t('experiments.staticReadingsCount'), value: staticReadings.length },
        { label: t('experiments.dynamicReadingsCount'), value: dynamicTrials.length },
      ],
      summaryStats: stats,
      tables: [staticTable, dynamicTable].filter(t => t.rows.length > 0),
      htmlBlocks: [
        { title: t('experiments.lawsTitle'), html: lawsBlock },
        calculationsBlock ? { title: t('experiments.calculationsTitle'), html: calculationsBlock } : null,
        regressionBlock ? { title: t('experiments.regressionResultsTitle'), html: regressionBlock } : null,
        { title: t('experiments.potentialErrorSources'), html: `<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>${t('experiments.airFriction')}</li><li>${t('experiments.humanStopwatchAccuracy')}</li><li>${t('experiments.parallaxError')}</li><li>${t('experiments.springNonLinearDeformation')}</li><li>${t('experiments.tableVibrations')}</li><li>${t('experiments.massNonCentrality')}</li></ul>` },
      ].filter((x): x is { title: string; html: string } => x !== null),
      footerNote: t('experiments.footerNote') + ' • ' + t('experiments.branchMechanics'),
    })
  }

  return { ...rep, openFullReport }
}
