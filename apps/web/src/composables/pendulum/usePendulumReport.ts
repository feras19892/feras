import { ref } from 'vue'
import { openLabReport } from '../../utils/lab-report'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

export function usePendulumReport() {
  const canvasSnapshot = ref<string>('')
  function captureSnapshot(canvasRef: { captureSnapshot?: () => void } | null) { canvasRef?.captureSnapshot?.() }
  function onSnapshot(dataUrl: string) { canvasSnapshot.value = dataUrl }

  function openFullReport(ex: any) {
    const trials = ex.trials.trials.value
    let studentInfo = ''
    try {
      const raw = localStorage.getItem('pendulum_report_student')
      if (raw) {
        const d = JSON.parse(raw)
        const fields: [string, string][] = []
        if (d.name) fields.push(['👤 الاسم', d.name]); if (d.email) fields.push(['📧 البريد', d.email]); if (d.class) fields.push(['🏫 الصف', d.class])
        studentInfo = fields.map(([k, v]) => `<tr><td style="font-weight:600;color:#334155;background:#f8fafc;width:30%">${k}</td><td style="font-family:monospace;color:#1e3a8a">${v}</td></tr>`).join('')
        if (studentInfo) studentInfo = `<section class="sec"><h2 class="sec-heading params-heading">📋 معلومات الطالب</h2><table class="params-table"><tbody>${studentInfo}</tbody></table></section>`
      }
    } catch { /* ignore */ }

    const table: LabReportTable = {
      caption: 'الجزء الديناميكي — الحركة الاهتزازية للبندول',
      headers: ['#', 'L (m)', 'T (s)', 'f (Hz)', 'g (m/s²)'],
      rows: trials.map((t: any, i: number) => [i + 1, t.length.toFixed(3), t.T.toFixed(3), t.f.toFixed(3), t.gCalc.toFixed(2)]),
    }

    const statsVal = ex.trials.trialStats.value
    const stats: LabReportStat[] = []
    if (statsVal.g_mean > 0) stats.push({ label: 'g المتوسط', value: statsVal.g_mean.toFixed(2), unit: 'm/s²', highlight: true })
    if (ex.params.g > 0) stats.push({ label: 'g النظري', value: ex.params.g.toFixed(2), unit: 'm/s²' })

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>الزمن الدوري:</b> T = 2π√(L/g)</div>
  <div><b>عجلة الجاذبية:</b> g = 4π²L/T²</div>
  <div><b>التردد الزاوي:</b> ω = √(g/L) &nbsp; <b>f</b> = 1/T</div>
</div>`

    let regressionBlock = ''
    if (statsVal.g_mean > 0) {
      regressionBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div>• الميل (slope) = ${(4 * Math.PI * Math.PI / statsVal.g_mean).toFixed(5)} s²/m</div>
  <div>• g من الانحدار = ${statsVal.g_mean.toFixed(2)} m/s²</div>
</div>`
    }

    openLabReport({
      title: '📋 تقرير تجربة البندول البسيط', icon: '⏱️', experimentName: 'الحركة التوافقية البسيطة — البندول',
      dir: 'rtl', dateLocale: 'ar',
      meta: { 'الفرع': 'الميكانيكا', 'التجربة': 'البندول البسيط', 'g النظري': ex.params.g.toFixed(2) + ' m/s²' },
      params: [
        { label: 'طول الخيط (L)', value: ex.params.length.toFixed(2), unit: 'm' },
        { label: 'الزاوية الأولية (θ₀)', value: (ex.params.theta0 * 180 / Math.PI).toFixed(0), unit: '°' },
        { label: 'عدد القراءات', value: trials.length },
      ],
      summaryStats: stats, tables: [table],
      htmlBlocks: [
        studentInfo ? { title: '📋 معلومات الطالب', html: studentInfo } : null,
        { title: '⚖️ القوانين الفيزيائية', html: lawsBlock },
        regressionBlock ? { title: '📈 نتائج الانحدار الخطي', html: regressionBlock } : null,
        { title: '⚠️ مصادر الأخطاء المحتملة', html: '<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>احتكاك الهواء مع الثقل</li><li>دقة ساعة الإيقاف البشرية</li><li>خطأ زاوية النظر (البارالكس)</li><li>حركة اليد عند الإطلاق</li><li>كتلة الخيط غير مهملة</li><li>زاوية كبيرة (>10°) تخرج عن التقريب</li></ul>' },
      ].filter(Boolean) as any,
      canvasSnapshot: canvasSnapshot.value || undefined,
      footerNote: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية • فيزياء الميكانيكا',
      openPrintDialog: true, sendToTeacher: true,
    })
  }

  return { canvasSnapshot, captureSnapshot, onSnapshot, openFullReport }
}
