import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface PrismTrial {
  id: number
  prismAngle: number
  angleIncidence: number
  wavelength: number
  angleEmergence: number | null
  deviation: number | null
  n: number
}

export function usePrismTrials(
  params: { value: { prismAngle: number; angleIncidence: number; wavelength: number } },
  angleEmergence: { value: number | null },
  deviation: { value: number | null },
  nValue: { value: number },
) {
  const base = useExperimentTrials<PrismTrial>({ storageKey: 'prism:trials:v1' })

  function recordTrial() {
    const ae = angleEmergence.value
    const dev = deviation.value
    if (ae === null || dev === null) return
    const { prismAngle, angleIncidence, wavelength } = params.value
    base.addTrial({ prismAngle, angleIncidence, wavelength, angleEmergence: ae, deviation: dev, n: nValue.value })
  }

  function exportCsv() {
    base.exportCsv(`prism_${Date.now()}.csv`, [
      ['Trial', 'A(deg)', 'theta_i(deg)', 'lambda(nm)', 'theta_e(deg)', 'delta(deg)', 'n'],
      ...base.trials.value.map(tr => {
        const fmt = (v: number | null, d = 1) => v !== null ? v.toFixed(d) : 'TIR'
        return [tr.id, tr.prismAngle.toFixed(1), tr.angleIncidence.toFixed(1), tr.wavelength, fmt(tr.angleEmergence), fmt(tr.deviation), tr.n.toFixed(3)]
      }),
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
