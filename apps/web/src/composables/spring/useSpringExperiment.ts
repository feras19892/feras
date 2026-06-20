import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sendToAnalysis } from '../../composables/analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

function toDynamicTrials(trials: { mass: number; T: number }[]) {
  return trials.map(t => {
    const tTotal = t.T * 20  // time for 20 oscillations
    return {
      mass: t.mass,
      t1: tTotal,
      t2: tTotal,
      t3: tTotal,
      tAvg: tTotal,
      T: t.T,
      T2: t.T * t.T,
    }
  })
}
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'
import { useSpringLab } from './useSpringLab'
import { useSpringLayout } from './useSpringLayout'
import { useSpringTrials } from './useSpringTrials'

export function useSpringExperiment() {
  const router = useRouter()

  const params = reactive<SpringParams>({ mass: 1.0, k: 50, amplitude: 0.03, damping: 0.5, measureCycles: 5, dampingModel: 'linear', springMass: 0.15 })
  const previousMass = ref(1.0)

  const lab = useSpringLab(params)
  const layout = useSpringLayout()
  const trials = useSpringTrials(params, lab.measured)

  function resetSim() { lab.resetSim() }

  function toggleMass() {
    if (params.mass > 0) { previousMass.value = params.mass; params.mass = 0 }
    else { params.mass = previousMass.value || 1.0 }
    resetSim()
  }

  function runSpringLab() { lab.runSpringLab(trials.recordTrial, trials.calcFitK) }

  function pullDown() {
    if (lab.sim.running && !lab.sim.paused) return
    const step = 0.005  // 5 mm per click
    ignoreParamsWatch = true
    lab.sim.x = Math.round((lab.sim.x + step) * 1000) / 1000
    lab.sim.v = 0
    setTimeout(() => { ignoreParamsWatch = false }, 0)
  }
  function pushUp() {
    if (lab.sim.running && !lab.sim.paused) return
    const step = 0.005  // 5 mm per click
    ignoreParamsWatch = true
    lab.sim.x = Math.round((lab.sim.x - step) * 1000) / 1000
    lab.sim.v = 0
    setTimeout(() => { ignoreParamsWatch = false }, 0)
  }

  const stepIndex = computed(() => trials.trials.value.length >= 2 ? 2 : trials.trials.value.length > 0 ? 1 : 0)
  const tutorType = computed(() => { if (!lab.sim.running) return 'info'; if (lab.sim.paused) return 'warn'; return 'success' })
  const tutorMessage = computed(() => { if (!lab.sim.running) return 'جاهز للبدء'; if (lab.sim.paused) return 'متوقف مؤقتاً'; return 'المحاكاة تعمل...' })

  const staticK = ref<number | null>(null)
  const staticReadings = ref<any[]>([])
  const fftResult = ref<{ freqs: number[]; amplitudes: number[]; dominantFreq: number } | null>(null)
  let ignoreParamsWatch = false

  const dynamicTrials = computed(() => toDynamicTrials(trials.trials.value))
  const kDynamic = computed(() => trials.trials.value.length > 0 ? trials.trialStats.value.k_mean : null)

  function onStaticComplete(readings: any[], k: number | null) { staticReadings.value = readings; staticK.value = k }
  function onDynamicComplete(_t: any[], _k: number | null) { /* no-op, kDynamic is computed */ }

  watch(() => [params.mass, params.k, params.amplitude, params.damping], () => { 
    if (ignoreParamsWatch) return
    if (!lab.running.value) resetSim() 
  })

  // Auto-save static experiment state
  watch([staticK, staticReadings], () => {
    try {
      localStorage.setItem('spring:experiment:v1', JSON.stringify({
        staticK: staticK.value,
        staticReadings: staticReadings.value,
        kDynamic: kDynamic.value,
      }))
    } catch { /* ignore */ }
  }, { deep: true })

  onMounted(() => {
    localStorage.removeItem('spring:layout:v1')
    layout.applyPersistedLayout()
    trials.autoLoad()
    // Load saved static/dynamic data
    try {
      const raw = localStorage.getItem('spring:experiment:v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.staticK !== undefined) staticK.value = parsed.staticK
        if (Array.isArray(parsed.staticReadings)) {
          // Filter corrupted readings with impossible values
          staticReadings.value = parsed.staticReadings.filter((r: any) =>
            r && typeof r.mass === 'number' && r.mass >= 0 && r.mass <= 20
          )
        }
      }
    } catch { /* ignore */ }
    resetSim()
  })
  onUnmounted(() => lab.cleanup())

  const colClasses: Record<string, string> = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
  const hasVisibleVisPanels = computed(() => getColumnPanels('vis').some(id => layout.isPanelVisible(id)))

  function getColumnPanels(col: string) {
    if (col === 'data' || col === 'vis' || col === 'ctrl') return layout.columnOrder[col]
    return []
  }
  function getMeasured() { return (lab.measured.value as any) }
  function getEffectiveMass() { return (lab.effectiveMass.value as number) }

  const colWidths = reactive({ data: 280, vis: 0, ctrl: 280 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX
    const startData = colWidths.data
    const startCtrl = colWidths.ctrl
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
        layout.movePanel(id as any, col, insertAfterId as any)
        return
      }
    }
  }

  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { alert('لا توجد قراءات مسجلة'); return }

    const readings = tList.map(t => ({
      mass: t.mass,
      T: t.T,
      T2: t.T * t.T,
      kCalc: t.kCalc,
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
        { xKey: 'mass', yKey: 'T2', xLabel: 'm (kg)', yLabel: 'T² (s²)', type: 'scatter' },
        { xKey: 'mass', yKey: 'T', xLabel: 'm (kg)', yLabel: 'T (s)', type: 'scatter' },
      ],
    }

    sendToAnalysis(payload)
  }

  return {
    params, previousMass, lab, layout, trials,
    resetSim, toggleMass, runSpringLab, pullDown, pushUp,
    stepIndex, tutorType, tutorMessage,
    staticK, staticReadings, dynamicTrials, kDynamic, fftResult,
    onStaticComplete, onDynamicComplete,
    colClasses, hasVisibleVisPanels, getColumnPanels,
    getMeasured, getEffectiveMass,
    colWidths, onResizeStart, handleDrop,
    exportToAnalysis,
  }
}
