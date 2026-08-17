import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface BoylesLawTrial {
  id: number
  p: number
  v: number
  pv: number
}

export function useBoylesLawTrials(
  paramsGetter: { get value(): { p: number; v: number; pv: number } },
) {
  const base = useExperimentTrials<BoylesLawTrial>({ storageKey: 'boyleslaw_trials_v1' })

  function recordTrial() {
    const p = paramsGetter.value
    base.addTrial({ p: p.p, v: p.v, pv: p.pv })
  }

  function exportCsv() {
    base.exportCsv('boyles_law_trials.csv', [
      ['ID', 'P(atm)', 'V(L)', 'P·V'],
      ...base.trials.value.map(tr => [tr.id, tr.p.toFixed(2), tr.v.toFixed(2), tr.pv.toFixed(2)]),
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
