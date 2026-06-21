import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'
import type { FreeFallParams } from '../../modules/physics/experiments/freefall/useFreeFallPhysics'
import { useFreeFallLab } from './useFreeFallLab'
import { useFreeFallLayout } from './useFreeFallLayout'
import { useFreeFallTrials } from './useFreeFallTrials'

export function useFreeFallExperiment() {
  const router = useRouter()

  const params = reactive<FreeFallParams>({ h: 0.50, g: 9.81, mass: 1.0, airResistance: false, dragCoeff: 0.1 })

  const lab = useFreeFallLab(params)
  const layout = useFreeFallLayout()
  const enableNoise = ref(true)
  const trials = useFreeFallTrials(params, lab.measured, enableNoise)

  function resetSim() { lab.resetSim() }
  function runFreeFallLab() { lab.runFreeFallLab(trials.recordTrial, trials.calcFitG) }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.sim.running) return 'info'; if (lab.sim.paused) return 'warn'; return 'success' })
  const tutorMessage = computed(() => { if (!lab.sim.running) return 'اضغط "إفلات" لبدء السقوط'; if (lab.sim.paused) return 'متوقف مؤقتاً'; if (lab.sim.landed) return 'الكرة ارتطمت! اضغط "تسجيل"'; return 'الكرة في الجو...' })

  watch(() => [params.h, params.g, params.mass, params.airResistance, params.dragCoeff], () => { if (!lab.running.value) resetSim() })

  onMounted(() => {
    localStorage.removeItem('freefall:layout:v1')
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

  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials recorded'); return }
    const readings = tList.map(t => ({ h: t.heightMeters, t: t.timeSec, t2: t.timeSquaredSec2, gCalc: t.gCalc }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'freefall', sourceNameAr: 'السقوط الحر', readings,
      columns: [
        { key: 'h', label: 'الارتفاع', unit: 'm' },
        { key: 't', label: 'الزمن', unit: 's' },
        { key: 't2', label: 't²', unit: 's²' },
        { key: 'gCalc', label: 'g المحسوب', unit: 'm/s²' },
      ],
      equations: [
        { name: 'السقوط الحر', formula: 'h = ½gt²', variables: [{ symbol: 'h', label: 'الارتفاع' }, { symbol: 't', label: 'الزمن' }, { symbol: 'g', label: 'تسارع الجاذبية' }], solveFor: ['g', 't', 'h'] },
        { name: 'g من القياس', formula: 'g = 2h/t²', variables: [{ symbol: 'h', label: 'الارتفاع' }, { symbol: 't', label: 'الزمن' }, { symbol: 'g', label: 'تسارع الجاذبية' }], solveFor: ['g'] },
      ],
      suggestedPlots: [
        { xKey: 't2', yKey: 'h', xLabel: 't² (s²)', yLabel: 'h (m)', type: 'scatter' },
        { xKey: 'h', yKey: 'gCalc', xLabel: 'h (m)', yLabel: 'g (m/s²)', type: 'scatter' },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, lab, layout, trials,
    resetSim, runFreeFallLab,
    stepIndex, tutorType, tutorMessage,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured,
    colWidths, onResizeStart, handleDrop,
    enableNoise,
    exportToAnalysis,
  }
}
