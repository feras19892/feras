import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AnalysisPayload } from '../../types/physics'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useCalorimetryLayout } from './useCalorimetryLayout'
import { useCalorimetryTrials } from './useCalorimetryTrials'
import type { CalorimetryTrial } from './useCalorimetryTrials'
import { finalTemp, findCMetal, SPECIFIC_HEAT_WATER, SPECIFIC_HEAT_ALUMINUM } from './useCalorimetryCalculations'

export function useCalorimetryExperiment() {
  const METAL_OPTIONS: Record<string, { c: number; nameAr: string; nameEn: string }> = {
    copper: { c: 385, nameAr: 'نحاس', nameEn: 'Copper' },
    aluminum: { c: 900, nameAr: 'ألمنيوم', nameEn: 'Aluminum' },
    iron: { c: 450, nameAr: 'حديد', nameEn: 'Iron' },
    lead: { c: 128, nameAr: 'رصاص', nameEn: 'Lead' },
    brass: { c: 380, nameAr: 'سبائك نحاس', nameEn: 'Brass' },
    silver: { c: 235, nameAr: 'فضة', nameEn: 'Silver' },
  }

  const params = reactive({
    mWater: 0.200, tWater: 25, mMetal: 0.050, tMetal: 100, cMetal: 385, mCup: 0.050,
    metalType: 'copper' as string,
  })

  watch(() => params.metalType, (type) => {
    if (type in METAL_OPTIONS) params.cMetal = METAL_OPTIONS[type].c
  })

  watch(() => params.mWater, (v) => { params.mWater = Math.max(0.05, Math.min(0.5, Math.round(v * 1000) / 1000)) })
  watch(() => params.tWater, (v) => {
    params.tWater = Math.max(10, Math.min(35, Math.round(v)))
    if (!running.value) currentWaterTemp.value = params.tWater
  })
  watch(() => params.mMetal, (v) => { params.mMetal = Math.max(0.01, Math.min(0.2, Math.round(v * 1000) / 1000)) })
  watch(() => params.tMetal, (v) => {
    params.tMetal = Math.max(50, Math.min(200, Math.round(v)))
    if (!running.value) currentMetalTemp.value = params.tMetal
  })
  watch(() => params.mCup, (v) => { params.mCup = Math.max(0.01, Math.min(0.1, Math.round(v * 1000) / 1000)) })

  const running = ref(false)
  const paused = ref(false)
  const simTime = ref(0)
  const phase = ref<'ready' | 'dropping' | 'mixing' | 'done'>('ready')

  // theoretical final temperature (instant)
  const tf = computed(() => finalTemp(params.mWater, params.tWater, params.mMetal, params.tMetal, params.cMetal, params.mCup, SPECIFIC_HEAT_ALUMINUM))

  // real-time interpolated temperatures during simulation
  const currentWaterTemp = ref(params.tWater)
  const currentMetalTemp = ref(params.tMetal)

  const cMetalMeasured = computed(() => findCMetal(params.mWater, params.tWater, params.mMetal, params.tMetal, tf.value, params.mCup, SPECIFIC_HEAT_ALUMINUM))
  const qLost = computed(() => params.mMetal * params.cMetal * (params.tMetal - tf.value))
  const qGained = computed(() => (params.mWater * SPECIFIC_HEAT_WATER + params.mCup * SPECIFIC_HEAT_ALUMINUM) * (tf.value - params.tWater))

  const layout = useCalorimetryLayout()
  const trials = useCalorimetryTrials(
    { get value() { return { mWater: params.mWater, tWater: params.tWater, mMetal: params.mMetal, tMetal: params.tMetal, tf: tf.value, cMetal: cMetalMeasured.value, cTrue: METAL_OPTIONS[params.metalType]?.c ?? 0 } } }
  )

  // animation loop updater (called from Canvas)
  function updateSim(dt: number) {
    if (!running.value || paused.value) return
    simTime.value += dt
    const DROP_TIME = 2, MIX_TIME = 8
    if (simTime.value < DROP_TIME) {
      phase.value = 'dropping'
      currentWaterTemp.value = params.tWater; currentMetalTemp.value = params.tMetal
    } else if (simTime.value < DROP_TIME + MIX_TIME) {
      phase.value = 'mixing'
      const ratio = (simTime.value - DROP_TIME) / MIX_TIME
      const expRatio = 1 - Math.exp(-ratio * 3)
      currentWaterTemp.value = params.tWater + (tf.value - params.tWater) * expRatio
      currentMetalTemp.value = params.tMetal + (tf.value - params.tMetal) * expRatio
    } else {
      phase.value = 'done'
      currentWaterTemp.value = tf.value; currentMetalTemp.value = tf.value
    }
  }

  function togglePause() {
    if (!running.value) {
      running.value = true; paused.value = false; simTime.value = 0
      phase.value = 'dropping'
      currentWaterTemp.value = params.tWater; currentMetalTemp.value = params.tMetal
    } else { paused.value = !paused.value }
  }
  function resetSim() {
    running.value = false; paused.value = false; simTime.value = 0; phase.value = 'ready'
    currentWaterTemp.value = params.tWater; currentMetalTemp.value = params.tMetal
  }
  const router = useRouter()
  function exportToAnalysis() {
    if (trials.trials.value.length < 2) { alert('تحتاج إلى تسجيل قراءتين على الأقل قبل التحليل'); return }
    const payload: AnalysisPayload = {
      sourceExperiment: 'calorimetry', sourceNameAr: 'الكالوريمتري',
      hasCalcTab: true,
      readings: trials.trials.value.map((t: CalorimetryTrial) => ({ mWater: t.mWater, tWater: t.tWater, mMetal: t.mMetal, tMetal: t.tMetal, tf: t.tf, cMetal: t.cMetal })),
      columns: [
        { key: 'mWater', label: 'mWater (kg)', unit: 'kg' },
        { key: 'tWater', label: 'tWater (°C)', unit: '°C' },
        { key: 'mMetal', label: 'mMetal (kg)', unit: 'kg' },
        { key: 'tMetal', label: 'tMetal (°C)', unit: '°C' },
        { key: 'tf', label: 'tf (°C)', unit: '°C' },
        { key: 'cMetal', label: 'cMetal (J/kgK)', unit: 'J/(kg·K)' },
      ],
      equations: [
        { name: 'Heat Balance', formula: 'Q_lost = Q_gained', variables: [{ symbol: 'Q', label: 'Heat' }, { symbol: 'm', label: 'Mass' }, { symbol: 'c', label: 'Specific Heat' }, { symbol: 'ΔT', label: 'Temperature Change' }], solveFor: ['c'] },
      ],
      suggestedPlots: [{ xKey: 'tMetal', yKey: 'tf', xLabel: 'tMetal (°C)', yLabel: 'tf (°C)', type: 'scatter' }],
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
      if (fi >= 0 && ti >= 0) { const tmp = arr[fi]; arr[fi] = arr[ti]; arr[ti] = tmp }
    }
  }
  function onResizeStart(col: string, e: MouseEvent) {
    if (!(col in layout.widths)) return
    const startX = e.clientX, startW = (layout.widths as Record<string, number>)[col] as number
    function move(ev: MouseEvent) { (layout.widths as Record<string, number>)[col] = Math.max(220, startW + (ev.clientX - startX)) }
    function up() { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  const lab = { running, paused, simTime, phase, tf, cMetalMeasured, currentWaterTemp, currentMetalTemp, qLost, qGained, togglePause, updateSim, METAL_OPTIONS }
  return { params, lab, layout, trials, resetSim, exportToAnalysis, onResizeStart, handleDrop }
}
