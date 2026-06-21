import { useExperimentReport } from '../useExperimentReport'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

export function useFreeFallReport() {
  const rep = useExperimentReport('freefall_report_student')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openFullReport(ex: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trials: any[] = ex.trials.trials.value
    const table: LabReportTable = {
      caption: 'جدول قراءات السقوط الحر',
      headers: ['#', 'h (m)', 't (s)', 't² (s²)', 'v_impact (m/s)', 'g_calc (m/s²)', 'الخطأ (%)'],
      rows: trials.map((t, i: number) => [
        i + 1, t.heightMeters.toFixed(2), t.timeSec.toFixed(3),
        t.timeSquaredSec2.toFixed(4), t.impactVelocityMs.toFixed(2),
        t.gCalc.toFixed(2), t.err.toFixed(2) + '%',
      ]),
    }

    const statsVal = ex.trials.trialStats.value
    const stats: LabReportStat[] = []
    if (statsVal.g_mean > 0) stats.push({ label: 'g المتوسط', value: statsVal.g_mean.toFixed(2), unit: 'm/s²', highlight: true })
    if (ex.params.g > 0) stats.push({ label: 'g النظري', value: ex.params.g.toFixed(2), unit: 'm/s²' })

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>معادلة الزمن:</b> t = √(2h/g)</div>
  <div><b>معادلة السرعة:</b> v = √(2gh)</div>
  <div><b>عجلة الجاذبية:</b> g = 2h/t²</div>
</div>`

    const calcHtml = ex.trials.calcResult.value || ''
    const calculationsBlock = calcHtml
      ? `<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">${calcHtml}</div>`
      : ''

    let regressionBlock = ''
    if (statsVal.g_mean > 0) {
      regressionBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div>• الميل (slope) = ${(statsVal.g_mean / 2).toFixed(5)} m/s²</div>
  <div>• g من الانحدار = ${statsVal.g_mean.toFixed(2)} m/s²</div>
</div>`
    }

    rep.openFullReport({
      title: '📋 تقرير تجربة السقوط الحر', icon: '🍎', experimentName: 'السقوط الحر — ميكانيكا الجاذبية',
      dir: 'rtl', dateLocale: 'ar',
      meta: { 'الفرع': 'الميكانيكا', 'التجربة': 'السقوط الحر', 'g النظري': ex.params.g.toFixed(2) + ' m/s²' },
      params: [
        { label: 'الارتفاع (h)', value: ex.params.h.toFixed(2), unit: 'm' },
        { label: 'g', value: ex.params.g.toFixed(2), unit: 'm/s²' },
        { label: 'الكتلة', value: ex.params.mass.toFixed(2), unit: 'kg' },
        { label: 'مقاومة الهواء', value: ex.params.airResistance ? 'مفعلة' : 'غير مفعلة' },
        { label: 'عدد القراءات', value: trials.length },
      ],
      summaryStats: stats, tables: [table],
      htmlBlocks: [
        { title: '⚖️ القوانين الفيزيائية', html: lawsBlock },
        calculationsBlock ? { title: '📐 الحسابات والمعادلات', html: calculationsBlock } : null,
        regressionBlock ? { title: '📈 نتائج الانحدار الخطي', html: regressionBlock } : null,
        { title: '⚠️ مصادر الأخطاء المحتملة', html: '<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>دقة المؤقت الرقمي</li><li>دقة قياس الارتفاع</li><li>احتكاك الهواء</li><li>اهتزاز الجهاز عند الاصطدام</li><li>تأثير الجاذبية المحلية</li></ul>' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].filter(Boolean) as any[],
      footerNote: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية • فيزياء الميكانيكا',
    })
  }

  return { ...rep, openFullReport }
}
