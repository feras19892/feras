import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import { useI18n } from '../../composables/useI18n'
import type { AnalysisPayload } from '../../types/physics'
import type { InclinedParams } from '../../modules/physics/experiments/inclined/useInclinedPhysics'
import { useInclinedLab } from './useInclinedLab'
import { useInclinedLayout } from './useInclinedLayout'
import { useInclinedTrials } from './useInclinedTrials'

export function useInclinedExperiment() {
  const { t } = useI18n()
  const router = useRouter()

  const params = reactive<InclinedParams>({ thetaDeg: 30, length: 2.0, mass: 1.0, g: 9.81, mu: 0.0, airResistance: false, bodyTypeId: 'block', cd: 1.05, area: 0.01 })

  const lab = useInclinedLab(params)
  const layout = useInclinedLayout()
  const enableNoise = ref(true)
  const trials = useInclinedTrials(params, lab.measured, enableNoise)

  function resetSim() { lab.resetSim() }
  function runInclinedLab() { lab.runInclinedLab(trials.recordTrial) }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.sim.running) return 'info'; if (lab.sim.paused) return 'warn'; return 'success' })
  const tutorMessage = computed(() => {
    if (!lab.sim.running) return t('experiments.adjustParamsAndPressStart')
    if (lab.sim.paused) return t('experiments.pausedTemporarily')
    if (lab.sim.arrived) return t('experiments.bodyReachedBasePressRecord')
    return t('experiments.bodyIsSliding')
  })

  watch(() => [params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.bodyTypeId, params.cd, params.area], () => { if (!lab.running.value) resetSim() })

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
        layout.movePanel(id as string, col, insertAfterId as string | null)
        return
      }
    }
  }

  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { alert('تحتاج إلى تسجيل قراءة واحدة على الأقل قبل التحليل'); return }
    const readings = tList.map(tr => ({
      thetaDeg: tr.thetaDeg,
      sinTheta: Math.sin(tr.thetaDeg * Math.PI / 180),
      length: tr.length, mass: tr.mass,
      acceleration: tr.acceleration, timeOfArrival: tr.timeOfArrival, finalVelocity: tr.finalVelocity,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'inclined', sourceNameAr: t('experiments.expInclined'), hasCalcTab: true, readings,
      columns: [
        { key: 'thetaDeg', label: t('experiments.colAngle'), unit: '°' },
        { key: 'sinTheta', label: 'sinθ', unit: '' },
        { key: 'length', label: t('experiments.colLength'), unit: 'm' },
        { key: 'mass', label: t('experiments.colMass'), unit: 'kg' },
        { key: 'acceleration', label: t('experiments.colAcceleration'), unit: 'm/s²' },
        { key: 'timeOfArrival', label: t('experiments.colTime'), unit: 's' },
        { key: 'finalVelocity', label: t('experiments.colVelocity'), unit: 'm/s' },
      ],
      equations: [
        { name: t('experiments.eqNewtonInclined'), formula: 'a = g·sinθ − μ·g·cosθ', variables: [{ symbol: 'a', label: t('experiments.varAcceleration') }, { symbol: 'g', label: 'g' }, { symbol: 'θ', label: t('experiments.varAngle') }, { symbol: 'μ', label: t('experiments.varMu') }], solveFor: ['a', 'μ', 'θ'] },
        { name: t('experiments.eqUniformMotion'), formula: 's = ½at²', variables: [{ symbol: 's', label: t('experiments.varDistance') }, { symbol: 'a', label: t('experiments.varAcceleration') }, { symbol: 't', label: t('experiments.varTime') }], solveFor: ['a', 't', 's'] },
      ],
      suggestedPlots: [
        { xKey: 'sinTheta', yKey: 'acceleration', xLabel: 'sin(θ)', yLabel: 'a (m/s²)', type: 'scatter' },
        { xKey: 'thetaDeg', yKey: 'acceleration', xLabel: 'θ (°)', yLabel: 'a (m/s²)', type: 'scatter' },
        { xKey: 'timeOfArrival', yKey: 'length', xLabel: 't (s)', yLabel: 's (m)', type: 'scatter' },
      ],
      theoretical: { value: params.g, label: 'g النظري', unit: 'm/s²' },
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, lab, layout, trials,
    resetSim, runInclinedLab,
    stepIndex, tutorType, tutorMessage,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured,
    colWidths, onResizeStart, handleDrop,
    enableNoise,
    exportToAnalysis,
  }
}
