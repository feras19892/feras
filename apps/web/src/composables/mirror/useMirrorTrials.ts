import type { MirrorTrial, MirrorParams } from './useMirrorExperiment'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export function useMirrorTrials(
  params: { value: MirrorParams },
  imageDistance: { value: number | null },
  imageHeight: { value: number | null },
  magnification: { value: number | null },
) {
  const base = useExperimentTrials<MirrorTrial>({ storageKey: 'mirror:trials:v1' })

  function recordTrial() {
    const diRaw = imageDistance.value
    if (diRaw === null) return
    const { mirrorType, focalLength, objectDistance, objectHeight } = params.value
    const di = diRaw
    const hi = imageHeight.value ?? 0
    const m = magnification.value ?? 0
    base.addTrial({ mirrorType, focalLength, objectDistance, objectHeight, imageDistance: di, imageHeight: hi, magnification: m, invDo: 1 / objectDistance, invDi: di !== 0 ? 1 / di : 0 })
  }

  function exportCsv() {
    base.exportCsv(`mirror_trials_${Date.now()}.csv`, [
      ['Trial', 'Type', 'f(cm)', 'do(cm)', 'ho(cm)', 'di(cm)', 'hi(cm)', 'm', '1/do', '1/di'],
      ...base.trials.value.map(tr => [tr.id, tr.mirrorType, tr.focalLength.toFixed(1), tr.objectDistance.toFixed(1), tr.objectHeight.toFixed(1), tr.imageDistance.toFixed(1), tr.imageHeight.toFixed(1), tr.magnification.toFixed(3), tr.invDo.toFixed(4), tr.invDi.toFixed(4)]),
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
