import { useExperimentReport } from '../useExperimentReport'
import { useI18n } from '../useI18n'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

export function usePendulumReport() {
  const { t } = useI18n()
  const rep = useExperimentReport('pendulum_report_student')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openFullReport(ex: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trials: any[] = ex.trials.trials.value

    const table: LabReportTable = {
      caption: t('experiments.pendulumReportCaption'),
      headers: ['#', 'L (m)', 'T (s)', 'f (Hz)', 'g (m/s²)'],
      rows: trials.map((t, i: number) => [i + 1, t.length.toFixed(3), t.T.toFixed(3), t.f.toFixed(3), t.gCalc.toFixed(2)]),
    }

    const statsVal = ex.trials.trialStats.value
    const stats: LabReportStat[] = []
    if (statsVal.g_mean > 0) stats.push({ label: t('experiments.gAverage'), value: statsVal.g_mean.toFixed(2), unit: 'm/s²', highlight: true })
    if (ex.params.g > 0) stats.push({ label: t('experiments.gTheoretical'), value: ex.params.g.toFixed(2), unit: 'm/s²' })

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>${t('experiments.periodicTime')}:</b> T = 2π√(L/g)</div>
  <div><b>${t('experiments.gEquation')}:</b> g = 4π²L/T²</div>
  <div><b>${t('experiments.angularFrequency')}:</b> ω = √(g/L) &nbsp; <b>f</b> = 1/T</div>
</div>`

    let regressionBlock = ''
    if (statsVal.g_mean > 0) {
      regressionBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div>• ${t('experiments.slopeLabel')} = ${(4 * Math.PI * Math.PI / statsVal.g_mean).toFixed(5)} s²/m</div>
  <div>• ${t('experiments.gFromRegression')} = ${statsVal.g_mean.toFixed(2)} m/s²</div>
</div>`
    }

    rep.openFullReport({
      title: t('experiments.pendulumReportTitle'), icon: '⏱️', experimentName: t('experiments.pendulumHarmonicMotion'),
      dir: 'rtl', dateLocale: 'ar',
      meta: { [t('experiments.branchLabel')]: t('experiments.branchMechanics'), [t('experiments.experimentLabel')]: t('experiments.expPendulum'), [t('experiments.gTheoretical')]: ex.params.g.toFixed(2) + ' m/s²' },
      params: [
        { label: t('experiments.stringLengthLabel'), value: ex.params.length.toFixed(2), unit: 'm' },
        { label: t('experiments.initialAngleLabel'), value: (ex.params.theta0 * 180 / Math.PI).toFixed(0), unit: '°' },
        { label: t('experiments.readingsCountLabel'), value: trials.length },
      ],
      summaryStats: stats, tables: [table],
      htmlBlocks: [
        { title: t('experiments.lawsTitle'), html: lawsBlock },
        regressionBlock ? { title: t('experiments.regressionResultsTitle'), html: regressionBlock } : null,
        { title: t('experiments.potentialErrorSources'), html: `<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>${t('experiments.airFrictionWithWeight')}</li><li>${t('experiments.humanStopwatchAccuracy')}</li><li>${t('experiments.parallaxError')}</li><li>${t('experiments.handMovementAtLaunch')}</li><li>${t('experiments.stringMassNotNegligible')}</li><li>${t('experiments.largeAngleApproximation')}</li></ul>` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].filter(Boolean) as any[],
      footerNote: t('experiments.footerNote') + ' • ' + t('experiments.branchMechanics'),
    })
  }

  return { ...rep, openFullReport }
}
