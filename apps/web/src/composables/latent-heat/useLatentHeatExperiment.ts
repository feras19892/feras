import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useLatentHeatLayout } from './useLatentHeatLayout'
import { useLatentHeatTrials } from './useLatentHeatTrials'
import { LATENT_HEAT, meltedMass, remainingIce, tempForPhase, phaseRatio } from './useLatentHeatCalculations'

export function useLatentHeatExperiment() {
  const params = reactive({
    mass: 0.5,          // kg
    phaseType: 'fusion' as 'fusion' | 'vaporization',
    heatingPower: 500,  // J/s (W)
  })

  watch(() => params.mass, (v) => { params.mass = Math.max(0.1, Math.min(2, Math.round(v * 100) / 100)) })
  watch(() => params.heatingPower, (v) => { params.heatingPower = Math.max(100, Math.min(2000, Math.round(v / 50) * 50)) })

  const running = ref(false)
  const paused = ref(false)
  const simTime = ref(0)
  const phase = ref<'ready' | 'heating' | 'done'>('ready')

  const currentQ = ref(0) // energy added (J)
  const L = computed(() => params.phaseType === 'fusion' ? LATENT_HEAT.fusion : LATENT_HEAT.vaporization)
  const totalQ = computed(() => params.mass * L.value)
  const melted = computed(() => meltedMass(currentQ.value, L.value, params.mass))
  const remaining = computed(() => remainingIce(currentQ.value, L.value, params.mass))
  const ratio = computed(() => phaseRatio(currentQ.value, L.value, params.mass))
  const currentTemp = computed(() => tempForPhase(params.phaseType))

  function updateSim(dt: number) {
    if (!running.value || paused.value) return
    simTime.value += dt
    const Qrate = params.heatingPower
    if (currentQ.value < totalQ.value) {
      phase.value = 'heating'
      currentQ.value += Qrate * dt
      if (currentQ.value >= totalQ.value) {
        currentQ.value = totalQ.value
        phase.value = 'done'
      }
    } else {
      phase.value = 'done'
    }
  }

  function togglePause() {
    if (!running.value) {
      running.value = true; paused.value = false; simTime.value = 0
      phase.value = 'heating'; currentQ.value = 0
    } else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false; simTime.value = 0; phase.value = 'ready'
    currentQ.value = 0
  }

  const layout = useLatentHeatLayout()
  const trials = useLatentHeatTrials(
    { get value() { return { mass: params.mass, phaseType: params.phaseType, Q: currentQ.value, L: L.value, meltedMass: melted.value, remainingMass: remaining.value, temp: currentTemp.value } } }
  )

  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) return
    const payload: AnalysisPayload = {
      sourceExperiment: 'latent-heat', sourceNameAr: 'الحرارة الكامنة',
      hasCalcTab: true,
      readings: trials.trials.value.map(t => ({ mass: t.mass, Q: t.Q, L: t.L, melted: t.meltedMass })),
      columns: [
        { key: 'mass', label: 'm (kg)', unit: 'kg' },
        { key: 'Q', label: 'Q (J)', unit: 'J' },
        { key: 'L', label: 'L (J/kg)', unit: 'J/kg' },
        { key: 'melted', label: 'melted (kg)', unit: 'kg' },
      ],
      equations: [
        { name: 'Latent Heat', formula: 'Q = m × L', variables: [{ symbol: 'Q', label: 'Heat' }, { symbol: 'm', label: 'Mass' }, { symbol: 'L', label: 'Latent Heat' }], solveFor: ['L'] },
      ],
      suggestedPlots: [{ xKey: 'Q', yKey: 'melted', xLabel: 'Q (J)', yLabel: 'melted (kg)', type: 'scatter' }],
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

  const lab = { running, paused, simTime, phase, currentQ, L, totalQ, melted, remaining, ratio, currentTemp, togglePause, updateSim }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
