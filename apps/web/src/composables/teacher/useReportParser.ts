import { computed, type Ref } from 'vue'
import type { Report } from '../../services/report.service'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

function safeJsonParse<T>(str: string | undefined, fallback: T): T {
  try { return str ? JSON.parse(str) : fallback } catch { return fallback }
}

export interface ColumnStat {
  key: string
  label: string
  unit?: string
  mean: number
  std: number
  min: number
  max: number
  range: number
  median: number
  count: number
  outliers: number[]
  consistency: number
}

export interface DataQuality {
  totalReadings: number
  totalColumns: number
  completeness: number
  hasChart: boolean
  hasConclusion: boolean
  hasEquations: boolean
  hasSolvedEquations: boolean
  hasRegression: boolean
  hasErrorCalc: boolean
  issues: string[]
  score: number
}

export function useReportParser(report: Ref<Report>) {
  const params = computed(() => safeJsonParse<Record<string, Any>>(report.value.params, {}))
  const readings = computed(() => safeJsonParse<Record<string, number>[]>(report.value.readings, []))
  const columns = computed(() => safeJsonParse<Any[]>(report.value.columns, []))
  const equations = computed(() => safeJsonParse<Any[]>(report.value.equations, []))
  const plots = computed(() => safeJsonParse<Any[]>(report.value.plots, []))
  const studentInfo = computed(() => safeJsonParse(report.value.student_info, { name: report.value.student_name || '', email: '', grade: '', notes: '' }))

  const solvedEquations = computed(() => params.value.solved_equations ?? [])
  const regressionData = computed(() => params.value.regression_data ?? null)
  const slopeCalcData = computed(() => params.value.slope_calc_data ?? null)
  const axesData = computed(() => params.value.axes_data ?? null)
  const errorCalcData = computed(() => params.value.error_calc_data ?? null)

  const columnStats = computed<ColumnStat[]>(() => {
    return columns.value.map((col: Record<string, unknown>) => {
      const key = String(col.key)
      const vals = readings.value.map(r => r[key]).filter(v => typeof v === 'number' && !isNaN(v)) as number[]
      if (!vals.length) return { key, label: String(col.label), unit: String(col.unit), mean: 0, std: 0, min: 0, max: 0, range: 0, median: 0, count: 0, outliers: [], consistency: 0 }
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length
      const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length)
      const sorted = [...vals].sort((a, b) => a - b)
      const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      const outliers = vals.filter(v => std > 0 && Math.abs(v - mean) > 2 * std)
      const consistency = std > 0 ? Math.round((1 - std / Math.abs(mean || 1)) * 100) : 100
      return { key, label: String(col.label), unit: String(col.unit), mean, std, min: Math.min(...vals), max: Math.max(...vals), range: Math.max(...vals) - Math.min(...vals), median, count: vals.length, outliers, consistency: Math.max(0, Math.min(100, consistency)) }
    })
  })

  const dataQuality = computed<DataQuality>(() => {
    const issues: string[] = []
    const total = readings.value.length
    const cols = columns.value.length
    if (total < 3) issues.push('insufficient_readings')
    if (cols === 0) issues.push('no_columns')
    if (!report.value.conclusion) issues.push('no_conclusion')
    if (!report.value.chart_snapshot) issues.push('no_chart')
    if (equations.value.length === 0) issues.push('no_equations')

    const hasChart = !!report.value.chart_snapshot
    const hasConclusion = !!report.value.conclusion
    const hasEquations = equations.value.length > 0
    const hasSolvedEquations = solvedEquations.value.length > 0
    const hasRegression = !!regressionData.value
    const hasErrorCalc = !!errorCalcData.value?.errorPercent

    let score = 0
    if (total >= 5) score += 20; else if (total >= 3) score += 10
    if (hasConclusion) score += 20
    if (hasChart) score += 15
    if (hasEquations) score += 15
    if (hasSolvedEquations) score += 10
    if (hasRegression) score += 10
    if (hasErrorCalc) score += 10

    return { totalReadings: total, totalColumns: cols, completeness: Math.round((score / 100) * 100), hasChart, hasConclusion, hasEquations, hasSolvedEquations, hasRegression, hasErrorCalc, issues, score }
  })

  return {
    params, readings, columns, equations, plots, studentInfo,
    solvedEquations, regressionData, slopeCalcData, axesData, errorCalcData,
    columnStats, dataQuality,
  }
}
