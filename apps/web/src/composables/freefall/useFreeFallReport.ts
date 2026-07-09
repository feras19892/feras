import { useExperimentReport } from '../useExperimentReport'
import { useI18n } from '../useI18n'
import type { FreeFallTrial } from './useFreeFallTrials'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

interface FreeFallReportInput { params: { h: number; g: number; mass: number; airResistance: boolean }; trials: { trials: { value: FreeFallTrial[] }; trialStats: { value: { g_mean: number } }; calcResult: { value: string } } }

export function useFreeFallReport() {
  const { t } = useI18n()
  const rep = useExperimentReport('freefall_report_student')

  function openFullReport(ex: FreeFallReportInput) {
    const trials = ex.trials.trials.value
    const table: LabReportTable = {
      caption: t('experiments.freeFallReportCaption'),
      headers: ['#', 'h (m)', 't (s)', 't² (s²)', 'v_impact (m/s)', 'g_calc (m/s²)', t('experiments.errorPercentage') + ' (%)'],
      rows: trials.map((t, i: number) => [
        i + 1, t.heightMeters.toFixed(2), t.timeSec.toFixed(3),
        t.timeSquaredSec2.toFixed(4), t.impactVelocityMs.toFixed(2),
        t.gCalc.toFixed(2), t.err.toFixed(2) + '%',
      ]),
    }

    const statsVal = ex.trials.trialStats.value
    const stats: LabReportStat[] = []
    if (statsVal.g_mean > 0) stats.push({ label: t('experiments.gAverage'), value: statsVal.g_mean.toFixed(2), unit: 'm/s²', highlight: true })
    if (ex.params.g > 0) stats.push({ label: t('experiments.gTheoretical'), value: ex.params.g.toFixed(2), unit: 'm/s²' })

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>${t('experiments.timeEquation')}:</b> t = √(2h/g)</div>
  <div><b>${t('experiments.velocityEquation')}:</b> v = √(2gh)</div>
  <div><b>${t('experiments.gEquation')}:</b> g = 2h/t²</div>
</div>`

    const calcHtml = ex.trials.calcResult.value || ''
    const calculationsBlock = calcHtml
      ? `<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">${calcHtml}</div>`
      : ''

    let regressionBlock = ''
    if (statsVal.g_mean > 0) {
      regressionBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div>• ${t('experiments.slopeLabel')} = ${(statsVal.g_mean / 2).toFixed(5)} m/s²</div>
  <div>• ${t('experiments.gFromRegression')} = ${statsVal.g_mean.toFixed(2)} m/s²</div>
</div>`
    }

    rep.openFullReport({
      title: t('experiments.freeFallReportTitle'), icon: '🍎', experimentName: t('experiments.expFreeFall') + ' — ' + t('experiments.gravityMechanics'),
      dir: 'rtl', dateLocale: 'ar',
      meta: { [t('experiments.branchLabel')]: t('experiments.branchMechanics'), [t('experiments.experimentLabel')]: t('experiments.expFreeFall'), [t('experiments.gTheoretical')]: ex.params.g.toFixed(2) + ' m/s²' },
      params: [
        { label: t('experiments.heightLabel'), value: ex.params.h.toFixed(2), unit: 'm' },
        { label: 'g', value: ex.params.g.toFixed(2), unit: 'm/s²' },
        { label: t('experiments.massLabel'), value: ex.params.mass.toFixed(2), unit: 'kg' },
        { label: t('experiments.airResistanceLabel'), value: ex.params.airResistance ? t('experiments.airResistanceEnabled') : t('experiments.airResistanceDisabled') },
        { label: t('experiments.readingsCountLabel'), value: trials.length },
      ],
      summaryStats: stats, tables: [table],
      htmlBlocks: [
        { title: t('experiments.lawsTitle'), html: lawsBlock },
        calculationsBlock ? { title: t('experiments.calculationsTitle'), html: calculationsBlock } : null,
        regressionBlock ? { title: t('experiments.regressionResultsTitle'), html: regressionBlock } : null,
        { title: t('experiments.potentialErrorSources'), html: `<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>${t('experiments.digitalTimerAccuracy')}</li><li>${t('experiments.heightMeasurementAccuracy')}</li><li>${t('experiments.airFriction')}</li><li>${t('experiments.deviceVibration')}</li><li>${t('experiments.localGravityEffect')}</li></ul>` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].filter((x): x is { title: string; html: string } => x !== null),
      footerNote: t('experiments.footerNote') + ' • ' + t('experiments.branchMechanics'),
    })
  }

  return { ...rep, openFullReport }
}
