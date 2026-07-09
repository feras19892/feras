import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useIdealGasLayout } from './useIdealGasLayout'
import { useIdealGasTrials } from './useIdealGasTrials'
import { pressure, particleSpeed } from './useIdealGasCalculations'

export function useIdealGasExperiment() {
  const params = reactive({
    n: 1.0,      // moles
    T: 300,      // Kelvin
    V: 0.0224,   // m³ (22.4 L at STP for 1 mol)
  })

  watch(() => params.n, (v) => { params.n = Math.max(0.1, Math.min(5, Math.round(v * 10) / 10)) })
  watch(() => params.T, (v) => { params.T = Math.max(200, Math.min(600, Math.round(v))) })
  watch(() => params.V, (v) => { params.V = Math.max(0.005, Math.min(0.1, Math.round(v * 10000) / 10000)) })

  const running = ref(false)
  const paused = ref(false)
  const mode = ref<'free' | 'isothermal' | 'isobaric' | 'isochoric'>('free')
  const constValue = ref<{ P?: number; T?: number; V?: number }>({})

  const P = computed(() => pressure(params.n, params.T, params.V))
  const vRms = computed(() => particleSpeed(params.T))

  // mode enforcement watchers
  watch(() => params.V, (v) => {
    if (mode.value === 'isothermal' && constValue.value.T !== undefined) {
      // T fixed, P changes automatically via computed
    } else if (mode.value === 'isobaric' && constValue.value.P !== undefined) {
      // P fixed, adjust T: T = PV/nR
      params.T = Math.max(200, Math.min(600, Math.round((constValue.value.P * v) / (params.n * 8.314))))
    } else if (mode.value === 'isochoric' && constValue.value.V !== undefined) {
      // V fixed, reject change
      params.V = constValue.value.V
    }
  })
  watch(() => params.T, (_t) => {
    if (mode.value === 'isothermal' && constValue.value.T !== undefined) {
      params.T = constValue.value.T
    } else if (mode.value === 'isochoric' && constValue.value.V !== undefined) {
      // V fixed, P changes automatically
    }
  })

  function setMode(m: 'free' | 'isothermal' | 'isobaric' | 'isochoric') {
    mode.value = m
    constValue.value = {}
    if (m === 'isothermal') constValue.value.T = params.T
    if (m === 'isobaric') constValue.value.P = P.value
    if (m === 'isochoric') constValue.value.V = params.V
  }

  // particle positions for canvas animation
  interface Particle { x: number; y: number; vx: number; vy: number }
  const particles = ref<Particle[]>([])
  const NUM_PARTICLES = 80
  function initParticles() {
    const pts: Particle[] = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      pts.push({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      })
    }
    particles.value = pts
  }
  initParticles()

  const layout = useIdealGasLayout()

  const trials = useIdealGasTrials(
    { get value() { return params } },
    { get value() { return P.value } }
  )

  function togglePause() {
    if (!running.value) { running.value = true; paused.value = false }
    else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false
    initParticles()
  }
  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'ideal-gas',
      sourceNameAr: 'الغاز المثالي',
      hasCalcTab: true,
      readings: trials.trials.value.map(t => ({ n: t.n, T: t.T, V: t.V, P: t.P })),
      columns: [
        { key: 'n', label: 'n (mol)', unit: 'mol' },
        { key: 'T', label: 'T (K)', unit: 'K' },
        { key: 'V', label: 'V (m³)', unit: 'm³' },
        { key: 'P', label: 'P (Pa)', unit: 'Pa' },
      ],
      equations: [
        { name: 'Ideal Gas Law', formula: 'P * V = n * R * T', variables: [{ symbol: 'P', label: 'Pressure' }, { symbol: 'V', label: 'Volume' }, { symbol: 'n', label: 'Moles' }, { symbol: 'T', label: 'Temperature' }], solveFor: ['P'] },
      ],
      suggestedPlots: [{ xKey: 'V', yKey: 'P', xLabel: 'V (m³)', yLabel: 'P (Pa)', type: 'scatter' }],
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
      const fi = arr.indexOf(fromId)
      const ti = arr.indexOf(toId)
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

  const lab = { running, paused, P, vRms, particles, mode, togglePause, setMode }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
