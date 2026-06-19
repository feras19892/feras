import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { InclinedParams } from '../../modules/physics/experiments/inclined/useInclinedPhysics'
import { useInclinedLab } from './useInclinedLab'
import { useInclinedLayout } from './useInclinedLayout'
import { useInclinedTrials } from './useInclinedTrials'

export function useInclinedExperiment() {
  const params = reactive<InclinedParams>({ thetaDeg: 30, length: 2.0, mass: 1.0, g: 9.81, mu: 0.0 })

  const lab = useInclinedLab(params)
  const layout = useInclinedLayout()
  const enableNoise = ref(true)
  const trials = useInclinedTrials(params, lab.measured, enableNoise)

  function resetSim() { lab.resetSim() }
  function runInclinedLab() { lab.runInclinedLab(trials.recordTrial) }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.sim.running) return 'info'; if (lab.sim.paused) return 'warn'; return 'success' })
  const tutorMessage = computed(() => {
    if (!lab.sim.running) return 'اضبط المعاملات واضغط "بدء"'
    if (lab.sim.paused) return 'متوقف مؤقتاً'
    if (lab.sim.arrived) return 'الجسم وصل للقاعدة! اضغط "تسجيل"'
    return 'الجسم ينزلق...'
  })

  watch(() => [params.thetaDeg, params.length, params.mass, params.g, params.mu], () => { if (!lab.running.value) resetSim() })

  onMounted(() => {
    localStorage.removeItem('inclined:layout:v1')
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
  function getMeasured() { return lab.measured.value }

  const colWidths = reactive({ data: 280, vis: 0, ctrl: 280 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX, startData = colWidths.data, startCtrl = colWidths.ctrl
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') colWidths.data = Math.max(160, Math.min(500, startData - dx))
      else colWidths.ctrl = Math.max(160, Math.min(500, startCtrl + dx))
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
    params, lab, layout, trials,
    resetSim, runInclinedLab,
    stepIndex, tutorType, tutorMessage,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured,
    colWidths, onResizeStart, handleDrop,
    enableNoise,
  }
}
