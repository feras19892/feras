import { watch, onMounted, onUnmounted } from 'vue'
import { useSpringLab } from './useSpringLab'
import { useSpringLayout } from './useSpringLayout'
import { useSpringTrials } from './useSpringTrials'
import { useSpringExperimentState, useSpringExperimentComputed, type SpringStaticReading } from './useSpringExperimentState'
import { useSpringExperimentActions } from './useSpringExperimentActions'

export function useSpringExperiment() {
  const state = useSpringExperimentState()
  const lab = useSpringLab(state.params)
  const layout = useSpringLayout()
  const trials = useSpringTrials(state.params, lab.measured)

  const computedVals = useSpringExperimentComputed(state, trials, lab, layout)
  const actions = useSpringExperimentActions(state, lab, trials, layout)

  watch(() => [state.params.mass, state.params.k, state.params.amplitude, state.params.damping], () => {
    if (state.ignoreParamsWatch.value) return
    if (!lab.running.value) actions.resetSim()
  })

  watch([state.staticK, state.staticReadings], () => {
    try {
      localStorage.setItem('spring:experiment:v1', JSON.stringify({
        staticK: state.staticK.value,
        staticReadings: state.staticReadings.value,
        kDynamic: computedVals.kDynamic.value,
      }))
    } catch { /* ignore */ }
  }, { deep: true })

  onMounted(() => {
    layout.applyPersistedLayout()
    trials.autoLoad()
    try {
      const raw = localStorage.getItem('spring:experiment:v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.staticK !== undefined) state.staticK.value = parsed.staticK
        if (Array.isArray(parsed.staticReadings)) {
          state.staticReadings.value = parsed.staticReadings.filter((r: Record<string, unknown>) =>
            r && typeof r.mass === 'number' && r.mass >= 0 && r.mass <= 20
          ) as SpringStaticReading[]
        }
      }
    } catch { /* ignore */ }
    actions.resetSim()
  })
  onUnmounted(() => lab.cleanup())

  return {
    params: state.params,
    previousMass: state.previousMass,
    lab, layout, trials,
    resetSim: actions.resetSim,
    toggleMass: actions.toggleMass,
    runSpringLab: actions.runSpringLab,
    pullDown: actions.pullDown,
    pushUp: actions.pushUp,
    stepIndex: computedVals.stepIndex,
    tutorType: computedVals.tutorType,
    tutorMessage: computedVals.tutorMessage,
    staticK: state.staticK,
    staticReadings: state.staticReadings,
    dynamicTrials: computedVals.dynamicTrials,
    kDynamic: computedVals.kDynamic,
    fftResult: state.fftResult,
    onStaticComplete: actions.onStaticComplete,
    onDynamicComplete: actions.onDynamicComplete,
    colClasses: computedVals.colClasses,
    hasVisibleVisPanels: computedVals.hasVisibleVisPanels,
    getColumnPanels: computedVals.getColumnPanels,
    getMeasured: () => lab.measured.value,
    getEffectiveMass: () => lab.effectiveMass.value,
    colWidths: state.colWidths,
    onResizeStart: actions.onResizeStart,
    handleDrop: actions.handleDrop,
    exportToAnalysis: actions.exportToAnalysis,
  }
}
