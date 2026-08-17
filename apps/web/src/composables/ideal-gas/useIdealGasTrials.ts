import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface IdealGasTrial {
  id: number
  n: number
  T: number
  V: number
  P: number
}

export function useIdealGasTrials(
  params: { value: { n: number; T: number; V: number } },
  pressure: { value: number },
) {
  const base = useExperimentTrials<IdealGasTrial>({ storageKey: 'idealgas:trials:v1' })

  function recordTrial() {
    const { n, T, V } = params.value
    base.addTrial({ n, T, V, P: pressure.value })
  }

  function exportCsv() {
    base.exportCsv(`ideal_gas_${Date.now()}.csv`, [
      ['Trial', 'n(mol)', 'T(K)', 'V(m3)', 'P(Pa)'],
      ...base.trials.value.map(tr => [tr.id, tr.n.toFixed(3), tr.T.toFixed(1), tr.V.toFixed(5), tr.P.toFixed(1)]),
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
