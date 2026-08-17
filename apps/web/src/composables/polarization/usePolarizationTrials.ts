import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface PolarizationTrial {
  id: number
  polarizerAngle: number
  analyzerAngle: number
  I0: number
  outputIntensity: number
  relativeAngle: number
}

export function usePolarizationTrials(
  params: { value: { polarizerAngle: number; analyzerAngle: number; I0: number } },
  outputIntensity: { value: number },
  relativeAngle: { value: number },
) {
  const base = useExperimentTrials<PolarizationTrial>({ storageKey: 'polarization:trials:v1' })

  function recordTrial() {
    const { polarizerAngle, analyzerAngle, I0 } = params.value
    base.addTrial({ polarizerAngle, analyzerAngle, I0, outputIntensity: outputIntensity.value, relativeAngle: relativeAngle.value })
  }

  function exportCsv() {
    base.exportCsv('polarization-trials.csv', [
      ['Trial', 'theta1(deg)', 'theta2(deg)', 'I0', 'I_out', 'deltaTheta'],
      ...base.trials.value.map(tr => [tr.id, tr.polarizerAngle, tr.analyzerAngle, tr.I0.toFixed(2), tr.outputIntensity.toFixed(3), tr.relativeAngle.toFixed(1)]),
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
