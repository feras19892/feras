import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import { useChartRegression } from './chart-regression'
import { useChartDrawer } from './chart-drawer'
import type { AnalysisColumnMeta, AnalysisPlotConfig } from '../../../types/physics'

export function useChartWorkspace(
  getReadings: () => Record<string, number>[],
  getColumns: () => AnalysisColumnMeta[],
  getSuggestedPlots: () => AnalysisPlotConfig[],
) {
  const { t } = useI18n()
  const xKey = ref('')
  const yKey = ref('')
  const containerRef = ref<HTMLDivElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const hoverPoint = ref<{ x: number; y: number; px: number; py: number } | null>(null)
  const tooltip = ref('')
  const showSlopeResult = ref(false)
  const showAxisControls = ref(false)

  const numericKeys = computed(() => getColumns().map(c => c.key))

  const xAxisLabel = computed(() => {
    const col = getColumns().find(c => c.key === xKey.value)
    return col ? `${col.label}${col.unit ? ` (${col.unit})` : ''}` : (xKey.value || 'X')
  })
  const yAxisLabel = computed(() => {
    const col = getColumns().find(c => c.key === yKey.value)
    return col ? `${col.label}${col.unit ? ` (${col.unit})` : ''}` : (yKey.value || 'Y')
  })

  watch(() => getSuggestedPlots(), (plots) => {
    if (plots.length) { xKey.value = plots[0].xKey; yKey.value = plots[0].yKey }
    else if (getColumns().length >= 2) { xKey.value = getColumns()[0].key; yKey.value = getColumns()[1].key }
  }, { immediate: true })

  const points = computed(() => {
    if (!xKey.value || !yKey.value) return []
    return getReadings()
      .map(r => ({ x: r[xKey.value], y: r[yKey.value] }))
      .filter(p => typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y))
  })

  const { regression, slopeWarning, slopeCalc } = useChartRegression(points, xKey, yKey, t)
  const { draw, onMouseMove } = useChartDrawer(
    canvasRef, containerRef, points, xKey, yKey,
    regression, xAxisLabel, yAxisLabel, t, hoverPoint, tooltip
  )

  let ro: ResizeObserver | null = null
  onMounted(() => {
    setTimeout(() => draw(), 100)
    if (containerRef.value) {
      ro = new ResizeObserver(() => draw())
      ro.observe(containerRef.value)
    }
    const canvas = canvasRef.value
    if (canvas) {
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseleave', () => { hoverPoint.value = null; tooltip.value = ''; draw() })
    }
  })
  onUnmounted(() => {
    if (ro) ro.disconnect()
    const canvas = canvasRef.value
    if (canvas) { canvas.removeEventListener('mousemove', onMouseMove) }
  })

  return {
    xKey,
    yKey,
    containerRef,
    canvasRef,
    numericKeys,
    regression,
    slopeWarning,
    slopeCalc,
    showSlopeResult,
    showAxisControls,
    xAxisLabel,
    yAxisLabel,
    draw,
  }
}
