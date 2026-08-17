import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useI18n } from '../useI18n'
import type { AnalysisPayload } from '../../types/physics'
import type { NetForceParams } from '../../modules/physics/experiments/netforce/useNetForcePhysics'
import { useNetForceLab } from './useNetForceLab'
import { useNetForceLayout } from './useNetForceLayout'
import { useNetForceTrials } from './useNetForceTrials'
import { calcAutoBalance, type CustomForce } from './netforceUtils'

export function useNetForceExperiment() {
  const { t } = useI18n()
  const router = useRouter()

  const params = reactive<NetForceParams>({
    mode: 'equilibrium',
    mass: 1.0, g: 9.81,
    appliedForce: 10, appliedAngle: 0, mu: 0.2, surfaceAngle: 0,
    tension: 0, tensionAngle: 90,
    radius: 0.5, angularVelocity: 3,
    customForces: [],
  })

  const lab = useNetForceLab(params)
  const layout = useNetForceLayout()
  const enableNoise = ref(true)
  const trials = useNetForceTrials(params, lab.measured, enableNoise)

  function resetSim() { lab.resetSim() }
  function runNetForceLab() { lab.runNetForceLab(trials.recordTrial) }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => {
    if (!lab.sim.running) return 'info'
    if (lab.sim.paused) return 'warn'
    return 'success'
  })
  const tutorMessage = computed(() => {
    if (!lab.sim.running) return t('experiments.adjustParamsAndPressStart')
    if (lab.sim.paused) return t('experiments.pausedTemporarily')
    if (params.mode === 'equilibrium') {
      if (lab.sim.motionState === 'equilibrium') return 'استقر الجسم — توازنت القوى! اضغط تسجيل'
      if (lab.sim.motionState === 'sliding') return 'الجسم ينزلق — القوى غير متوازنة'
      return 'الجسم ساكن — الاحتكاك يمسكه'
    }
    if (params.mode === 'centripetal') return 'الجسم يدور — اضغط تسجيل'
    return 'المحاكاة قيد التشغيل'
  })

  watch(() => [params.mode, params.mass, params.g, params.appliedForce, params.appliedAngle,
    params.mu, params.surfaceAngle, params.tension, params.tensionAngle,
    params.radius, params.angularVelocity, params.customForces], () => {
    if (!lab.running.value) {
      lab.updateMeasurements()
    }
  })

  onMounted(() => {
    layout.applyPersistedLayout()
    trials.autoLoad()
    lab.updateMeasurements()
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
        layout.movePanel(id, col, insertAfterId)
        return
      }
    }
  }

  let nextForceId = 1
  function addCustomForce() {
    params.customForces.push({ id: nextForceId++, magnitude: 5, angle: 45, label: `F${params.customForces.length + 1}` })
    lab.updateMeasurements()
  }
  function removeCustomForce(id: number) {
    params.customForces = params.customForces.filter(f => f.id !== id)
    lab.updateMeasurements()
  }
  function updateCustomForce(id: number, patch: Partial<CustomForce>) {
    const f = params.customForces.find(f => f.id === id)
    if (f) Object.assign(f, patch)
    lab.updateMeasurements()
  }

  function autoBalance() {
    if (params.mode !== 'equilibrium') return
    const F = calcAutoBalance(
      params.mass, params.g, params.appliedAngle, params.mu,
      params.surfaceAngle, params.tension, params.tensionAngle,
      params.customForces,
    )
    params.appliedForce = F
    lab.updateMeasurements()
  }

  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { alert('تحتاج إلى تسجيل قراءة واحدة على الأقل قبل التحليل'); return }
    const readings = tList.map(tr => ({
      mode: tr.mode, mass: tr.mass,
      appliedForce: tr.appliedForce, appliedAngle: tr.appliedAngle,
      netForceMag: tr.netForceMag, isBalanced: tr.isBalanced ? 1 : 0,
      radius: tr.radius, angularVelocity: tr.angularVelocity,
      omegaSquared: tr.angularVelocity * tr.angularVelocity,
      centripetalForce: tr.centripetalForce, centripetalAcc: tr.centripetalAcc,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'netforce', sourceNameAr: t('experiments.expNetForce'),
      hasCalcTab: true, readings,
      columns: [
        { key: 'mass', label: 'm (kg)', unit: 'kg' },
        { key: 'appliedForce', label: 'F (N)', unit: 'N' },
        { key: 'appliedAngle', label: 'θ (°)', unit: '°' },
        { key: 'netForceMag', label: 'F_net (N)', unit: 'N' },
        { key: 'radius', label: 'r (m)', unit: 'm' },
        { key: 'angularVelocity', label: 'ω (rad/s)', unit: 'rad/s' },
        { key: 'omegaSquared', label: 'ω² (rad²/s²)', unit: 'rad²/s²' },
        { key: 'centripetalForce', label: 'Fc (N)', unit: 'N' },
      ],
      equations: [
        { name: 'محصلة القوى', formula: 'F_net = √(ΣFx² + ΣFy²)', variables: [{ symbol: 'F_net', label: 'Net Force' }], solveFor: ['F_net'] },
        { name: 'القوة المركزية', formula: 'Fc = m·ω²·r', variables: [{ symbol: 'Fc', label: 'Centripetal Force' }, { symbol: 'm', label: 'Mass' }, { symbol: 'ω', label: 'Angular Velocity' }, { symbol: 'r', label: 'Radius' }], solveFor: ['Fc', 'm', 'r'] },
        { name: 'شرط التوازن', formula: 'ΣF = 0', variables: [], solveFor: [] },
      ],
      suggestedPlots: [
        { xKey: 'appliedAngle', yKey: 'netForceMag', xLabel: 'θ (°)', yLabel: 'F_net (N)', type: 'scatter' },
        { xKey: 'omegaSquared', yKey: 'centripetalForce', xLabel: 'ω² (rad²/s²)', yLabel: 'Fc (N)', type: 'scatter' },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, lab, layout, trials,
    resetSim, runNetForceLab, autoBalance,
    addCustomForce, removeCustomForce, updateCustomForce,
    stepIndex, tutorType, tutorMessage,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured, colWidths, onResizeStart, handleDrop,
    enableNoise, exportToAnalysis,
  }
}
