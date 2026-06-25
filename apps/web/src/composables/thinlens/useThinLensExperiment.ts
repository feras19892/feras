import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useThinLensLayout, type ColumnId } from './useThinLensLayout'
import { useThinLensTrials } from './useThinLensTrials'
import { sendToAnalysis } from '../analysis/sendToAnalysis'
import { useI18n } from '../../composables/useI18n'
import type { AnalysisPayload } from '../../types/physics'

export interface ThinLensTrial {
  id: number
  lensType: LensType
  focalLength: number
  objectDistance: number
  objectHeight: number
  imageDistance: number
  imageHeight: number
  magnification: number
  invDo: number
  invDi: number
}

export type LensType = 'convex' | 'concave'

export interface ThinLensParams {
  lensType: LensType
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
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
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

export function useThinLensExperiment() {
  const { t } = useI18n()
  const params = reactive<ThinLensParams>({ lensType: 'convex', focalLength: 10, objectDistance: 30, objectHeight: 5 })
  const running = ref(false)
  const paused = ref(false)
  const colWidths = reactive({ data: 280, ctrl: 280 })

  const imageDistance = computed(() => {
    const { lensType, focalLength, objectDistance } = params
    const f = lensType === 'convex' ? focalLength : -focalLength
    if (Math.abs(objectDistance - f) < 0.001) return null // image at infinity
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
    // Sign convention:
    // di > 0: real (right of lens), di < 0: virtual (left of lens)
    // m > 0: upright, m < 0: inverted
    // For concave: image is always virtual, upright, reduced
    const type = di > 0 ? t('experiments.imageReal') : t('experiments.imageVirtual')
    const orientation = m > 0 ? t('experiments.imageUpright') : t('experiments.imageInverted')
    const size = Math.abs(m) > 1 ? t('experiments.imageMagnified') : Math.abs(m) < 1 ? t('experiments.imageReduced') : t('experiments.imageSameSize')
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

  const layout = useThinLensLayout()
  const trials = useThinLensTrials(
    { get value() { return params } },
    { get value() { return lab.imageDistance.value } },
    { get value() { return lab.imageHeight.value } },
    { get value() { return lab.magnification.value } }
  )

  const regression = computed(() => {
    const pts = trials.trials.value
      .filter((t) => t.imageDistance !== 0 && t.lensType === params.lensType)
      .map((t) => ({ x: t.invDo, y: t.invDi }))
    return linearRegression(pts)
  })

  const focalFromRegression = computed(() => {
    const m = regression.value.m
    const b = regression.value.b
    if (!isFinite(m) || !isFinite(b)) return null
    // From 1/di = -1/do + 1/f, slope should be -1, intercept = 1/f
    if (Math.abs(m + 1) > 0.2) return null // unreliable slope, not close to -1
    const fEst = 1 / b
    return isFinite(fEst) ? Math.abs(fEst) : null
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

    const readings = tList.map((t) => ({
      lens_type: t.lensType,
      f: t.focalLength,
      do: t.objectDistance,
      di: t.imageDistance,
      ho: t.objectHeight,
      hi: t.imageHeight,
      inv_do: t.invDo,
      inv_di: t.invDi,
    })) as Record<string, string | number>[]

    const payload: AnalysisPayload = {
      sourceExperiment: 'thin-lens',
      sourceNameAr: t('experiments.expThinLens'),
      readings,
      columns: [
        { key: 'lens_type', label: t('experiments.lensType') },
        { key: 'f', label: t('experiments.focalLength'), unit: 'cm' },
        { key: 'do', label: t('experiments.objectDistance'), unit: 'cm' },
        { key: 'di', label: t('experiments.imageDistance'), unit: 'cm' },
        { key: 'ho', label: t('experiments.objectHeight'), unit: 'cm' },
        { key: 'hi', label: t('experiments.imageHeight'), unit: 'cm' },
        { key: 'inv_do', label: '1/do', unit: '1/cm' },
        { key: 'inv_di', label: '1/di', unit: '1/cm' },
      ],
      equations: [
        {
          name: t('experiments.lensEquation'),
          formula: '1/f = 1/do + 1/di',
          variables: [
            { symbol: 'f', label: t('experiments.focalLength') },
            { symbol: 'do', label: t('experiments.objectDistance') },
            { symbol: 'di', label: t('experiments.imageDistance') },
          ],
          solveFor: ['f', 'do', 'di'],
        },
        {
          name: t('experiments.magnificationTitle'),
          formula: 'm = -di/do = hi/ho',
          variables: [
            { symbol: 'm', label: t('experiments.magnificationTitle') },
            { symbol: 'di', label: t('experiments.imageDistance') },
            { symbol: 'do', label: t('experiments.objectDistance') },
            { symbol: 'hi', label: t('experiments.imageHeight') },
            { symbol: 'ho', label: t('experiments.objectHeight') },
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
