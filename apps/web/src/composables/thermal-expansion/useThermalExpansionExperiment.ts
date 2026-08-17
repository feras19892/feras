import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useThermalExpansionLayout } from './useThermalExpansionLayout'
import { useThermalExpansionTrials } from './useThermalExpansionTrials'
import { ALPHA, deltaL, finalLength, findAlpha } from './useThermalExpansionCalculations'

export function useThermalExpansionExperiment() {
  const params = reactive({
    material: 'copper' as string,
    L0: 1.0,    // m
    t0: 20,     // °C
    t1: 100,    // °C
  })

  const alpha = computed(() => ALPHA[params.material] ?? 16.5)
  const dL = computed(() => deltaL(params.L0, alpha.value, params.t1 - params.t0))
  const L1 = computed(() => finalLength(params.L0, alpha.value, params.t1 - params.t0))
  const alphaMeasured = computed(() => {
    const dt = params.t1 - params.t0
    if (dt === 0 || params.L0 === 0) return 0
    return findAlpha(dL.value, params.L0, dt)
  })

  watch(() => params.L0, (v) => { params.L0 = Math.max(0.1, Math.min(3, Math.round(v * 100) / 100)) })
  watch(() => params.t0, (v) => { params.t0 = Math.max(0, Math.min(30, Math.round(v))) })
  watch(() => params.t1, (v) => { params.t1 = Math.max(50, Math.min(200, Math.round(v))) })

  const running = ref(false)
  const paused = ref(false)
  const simTime = ref(0)
  const phase = ref<'ready' | 'heating' | 'done'>('ready')

  const currentT = ref(params.t0)

  function updateSim(dt: number) {
    if (!running.value || paused.value) return
    simTime.value += dt
    const HEAT_TIME = 5
    if (simTime.value < HEAT_TIME) {
      phase.value = 'heating'
      const ratio = simTime.value / HEAT_TIME
      currentT.value = params.t0 + (params.t1 - params.t0) * ratio
    } else {
      phase.value = 'done'
      currentT.value = params.t1
    }
  }

  function togglePause() {
    if (!running.value) {
      running.value = true; paused.value = false; simTime.value = 0
      phase.value = 'heating'; currentT.value = params.t0
    } else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false; simTime.value = 0; phase.value = 'ready'
    currentT.value = params.t0
  }

  const layout = useThermalExpansionLayout()
  const trials = useThermalExpansionTrials(
    { get value() { return { material: params.material, L0: params.L0, t0: params.t0, t1: params.t1, deltaL: dL.value, alpha: alpha.value, alphaMeasured: alphaMeasured.value } } }
  )

  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const payload: AnalysisPayload = {
      sourceExperiment: 'thermal-expansion', sourceNameAr: 'التمدد الحراري',
      hasCalcTab: true,
      readings: trials.trials.value.map(tr => ({ material: tr.material, L0: tr.L0, t0: tr.t0, t1: tr.t1, deltaL: tr.deltaL, alpha: tr.alpha })),
      columns: [
        { key: 'material', label: 'Material', unit: '' },
        { key: 'L0', label: 'L0 (m)', unit: 'm' },
        { key: 't0', label: 't0 (°C)', unit: '°C' },
        { key: 't1', label: 't1 (°C)', unit: '°C' },
        { key: 'deltaL', label: 'ΔL (m)', unit: 'm' },
        { key: 'alpha', label: 'α (×10⁻⁶/K)', unit: '×10⁻⁶/K' },
      ],
      equations: [
        { name: 'Linear Expansion', formula: 'ΔL = α × L₀ × ΔT', variables: [{ symbol: 'ΔL', label: 'Length Change' }, { symbol: 'α', label: 'Coefficient' }, { symbol: 'L₀', label: 'Initial Length' }, { symbol: 'ΔT', label: 'Temperature Change' }], solveFor: ['α'] },
      ],
      suggestedPlots: [{ xKey: 't1', yKey: 'deltaL', xLabel: 't1 (°C)', yLabel: 'ΔL (m)', type: 'scatter' }],
    }
    sendToAnalysis(router, payload)
  }
  function handleDrop(fromId: string, x?: number, y?: number) {
    if (x === undefined || y === undefined) return
    const el = document.elementFromPoint(x, y)
    const toPanel = el?.closest('.draggable-panel')
    const toId = toPanel?.getAttribute('data-id')
    if (!toId || fromId === toId) return
    for (const col of Object.keys(layout.columnMap)) {
      const arr = layout.columnMap[col]
      const fi = arr.indexOf(fromId), ti = arr.indexOf(toId)
      if (fi >= 0 && ti >= 0) { const t = arr[fi]; arr[fi] = arr[ti]; arr[ti] = t }
    }
  }
  function onResizeStart(col: string, e: MouseEvent) {
    if (!(col in layout.widths)) return
    const startX = e.clientX, startW = (layout.widths as Record<string, number>)[col] as number
    function move(ev: MouseEvent) { (layout.widths as Record<string, number>)[col] = Math.max(220, startW + (ev.clientX - startX)) }
    function up() { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  const lab = { running, paused, simTime, phase, alpha, dL, L1, currentT, togglePause, updateSim, ALPHA }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
