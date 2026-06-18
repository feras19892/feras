import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { PendulumParams } from '../../modules/physics/experiments/pendulum/usePendulumPhysics'
import { usePendulumLab } from './usePendulumLab'
import { usePendulumLayout } from './usePendulumLayout'
import { usePendulumTrials } from './usePendulumTrials'

export function usePendulumExperiment() {
  const params = reactive<PendulumParams>({ length: 0.50, g: 9.81, theta0: 10 * Math.PI / 180, theta0Deg: 10, mass: 0.05, damping: 0.02, measureCycles: 20, bobRadius: 0.02, airDensity: 1.225, springK: 10, springRestLength: 0.08 })

  // Sync theta0 <-> theta0Deg (avoid circular loop)
  let ignoreThetaWatch = false
  watch(() => params.theta0Deg, (deg) => {
    if (ignoreThetaWatch) return
    ignoreThetaWatch = true
    params.theta0 = deg * Math.PI / 180
    setTimeout(() => { ignoreThetaWatch = false }, 0)
  })
  watch(() => params.theta0, (rad) => {
    if (ignoreThetaWatch) return
    ignoreThetaWatch = true
    params.theta0Deg = Math.round(rad * 180 / Math.PI)
    setTimeout(() => { ignoreThetaWatch = false }, 0)
  })

  const lab = usePendulumLab(params)
  const layout = usePendulumLayout()
  const trials = usePendulumTrials(params, lab.measured)

  function resetSim() { lab.resetSim() }
  function runPendulumLab() { lab.runPendulumLab(trials.recordTrial, trials.calcFitG) }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.running.value) return 'info'; if (lab.paused.value) return 'warn'; return 'success' })
  const tutorMessage = computed(() => { if (!lab.running.value) return 'جاهز للبدء'; if (lab.paused.value) return 'متوقف مؤقتاً'; return 'المحاكاة تعمل...' })

  const fftResult = ref<{ freqs: number[]; amplitudes: number[]; dominantFreq: number } | null>(null)

  watch(() => [params.length, params.g, params.theta0, params.mass, params.damping], () => { if (!lab.running.value) resetSim() })

  onMounted(() => {
    localStorage.removeItem('pendulum:layout:v1')
    layout.applyPersistedLayout()
    trials.autoLoad()
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
  function getEffectiveMass() { return params.mass }

  const colWidths = reactive({ data: 280, vis: 0, ctrl: 280 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX, startData = colWidths.data, startCtrl = colWidths.ctrl
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') colWidths.data = Math.max(160, Math.min(500, startData - dx))
      else colWidths.ctrl = Math.max(160, Math.min(500, startCtrl + dx))
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
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
    params, lab, layout, trials,
    resetSim, runPendulumLab,
    stepIndex, tutorType, tutorMessage,
    fftResult,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured, getEffectiveMass,
    colWidths, onResizeStart, handleDrop,
  }
}
