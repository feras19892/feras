import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface SpeedOfSoundTrial {
  id: number
  tubeLength: number
  frequency: number
  temperature: number
  harmonic: 1 | 3
  wavelength: number
  vMeasured: number
  vTheory: number
}

export function useSpeedOfSoundTrials(
  params: { value: { tubeLength: number; frequency: number; temperature: number; harmonic: 1 | 3 } },
  wavelength: { value: number },
  vMeasured: { value: number },
  vTheory: { value: number },
) {
  const base = useExperimentTrials<SpeedOfSoundTrial>({ storageKey: 'speedofsound:trials:v1' })

  function recordTrial() {
    const { tubeLength, frequency, temperature, harmonic } = params.value
    base.addTrial({ tubeLength, frequency, temperature, harmonic, wavelength: wavelength.value, vMeasured: vMeasured.value, vTheory: vTheory.value })
  }

  function exportCsv() {
    base.exportCsv(`speed_of_sound_${Date.now()}.csv`, [
      ['Trial', 'L(m)', 'f(Hz)', 'T(C)', 'harmonic', 'lambda(m)', 'v_meas(m/s)', 'v_theory(m/s)'],
      ...base.trials.value.map(tr => [tr.id, tr.tubeLength.toFixed(3), tr.frequency, tr.temperature, tr.harmonic, tr.wavelength.toFixed(3), tr.vMeasured.toFixed(1), tr.vTheory.toFixed(1)]),
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
