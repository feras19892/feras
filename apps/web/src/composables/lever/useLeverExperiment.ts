import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'
import type { LeverParams } from '../../modules/physics/experiments/lever/useLeverPhysics'
import { useLeverLab } from './useLeverLab'
import { useLeverTrials } from './useLeverTrials'
import { useLeverLayout } from './useLeverLayout'

export function useLeverExperiment() {
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
    if (lab.sim.balls.length === 0 && lab.sim.forces.length === 0) return 'أضف كراتاً أو قوى ثم اضغط "بدء"'
    if (lab.sim.isBalanced) return '⚖️ متوازن! اضغط "تسجيل"'
    return lab.sim.netTorque > 0
      ? `↻ العزم لليمين (${lab.sim.netTorque.toFixed(1)} N·m)`
      : `↺ العزم لليسار (${Math.abs(lab.sim.netTorque).toFixed(1)} N·m)`
  })

  // === Drag & Drop / Resizing ===
  const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col' }
  const hasVisibleVisPanels = computed(() => getColumnPanels('vis').some(id => layout.isPanelVisible(id)))

  function getColumnPanels(col: string) {
    if (col === 'data' || col === 'vis') return layout.columnOrder[col]
    return []
  }

  const colWidths = reactive({ data: 260, vis: 0 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX
    const startData = colWidths.data
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') { colWidths.data = Math.max(200, Math.min(500, startData - dx)) }
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
    if (tList.length === 0) { alert('لا توجد قراءات مسجلة'); return }

    const readings = tList.map(t => {
      const left = t.balls.filter((b: {x: number}) => b.x < 0)
      const right = t.balls.filter((b: {x: number}) => b.x > 0)
      return {
        trialNo: t.trialNo,
        massLeft: left.reduce((s: number, b: {mass: number}) => s + b.mass, 0),
        massRight: right.reduce((s: number, b: {mass: number}) => s + b.mass, 0),
        xLeft: left.length > 0 ? Math.min(...left.map((b: {x: number}) => b.x)) : 0,
        xRight: right.length > 0 ? Math.max(...right.map((b: {x: number}) => b.x)) : 0,
        netTorque: t.netTorque,
        tiltDeg: t.tiltDeg,
      }
    })

    const payload: AnalysisPayload = {
      sourceExperiment: 'lever',
      sourceNameAr: 'توازن العارضة',
      readings,
      columns: [
        { key: 'trialNo', label: 'رقم المحاولة' },
        { key: 'massLeft', label: 'الكتلة اليسرى', unit: 'kg' },
        { key: 'massRight', label: 'الكتلة اليمنى', unit: 'kg' },
        { key: 'xLeft', label: 'ذراع اليسار', unit: 'm' },
        { key: 'xRight', label: 'ذراع اليمين', unit: 'm' },
        { key: 'netTorque', label: 'العزم الصافي', unit: 'N·m' },
        { key: 'tiltDeg', label: 'زاوية الميلان', unit: '°' },
      ],
      equations: [
        {
          name: 'قانون الروافع',
          formula: 'τ = m · g · x',
          variables: [
            { symbol: 'm', label: 'الكتلة' },
            { symbol: 'g', label: 'الجاذبية' },
            { symbol: 'x', label: 'المسافة من الارتكاز' },
          ],
          solveFor: ['m', 'x'],
        },
      ],
      suggestedPlots: [
        { xKey: 'xLeft', yKey: 'massLeft', xLabel: 'x_يسار (m)', yLabel: 'm_يسار (kg)', type: 'scatter' },
        { xKey: 'xRight', yKey: 'massRight', xLabel: 'x_يمين (m)', yLabel: 'm_يمين (kg)', type: 'scatter' },
      ],
    }

    sendToAnalysis(payload)
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
