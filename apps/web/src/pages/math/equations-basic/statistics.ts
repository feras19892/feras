import type { Equation } from '../math-types';
import { fmt, parseNumbers } from '../math-utils';

export const equationsBasic_statistics: Equation[] = [
{
    id: 'mean-median-mode',
    branchId: 'statistics',
    name: 'المتوسط والوسيط والمنوال',
    formula: 'mean = Σx / N',
    description: 'تستخدم لتحليل مجموعة بيانات وإيجاد القيمة النموذجية. تطبق في الإحصاء والاحتمالات.',
    method: 'لحساب المتوسط والوسيط والمنوال: 1) نجمع جميع القيم ونقسم على عددها للحصول على المتوسط. 2) نرتب القيم تصاعدياً للحصول على الوسيط (القيمة الوسطى). 3) نعدّ تكرار كل قيمة للحصول على المنوال (الأكثر تكراراً). 4) نعوض البيانات ونحسب القياسات الثلاثة.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { numbers: '2, 4, 4, 6, 8' },
        steps: [
          'البيانات: 2, 4, 4, 6, 8',
          'المتوسط = (2+4+4+6+8) / 5 = 24 / 5 = 4.8',
          'الوسيط = 4',
          'المنوال = 4',
        ],
      },
    ],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0) return { result: 'أدخل أرقاماًً', steps: [] };
      const sum = numbers.reduce((s, n) => s + n, 0);
      const mean = sum / numbers.length;
      const sorted = [...numbers].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      const counts = new Map<number, number>();
      numbers.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1));
      const mode = [...counts.entries()].reduce((a, b) => (a[1] >= b[1] ? a : b))[0];
      return {
        result: `متوسط = ${fmt(mean)}, وسيط = ${fmt(median)}, منوال = ${fmt(mode)}`,
        steps: [
          `المتوسط = ${fmt(sum)} / ${numbers.length} = ${fmt(mean)}`,
          `الوسيط = ${fmt(median)}`,
          `المنوال = ${fmt(mode)}`,
        ],
      };
    },
  },
{
    id: 'standard-deviation',
    branchId: 'statistics',
    name: 'الانحراف المعياري',
    formula: 'σ = sqrt( Σ(x - μ)^2 / N )',
    description: 'تستخدم لقياس مدى تشتت البيانات حول المتوسط. تطبق في تقييم الجودة والقياسات العلمية.',
    method: 'لحساب الانحراف المعياري: 1) نحسب المتوسط μ = Σx / N. 2) نحسب فرق كل قيمة عن المتوسط: (x - μ). 3) نربع كل فرق ونجمعها: Σ(x - μ)². 4) نقسم على عدد القيم N: التباين = Σ(x - μ)² / N. 5) نأخذ الجذر التربيعي: σ = √(التباين).',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { numbers: '2, 4, 4, 6, 8' },
        steps: [
          'البيانات: 2, 4, 4, 6, 8',
          'المتوسط μ = 4.8',
          'مربعات الفروق: (2-4.8)^2 + (4-4.8)^2 + ... + (8-4.8)^2 = 17.2',
          'التباين = 17.2 / 5 = 3.44',
          'الانحراف المعياري σ = √3.44 ≈ 1.855',
        ],
      },
    ],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0) return { result: 'أدخل أرقاماًً', steps: [] };
      const mean = numbers.reduce((s, n) => s + n, 0) / numbers.length;
      const variance = numbers.reduce((s, n) => s + (n - mean) ** 2, 0) / numbers.length;
      const std = Math.sqrt(variance);
      return {
        result: `σ = ${fmt(std)}`,
        steps: [
          `μ = ${fmt(mean)}`,
          `التباين = ${fmt(variance)}`,
          `σ = √${fmt(variance)} = ${fmt(std)}`,
        ],
      };
    },
  },
{
    id: 'probability',
    branchId: 'statistics',
    name: 'احتمال حدث',
    formula: 'P = favorable / total',
    description: 'يحسب احتمال وقوع حدث ما عندما نعرف عدد النتائج المرغوبة وإجمالي عدد النتائج الممكنة المتساوية الاحتمال.',
    method: '1) حدد عدد النتائج المرغوبة (favorable). 2) حدد إجمالي عدد النتائج الممكنة (total). 3) قسّم المرغوب على الكلي: P = favorable/total. 4) يمكن التعبير عن الاحتمال ككسر أو نسبة مئوية.',
    examples: [{ title: 'مثال', values: { favorable: 3, total: 10 }, steps: ['P = 0.3'] }],
    applicationProblems: [
      {
        question: 'في صندوق 15 كرة، 5 حمراء و10 زرقاء. ما احتمال اختيار كرة حمراء عشوائياً؟',
        hint: 'P = عدد الحمراء / العدد الكلي.',
        answer: 'P = 1/3 ≈ 0.333',
        variables: { favorable: 5, total: 15 },
        expectedValue: '0.333',
      },
    ],
    variables: [{ name: 'favorable', label: 'المرغوب' }, { name: 'total', label: 'الكلي' }],
    solve(values) {
      const f = Number(values.favorable), t = Number(values.total);
      if ([f, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (t === 0) return { result: 'الكلي لا يمكن أن يكون صفراً', steps: [] };
      return { result: `P = ${fmt(f / t)}`, steps: [`P = ${f}/${t}`, `P = ${fmt(f / t)}`] };
    },
  },
{
    id: 'combination',
    branchId: 'statistics',
    name: 'التوافيق',
    formula: 'C(n, k) = n! / (k!(n-k)!)',
    description: 'تحسب عدد الطرق لاختيار k عناصر من مجموعة n عنصراً دون اعتبار الترتيب. تستخدم في اليانصيب، اختيار اللجان، والاحتمالات.',
    method: '1) حدد العدد الكلي n. 2) حدد عدد العناصر المختارة k. 3) احسب المضارب: n! و k! و (n-k)!. 4) C(n,k) = n! / (k! × (n-k)!).',
    examples: [{ title: 'مثال', values: { n: 5, k: 2 }, steps: ['C(5,2) = 10'] }],
    variables: [{ name: 'n', label: 'n' }, { name: 'k', label: 'k' }],
    solve(values) {
      const n = Number(values.n), k = Number(values.k);
      if ([n, k].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (k < 0 || k > n) return { result: 'k يجب أن يكون بين 0 و n', steps: [] };
      const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
      const c = fact(n) / (fact(k) * fact(n - k));
      return { result: `C(${n}, ${k}) = ${fmt(c)}`, steps: [`C(${n}, ${k}) = ${n}!/(${k}!×${n - k}!)`, `C(${n}, ${k}) = ${fmt(c)}`] };
    },
  }
];
