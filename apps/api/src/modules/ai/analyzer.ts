// Built-in statistical analysis engine — no external AI needed
// Analyzes lab reports using statistical methods and heuristics

interface AnalysisInput {
  experiment_name: string;
  student_name?: string | null;
  readings: string | null;
  columns?: string | null;
  equations?: string | null;
  plots?: string | null;
  conclusion?: string | null;
  chart_snapshot?: string | null;
}

interface ColumnDef {
  type: string;
  key: string;
  label?: string;
  unit?: string;
}

function safeParse(str: string | null | undefined): any[] {
  try { return str ? JSON.parse(str) : []; } catch { return []; }
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const variance = nums.reduce((acc, n) => acc + (n - m) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function detectOutliers(nums: number[]): number[] {
  if (nums.length < 4) return [];
  const sorted = [...nums].sort((a, b) => a - b);
  const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)));
  const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)));
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return nums.filter((n) => n < lower || n > upper);
}

function coefficientOfVariation(nums: number[]): number {
  const m = mean(nums);
  if (m === 0) return 0;
  return (stdDev(nums) / Math.abs(m)) * 100;
}

function pearsonR(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const mx = mean(x);
  const my = mean(y);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

export function analyzeReportBuiltIn(input: AnalysisInput): { analysis: string; grade: number } {
  const readings = safeParse(input.readings);
  const columns = safeParse(input.columns) as ColumnDef[];
  const equations = safeParse(input.equations);
  const plots = safeParse(input.plots);
  const conclusion = input.conclusion || '';
  const hasChart = !!input.chart_snapshot;

  const sections: string[] = [];
  let grade = 0;
  const gradeBreakdown: string[] = [];

  // ── 1. Summary ──
  sections.push(`## 📋 ملخص التقرير`);
  sections.push(`- **التجربة:** ${input.experiment_name}`);
  sections.push(`- **الطالب:** ${input.student_name || 'غير محدد'}`);
  sections.push(`- **عدد القراءات:** ${readings.length}`);
  sections.push(`- **عدد الأعمدة:** ${columns.length}`);
  sections.push('');

  // ── 2. Data Quality Analysis ──
  sections.push(`## 📊 تحليل جودة البيانات`);

  const numericCols = columns.filter((c) => c.type === 'number');
  const numericKeyPairs: { x: string; y: string }[] = [];

  if (numericCols.length >= 2) {
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        numericKeyPairs.push({ x: numericCols[i].key, y: numericCols[j].key });
      }
    }
  }

  let dataQualityScore = 0;

  if (readings.length === 0) {
    sections.push('- ⚠️ **لا توجد قراءات** — التقرير لا يحتوي على بيانات تجريبية');
  } else {
    // Check data quantity
    if (readings.length >= 10) {
      sections.push(`- ✅ **عدد القراءات ممتاز** (${readings.length} قراءة) — بيانات كافية لتحليل موثوق`);
      dataQualityScore += 25;
    } else if (readings.length >= 5) {
      sections.push(`- ✅ **عدد القراءات جيد** (${readings.length} قراءة)`);
      dataQualityScore += 18;
    } else if (readings.length >= 3) {
      sections.push(`- ⚠️ **عدد القراءات مقبول** (${readings.length} قراءة) — يُنصح بجمع المزيد من البيانات`);
      dataQualityScore += 10;
    } else {
      sections.push(`- ❌ **عدد القراءات غير كافٍ** (${readings.length} قراءة فقط)`);
      dataQualityScore += 3;
    }

    // Analyze each numeric column
    for (const col of numericCols) {
      const values = readings
        .map((r: any) => Number(r[col.key]))
        .filter((v: number) => !isNaN(v));

      if (values.length === 0) continue;

      const m = mean(values);
      const sd = stdDev(values);
      const cv = coefficientOfVariation(values);
      const outliers = detectOutliers(values);
      const colLabel = col.label || col.key;

      sections.push(`- **${colLabel}**: المتوسط = ${m.toFixed(3)}, الانحراف المعياري = ${sd.toFixed(3)}, معامل الاختلاف = ${cv.toFixed(1)}%`);

      if (outliers.length > 0) {
        sections.push(`  - ⚠️ تم اكتشاف ${outliers.length} قيمة شاذة في عمود "${colLabel}"`);
      }

      if (cv < 5) {
        dataQualityScore += 5;
      } else if (cv < 15) {
        dataQualityScore += 3;
      }
    }

    // Correlation analysis
    if (numericKeyPairs.length > 0) {
      sections.push('');
      sections.push('### 📈 تحليل الارتباط');
      for (const pair of numericKeyPairs.slice(0, 3)) {
        const xVals = readings.map((r: any) => Number(r[pair.x])).filter((v: number) => !isNaN(v));
        const yVals = readings.map((r: any) => Number(r[pair.y])).filter((v: number) => !isNaN(v));
        const minLen = Math.min(xVals.length, yVals.length);
        if (minLen >= 3) {
          const r = pearsonR(xVals.slice(0, minLen), yVals.slice(0, minLen));
          const strength = Math.abs(r) > 0.9 ? 'ارتباط قوي جداً' : Math.abs(r) > 0.7 ? 'ارتباط قوي' : Math.abs(r) > 0.5 ? 'ارتباط متوسط' : Math.abs(r) > 0.3 ? 'ارتباط ضعيف' : 'لا يوجد ارتباط';
          const direction = r > 0 ? 'طردي' : r < 0 ? 'عكسي' : '';
          sections.push(`- **${pair.x} ↔ ${pair.y}**: معامل الارتباط (r) = ${r.toFixed(4)} — ${strength} ${direction}`);
          if (Math.abs(r) > 0.7) dataQualityScore += 5;
        }
      }
    }
  }

  dataQualityScore = Math.min(dataQualityScore, 40);
  sections.push('');
  sections.push(`**درجة جودة البيانات: ${dataQualityScore}/40**`);
  sections.push('');

  // ── 3. Equations Analysis ──
  sections.push('## 📐 تحليل المعادلات');
  if (equations.length === 0) {
    sections.push('- ❌ **لا توجد معادلات** — لم يتم استخدام أي معادلات في التحليل');
  } else {
    sections.push(`- ✅ تم استخدام ${equations.length} معادلة/معادلات`);
    for (const eq of equations.slice(0, 5)) {
      if (typeof eq === 'object' && eq !== null) {
        const name = (eq as any).name || (eq as any).label || (eq as any).equation || 'معادلة';
        sections.push(`  - ${typeof name === 'string' ? name : 'معادلة'}`);
      }
    }
    dataQualityScore += 10;
  }
  sections.push('');

  // ── 4. Plots & Charts ──
  sections.push('## 📉 تحليل الرسومات');
  if (plots.length > 0) {
    sections.push(`- ✅ يوجد ${plots.length} رسم بياني`);
    dataQualityScore += 5;
  } else {
    sections.push('- ❌ **لا توجد رسومات بيانية**');
  }
  if (hasChart) {
    sections.push('- ✅ يوجد رسم بياني (chart snapshot)');
    dataQualityScore += 5;
  } else {
    sections.push('- ❌ لا يوجد لقطة للرسم البياني');
  }
  sections.push('');

  // ── 5. Conclusion Analysis ──
  sections.push('## 📝 تحليل الخاتمة');
  if (conclusion.length === 0) {
    sections.push('- ❌ **لا توجد خاتمة** — الطالب لم يكتب خاتمة للتقرير');
  } else if (conclusion.length < 50) {
    sections.push(`- ⚠️ **خاتمة قصيرة جداً** (${conclusion.length} حرف) — تحتاج إلى تفصيل أكثر`);
    dataQualityScore += 3;
  } else if (conclusion.length < 150) {
    sections.push(`- ✅ **خاتمة مقبولة** (${conclusion.length} حرف)`);
    dataQualityScore += 8;
  } else {
    sections.push(`- ✅ **خاتلة ممتازة ومفصلة** (${conclusion.length} حرف)`);
    dataQualityScore += 12;
  }
  sections.push('');

  // ── 6. Grade Calculation ──
  sections.push('## 🎯 التقييم النهائي');

  grade = Math.min(100, dataQualityScore + 20); // base 20 for submitting

  // Bonus for completeness
  if (equations.length > 0) grade += 10;
  if (plots.length > 0) grade += 5;
  if (hasChart) grade += 5;
  if (conclusion.length >= 150) grade += 10;
  else if (conclusion.length >= 50) grade += 5;

  grade = Math.min(100, Math.round(grade));

  let gradeLabel = '';
  if (grade >= 90) gradeLabel = 'ممتاز';
  else if (grade >= 80) gradeLabel = 'جيد جداً';
  else if (grade >= 70) gradeLabel = 'جيد';
  else if (grade >= 60) gradeLabel = 'مقبول';
  else gradeLabel = 'ضعيف';

  sections.push(`- **الدرجة المقترحة: ${grade}/100** (${gradeLabel})`);
  sections.push('');

  // ── 7. Recommendations ──
  sections.push('## 💡 توصيات للتحسين');
  const recommendations: string[] = [];

  if (readings.length < 5) recommendations.push('جمع المزيد من القراءات التجريبية (يُنصح بـ 10 قراءات على الأقل)');
  if (equations.length === 0) recommendations.push('إضافة المعادلات المستخدمة في التحليل');
  if (plots.length === 0 && !hasChart) recommendations.push('إضافة رسومات بيانية لتوضيح العلاقة بين المتغيرات');
  if (conclusion.length < 150) recommendations.push('كتابة خاتمة أكثر تفصيلاً تشمل النتائج والمصادر المحتملة للخطأ');
  
  // Check for outliers
  for (const col of numericCols) {
    const values = readings.map((r: any) => Number(r[col.key])).filter((v: number) => !isNaN(v));
    if (detectOutliers(values).length > 0) {
      recommendations.push(`مراجعة القيم الشاذة في عمود "${col.label || col.key}" وإعادة القياس إذا لزم الأمر`);
      break;
    }
  }

  if (recommendations.length === 0) {
    sections.push('- ✅ التقرير مكتمل! لا توجد توصيات إضافية');
  } else {
    for (const rec of recommendations) {
      sections.push(`- ${rec}`);
    }
  }

  return { analysis: sections.join('\n'), grade };
}
