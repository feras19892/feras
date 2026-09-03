export interface LabReportTable {
  caption?: string
  headers: (string | number)[]
  rows: (string | number | undefined)[][]
}

export interface LabReportImage {
  src: string
  caption?: string
  fullWidth?: boolean
}

export interface LabReportHtmlBlock {
  title?: string
  html: string
}

export interface LabReportParam {
  label: string
  value: string | number
  unit?: string
}

export interface LabReportStat {
  label: string
  value: string | number
  unit?: string
  highlight?: boolean
}

export interface OpenLabReportOptions {
  title: string
  icon?: string
  experimentName?: string
  /** API experiment_type value used when sending the report to the teacher (defaults to 'physics'). */
  experimentType?: string
  dir?: 'rtl' | 'ltr'
  dateLocale?: string
  meta?: Record<string, string>
  params?: LabReportParam[]
  summaryStats?: LabReportStat[]
  tables?: LabReportTable[]
  images?: LabReportImage[]
  htmlBlocks?: LabReportHtmlBlock[]
  footerNote?: string
  canvasSnapshot?: string
  openPrintDialog?: boolean
  sendToTeacher?: boolean
  strings?: Record<string, string>
}

export interface ExperimentStateBundle {
  experiment: string
  branch: string
  initial_params: Record<string, unknown>
  results_array: Record<string, unknown>[]
  quiz_score?: number
  quiz_answers?: Record<string, { answer: string; correct: boolean }>
  timestamp: string
}
