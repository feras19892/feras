import { computed, reactive, ref } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'

export interface SpringExperimentState {
  params: SpringParams
  previousMass: { value: number }
  staticK: { value: number | null }
  staticReadings: { value: Record<string, unknown>[] }
  fftResult: { value: { freqs: number[]; amplitudes: number[]; dominantFreq: number } | null }
  ignoreParamsWatch: { value: boolean }
  colWidths: { data: number; vis: number; ctrl: number }
}

export function useSpringExperimentState(): SpringExperimentState {
  const params = reactive<SpringParams>({
    mass: 1.0, k: 50, amplitude: 0.03, damping: 0.5, measureCycles: 5,
    dampingModel: 'linear', springMass: 0.15
  })
  const previousMass = ref(1.0)
  const staticK = ref<number | null>(null)
  const staticReadings = ref<Record<string, unknown>[]>([])
  const fftResult = ref<{ freqs: number[]; amplitudes: number[]; dominantFreq: number } | null>(null)
  const ignoreParamsWatch = ref(false)
  const colWidths = reactive({ data: 280, vis: 0, ctrl: 280 })

  return { params, previousMass, staticK, staticReadings, fftResult, ignoreParamsWatch, colWidths }
}

export function useSpringExperimentComputed(
  state: SpringExperimentState,
  trials: { trials: { value: Record<string, unknown>[] }; trialStats: { value: { k_mean: number | null } } },
  lab: { sim: { running: boolean; paused: boolean }; measured: { value: Record<string, unknown> | null }; effectiveMass: { value: number }; running: { value: boolean } },
  layout: { isPanelVisible: (id: string) => boolean; columnOrder: Record<string, string[]> },
) {
  const { t } = useI18n()
  const stepIndex = computed(() =>
    trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0
  )
  const tutorType = computed(() => {
    if (!lab.sim.running) return 'info'
    if (lab.sim.paused) return 'warn'
    return 'success'
  })
  const tutorMessage = computed(() => {
    if (!lab.sim.running) return t('experiments.readyToStart')
    if (lab.sim.paused) return t('experiments.pausedTemporarily')
    return t('experiments.simulationRunning')
  })

  const dynamicTrials = computed(() => {
    return trials.trials.value.map((t: Record<string, unknown>) => {
      const T = Number(t.T)
      const tTotal = T * 20
      return { mass: Number(t.mass), t1: tTotal, t2: tTotal, t3: tTotal, tAvg: tTotal, T, T2: T * T }
    })
  })
  const kDynamic = computed(() =>
    trials.trials.value.length > 0 ? trials.trialStats.value.k_mean : null
  )

  const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
  const hasVisibleVisPanels = computed(() =>
    getColumnPanels('vis').some(id => layout.isPanelVisible(id))
  )

  function getColumnPanels(col: string) {
    if (col === 'data' || col === 'vis' || col === 'ctrl') return layout.columnOrder[col]
    return []
  }

  return {
    stepIndex, tutorType, tutorMessage, dynamicTrials, kDynamic,
    colClasses, hasVisibleVisPanels, getColumnPanels,
  }
}
