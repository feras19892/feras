import { useExperimentReport } from '../useExperimentReport'
import { useI18n } from '../useI18n'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import type { PendulumTrial } from './usePendulumTrials'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

interface PendulumReportInput { params: { length: number; mass: number; g: number; theta0: number }; trials: { trials: { value: PendulumTrial[] }; trialStats: { value: { T_mean: number; T_std: number; g_mean: number; g_std: number } }; calcResult: { value: string } } }

export function usePendulumReport() {
  const { t } = useI18n()
  const rep = useExperimentReport('pendulum_report_student')

  function openFullReport(ex: PendulumReportInput) {
    const trials = ex.trials.trials.value

    const table: LabReportTable = {
      caption: t('experiments.pendulumReportCaption'),
      headers: ['#', 'L (m)', 'T (s)', 'f (Hz)', 'g (m/s²)'],
      rows: trials.map((trial, i: number) => [i + 1, trial.length.toFixed(3), trial.T.toFixed(3), trial.f.toFixed(3), trial.gCalc.toFixed(2)]),
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
    if (trials.length >= 2) {
      const xs = trials.map(tr => tr.length)
      const ys = trials.map(tr => tr.T * tr.T)
      const fit = linearRegression(xs, ys)
      if (fit && Math.abs(fit.slope) > 1e-12) {
        const gFromFit = (4 * Math.PI * Math.PI) / fit.slope
        regressionBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div>• ${t('experiments.slopeLabel')} = ${fit.slope.toFixed(5)} s²/m</div>
  <div>• ${t('experiments.rSquaredLabel')} = ${fit.r2.toFixed(4)}</div>
  <div>• ${t('experiments.gFromRegression')} = ${gFromFit.toFixed(2)} m/s²</div>
</div>`
      }
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
      ].filter((x): x is { title: string; html: string } => x !== null),
      footerNote: t('experiments.footerNote') + ' • ' + t('experiments.branchMechanics'),
    })
  }

  return { ...rep, openFullReport }
}
