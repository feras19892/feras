import type { Report } from '../services/report.service'

export interface AutoGradeResult {
  accuracy: number
  presentation: number
  conclusion: number
  innovation: number
  total: number
  notes: string[]
}

function safeParse(str: string | undefined): any {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function autoGradeReport(report: Report): AutoGradeResult {
  const notes: string[] = []
  let accuracy = 0
  let presentation = 0
  let conclusion = 0
  let innovation = 0

  const readings = safeParse(report.readings)
  const columns = safeParse(report.columns)
  const equations = safeParse(report.equations)
  const plots = safeParse(report.plots)
  const params = safeParse(report.params)
  const studentInfo = safeParse(report.student_info)

  // ═══ الدقة (0-25) ═══
  if (readings && Array.isArray(readings)) {
    const count = readings.length
    if (count >= 10) { accuracy += 12; notes.push('عدد القراءات ممتاز (10+)') }
    else if (count >= 6) { accuracy += 9; notes.push('عدد القراءات جيد') }
    else if (count >= 3) { accuracy += 6; notes.push('عدد القراءات مقبول') }
    else { accuracy += 2; notes.push('عدد القراءات قليل') }

    // فحص تناسق القراءات
    if (count >= 2) {
      const numericCols = readings.reduce((acc: string[], r: any) => {
        Object.keys(r).forEach(k => {
          if (typeof r[k] === 'number' && !acc.includes(k)) acc.push(k)
        })
        return acc
      }, [])
      if (numericCols.length > 0) {
        let consistent = true
        for (const col of numericCols) {
          const vals = readings.map((r: any) => r[col]).filter((v: any) => typeof v === 'number')
          if (vals.length >= 3) {
            const mean = vals.reduce((s: number, v: number) => s + v, 0) / vals.length
            const variance = vals.reduce((s: number, v: number) => s + (v - mean) ** 2, 0) / vals.length
            const cv = mean !== 0 ? Math.sqrt(variance) / Math.abs(mean) : 0
            if (cv > 0.5) { consistent = false; break }
          }
        }
        if (consistent) { accuracy += 8; notes.push('القراءات متناسقة') }
        else { accuracy += 4; notes.push('توجد تذبذبات في القراءات') }
      } else { accuracy += 5 }
    } else { accuracy += 5 }
  } else {
    accuracy += 0
    notes.push('لا توجد قراءات')
  }
  // دقة الأرقام العشرية
  if (readings && Array.isArray(readings) && readings.length > 0) {
    const hasDecimals = readings.some((r: any) =>
      Object.values(r).some((v: any) => typeof v === 'number' && v % 1 !== 0)
    )
    if (hasDecimals) { accuracy += 5; notes.push('دقة عشرية جيدة') }
    else { accuracy += 2 }
  }
  accuracy = clamp(accuracy, 0, 25)

  // ═══ العرض (0-25) ═══
  if (columns && Array.isArray(columns) && columns.length > 0) {
    presentation += 8; notes.push(`الأعمدة منظمة (${columns.length} عمود)`)
  } else { presentation += 2; notes.push('لا توجد أعمدة معرفة') }

  if (plots && Array.isArray(plots) && plots.length > 0) {
    presentation += 7; notes.push(`الرسوم البيانية موجودة (${plots.length})`)
  } else { presentation += 1 }

  if (report.chart_snapshot) {
    presentation += 6; notes.push('لقطة الرسم البياني مرفقة')
  } else { presentation += 1; notes.push('لا توجد لقطة للرسم') }

  if (equations && Array.isArray(equations) && equations.length > 0) {
    presentation += 4; notes.push(`المعادلات موجودة (${equations.length})`)
  } else { presentation += 1 }

  presentation = clamp(presentation, 0, 25)

  // ═══ الاستنتاج (0-25) ═══
  const concText = (report.conclusion || '').trim()
  if (concText) {
    if (concText.length >= 150) { conclusion += 12; notes.push('الاستنتاج مفصل ومطوّل') }
    else if (concText.length >= 60) { conclusion += 8; notes.push('الاستنتاج جيد') }
    else if (concText.length >= 20) { conclusion += 5; notes.push('الاستنتاج مختصر') }
    else { conclusion += 2; notes.push('الاستنتاج قصير جداً') }
  } else { notes.push('لا يوجد استنتاج — درجة الاستنتاج 0') }

  if (report.conclusion_errors && report.conclusion_errors.trim()) {
    conclusion += 7; notes.push('تم تحديد المصادر الخطأ')
  } else { conclusion += 1 }

  if (report.conclusion_improvements && report.conclusion_improvements.trim()) {
    conclusion += 6; notes.push('تم اقتراح تحسينات')
  } else { conclusion += 1 }

  conclusion = clamp(conclusion, 0, 25)

  // ═══ الابتكار (0-25) ═══
  if (params) {
    const paramKeys = Object.keys(params)
    if (paramKeys.length >= 5) { innovation += 10; notes.push('معاملات إضافية غنية') }
    else if (paramKeys.length >= 3) { innovation += 7; notes.push('معاملات جيدة') }
    else if (paramKeys.length >= 1) { innovation += 4 }
    else { innovation += 1 }
  } else { innovation += 1 }

  if (studentInfo && Object.keys(studentInfo).length > 0) {
    innovation += 5; notes.push('بيانات الطالب مكتملة')
  } else { innovation += 1 }

  const improvementsText = (report.conclusion_improvements || '').trim()
  if (improvementsText.length >= 80) { innovation += 6; notes.push('اقتراحات تحسين مبتكرة') }
  else if (improvementsText.length >= 30) { innovation += 4 }
  else { innovation += 1 }

  if (equations && Array.isArray(equations) && equations.length >= 3) {
    innovation += 4; notes.push('استخدام معادلات متعددة')
  } else if (equations && equations.length >= 1) { innovation += 2 }
  else { innovation += 1 }

  innovation = clamp(innovation, 0, 25)

  const total = accuracy + presentation + conclusion + innovation

  return { accuracy, presentation, conclusion, innovation, total, notes }
}
