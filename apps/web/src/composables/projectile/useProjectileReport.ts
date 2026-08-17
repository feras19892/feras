import { useExperimentReport } from '../useExperimentReport'
import { useI18n } from '../useI18n'
import type { ProjectileTrial } from './useProjectileTrials'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

interface ProjectileReportInput { params: { v0: number; angleDeg: number; g: number; dragCoeff: number }; trials: { trials: { value: ProjectileTrial[] }; trialStats: { value: { range_mean: number; range_std: number; flightTime_mean: number; flightTime_std: number } }; fitResult: { value: { slope: number; intercept: number; r2: number } | null }; calcResult: { value: string } } }

export function useProjectileReport() {
  const { t } = useI18n()
  const rep = useExperimentReport('projectile_report_student')

  function openFullReport(ex: ProjectileReportInput) {
    const trials = ex.trials.trials.value
    const trialStats = ex.trials.trialStats.value
    const fitResult = ex.trials.fitResult.value

    const table: LabReportTable = {
      caption: t('experiments.projectileReportCaption'),
      headers: ['#', t('experiments.angleLabel') + ' (°)', 'v₀ (m/s)', t('experiments.flightTimeLabel') + ' (s)', t('experiments.maxHeight') + ' (m)', t('experiments.rangeLabel') + ' (m)', t('experiments.errorPercentage') + ' (%)'],
      rows: trials.map((trial, i: number) => [
        i + 1,
        trial.angleDegrees.toFixed(1),
        trial.initialVelocity.toFixed(2),
        trial.flightTimeSec.toFixed(2),
        trial.maxHeightMeters.toFixed(2),
        trial.rangeMeters.toFixed(2),
        trial.err.toFixed(2) + '%',
      ]),
    }

    const stats: LabReportStat[] = []
    if (trialStats) {
      stats.push({ label: t('experiments.averageRange'), value: trialStats.range_mean.toFixed(2), unit: 'm', highlight: true })
      stats.push({ label: t('experiments.stdDeviationRange'), value: trialStats.range_std.toFixed(2), unit: 'm' })
      stats.push({ label: t('experiments.averageFlightTime'), value: trialStats.flightTime_mean.toFixed(2), unit: 's' })
      stats.push({ label: t('experiments.stdDeviationTime'), value: trialStats.flightTime_std.toFixed(2), unit: 's' })
    }

    let fitBlock = ''
    if (fitResult && trials.length >= 2) {
      fitBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div><b>${t('experiments.rangeEquationLabel')}:</b> R = ${fitResult.slope.toFixed(4)} · sin(2θ) ${fitResult.intercept >= 0 ? '+' : ''} ${fitResult.intercept.toFixed(4)}</div>
  <div>R² = ${fitResult.r2.toFixed(4)}</div>
  <div>${t('experiments.linearRegressionCurve')}</div>
</div>`
    }

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>${t('experiments.timeToMaxHeight')}:</b> z = v₀ sin θ / g</div>
  <div><b>${t('experiments.maxHeight')}:</b> H = (v₀ sin θ)² / 2g</div>
  <div><b>${t('experiments.rangeLabel')}:</b> R = v₀² sin(2θ) / g</div>
</div>`

    rep.openFullReport({
      title: t('experiments.projectileReportTitle'),
      icon: '🚀',
      experimentName: t('experiments.expProjectile') + ' — ' + t('experiments.branchMechanics'),
      dir: 'rtl',
      dateLocale: 'ar',
      meta: { [t('experiments.branchLabel')]: t('experiments.branchMechanics'), [t('experiments.experimentLabel')]: t('experiments.expProjectile'), [t('experiments.gTheoretical')]: ex.params.g.toFixed(2) + ' m/s²' },
      params: [
        { label: 'v₀', value: ex.params.v0, unit: 'm/s' },
        { label: t('experiments.angleLabel'), value: ex.params.angleDeg.toFixed(1), unit: '°' },
        { label: 'g', value: ex.params.g.toFixed(2), unit: 'm/s²' },
        { label: t('experiments.airResistanceLabel'), value: ex.params.dragCoeff },
        { label: t('experiments.readingsCountLabel'), value: trials.length },
      ],
      summaryStats: stats,
      tables: [table],
      htmlBlocks: [
        { title: t('experiments.usedEquations'), html: lawsBlock },
        fitBlock ? { title: t('experiments.rangeCurveFitting'), html: fitBlock } : null,
        { title: t('experiments.potentialErrorSources'), html: `<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>${t('experiments.airFriction')}</li><li>${t('experiments.humanStopwatchAccuracy')}</li><li>${t('experiments.parallaxError')}</li><li>${t('experiments.earthRotationEffect')}</li><li>${t('experiments.gVariationWithHeight')}</li></ul>` },
      ].filter((x): x is { title: string; html: string } => x !== null),
      footerNote: t('experiments.footerNote') + ' • ' + t('experiments.branchMechanics'),
    })
  }

  return { ...rep, openFullReport }
}
