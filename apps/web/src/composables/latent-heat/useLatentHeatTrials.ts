import { computed } from 'vue'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface LatentHeatTrial {
  id: number
  mass: number
  phaseType: 'fusion' | 'vaporization'
  Q: number
  L: number
  meltedMass: number
  remainingMass: number
  temp: number
}

export function useLatentHeatTrials(
  paramsGetter: { get value(): { mass: number; phaseType: 'fusion' | 'vaporization'; Q: number; L: number; meltedMass: number; remainingMass: number; temp: number } },
) {
  const base = useExperimentTrials<LatentHeatTrial>({ storageKey: 'latentheat_trials_v1' })

  const avgL = computed(() => {
    if (!base.trials.value.length) return 0
    return base.trials.value.reduce((s, tr) => s + tr.L, 0) / base.trials.value.length
  })
  function recordTrial() {
    const p = paramsGetter.value
    base.addTrial({ mass: p.mass, phaseType: p.phaseType, Q: p.Q, L: p.L, meltedMass: p.meltedMass, remainingMass: p.remainingMass, temp: p.temp })
  }

  function exportCsv() {
    base.exportCsv('latent_heat_trials.csv', [
      ['ID', 'Mass(kg)', 'Phase', 'Q(J)', 'L(J/kg)', 'Melted(kg)', 'Remaining(kg)', 'Temp(C)'],
      ...base.trials.value.map(tr => [tr.id, tr.mass, tr.phaseType, tr.Q.toFixed(0), tr.L.toFixed(0), tr.meltedMass.toFixed(3), tr.remainingMass.toFixed(3), tr.temp]),
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
    avgL
  }
}
