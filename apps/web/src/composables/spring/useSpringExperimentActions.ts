import type { SpringExperimentState } from './useSpringExperimentState'
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export function useSpringExperimentActions(
  state: SpringExperimentState,
  lab: { resetSim: () => void; sim: { running: boolean; paused: boolean; x: number; v: number }; runSpringLab: (recordTrial: () => void, calcFitK: () => void) => void; cleanup: () => void },
  trials: { recordTrial: () => void; calcFitK: () => void; autoLoad: () => void; trials: { value: any[] } },
  layout: { applyPersistedLayout: () => void; movePanel: (id: any, col: any, afterId: any) => void },
) {
  const router = useRouter()
  function resetSim() { lab.resetSim() }

  function toggleMass() {
    if (state.params.mass > 0) { state.previousMass.value = state.params.mass; state.params.mass = 0 }
    else { state.params.mass = state.previousMass.value || 1.0 }
    resetSim()
  }

  function runSpringLab() { lab.runSpringLab(trials.recordTrial, trials.calcFitK) }

  function pullDown() {
    if (lab.sim.running && !lab.sim.paused) return
    const step = 0.005
    state.ignoreParamsWatch.value = true
    lab.sim.x = Math.round((lab.sim.x + step) * 1000) / 1000
    lab.sim.v = 0
    setTimeout(() => { state.ignoreParamsWatch.value = false }, 0)
  }

  function pushUp() {
    if (lab.sim.running && !lab.sim.paused) return
    const step = 0.005
    state.ignoreParamsWatch.value = true
    lab.sim.x = Math.round((lab.sim.x - step) * 1000) / 1000
    lab.sim.v = 0
    setTimeout(() => { state.ignoreParamsWatch.value = false }, 0)
  }

  function onStaticComplete(readings: any[], k: number | null) {
    state.staticReadings.value = readings
    state.staticK.value = k
  }
  function onDynamicComplete(_t: any[], _k: number | null) { /* no-op */ }

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX
    const startData = state.colWidths.data
    const startCtrl = state.colWidths.ctrl
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') { state.colWidths.data = Math.max(160, Math.min(500, startData - dx)) }
      else { state.colWidths.ctrl = Math.max(160, Math.min(500, startCtrl + dx)) }
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDrop(id: string, x: number, y: number) {
    type ColumnId = 'data' | 'vis' | 'ctrl'
    const cols: ColumnId[] = ['data', 'vis', 'ctrl']
    const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
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
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials recorded'); return }

    const readings = tList.map((t: any) => ({
      mass: t.mass, T: t.T, T2: t.T * t.T, kCalc: t.kCalc,
    }))

    const payload: AnalysisPayload = {
      sourceExperiment: 'spring',
      sourceNameAr: 'تجربة النابض',
      readings,
      columns: [
        { key: 'mass', label: 'الكتلة', unit: 'kg' },
        { key: 'T', label: 'الدورة', unit: 's' },
        { key: 'T2', label: 'T²', unit: 's²' },
        { key: 'kCalc', label: 'k المحسوب', unit: 'N/m' },
      ],
      equations: [
        {
          name: 'قانون النابض',
          formula: 'T = 2π√(m/k)',
          variables: [
            { symbol: 'm', label: 'الكتلة' },
            { symbol: 'T', label: 'الدورة' },
            { symbol: 'k', label: 'ثابت النابض' },
          ],
          solveFor: ['k', 'T', 'm'],
        },
        {
          name: 'ثابت النابض من الانحدار',
          formula: 'T² = (4π²/k) · m',
          variables: [
            { symbol: 'm', label: 'الكتلة' },
            { symbol: 'T', label: 'الدورة' },
            { symbol: 'k', label: 'ثابت النابض' },
          ],
          solveFor: ['k'],
        },
      ],
      suggestedPlots: [
        { xKey: 'mass', yKey: 'T2', xLabel: 'm (kg)', yLabel: 'T² (s²)', type: 'scatter' as const },
        { xKey: 'mass', yKey: 'T', xLabel: 'm (kg)', yLabel: 'T (s)', type: 'scatter' as const },
      ],
    }

    sendToAnalysis(router, payload)
  }

  return {
    resetSim, toggleMass, runSpringLab, pullDown, pushUp,
    onStaticComplete, onDynamicComplete,
    onResizeStart, handleDrop, exportToAnalysis,
  }
}
