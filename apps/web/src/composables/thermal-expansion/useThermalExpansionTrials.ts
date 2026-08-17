import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface ThermalExpansionTrial {
  id: number
  material: string
  L0: number
  t0: number
  t1: number
  deltaL: number
  alpha: number
  alphaMeasured: number
}

export function useThermalExpansionTrials(
  params: { value: { material: string; L0: number; t0: number; t1: number; deltaL: number; alpha: number; alphaMeasured: number } },
) {
  const base = useExperimentTrials<ThermalExpansionTrial>({ storageKey: 'thermal-expansion:trials:v1' })

  function recordTrial() {
    const { material, L0, t0, t1, deltaL, alpha, alphaMeasured } = params.value
    base.addTrial({ material, L0, t0, t1, deltaL, alpha, alphaMeasured })
  }

  function exportCsv() {
    base.exportCsv(`thermal_expansion_${Date.now()}.csv`, [
      ['Trial', 'Material', 'L0(m)', 't0(C)', 't1(C)', 'deltaL(m)', 'alpha_true(×10⁻⁶/K)', 'alpha_measured(×10⁻⁶/K)'],
      ...base.trials.value.map(tr => [tr.id, tr.material, tr.L0.toFixed(3), tr.t0.toFixed(1), tr.t1.toFixed(1), tr.deltaL.toFixed(6), tr.alpha.toFixed(2), tr.alphaMeasured.toFixed(2)]),
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
