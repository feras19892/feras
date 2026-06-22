import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import { useI18n } from '../../composables/useI18n'
import type { AnalysisPayload } from '../../types/physics'
import type { CollisionParams } from '../../modules/physics/experiments/collision/useCollisionPhysics'
import { useCollisionLab } from './useCollisionLab'
import { useCollisionTrials } from './useCollisionTrials'
import { useCollisionLayout, type PanelId, type ColumnId } from './useCollisionLayout'

export function useCollisionExperiment() {
  const { t } = useI18n()
  const router = useRouter()

  const params = reactive<CollisionParams>({ m1: 2, m2: 3, v1i: 3, v2i: -2, r1: 0.2, r2: 0.2, e: 1 })

  const lab = useCollisionLab(params)
  const layout = useCollisionLayout()
  const trials = useCollisionTrials(params, lab.sim)

  function resetSim() { lab.resetSim() }

  const colClasses: Record<ColumnId, string> = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
  const hasVisibleVisPanels = computed(() => getColumnPanels('vis').some(id => layout.isPanelVisible(id)))

  function getColumnPanels(col: ColumnId): PanelId[] {
    return layout.columnOrder[col] ?? []
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
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDrop(id: string, x: number, y: number) {
    const cols: ColumnId[] = ['data', 'vis', 'ctrl']
    for (const col of cols) {
      const colEl = document.querySelector(`.${colClasses[col]}`)
      if (!colEl) continue
      const colRect = colEl.getBoundingClientRect()
      if (x >= colRect.left && x < colRect.right && y >= colRect.top && y < colRect.bottom) {
        const panelEls = Array.from(colEl.querySelectorAll('.draggable-panel[data-id]'))
        let insertAfterId: PanelId | null = null
        for (const el of panelEls) {
          const pid = el.getAttribute('data-id')
          if (!pid || pid === id) continue
          const rect = el.getBoundingClientRect()
          if (y >= rect.top && y <= rect.bottom) { if (y > rect.top + rect.height / 2) insertAfterId = pid as PanelId; break }
          if (y > rect.bottom) insertAfterId = pid as PanelId
        }
        layout.movePanel(id, col, insertAfterId)
        return
      }
    }
  }

  watch(() => [params.m1, params.m2, params.v1i, params.v2i, params.r1, params.r2, params.e], () => { if (!lab.running.value) resetSim() })

  function updateParams(p: Partial<CollisionParams>) {
    Object.assign(params, p)
  }

  onMounted(() => {
    layout.applyPersistedLayout()
    trials.autoLoad()
    resetSim()
  })
  onUnmounted(() => lab.cleanup())

  function exportToAnalysis() {
    layout.showPanels(['params', 'data'])
    const tList = trials.trials.value
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials recorded'); return }
    const readings = tList.map(t => ({
      m1: t.m1, m2: t.m2, v1i: t.v1i, v2i: t.v2i,
      v1f: t.v1f, v2f: t.v2f, Pi: t.Pi, Pf: t.Pf, KEi: t.KEi, KEf: t.KEf, lossPercent: t.lossPercent,
    }))
    const payload: AnalysisPayload = {
      sourceExperiment: 'collision', sourceNameAr: t('experiments.expCollision'), readings,
      columns: [
        { key: 'm1', label: 'm₁', unit: 'kg' },
        { key: 'm2', label: 'm₂', unit: 'kg' },
        { key: 'v1i', label: 'v₁i', unit: 'm/s' },
        { key: 'v2i', label: 'v₂i', unit: 'm/s' },
        { key: 'v1f', label: 'v₁f', unit: 'm/s' },
        { key: 'v2f', label: 'v₂f', unit: 'm/s' },
        { key: 'Pi', label: `P ${t('experiments.before')}`, unit: 'kg·m/s' },
        { key: 'Pf', label: `P ${t('experiments.after')}`, unit: 'kg·m/s' },
        { key: 'KEi', label: `KE ${t('experiments.before')}`, unit: 'J' },
        { key: 'KEf', label: `KE ${t('experiments.after')}`, unit: 'J' },
        { key: 'lossPercent', label: t('experiments.colEnergyLoss'), unit: '%' },
      ],
      equations: [
        { name: t('experiments.eqMomentumConservation'), formula: 'm₁v₁i + m₂v₂i = m₁v₁f + m₂v₂f', variables: [{ symbol: 'm1', label: 'm₁' }, { symbol: 'm2', label: 'm₂' }, { symbol: 'v1i', label: 'v₁i' }, { symbol: 'v2i', label: 'v₂i' }, { symbol: 'v1f', label: 'v₁f' }, { symbol: 'v2f', label: 'v₂f' }], solveFor: ['v1f', 'v2f'] },
        { name: t('experiments.eqRestitution'), formula: 'e = (v₂f − v₁f)/(v₁i − v₂i)', variables: [{ symbol: 'e', label: 'e' }, { symbol: 'v1i', label: 'v₁i' }, { symbol: 'v2i', label: 'v₂i' }, { symbol: 'v1f', label: 'v₁f' }, { symbol: 'v2f', label: 'v₂f' }], solveFor: ['e'] },
      ],
      suggestedPlots: [
        { xKey: 'm1', yKey: 'v1f', xLabel: 'm₁ (kg)', yLabel: 'v₁f (m/s)', type: 'scatter' },
        { xKey: 'KEi', yKey: 'KEf', xLabel: `KE ${t('experiments.before')} (J)`, yLabel: `KE ${t('experiments.after')} (J)`, type: 'scatter' },
      ],
    }
    sendToAnalysis(router, payload)
  }

  return {
    params, lab, layout, trials,
    resetSim, updateParams,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    colWidths, onResizeStart, handleDrop,
    exportToAnalysis,
  }
}
