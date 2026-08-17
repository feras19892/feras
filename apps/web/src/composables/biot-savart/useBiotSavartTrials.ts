import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface BiotSavartTrial {
  id: number
  I: number
  r: number
  B: number
  shape: string
}

export function useBiotSavartTrials(
  paramsGetter: { get value(): { I: number; r: number; B: number; shape: string } },
) {
  const base = useExperimentTrials<BiotSavartTrial>({ storageKey: 'biotsavart_trials_v1' })

  function recordTrial() {
    const p = paramsGetter.value
    base.addTrial({ I: p.I, r: p.r, B: p.B, shape: p.shape })
  }

  function exportCsv() {
    base.exportCsv('biot_savart_trials.csv', [
      ['ID', 'I(A)', 'r(m)', 'B(T)', 'shape'],
      ...base.trials.value.map(tr => [tr.id, tr.I.toFixed(1), tr.r.toFixed(3), tr.B.toFixed(6), tr.shape]),
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
