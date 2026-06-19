import { useExperimentReport } from '../useExperimentReport'
import type { LabReportTable, LabReportStat } from '../../utils/lab-report'

export function useProjectileReport() {
  const rep = useExperimentReport('projectile_report_student')

  function openFullReport(ex: any) {
    const trials = ex.trials.trials.value
    const trialStats = ex.trials.trialStats.value
    const fitResult = ex.trials.fitResult.value

    const table: LabReportTable = {
      caption: 'جدول القراءات — حركة المقذوفات',
      headers: ['#', 'الزاوية (°)', 'v₀ (m/s)', 'زمن التحليق (s)', 'أقصى ارتفاع (m)', 'المدى (m)', 'الخطأ (%)'],
      rows: trials.map((t: any, i: number) => [
        i + 1,
        t.angleDegrees.toFixed(1),
        t.initialVelocity.toFixed(2),
        t.flightTimeSec.toFixed(2),
        t.maxHeightMeters.toFixed(2),
        t.rangeMeters.toFixed(2),
        t.err.toFixed(2) + '%',
      ]),
    }

    const stats: LabReportStat[] = []
    if (trialStats) {
      stats.push({ label: 'متوسط المدى', value: trialStats.range_mean.toFixed(2), unit: 'm', highlight: true })
      stats.push({ label: 'الانحراف المعياري (المدى)', value: trialStats.range_std.toFixed(2), unit: 'm' })
      stats.push({ label: 'متوسط زمن التحليق', value: trialStats.flightTime_mean.toFixed(2), unit: 's' })
      stats.push({ label: 'الانحراف المعياري (الزمن)', value: trialStats.flightTime_std.toFixed(2), unit: 's' })
    }

    let fitBlock = ''
    if (fitResult && trials.length >= 2) {
      fitBlock = `
<div style="font-family:monospace;font-size:.85rem;line-height:1.8;color:#1e3a8a">
  <div><b>معادلة المدى:</b> R = ${fitResult.slope.toFixed(4)} · sin(2θ) ${fitResult.intercept >= 0 ? '+' : ''} ${fitResult.intercept.toFixed(4)}</div>
  <div>منحنى الانحدار الخطي لـ R مقابل sin(2θ)</div>
</div>`
    }

    const lawsBlock = `
<div style="font:monospace .85rem/1.8 #1e3a8a">
  <div><b>زمن الوصول لأقصى ارتفاع:</b> z = v₀ sin θ / g</div>
  <div><b>أقصى ارتفاع:</b> H = (v₀ sin θ)² / 2g</div>
  <div><b>المدى:</b> R = v₀² sin(2θ) / g</div>
</div>`

    rep.openFullReport({
      title: '📋 تقرير تجربة المقذوفات',
      icon: '🚀',
      experimentName: 'حركة المقذوفات — الميكانيكا',
      dir: 'rtl',
      dateLocale: 'ar',
      meta: { 'الفرع': 'الميكانيكا', 'التجربة': 'حركة المقذوفات', 'g النظري': ex.params.g.toFixed(2) + ' m/s²' },
      params: [
        { label: 'v₀', value: ex.params.v0, unit: 'm/s' },
        { label: 'الزاوية', value: ex.params.angleDeg.toFixed(1), unit: '°' },
        { label: 'g', value: ex.params.g.toFixed(2), unit: 'm/s²' },
        { label: 'مقاومة الهواء', value: ex.params.dragCoeff },
        { label: 'عدد القراءات', value: trials.length },
      ],
      summaryStats: stats,
      tables: [table],
      htmlBlocks: [
        { title: '⚖️ المعادلات المستخدمة', html: lawsBlock },
        fitBlock ? { title: '📈 ملائمة منحنى المدى', html: fitBlock } : null,
        { title: '⚠️ مصادر الأخطاء المحتملة', html: '<ul style="margin:0;padding-right:1.2rem;font-size:.85rem"><li>احتكاك الهواء</li><li>دقة ساعة الإيقاف</li><li>خطأ زاوية النظر (parallax)</li><li>تأثير دوران الأرض</li><li>اختلاف g مع الارتفاع</li></ul>' },
      ].filter(Boolean) as any,
      footerNote: 'تم إنشاء هذا التقرير من المحاكاة التفاعلية • فيزياء الميكانيكا',
    })
  }

  return { ...rep, openFullReport }
}
