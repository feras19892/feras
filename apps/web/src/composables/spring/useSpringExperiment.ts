import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'
import { useSpringLab } from './useSpringLab'
import { useSpringLayout } from './useSpringLayout'
import { useSpringTrials } from './useSpringTrials'

export function useSpringExperiment() {
  const params = reactive<SpringParams>({ mass: 1.0, k: 50, amplitude: 0.03, damping: 0.5, measureCycles: 5, dampingModel: 'linear', springMass: 0.15 })
  const previousMass = ref(1.0)

  const lab = useSpringLab(params)
  const layout = useSpringLayout()
  const trials = useSpringTrials(params, lab.measured)

  function resetSim() { lab.resetSim() }

  function toggleMass() {
    if (params.mass > 0) { previousMass.value = params.mass; params.mass = 0 }
    else { params.mass = previousMass.value || 1.0 }
    resetSim()
  }

  function runSpringLab() { lab.runSpringLab(trials.recordTrial, trials.calcFitK) }

  function pullDown() {
    if (lab.sim.running && !lab.sim.paused) return
    const step = 0.005  // 5 mm per click
    ignoreParamsWatch = true
    lab.sim.x = Math.round((lab.sim.x + step) * 1000) / 1000
    lab.sim.v = 0
    setTimeout(() => { ignoreParamsWatch = false }, 0)
  }
  function pushUp() {
    if (lab.sim.running && !lab.sim.paused) return
    const step = 0.005  // 5 mm per click
    ignoreParamsWatch = true
    lab.sim.x = Math.round((lab.sim.x - step) * 1000) / 1000
    lab.sim.v = 0
    setTimeout(() => { ignoreParamsWatch = false }, 0)
  }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.sim.running) return 'info'; if (lab.sim.paused) return 'warn'; return 'success' })
  const tutorMessage = computed(() => { if (!lab.sim.running) return 'جاهز للبدء'; if (lab.sim.paused) return 'متوقف مؤقتاً'; return 'المحاكاة تعمل...' })

  const staticK = ref<number | null>(null)
  const staticReadings = ref<any[]>([])
  const dynamicTrials = ref<any[]>([])
  const kDynamic = ref<number | null>(null)
  const fftResult = ref<{ freqs: number[]; amplitudes: number[]; dominantFreq: number } | null>(null)
  let ignoreParamsWatch = false

  function onStaticComplete(readings: any[], k: number | null) { staticReadings.value = readings; staticK.value = k }
  function onDynamicComplete(t: any[], k: number | null) { dynamicTrials.value = t; kDynamic.value = k }

  watch(() => [params.mass, params.k, params.amplitude, params.damping], () => { 
    if (ignoreParamsWatch) return
    if (!lab.running.value) resetSim() 
  })

  // Auto-save static/dynamic experiment state
  watch([staticK, staticReadings, kDynamic, dynamicTrials], () => {
    try {
      localStorage.setItem('spring:experiment:v1', JSON.stringify({
        staticK: staticK.value,
        staticReadings: staticReadings.value,
        kDynamic: kDynamic.value,
        dynamicTrials: dynamicTrials.value,
      }))
    } catch { /* ignore */ }
  }, { deep: true })

  onMounted(() => {
    localStorage.removeItem('spring:layout:v1')
    layout.applyPersistedLayout()
    trials.autoLoad()
    // Load saved static/dynamic data
    try {
      const raw = localStorage.getItem('spring:experiment:v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.staticK !== undefined) staticK.value = parsed.staticK
        if (parsed.staticReadings) staticReadings.value = parsed.staticReadings
        if (parsed.kDynamic !== undefined) kDynamic.value = parsed.kDynamic
        if (parsed.dynamicTrials) dynamicTrials.value = parsed.dynamicTrials
      }
    } catch { /* ignore */ }
    resetSim()
  })
  onUnmounted(() => lab.cleanup())

  const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
  const hasVisibleVisPanels = computed(() => getColumnPanels('vis').some(id => layout.isPanelVisible(id)))

  function getColumnPanels(col: string) {
    if (col === 'data' || col === 'vis' || col === 'ctrl') return layout.columnOrder[col]
    return []
  }
  function getMeasured() { return (lab.measured.value as any) }
  function getEffectiveMass() { return (lab.effectiveMass.value as number) }

  const colWidths = reactive({ data: 280, vis: 0, ctrl: 280 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX
    const startData = colWidths.data
    const startCtrl = colWidths.ctrl
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') { colWidths.data = Math.max(160, Math.min(500, startData - dx)) }
      else { colWidths.ctrl = Math.max(160, Math.min(500, startCtrl + dx)) }
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDrop(id: string, x: number, y: number) {
    type ColumnId = 'data' | 'vis' | 'ctrl'
    const cols: ColumnId[] = ['data', 'vis', 'ctrl']
    for (const col of cols) {
      const colEl = document.querySelector(`.${colClasses[col]}`)
      if (!colEl) continue
      const colRect = colEl.getBoundingClientRect()
      if (x >= colRect.left && x < colRect.right && y >= colRect.top && y < colRect.bottom) {
        const panelEls = Array.from(colEl.querySelectorAll('.draggable-panel[data-id]'))
        let insertAfterId: string | null = null
        for (const el of panelEls) {
          const pid = el.getAttribute('data-id')
          if (!pid || pid === id) continue
          const rect = el.getBoundingClientRect()
          if (y >= rect.top && y <= rect.bottom) { if (y > rect.top + rect.height / 2) insertAfterId = pid; break }
          if (y > rect.bottom) insertAfterId = pid
        }
        layout.movePanel(id as any, col, insertAfterId as any)
        return
      }
    }
  }

  return {
    params, previousMass, lab, layout, trials,
    resetSim, toggleMass, runSpringLab, pullDown, pushUp,
    stepIndex, tutorType, tutorMessage,
    staticK, staticReadings, dynamicTrials, kDynamic, fftResult,
    onStaticComplete, onDynamicComplete,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured, getEffectiveMass,
    colWidths, onResizeStart, handleDrop,
  }
}
