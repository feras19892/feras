import { ref } from 'vue'
import { openLabReport } from '../utils/lab-report'
import { useI18n } from '../composables/useI18n'
import type { OpenLabReportOptions, LabReportHtmlBlock } from '../utils/lab-report'

export function useExperimentReport(studentStorageKey: string) {
  const { t } = useI18n()
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
    const studentInfo: Record<string, string> = {}
    try {
      const raw = localStorage.getItem(studentStorageKey)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.name) studentInfo[t('experiments.nameLabel')] = d.name
        if (d.email) studentInfo[t('experiments.emailLabel')] = d.email
        if (d.class) studentInfo[t('experiments.classLabel')] = d.class
        if (d.notes) studentInfo[t('experiments.notesLabel')] = d.notes
      }
    } catch { /* ignore */ }

    const rows = Object.entries(studentInfo)
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="font-weight:600;color:#334155;background:#f8fafc;width:30%">${k}</td><td style="font-family:monospace;color:#1e3a8a">${v}</td></tr>`)
      .join('')

    if (!rows) return null

    const title = t('experiments.studentInfo')
    return {
      title: `📋 ${title}`,
      html: `<section class="sec"><h2 class="sec-heading params-heading">📋 ${title}</h2><table class="params-table"><tbody>${rows}</tbody></table></section>`,
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
      strings: {
        dateLabel: t('experiments.dateLabel'),
        experimentLabel: t('experiments.experimentLabel'),
        paramsHeading: t('experiments.paramsHeading'),
        resultsHeading: t('experiments.resultsHeading'),
        footerHint: t('experiments.footerHint'),
        printLabel: t('experiments.printLabel'),
        closeLabel: t('experiments.closeLabel'),
        simulationSnap: t('experiments.simulationSnap'),
        sendToTeacherBtn: t('experiments.sendToTeacherBtn'),
        guestStudent: t('experiments.guestStudent'),
        joinClassFirst: t('experiments.joinClassFirst'),
        branchPhysics: t('experiments.branchPhysics'),
        sentSuccessfully: t('experiments.sentSuccessfully'),
        reportSentSuccess: t('experiments.reportSentSuccess'),
        errorLabel: t('experiments.errorLabel'),
      },
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
