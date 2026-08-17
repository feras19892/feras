import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface FaradayTrial {
  id: number
  N: number
  B: number
  A: number
  omega: number
  emf: number
}

export function useFaradayTrials(
  paramsGetter: { get value(): { N: number; B: number; A: number; omega: number; emf: number } },
) {
  const base = useExperimentTrials<FaradayTrial>({ storageKey: 'faraday_trials_v1' })

  function recordTrial() {
    const p = paramsGetter.value
    base.addTrial({ N: p.N, B: p.B, A: p.A, omega: p.omega, emf: p.emf })
  }

  function exportCsv() {
    base.exportCsv('faraday_trials.csv', [
      ['ID', 'N', 'B(T)', 'A(m2)', 'omega(rad/s)', 'emf(V)'],
      ...base.trials.value.map(tr => [tr.id, tr.N, tr.B.toFixed(2), tr.A.toFixed(3), tr.omega.toFixed(1), tr.emf.toFixed(2)]),
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
