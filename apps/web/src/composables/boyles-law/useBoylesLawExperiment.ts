import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useBoylesLawLayout } from './useBoylesLawLayout'
import { useBoylesLawTrials } from './useBoylesLawTrials'
import { boyleProduct } from './useBoylesLawCalculations'

const R_L_atm = 0.082057

function calcP(n: number, T: number, v: number) {
  return Math.min(10, Math.max(0.1, (n * R_L_atm * T) / v))
}

export function useBoylesLawExperiment() {
  const params = reactive({
    p: calcP(0.041, 300, 1.0),   // atm (computed from n,T,V)
    v: 1.0,   // L
    n: 0.041, // moles → gives P=1 atm at V=1L, T=300K (nRT = 1)
    T: 300,   // K
  })

  function syncP() { params.p = calcP(params.n, params.T, params.v) }

  const running = ref(false)
  const paused = ref(false)
  const phase = ref<'ready' | 'compressing' | 'done'>('ready')
  const simTime = ref(0)

  // Boyle's constant = n·R·T (physically correct)
  const constTarget = computed(() => params.n * R_L_atm * params.T)

  const pv = computed(() => boyleProduct(params.p, params.v))

  function updateSim(dt: number) {
    if (!running.value || paused.value) return
    simTime.value += dt
    if (params.v > 0.3) {
      phase.value = 'compressing'
      params.v -= 0.05 * dt
      if (params.v <= 0.3) { params.v = 0.3; phase.value = 'done' }
    } else {
      phase.value = 'done'
    }
    syncP() // P = nRT/V
  }

  function togglePause() {
    if (!running.value) {
      running.value = true; paused.value = false; simTime.value = 0
      phase.value = 'compressing'; params.v = 1.0; syncP()
    } else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false; simTime.value = 0; phase.value = 'ready'
    params.v = 1.0; syncP()
  }

  const layout = useBoylesLawLayout()
  const trials = useBoylesLawTrials(
    { get value() { return { p: params.p, v: params.v, pv: pv.value } } }
  )

  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'boyles-law', sourceNameAr: 'قانون بويل',
      hasCalcTab: true,
      readings: trials.trials.value.map(t => ({ p: t.p, v: t.v, pv: t.pv })),
      columns: [
        { key: 'p', label: 'P (atm)', unit: 'atm' },
        { key: 'v', label: 'V (L)', unit: 'L' },
        { key: 'pv', label: 'P·V', unit: 'atm·L' },
      ],
      equations: [
        { name: "Boyle's Law", formula: 'P × V = constant', variables: [{ symbol: 'P', label: 'Pressure' }, { symbol: 'V', label: 'Volume' }], solveFor: ['P', 'V'] },
      ],
      suggestedPlots: [{ xKey: 'v', yKey: 'p', xLabel: 'V (L)', yLabel: 'P (atm)', type: 'scatter' }],
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

  const lab = { running, paused, simTime, phase, pv, constTarget, togglePause, updateSim }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop, syncP }
}
