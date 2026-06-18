import type { OpenLabReportOptions, ExperimentStateBundle } from './lab-report.types'
import {
  buildStudentHtml, buildMetaHtml, buildParamsHtml, buildStatsHtml,
  buildTablesHtml, buildImagesHtml, buildBlocksHtml, buildCss, eh,
} from './lab-report.build-html'
import { buildSendScript } from './lab-report.send'

export type { LabReportTable, LabReportImage, LabReportHtmlBlock, LabReportParam, LabReportStat, OpenLabReportOptions, ExperimentStateBundle } from './lab-report.types'

export function openLabReport(options: OpenLabReportOptions): Window | null {
  const dir = options.dir ?? 'rtl'
  const locale = options.dateLocale ?? 'ar'

  const strings = {
    dateLabel: 'التاريخ',
    experimentLabel: 'التجربة',
    paramsHeading: 'المعاملات',
    resultsHeading: 'النتائج',
    footerHint: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية',
    printLabel: 'طباعة',
    closeLabel: 'إغلاق',
    simulationSnap: 'لقطة من المحاكاة',
  }

  const now = new Date().toLocaleString(locale)
  const sendToTeacherScript = options.sendToTeacher ? buildSendScript(options) : ''

  const studentInfo: Record<string, string> = {}
  try {
    const raw = localStorage.getItem('spring_report_student')
    if (raw) {
      const d = JSON.parse(raw)
      if (d.name) studentInfo['الاسم'] = d.name
      if (d.email) studentInfo['البريد'] = d.email
      if (d.class) studentInfo['الصف'] = d.class
    }
  } catch { /* ignore */ }

  const studentHtml = buildStudentHtml(dir, studentInfo)
  const metaRows = buildMetaHtml(options.meta ?? {})
  const paramsHtml = buildParamsHtml(options.params, strings.paramsHeading, dir)
  const statsHtml = buildStatsHtml(options.summaryStats, strings.resultsHeading)
  const tablesHtml = buildTablesHtml(options.tables)
  const imagesHtml = buildImagesHtml(options.images ?? [], options.canvasSnapshot, strings.simulationSnap)
  const blocksHtml = buildBlocksHtml(options.htmlBlocks)
  const css = buildCss(dir)

  const htmlContent = `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${eh(options.title)}</title><style>${css}</style></head>
<body>
<div class="report-header noprint"><h1>${options.icon ? options.icon + ' ' : ''}${eh(options.title)}</h1><div class="subtitle">${options.experimentName ? eh(options.experimentName) + ' • ' : ''}${eh(now)}</div></div>
<div class="content">
<div class="meta"><div><span class="meta-key">${eh(strings.dateLabel)}:</span> ${eh(now)}</div>${options.experimentName ? `<div><span class="meta-key">${eh(strings.experimentLabel)}:</span> ${eh(options.experimentName)}</div>` : ''}${metaRows}</div>
${studentHtml}${paramsHtml}${statsHtml}${imagesHtml}${tablesHtml}${blocksHtml}
<p class="footer noprint">${eh(options.footerNote ?? strings.footerHint)}</p>
<div class="actions noprint"><button class="btn-close" type="button" onclick="window.close()">${eh(strings.closeLabel)}</button>${sendToTeacherScript}<button class="btn-print" type="button" onclick="window.print()">${eh(strings.printLabel)}</button></div>
</div>
</body></html>`

  const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' })
  const blobUrl = URL.createObjectURL(blob)
  const win = window.open(blobUrl, '_blank')
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)

  if (!win) return null

  if (options.openPrintDialog) {
    win.addEventListener('load', () => {
      setTimeout(() => {
        try { win.focus(); win.print() } catch { /* ignore */ }
      }, 450)
    })
  }
  return win
}

export function bundleLabReport(
  experiment: string,
  branch: string,
  initialParams: Record<string, unknown>,
  resultsArray: Record<string, unknown>[],
  quizScore?: number,
  quizAnswers?: Record<string, { answer: string; correct: boolean }>,
): ExperimentStateBundle {
  return {
    experiment,
    branch,
    initial_params: initialParams,
    results_array: resultsArray,
    quiz_score: quizScore,
    quiz_answers: quizAnswers,
    timestamp: new Date().toISOString(),
  }
}
