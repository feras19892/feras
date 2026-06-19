import { ref } from 'vue'
import { openLabReport } from '../utils/lab-report'
import type { OpenLabReportOptions, LabReportHtmlBlock } from '../utils/lab-report'

export function useExperimentReport(studentStorageKey: string) {
  const canvasSnapshot = ref<string | null>(null)

  function captureSnapshot(canvasRef: { captureSnapshot?: () => string | void | undefined } | null) {
    if (!canvasRef) return
    try {
      const dataUrl = canvasRef.captureSnapshot?.()
      if (dataUrl) canvasSnapshot.value = dataUrl
    } catch { /* ignore */ }
  }

  function onSnapshot(dataUrl: string) {
    canvasSnapshot.value = dataUrl
  }

  function buildStudentHtmlBlock(): LabReportHtmlBlock | null {
    let studentInfo: Record<string, string> = {}
    try {
      const raw = localStorage.getItem(studentStorageKey)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.name) studentInfo['الاسم'] = d.name
        if (d.email) studentInfo['البريد'] = d.email
        if (d.class) studentInfo['الصف'] = d.class
        if (d.notes) studentInfo['ملاحظات'] = d.notes
      }
    } catch { /* ignore */ }

    const rows = Object.entries(studentInfo)
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="font-weight:600;color:#334155;background:#f8fafc;width:30%">${k}</td><td style="font-family:monospace;color:#1e3a8a">${v}</td></tr>`)
      .join('')

    if (!rows) return null

    return {
      title: '📋 معلومات الطالب',
      html: `<section class="sec"><h2 class="sec-heading params-heading">📋 معلومات الطالب</h2><table class="params-table"><tbody>${rows}</tbody></table></section>`,
    }
  }

  function openFullReport(options: Omit<OpenLabReportOptions, 'canvasSnapshot'>) {
    const studentBlock = buildStudentHtmlBlock()
    const blocks: LabReportHtmlBlock[] = []
    if (studentBlock) blocks.push(studentBlock)
    if (options.htmlBlocks) blocks.push(...options.htmlBlocks)

    openLabReport({
      ...options,
      htmlBlocks: blocks,
      canvasSnapshot: canvasSnapshot.value || undefined,
      openPrintDialog: options.openPrintDialog ?? true,
      sendToTeacher: options.sendToTeacher ?? true,
    })
  }

  return {
    canvasSnapshot,
    captureSnapshot,
    onSnapshot,
    openFullReport,
    buildStudentHtmlBlock,
  }
}
