import { useExperimentReport } from '../useExperimentReport'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

export function usePendulumReport() {
  const rep = useExperimentReport('pendulum_report_student')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openFullReport(ex: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trials: any[] = ex.trials.trials.value

    const table: LabReportTable = {
      caption: 'الجزء الديناميكي — الحركة الاهتزازية للبندول',
      headers: ['#', 'L (m)', 'T (s)', 'f (Hz)', 'g (m/s²)'],
      rows: trials.map((t, i: number) => [i + 1, t.length.toFixed(3), t.T.toFixed(3), t.f.toFixed(3), t.gCalc.toFixed(2)]),
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

    rep.openFullReport({
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
        { title: '⚖️ القوانين الفيزيائية', html: lawsBlock },
        regressionBlock ? { title: '📈 نتائج الانحدار الخطي', html: regressionBlock } : null,
        { title: '⚠️ مصادر الأخطاء المحتملة', html: '<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>احتكاك الهواء مع الثقل</li><li>دقة ساعة الإيقاف البشرية</li><li>خطأ زاوية النظر (البارالكس)</li><li>حركة اليد عند الإطلاق</li><li>كتلة الخيط غير مهملة</li><li>زاوية كبيرة (>10°) تخرج عن التقريب</li></ul>' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].filter(Boolean) as any[],
      footerNote: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية • فيزياء الميكانيكا',
    })
  }

  return { ...rep, openFullReport }
}
