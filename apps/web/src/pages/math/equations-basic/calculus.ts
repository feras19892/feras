import type { Equation } from '../math-types';
import { fmt } from '../math-utils';

export const equationsBasic_calculus: Equation[] = [
{
    id: 'derivative-power-rule',
    branchId: 'calculus',
    name: 'قاعدة القوة',
    formula: 'd/dx(x^n) = n x^(n-1)',
    description: 'تستخدم لإيجاد مشتقة الدوال الأسية بسرعة. أساسية في حساب التغيرات والميل.',
    method: 'لإيجاد مشتقة الدالة الأسية: 1) نحدد الأس n. 2) نضرب المعامل في n. 3) نطرح 1 من الأس. 4) النتيجة: d/dx(xف) = n xفف¹. 5) مثال: d/dx(x³) = 3x².',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { n: 3 },
        steps: [
          'n = 3',
          'd/dx(x^3) = 3 x^(3-1) = 3x^2',
        ],
      },
    ],
    graph: {
      label: 'الدالة y = x^n ومشتقتها',
      xRange: [-5, 5],
      yRange: [-10, 10],
      params: { n: 2 },
      fn: (x, p) => {
        if (x < 0 && !Number.isInteger(p.n)) return NaN;
        return x ** p.n;
      },
    },
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return {
        result: `d/dx(x^${n}) = ${n}x^${n - 1}`,
        steps: [`d/dx(x^${n}) = ${n} × x^(${n} - 1)`, `d/dx(x^${n}) = ${n}x^${n - 1}`],
      };
    },
  },
{
    id: 'derivative-polynomial',
    branchId: 'calculus',
    name: 'مشتقة كثيرة الحدود',
    formula: 'd/dx (a x^n + b x^m)',
    description: 'تستخدم لإيجاد ميل منحنى كثيرة الحدود عند أي نقطة. تطبق في تحليل الحركة والتغيرات اللحظية.',
    method: 'لإيجاد مشتقة كثيرة الحدود: 1) نحدد كل حد: a xف و b x. 2) نشتق كل حد بقاعدة القوة: d/dx(a xف) = a n xفف¹. 3) نجمع النتائج: المشتقة = a n xفف¹ + b m xف¹. 4) نعوض القيم العددية للمعاملات والأسس.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 3, n: 4, b: -2, m: 2 },
        steps: [
          'a = 3, n = 4, b = -2, m = 2',
          'd/dx(3x^4) = 3×4 x^3 = 12x^3',
          'd/dx(-2x^2) = -2×2 x = -4x',
          'المشتقة: 12x^3 - 4x',
        ],
      },
    ],
    graph: {
      label: 'كثيرة الحدود y = ax^n + bx^m',
      xRange: [-5, 5],
      yRange: [-20, 20],
      params: { a: 1, n: 2, b: 0, m: 1 },
      fn: (x, p) => {
        let r = 0;
        if (x >= 0 || Number.isInteger(p.n)) r += p.a * (x ** p.n);
        if (x >= 0 || Number.isInteger(p.m)) r += p.b * (x ** p.m);
        return r;
      },
    },
    variables: [
      { name: 'a', label: 'a' },
      { name: 'n', label: 'n' },
      { name: 'b', label: 'b' },
      { name: 'm', label: 'm' },
    ],
    solve(values) {
      const a = Number(values.a);
      const n = Number(values.n);
      const b = Number(values.b);
      const m = Number(values.m);
      if ([a, n, b, m].some((x) => Number.isNaN(x))) {
        return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      }
      return {
        result: `${a * n}x^${n - 1} + ${b * m}x^${m - 1}`,
        steps: [
          `d/dx(${a}x^${n}) = ${a * n}x^${n - 1}`,
          `d/dx(${b}x^${m}) = ${b * m}x^${m - 1}`,
          `المشتقة: ${a * n}x^${n - 1} + ${b * m}x^${m - 1}`,
        ],
      };
    },
  },
{
    id: 'integral-power-rule',
    branchId: 'calculus',
    name: 'تكامل القوة',
    formula: '∫ x^n dx = x^(n+1) / (n+1) + C',
    description: 'يستخدم لإيجاد تكامل الدوال الأسية من الشكل x^n. قاعدة أساسية في التفاضل والتكامل.',
    method: '1) حدد الأس n (يجب ألا يكون -1). 2) أضف 1 إلى الأس. 3) اقسم على الأس الجديد. 4) أضف ثابت التكامل C: ∫x^n dx = x^(n+1)/(n+1) + C.',
    examples: [{ title: 'مثال', values: { n: 2 }, steps: ['∫ x^2 dx = x^3/3 + C'] }],
    graph: {
      label: 'الدالة y = x^n',
      xRange: [-5, 5],
      yRange: [-10, 10],
      params: { n: 2 },
      fn: (x, p) => {
        if (x < 0 && !Number.isInteger(p.n)) return NaN;
        return x ** p.n;
      },
    },
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (n === -1) return { result: 'n لا يمكن أن تكون -1', steps: [] };
      return { result: `∫ x^${n} dx = x^${n + 1}/${n + 1} + C`, steps: [`x^${n + 1} / ${n + 1} + C`] };
    },
  },
{
    id: 'definite-integral',
    branchId: 'calculus',
    name: 'التكامل المحدد',
    formula: '∫[a,b] x^n dx = (b^(n+1) - a^(n+1)) / (n+1)',
    description: 'يحسب المساحة المحددة بين منحنى دالة والمحور x من x=a إلى x=b. لا يحتاج لثابت التكامل لأنه يلغى عند الطرح.',
    method: '1) أوجد التكامل العام F(x) = x^(n+1)/(n+1). 2) عوّض بالحد العلوي b. 3) عوّض بالحد السفلي a. 4) اطرح: F(b) - F(a).',
    examples: [{ title: 'مثال', values: { n: 2, a: 0, b: 3 }, steps: ['I = 9'] }],
    graph: {
      label: 'المساحة تحت منحنى y = x^n',
      xRange: [-5, 5],
      yRange: [-10, 10],
      params: { n: 2 },
      fn: (x, p) => {
        if (x < 0 && !Number.isInteger(p.n)) return NaN;
        return x ** p.n;
      },
    },
    variables: [{ name: 'n', label: 'n' }, { name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const n = Number(values.n), a = Number(values.a), b = Number(values.b);
      if ([n, a, b].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (n === -1) return { result: 'n لا يمكن أن تكون -1', steps: [] };
      const result = (b ** (n + 1) - a ** (n + 1)) / (n + 1);
      return { result: `I = ${fmt(result)}`, steps: [`I = (${b}^${n + 1} - ${a}^${n + 1}) / ${n + 1}`, `I = ${fmt(result)}`] };
    },
  }
];
