import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import { useI18n } from '../../composables/useI18n'
import type { AnalysisPayload } from '../../types/physics'
import type { PendulumParams } from '../../modules/physics/experiments/pendulum/usePendulumPhysics'
import { usePendulumLab } from './usePendulumLab'
import { usePendulumLayout } from './usePendulumLayout'
import { usePendulumTrials } from './usePendulumTrials'

export function usePendulumExperiment() {
  const { t } = useI18n()
  const router = useRouter()

  const params = reactive<PendulumParams>({ length: 0.50, g: 9.81, theta0: 10 * Math.PI / 180, theta0Deg: 10, mass: 0.05, damping: 0.02, measureCycles: 20, bobRadius: 0.02, airDensity: 1.225, springK: 10, springRestLength: 0.08 })

  // Sync theta0 <-> theta0Deg (avoid circular loop)
  watch(() => params.theta0Deg, (deg) => { params.theta0 = deg * Math.PI / 180 }, { flush: 'sync' })
  watch(() => params.theta0, (rad) => { params.theta0Deg = Math.round(rad * 180 / Math.PI) }, { flush: 'sync' })

  const lab = usePendulumLab(params)
  const layout = usePendulumLayout()
  const trials = usePendulumTrials(params, lab.measured)

  function resetSim() { lab.resetSim() }
  function runPendulumLab() { lab.runPendulumLab(trials.recordTrial, trials.calcFitG) }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.running.value) return 'info'; if (lab.paused.value) return 'warn'; return 'success' })
  const tutorMessage = computed(() => { if (!lab.running.value) return t('experiments.readyToStart'); if (lab.paused.value) return t('experiments.pausedTemporarily'); return t('experiments.simulationRunning') })

  const fftResult = ref<{ freqs: number[]; amplitudes: number[]; dominantFreq: number } | null>(null)

  watch(() => [params.length, params.g, params.theta0, params.mass, params.damping], () => { if (!lab.running.value) resetSim() })

  onMounted(() => {
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
        layout.movePanel(id as string, col, insertAfterId as string | null)
        return
      }
    }
  }

  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { alert('تحتاج إلى تسجيل قراءة واحدة على الأقل قبل التحليل'); return }
    const readings = tList.map(tr => ({ length: tr.length, T: tr.T, T2: tr.T * tr.T, gCalc: tr.gCalc }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'pendulum', sourceNameAr: t('experiments.expPendulum'), hasCalcTab: true, readings,
      columns: [
        { key: 'length', label: t('experiments.varStringLength'), unit: 'm' },
        { key: 'T', label: t('experiments.colPeriod'), unit: 's' },
        { key: 'T2', label: 'T²', unit: 's²' },
        { key: 'gCalc', label: t('experiments.colGCalc'), unit: 'm/s²' },
      ],
      equations: [
        { name: t('experiments.eqPendulum'), formula: 'T = 2π√(L/g)', variables: [{ symbol: 'L', label: t('experiments.varStringLength') }, { symbol: 'T', label: t('experiments.varPeriod') }, { symbol: 'g', label: t('experiments.varGravity') }], solveFor: ['g', 'T', 'L'] },
        { name: t('experiments.eqPendulumG'), formula: 'T² = (4π²/g) · L', variables: [{ symbol: 'L', label: t('experiments.varStringLength') }, { symbol: 'T', label: t('experiments.varPeriod') }, { symbol: 'g', label: t('experiments.varGravity') }], solveFor: ['g'] },
      ],
      suggestedPlots: [
        { xKey: 'length', yKey: 'T2', xLabel: 'L (m)', yLabel: 'T² (s²)', type: 'scatter' },
        { xKey: 'length', yKey: 'T', xLabel: 'L (m)', yLabel: 'T (s)', type: 'scatter' },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, lab, layout, trials,
    resetSim, runPendulumLab,
    stepIndex, tutorType, tutorMessage,
    fftResult,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured, getEffectiveMass,
    colWidths, onResizeStart, handleDrop,
    exportToAnalysis,
  }
}
