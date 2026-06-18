import { ref } from 'vue'
import { openLabReport } from '../../utils/lab-report'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

export function useSpringReport() {
  const canvasSnapshot = ref<string>('')

  function captureSnapshot(canvasRef: { captureSnapshot?: () => void } | null) {
    canvasRef?.captureSnapshot?.()
  }

  function onSnapshot(dataUrl: string) {
    canvasSnapshot.value = dataUrl
  }

  function openFullReport(ex: any) {
    const staticReadings = ex.staticReadings.value
    const dynamicTrials = ex.dynamicTrials.value

    // Student info from localStorage
    let studentInfo = ''
    try {
      const raw = localStorage.getItem('spring_report_student')
      if (raw) {
        const d = JSON.parse(raw)
        const fields: [string, string][] = []
        if (d.name) fields.push(['👤 الاسم', d.name])
        if (d.email) fields.push(['📧 البريد', d.email])
        if (d.class) fields.push(['🏫 الصف / الفصل', d.class])
        if (d.course) fields.push(['📚 المادة', d.course])
        if (d.instructor) fields.push(['👨‍🏫 المدرس', d.instructor])
        if (d.school) fields.push(['🏛️ المدرسة', d.school])
        studentInfo = fields.map(([k, v]) => `<tr><td style="font-weight:600;color:#334155;background:#f8fafc;width:30%">${k}</td><td style="font-family:monospace;color:#1e3a8a">${v}</td></tr>`).join('')
        if (studentInfo) studentInfo = `<section class="sec"><h2 class="sec-heading params-heading">📋 معلومات الطالب</h2><table class="params-table"><tbody>${studentInfo}</tbody></table></section>`
      }
    } catch { /* ignore */ }

    const staticTable: LabReportTable = {
      caption: 'الجزء الاستاتيكي — قانون هوك',
      headers: ['#', 'm (g)', 'Δy (cm)', 'F = mg (N)'],
      rows: staticReadings.map((r: any, i: number) => [
        i + 1,
        (r.mass * 1000).toFixed(0),
        (r.deltaY ?? 0).toFixed(2),
        (r.force ?? 0).toFixed(3),
      ]),
    }

    const dynamicTable: LabReportTable = {
      caption: 'الجزء الديناميكي — الحركة الاهتزازية',
      headers: ['#', 'm (g)', 't₁ (s)', 't₂ (s)', 't₃ (s)', 't̄ (s)', 'T (s)', 'T² (s²)'],
      rows: dynamicTrials.map((t: any, i: number) => [
        i + 1,
        (t.mass * 1000).toFixed(0),
        (t.t1 ?? 0).toFixed(2),
        (t.t2 ?? 0).toFixed(2),
        (t.t3 ?? 0).toFixed(2),
        (t.tAvg ?? 0).toFixed(2),
        (t.T ?? 0).toFixed(3),
        (t.T2 ?? 0).toFixed(4),
      ]),
    }

    const kAvg = (ex.staticK.value && ex.kDynamic.value)
      ? (ex.staticK.value + ex.kDynamic.value) / 2
      : (ex.staticK.value || ex.kDynamic.value || null)
    const errorPercent = (kAvg && ex.params.k > 0)
      ? Math.abs((kAvg - ex.params.k) / ex.params.k) * 100
      : null

    const stats: LabReportStat[] = []
    if (kAvg) stats.push({ label: 'k المتوسط', value: kAvg.toFixed(2), unit: 'N/m', highlight: true })
    if (ex.staticK.value) stats.push({ label: 'k استاتيكي', value: ex.staticK.value.toFixed(2), unit: 'N/m' })
    if (ex.kDynamic.value) stats.push({ label: 'k ديناميكي', value: ex.kDynamic.value.toFixed(2), unit: 'N/m' })
    if (errorPercent !== null) stats.push({ label: 'نسبة الخطأ', value: errorPercent.toFixed(2), unit: '%' })

    const calcHtml = ex.trials.calcResult.value || ''
    const calculationsBlock = calcHtml
      ? `<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">${calcHtml}</div>`
      : ''

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>قانون هوك:</b> k = F/Δy</div>
  <div><b>SHM:</b> T = 2π√(m/k) → k = 4π²m/T²</div>
  <div><b>f₀</b> = (1/2π)·√(k/m) &nbsp; <b>E</b> = ½kA² &nbsp; <b>vₘₐₓ</b> = A√(k/m)</div>
</div>`

    const statsVal = ex.trials.trialStats.value
    let regressionBlock = ''
    if (statsVal.k_mean > 0) {
      regressionBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div>• الميل (slope) = ${statsVal.k_mean.toFixed(2)} N/m</div>
  <div>• معامل التحديد R² = ${(statsVal.T_std < 0.01 ? '0.999+' : (1 - statsVal.T_std).toFixed(3))}</div>
  <div>• المعادلة: y = ${statsVal.k_mean.toFixed(2)} · x + b</div>
</div>`
    }

    openLabReport({
      title: '📋 تقرير تجربة النابض',
      icon: '🧪',
      experimentName: 'الحركة التوافقية البسيطة',
      dir: 'rtl',
      dateLocale: 'ar',
      meta: {
        'الفرع': 'الميكانيكا',
        'التجربة': 'ثابت النابض',
        'k النظري': ex.params.k.toFixed(2) + ' N/m',
      },
      params: [
        { label: 'الكتلة (m)', value: ex.params.mass.toFixed(2), unit: 'kg' },
        { label: 'ثابت النابض النظري (k)', value: ex.params.k.toFixed(2), unit: 'N/m' },
        { label: 'السعة (A)', value: ex.params.amplitude.toFixed(3), unit: 'm' },
        { label: 'عدد الدورات المقاسة', value: ex.params.measureCycles },
        { label: 'عدد القراءات الاستاتيكية', value: staticReadings.length },
        { label: 'عدد القراءات الديناميكية', value: dynamicTrials.length },
      ],
      summaryStats: stats,
      tables: [staticTable, dynamicTable].filter(t => t.rows.length > 0),
      htmlBlocks: [
        studentInfo ? { title: '📋 معلومات الطالب', html: studentInfo } : null,
        { title: '⚖️ القوانين الفيزيائية', html: lawsBlock },
        calculationsBlock ? { title: '📐 الحسابات والمعادلات', html: calculationsBlock } : null,
        regressionBlock ? { title: '📈 نتائج الانحدار الخطي', html: regressionBlock } : null,
        { title: '⚠️ مصادر الأخطاء المحتملة', html: '<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>احتكاك الهواء</li><li>دقة ساعة الإيقاف</li><li>خطأ زاوية النظر (parallax)</li><li>تشوه النابض غير الخطي</li><li>اهتزازات الطاولة</li><li>عدم مركزية الكتلة</li></ul>' },
      ].filter(Boolean) as any,
      canvasSnapshot: canvasSnapshot.value || undefined,
      footerNote: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية • فيزياء الميكانيكا',
      openPrintDialog: true,
      sendToTeacher: true,
    })
  }

  return { canvasSnapshot, captureSnapshot, onSnapshot, openFullReport }
}
