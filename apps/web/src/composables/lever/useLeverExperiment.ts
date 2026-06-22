import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import { useI18n } from '../../composables/useI18n'
import type { AnalysisPayload } from '../../types/physics'
import type { LeverParams } from '../../modules/physics/experiments/lever/useLeverPhysics'
import { useLeverLab } from './useLeverLab'
import { useLeverTrials } from './useLeverTrials'
import { useLeverLayout } from './useLeverLayout'

export function useLeverExperiment() {
  const { t } = useI18n()
  const router = useRouter()
  const params = reactive<LeverParams>({ beamLength: 10, g: 9.81, maxTiltDeg: 15, snapStep: 0.5 })
  const lab = useLeverLab(params)
  const layout = useLeverLayout()
  const trials = useLeverTrials(params, lab.sim)

  function resetSim() { lab.resetSim() }

  const stepIndex = computed(() => trials.trials.value.length)
  const tutorType = computed(() => {
    if (lab.sim.balls.length === 0 && lab.sim.forces.length === 0) return 'info'
    if (lab.sim.isBalanced) return 'success'
    return 'warn'
  })
  const tutorMessage = computed(() => {
    if (lab.sim.balls.length === 0 && lab.sim.forces.length === 0) return t('experiments.addBallsOrForcesThenPressStart')
    if (lab.sim.isBalanced) return t('experiments.balancedPressRecord')
    return lab.sim.netTorque > 0
      ? t('experiments.torqueToRight', { torque: lab.sim.netTorque.toFixed(1) })
      : t('experiments.torqueToLeft', { torque: Math.abs(lab.sim.netTorque).toFixed(1) })
  })

  // === Drag & Drop / Resizing ===
  const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col' }
  const hasVisibleVisPanels = computed(() => getColumnPanels('vis').some(id => layout.isPanelVisible(id)))

  function getColumnPanels(col: string) {
    if (col === 'data' || col === 'vis') return layout.columnOrder[col]
    return []
  }

  const colWidths = reactive({ data: 460, vis: 0 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX
    const startData = colWidths.data
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') { colWidths.data = Math.max(260, Math.min(500, startData - dx)) }
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDrop(id: string, x: number, y: number) {
    type ColumnId = 'data' | 'vis'
    const cols: ColumnId[] = ['data', 'vis']
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

  // === Export to Analysis ===
  function exportToAnalysis() {
    layout.showPanels(['balls', 'table'])
    const tList = trials.trials.value
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials recorded'); return }

    const readings = tList.map(t => {
      const left = t.balls.filter((b: {x: number}) => b.x < 0)
      const right = t.balls.filter((b: {x: number}) => b.x > 0)
      return {
        trialNo: t.trialNo,
        massLeft: left.reduce((s: number, b: {mass: number}) => s + b.mass, 0),
        massRight: right.reduce((s: number, b: {mass: number}) => s + b.mass, 0),
        xLeft: left.length > 0 ? Math.min(...left.map((b: {x: number}) => b.x)) : 0,
        xRight: right.length > 0 ? Math.max(...right.map((b: {x: number}) => b.x)) : 0,
        invXLeft: left.length > 0 ? 1 / Math.abs(Math.min(...left.map((b: {x: number}) => b.x))) : 0,
        invXRight: right.length > 0 ? 1 / Math.max(...right.map((b: {x: number}) => b.x)) : 0,
        netTorque: t.netTorque,
        tiltDeg: t.tiltDeg,
      }
    })

    const payload: AnalysisPayload = {
      sourceExperiment: 'lever',
      sourceNameAr: t('experiments.expLever'),
      readings,
      columns: [
        { key: 'trialNo', label: t('experiments.colTrialNo') },
        { key: 'massLeft', label: t('experiments.colMassLeft'), unit: 'kg' },
        { key: 'massRight', label: t('experiments.colMassRight'), unit: 'kg' },
        { key: 'xLeft', label: t('experiments.colArmLeft'), unit: 'm' },
        { key: 'xRight', label: t('experiments.colArmRight'), unit: 'm' },
        { key: 'invXLeft', label: t('experiments.colInvArmLeft'), unit: '1/m' },
        { key: 'invXRight', label: t('experiments.colInvArmRight'), unit: '1/m' },
        { key: 'netTorque', label: t('experiments.colNetTorque'), unit: 'N·m' },
        { key: 'tiltDeg', label: t('experiments.colTiltDeg'), unit: '°' },
      ],
      equations: [
        {
          name: t('experiments.eqLeverLaw'),
          formula: 'τ = m · g · x',
          variables: [
            { symbol: 'm', label: t('experiments.varMass') },
            { symbol: 'g', label: t('experiments.varG') },
            { symbol: 'x', label: t('experiments.varLeverDistance') },
          ],
          solveFor: ['m', 'x'],
        },
      ],
      suggestedPlots: [
        { xKey: 'invXLeft', yKey: 'massLeft', xLabel: `1/d_${t('experiments.leftSide')} (1/m)`, yLabel: `m_${t('experiments.leftSide')} (kg)`, type: 'scatter' },
        { xKey: 'invXRight', yKey: 'massRight', xLabel: `1/d_${t('experiments.rightSide')} (1/m)`, yLabel: `m_${t('experiments.rightSide')} (kg)`, type: 'scatter' },
      ],
    }

    sendToAnalysis(router, payload)
  }

  onMounted(() => {
    layout.applyPersistedLayout()
    trials.autoLoad()
    resetSim()
  })
  onUnmounted(() => lab.cleanup())

  watch(() => [params.beamLength, params.g, params.snapStep], () => {
    resetSim()
  })

  return {
    params,
    lab,
    layout,
    trials,
    resetSim,
    stepIndex,
    tutorType,
    tutorMessage,
    colClasses,
    hasVisibleVisPanels,
    getColumnPanels,
    colWidths,
    onResizeStart,
    handleDrop,
    exportToAnalysis,
  }
}
