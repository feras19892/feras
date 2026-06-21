import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'
import type { ProjectileParams } from '../../modules/physics/experiments/projectile/useProjectilePhysics'
import { useProjectileLab } from './useProjectileLab'
import { useProjectileLayout } from './useProjectileLayout'
import { useProjectileTrials } from './useProjectileTrials'

export function useProjectileExperiment() {
  const router = useRouter()

  const params = reactive<ProjectileParams>({ v0: 10, angleDeg: 45, g: 9.81, x0: 0, y0: 0, targetX: 30, targetY: 0, targetRadius: 3, targetVisible: false, targetMode: false, dragCoeff: 0 })

  const lab = useProjectileLab(params)
  const layout = useProjectileLayout()
  const trials = useProjectileTrials(params, lab.measured)

  function resetSim() { lab.resetSim() }
  function runProjectileLab() { lab.runProjectileLab(trials.recordTrial, trials.calcFitRange) }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.sim.running) return 'info'; if (lab.sim.paused) return 'warn'; return 'success' })
  const tutorMessage = computed(() => { if (!lab.sim.running) return 'جاهز للبدء'; if (lab.sim.paused) return 'متوقف مؤقتاً'; if (lab.sim.landed) return 'هبط! اضغط تسجيل'; return 'المقذوف في الجو...' })

  watch(() => [params.v0, params.angleDeg, params.g, params.x0, params.y0, params.dragCoeff], () => { if (!lab.running.value) lab.resetSim() })

  onMounted(() => {
    localStorage.removeItem('projectile:layout:v1')
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
  function getMeasured() { return (lab.measured.value as Record<string, unknown>) }

  const colWidths = reactive({ data: 280, vis: 0, ctrl: 280 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX, startData = colWidths.data, startCtrl = colWidths.ctrl
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
        layout.movePanel(id as string, col, insertAfterId as string | null)
        return
      }
    }
  }

  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials recorded'); return }
    const readings = tList.map(t => ({
      angleDegrees: t.angleDegrees, initialVelocity: t.initialVelocity,
      v0Squared: t.initialVelocity * t.initialVelocity,
      sin2Theta: Math.sin(2 * t.angleDegrees * Math.PI / 180),
      flightTimeSec: t.flightTimeSec, maxHeightMeters: t.maxHeightMeters, rangeMeters: t.rangeMeters,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'projectile', sourceNameAr: 'حركة المقذوفات', readings,
      columns: [
        { key: 'angleDegrees', label: 'الزاوية', unit: '°' },
        { key: 'initialVelocity', label: 'v₀', unit: 'm/s' },
        { key: 'v0Squared', label: 'v₀²', unit: 'm²/s²' },
        { key: 'sin2Theta', label: 'sin(2θ)', unit: '' },
        { key: 'flightTimeSec', label: 'زمن الرحلة', unit: 's' },
        { key: 'maxHeightMeters', label: 'الارتفاع الأقصى', unit: 'm' },
        { key: 'rangeMeters', label: 'المدى', unit: 'm' },
      ],
      equations: [
        { name: 'المدى الأقصى', formula: 'R = v₀²·sin(2θ)/g', variables: [{ symbol: 'v0', label: 'v₀' }, { symbol: 'θ', label: 'الزاوية' }, { symbol: 'g', label: 'g' }, { symbol: 'R', label: 'المدى' }], solveFor: ['R', 'v0', 'θ'] },
        { name: 'الارتفاع الأقصى', formula: 'H = v₀²·sin²(θ)/(2g)', variables: [{ symbol: 'v0', label: 'v₀' }, { symbol: 'θ', label: 'الزاوية' }, { symbol: 'g', label: 'g' }, { symbol: 'H', label: 'الارتفاع' }], solveFor: ['H'] },
      ],
      suggestedPlots: [
        { xKey: 'rangeMeters', yKey: 'maxHeightMeters', xLabel: 'R (m)', yLabel: 'H (m)', type: 'scatter' },
        { xKey: 'v0Squared', yKey: 'rangeMeters', xLabel: 'v₀² (m²/s²)', yLabel: 'R (m)', type: 'scatter' },
        { xKey: 'sin2Theta', yKey: 'rangeMeters', xLabel: 'sin(2θ)', yLabel: 'R (m)', type: 'scatter' },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, lab, layout, trials,
    resetSim, runProjectileLab,
    stepIndex, tutorType, tutorMessage,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured,
    colWidths, onResizeStart, handleDrop,
    exportToAnalysis,
  }
}
