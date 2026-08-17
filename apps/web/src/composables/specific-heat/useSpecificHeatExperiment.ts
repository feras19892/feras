import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useSpecificHeatLayout } from './useSpecificHeatLayout'
import { useSpecificHeatTrials } from './useSpecificHeatTrials'
import { equilibriumTemp, findMetalSpecificHeat, METAL_CATALOG, linearRegression, C_WATER } from './useSpecificHeatCalculations'

export function useSpecificHeatExperiment() {
  // Metal sample (unknown) + cold water in calorimeter
  const params = reactive({
    metalType: 'metalA' as string,
    metalMass: 0.100,   // kg (100 g)
    waterMass: 0.200,   // kg (200 g)
    waterTemp: 20,      // °C (cold water initial)
  })

  watch(() => params.metalMass, (v) => { params.metalMass = Math.max(0.05, Math.min(0.2, Math.round(v * 1000) / 1000)) })
  watch(() => params.waterMass, (v) => { params.waterMass = Math.max(0.1, Math.min(0.3, Math.round(v * 1000) / 1000)) })
  watch(() => params.waterTemp, (v) => { params.waterTemp = Math.max(5, Math.min(35, Math.round(v))) })

  // True c of selected metal (hidden from user)
  const cTrue = computed(() => METAL_CATALOG[params.metalType]?.c ?? 900)

  // Metal is heated to 100°C in water bath
  const metalTemp = ref(params.waterTemp) // starts at room temp
  const finalTemp = computed(() => equilibriumTemp(params.metalMass, cTrue.value, 100, params.waterMass, params.waterTemp))

  // Extracted specific heat from the measured (simulated) equilibrium
  const cExtracted = computed(() => findMetalSpecificHeat(params.metalMass, 100, params.waterMass, params.waterTemp, finalTemp.value))

  const running = ref(false)
  const paused = ref(false)
  const simTime = ref(0)
  const phase = ref<'ready' | 'heating' | 'transfer' | 'mixing' | 'done'>('ready')
  const unknownMode = ref(false)

  // Randomize metal when unknown mode is active
  const metalKeys = Object.keys(METAL_CATALOG)
  function randomizeMetal() {
    const idx = Math.floor(Math.random() * metalKeys.length)
    params.metalType = metalKeys[idx]
  }
  function guessMetal(cGuess: number) {
    let bestKey = ''
    let bestDiff = Infinity
    for (const [key, info] of Object.entries(METAL_CATALOG)) {
      const diff = Math.abs(info.c - cGuess)
      if (diff < bestDiff) { bestDiff = diff; bestKey = key }
    }
    return { key: bestKey, info: METAL_CATALOG[bestKey], diff: bestDiff }
  }
  watch(unknownMode, (v) => { if (v) randomizeMetal() })

  // During heating animation, metalTemp rises toward 100
  // During mixing animation, displayed temp rises toward finalTemp
  const displayT = ref(params.waterTemp)

  function updateSim(dt_: number) {
    if (!running.value || paused.value) return
    simTime.value += dt_
    const HEAT_TIME = 2.5
    const MIX_TIME = 3.0

    if (phase.value === 'heating') {
      const ratio = Math.min(1, simTime.value / HEAT_TIME)
      metalTemp.value = params.waterTemp + (100 - params.waterTemp) * ratio
      displayT.value = metalTemp.value
      if (ratio >= 1) { metalTemp.value = 100; phase.value = 'transfer'; simTime.value = 0 }
    } else if (phase.value === 'mixing') {
      const ratio = Math.min(1, simTime.value / MIX_TIME)
      // Metal cools from 100°C down to finalTemp
      metalTemp.value = 100 - (100 - finalTemp.value) * ratio
      // Water/mixture warms from T_w up to finalTemp
      displayT.value = params.waterTemp + (finalTemp.value - params.waterTemp) * ratio
      if (ratio >= 1) {
        metalTemp.value = finalTemp.value
        displayT.value = finalTemp.value
        phase.value = 'done'
      }
    }
  }

  function transferMetal() {
    if (phase.value === 'transfer') {
      phase.value = 'mixing'
      simTime.value = 0
    }
  }

  function togglePause() {
    if (!running.value) {
      if (unknownMode.value) randomizeMetal()
      running.value = true; paused.value = false; simTime.value = 0
      phase.value = 'heating'; metalTemp.value = params.waterTemp; displayT.value = params.waterTemp
    } else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false; simTime.value = 0; phase.value = 'ready'
    metalTemp.value = params.waterTemp; displayT.value = params.waterTemp
  }

  const layout = useSpecificHeatLayout()
  const trials = useSpecificHeatTrials(
    { get value() {
      return {
        metalType: params.metalType, metalMass: params.metalMass, metalTemp: 100,
        waterMass: params.waterMass, waterTemp: params.waterTemp, finalTemp: finalTemp.value,
        cExtracted: cExtracted.value, cTrue: cTrue.value,
      }
    } }
  )

  // Regression per report: Y = (Tm - Tf) vs X = m_w (kg)
  // Slope = Δ(Tm-Tf) / Δm_w
  // c_m = c_w * avg(Tf-Tw) / (m_m * Slope)
  const regression = computed(() => {
    const valid = trials.trials.value.filter((tr) => tr.cExtracted > 0 && tr.finalTemp > tr.waterTemp)
    if (valid.length < 2) return { m: 0, b: 0, r2: 0, avgDeltaT: 0 }
    const pts = valid.map((tr) => ({
      x: tr.waterMass,
      y: tr.metalTemp - tr.finalTemp,
    }))
    const avgDeltaT = valid.reduce((s, tr) => s + (tr.finalTemp - tr.waterTemp), 0) / valid.length
    const reg = linearRegression(pts)
    return { ...reg, avgDeltaT }
  })

  // c_m extracted from regression slope per report formula
  const cFromSlope = computed(() => {
    const m = regression.value.m
    const avg = regression.value.avgDeltaT
    if (!isFinite(m) || m <= 0 || avg <= 0 || params.metalMass <= 0) return 0
    return (C_WATER * avg) / (params.metalMass * m)
  })

  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const payload: AnalysisPayload = {
      sourceExperiment: 'specific-heat', sourceNameAr: 'السعة الحرارية النوعية (طريقة الخلط)',
      hasCalcTab: true,
      readings: trials.trials.value.map(tr => ({
        metalType: tr.metalType, metalMass: tr.metalMass, waterMass: tr.waterMass,
        waterTemp: tr.waterTemp, finalTemp: tr.finalTemp, cExtracted: tr.cExtracted, cTrue: tr.cTrue,
      })),
      columns: [
        { key: 'metalType', label: 'Metal', unit: '' },
        { key: 'metalMass', label: 'm_m (kg)', unit: 'kg' },
        { key: 'waterMass', label: 'm_w (kg)', unit: 'kg' },
        { key: 'waterTemp', label: 'T_w (°C)', unit: '°C' },
        { key: 'finalTemp', label: 'T_f (°C)', unit: '°C' },
        { key: 'cExtracted', label: 'c_m extracted', unit: 'J/(kg·°C)' },
        { key: 'cTrue', label: 'c_m true', unit: 'J/(kg·°C)' },
      ],
      equations: [
        { name: 'Heat Balance', formula: 'm_m * c_m * (T_m - T_f) = m_w * c_w * (T_f - T_w)', variables: [
          { symbol: 'm_m', label: 'Metal mass' }, { symbol: 'c_m', label: 'Metal specific heat' },
          { symbol: 'T_m', label: 'Metal initial temp' }, { symbol: 'T_f', label: 'Final temp' },
          { symbol: 'm_w', label: 'Water mass' }, { symbol: 'c_w', label: 'Water specific heat' }, { symbol: 'T_w', label: 'Water initial temp' },
        ], solveFor: ['c_m'] },
      ],
      suggestedPlots: [{ xKey: 'metalMass', yKey: 'cExtracted', xLabel: 'm_m (kg)', yLabel: 'c_m', type: 'scatter' }],
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

  const lab = {
    running, paused, simTime, phase, metalTemp, displayT, finalTemp, cExtracted, cTrue, unknownMode,
    waterTemp: computed(() => params.waterTemp),
    togglePause, transferMetal, updateSim, randomizeMetal, guessMetal, METAL_CATALOG, C_WATER,
  }
  return { params, lab, layout, trials, regression, cFromSlope, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
