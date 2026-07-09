import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useI18n } from '../useI18n'
import type { AnalysisPayload } from '../../types/physics'
import { useLeverLab } from './useLeverLab'
import { useLeverLayout } from './useLeverLayout'
import { useLeverTrials } from './useLeverTrials'

export function useLeverExperiment() {
  const { t } = useI18n()
  const router = useRouter()
  const lab = useLeverLab()
  const layout = useLeverLayout()
  const trials = useLeverTrials(lab.vector.state, lab.resultant, lab.equilibriumForce, lab.isBalanced)

  function resetSim() { lab.resetSim() }
  function toggleMode() { lab.setMode(lab.mode.value === 'vector' ? 'beam' : 'vector') }

  const stepIndex = computed(() => trials.trials.value.length)
  const tutorType = computed(() => {
    if (lab.mode.value === 'vector') {
      if (lab.vector.state.forces.length === 0) return 'info'
      if (lab.isBalanced.value) return 'success'
      return 'warn'
    }
    if (lab.beam.state.masses.length === 0) return 'info'
    if (Math.abs(lab.netTorque.value) < 0.01) return 'success'
    return 'warn'
  })
  const tutorMessage = computed(() => {
    if (lab.mode.value === 'vector') {
      if (lab.vector.state.forces.length === 0) return t('experiments.addForceHint')
      if (lab.isBalanced.value) return t('experiments.balancedHint')
      return t('experiments.notBalancedHint', { mag: lab.resultant.value.magnitude.toFixed(2) })
    }
    if (lab.beam.state.masses.length === 0) return t('experiments.addMassHint')
    if (Math.abs(lab.netTorque.value) < 0.01) return t('experiments.balancedHint')
    return t('experiments.notBalancedTorqueHint', { torque: Math.abs(lab.netTorque.value).toFixed(2) })
  })

  const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
  const hasVisibleVisPanels = computed(() => getColumnPanels('vis').some(id => layout.isPanelVisible(id)))

  function getColumnPanels(col: string) {
    if (col === 'data' || col === 'vis' || col === 'ctrl') return layout.columnOrder[col]
    return []
  }

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
        layout.movePanel(id, col, insertAfterId)
        return
      }
    }
  }

  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials'); return }
    const readings = tList.map(t => ({ trialNo: t.trialNo, forceCount: t.forceCount, sumFx: t.sumFx, sumFy: t.sumFy, resultantMag: t.resultantMag, resultantAngle: t.resultantAngle, eqForceMag: t.eqForceMag, eqForceAngle: t.eqForceAngle, isBalanced: t.isBalanced ? 1 : 0 }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'lever', sourceNameAr: t('experiments.expLever'), hasCalcTab: true, readings,
      columns: [
        { key: 'trialNo', label: t('experiments.colTrialNo') },
        { key: 'forceCount', label: t('experiments.colForceCount') },
        { key: 'sumFx', label: t('experiments.colSumFx'), unit: 'N' },
        { key: 'sumFy', label: t('experiments.colSumFy'), unit: 'N' },
        { key: 'resultantMag', label: t('experiments.colResultantMag'), unit: 'N' },
        { key: 'resultantAngle', label: t('experiments.colResultantAngle'), unit: 'deg' },
        { key: 'eqForceMag', label: t('experiments.colEqForceMag'), unit: 'N' },
        { key: 'eqForceAngle', label: t('experiments.colEqForceAngle'), unit: 'deg' },
      ],
      equations: [
        { name: t('experiments.eqSumFx'), formula: '∑Fx = 0', variables: [{ symbol: 'Fx', label: t('experiments.varFx') }], solveFor: [] },
        { name: t('experiments.eqSumFy'), formula: '∑Fy = 0', variables: [{ symbol: 'Fy', label: t('experiments.varFy') }], solveFor: [] },
        { name: t('experiments.eqResultant'), formula: 'R = √(∑Fx² + ∑Fy²)', variables: [{ symbol: 'R', label: t('experiments.varResultant') }, { symbol: 'Fx', label: t('experiments.varFx') }, { symbol: 'Fy', label: t('experiments.varFy') }], solveFor: ['R'] },
        { name: t('experiments.eqEquilibrium'), formula: 'F_eq = -R', variables: [{ symbol: 'F_eq', label: t('experiments.varEquilibrium') }, { symbol: 'R', label: t('experiments.varResultant') }], solveFor: [] },
      ],
      suggestedPlots: [
        { xKey: 'resultantAngle', yKey: 'resultantMag', xLabel: t('experiments.resultantAngle'), yLabel: t('experiments.resultantMag'), type: 'scatter' },
      ],
    }
    sendToAnalysis(router, payload)
  }

  onMounted(() => { layout.applyPersistedLayout(); trials.autoLoad() })
  onUnmounted(() => lab.cleanup())

  return {
    lab, layout, trials, resetSim, toggleMode,
    stepIndex, tutorType, tutorMessage,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    colWidths, onResizeStart, handleDrop,
    exportToAnalysis,
  }
}
