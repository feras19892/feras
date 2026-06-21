import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMirrorLayout, type ColumnId } from './useMirrorLayout'
import { useMirrorTrials } from './useMirrorTrials'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import type { AnalysisPayload } from '../../types/physics'

export interface MirrorTrial {
  id: number
  mirrorType: MirrorType
  focalLength: number
  objectDistance: number
  objectHeight: number
  imageDistance: number
  imageHeight: number
  magnification: number
  invDo: number
  invDi: number
}

export type MirrorType = 'concave' | 'convex'

export interface MirrorParams {
  mirrorType: MirrorType
  focalLength: number
  objectDistance: number
  objectHeight: number
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return { m: 0, b: 0, r2: 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (const p of points) {
    sumX += p.x; sumY += p.y; sumXY += p.x * p.y
    sumX2 += p.x * p.x; sumY2 += p.y * p.y
  }
  const denominator = n * sumX2 - sumX * sumX
  if (Math.abs(denominator) < 1e-12) return { m: 0, b: 0, r2: 0 }
  const m = (n * sumXY - sumX * sumY) / denominator
  const b = (sumY - m * sumX) / n
  const ssTot = sumY2 - (sumY * sumY) / n
  let ssRes = 0
  for (const p of points) {
    const yHat = m * p.x + b
    ssRes += (p.y - yHat) ** 2
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { m, b, r2 }
}

export function useMirrorExperiment() {
  const params = reactive<MirrorParams>({ mirrorType: 'concave', focalLength: 10, objectDistance: 30, objectHeight: 5 })
  const running = ref(false)
  const paused = ref(false)
  const colWidths = reactive({ data: 280, ctrl: 280 })

  const imageDistance = computed(() => {
    const { mirrorType, focalLength, objectDistance } = params
    const f = mirrorType === 'concave' ? focalLength : -focalLength
    if (Math.abs(objectDistance - f) < 0.001) return null
    const di = (f * objectDistance) / (objectDistance - f)
    return di
  })

  const imageHeight = computed(() => {
    const di = imageDistance.value
    if (di === null) return null
    return -(di / params.objectDistance) * params.objectHeight
  })

  const magnification = computed(() => {
    const di = imageDistance.value
    if (di === null) return null
    return -di / params.objectDistance
  })

  const imageProperties = computed(() => {
    const di = imageDistance.value
    const m = magnification.value
    if (di === null || m === null) return { type: '—', orientation: '—', size: '—' }
    const type = di > 0 ? 'حقيقي' : 'افتراضي'
    const orientation = m > 0 ? 'مثبت' : 'مقلوب'
    const size = Math.abs(m) > 1 ? 'مكبّر' : Math.abs(m) < 1 ? 'مصغّر' : 'بحجم الطبيعي'
    return { type, orientation, size, diSign: di > 0 ? '+' : '-', mSign: m > 0 ? '+' : '-' }
  })

  const lab = {
    running,
    paused,
    imageDistance,
    imageHeight,
    magnification,
    imageProperties,
    togglePause: () => {
      if (!running.value) { running.value = true; paused.value = false }
      else { paused.value = !paused.value }
    },
  }

  const layout = useMirrorLayout()
  const trials = useMirrorTrials(
    { get value() { return params } },
    { get value() { return lab.imageDistance.value } },
    { get value() { return lab.imageHeight.value } },
    { get value() { return lab.magnification.value } }
  )

  const regression = computed(() => {
    const pts = trials.trials.value
      .filter((t: MirrorTrial) => t.imageDistance !== 0 && t.mirrorType === params.mirrorType)
      .map((t: MirrorTrial) => ({ x: t.invDo, y: t.invDi }))
    return linearRegression(pts)
  })

  const focalFromRegression = computed(() => {
    const m = regression.value.m
    const b = regression.value.b
    if (!isFinite(m) || !isFinite(b)) return null
    if (Math.abs(m + 1) > 0.2) return null
    const fEst = 1 / b
    if (!isFinite(fEst)) return null
    // Preserve physical sign: convex mirrors have negative focal length
    return params.mirrorType === 'convex' ? -Math.abs(fEst) : Math.abs(fEst)
  })

  function resetSim() {
    running.value = false
    paused.value = false
    params.focalLength = 10
    params.objectDistance = 30
    params.objectHeight = 5
    trials.clearTrials()
  }

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) {
    const startX = e.clientX
    const startData = colWidths.data
    const startCtrl = colWidths.ctrl
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      if (side === 'data') colWidths.data = Math.max(160, Math.min(500, startData + dx))
      else colWidths.ctrl = Math.max(160, Math.min(500, startCtrl - dx))
    }
    function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDrop(id: string, x: number, y: number) {
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

  const getColumnPanels = (col: ColumnId) => layout.columnOrder[col]

  const router = useRouter()
  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { console.warn('[exportToAnalysis] no trials recorded'); return }

    const readings = tList.map((t: MirrorTrial) => ({
      mirror_type: t.mirrorType,
      f: t.focalLength,
      do: t.objectDistance,
      di: t.imageDistance,
      ho: t.objectHeight,
      hi: t.imageHeight,
      inv_do: t.invDo,
      inv_di: t.invDi,
    }))

    const payload: AnalysisPayload = {
      sourceExperiment: 'mirrors',
      sourceNameAr: 'المرايا الكروية',
      readings,
      columns: [
        { key: 'mirror_type', label: 'نوع المرآة' },
        { key: 'f', label: 'البعد البؤري', unit: 'cm' },
        { key: 'do', label: 'بعد الجسم', unit: 'cm' },
        { key: 'di', label: 'بعد الصورة', unit: 'cm' },
        { key: 'ho', label: 'ارتفاع الجسم', unit: 'cm' },
        { key: 'hi', label: 'ارتفاع الصورة', unit: 'cm' },
        { key: 'inv_do', label: '1/do', unit: '1/cm' },
        { key: 'inv_di', label: '1/di', unit: '1/cm' },
      ],
      equations: [
        {
          name: 'معادلة المرآة',
          formula: '1/f = 1/do + 1/di',
          variables: [
            { symbol: 'f', label: 'البعد البؤري' },
            { symbol: 'do', label: 'بعد الجسم' },
            { symbol: 'di', label: 'بعد الصورة' },
          ],
          solveFor: ['f', 'do', 'di'],
        },
        {
          name: 'التكبير',
          formula: 'm = -di/do = hi/ho',
          variables: [
            { symbol: 'm', label: 'التكبير' },
            { symbol: 'di', label: 'بعد الصورة' },
            { symbol: 'do', label: 'بعد الجسم' },
            { symbol: 'hi', label: 'ارتفاع الصورة' },
            { symbol: 'ho', label: 'ارتفاع الجسم' },
          ],
          solveFor: ['m', 'hi'],
        },
      ],
      suggestedPlots: [
        { xKey: 'inv_do', yKey: 'inv_di', xLabel: '1/do (1/cm)', yLabel: '1/di (1/cm)', type: 'scatter' as const },
      ],
    }

    sendToAnalysis(router, payload)
  }

  return {
    params,
    lab,
    layout,
    trials,
    regression,
    focalFromRegression,
    resetSim,
    colWidths,
    onResizeStart,
    handleDrop,
    getColumnPanels,
    exportToAnalysis,
  }
}
