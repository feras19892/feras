import type { LightRayTrial, LightRayParams } from './useLightRayExperiment'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export function useLightRayTrials(
  params: { value: LightRayParams }, angleRefraction: { value: number | null }, angleReflection: { value: number },
) {
  const base = useExperimentTrials<LightRayTrial>({ storageKey: 'lightray:trials:v1' })

  function recordTrial() {
    const { angleIncidence, n1, n2 } = params.value
    const thetaT = angleRefraction.value ?? 0
    const toRad = (deg: number) => (deg * Math.PI) / 180
    base.addTrial({ angleIncidence, angleReflection: angleReflection.value, angleRefraction: thetaT, sinI: Math.sin(toRad(angleIncidence)), sinT: Math.sin(toRad(thetaT)), n1, n2 })
  }

  function exportCsv() {
    base.exportCsv(`lightray_trials_${Date.now()}.csv`, [
      ['Trial', 'theta_i(deg)', 'theta_r(deg)', 'theta_t(deg)', 'sin_i', 'sin_t', 'n1', 'n2'],
      ...base.trials.value.map(tr => [tr.id, tr.angleIncidence.toFixed(1), tr.angleReflection.toFixed(1), tr.angleRefraction.toFixed(1), tr.sinI.toFixed(4), tr.sinT.toFixed(4), tr.n1, tr.n2]),
    ])
  }

  return {
    trials: base.trials,
    recordTrial,
    removeTrial: base.removeTrial,
    clearTrials: base.clearTrials,
    undo: base.undo,
    redo: base.redo,
    canUndo: base.canUndo,
    canRedo: base.canRedo,
    autoLoad: base.autoLoad,
    exportCsv,
  }
}
