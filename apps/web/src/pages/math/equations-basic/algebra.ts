import type { Equation } from '../math-types';
import { fmt } from '../math-utils';

export const equationsBasic_algebra: Equation[] = [
{
    id: 'linear-equation',
    branchId: 'algebra',
    name: 'المعادلة الخطية',
    formula: 'ax + b = c',
    description: 'تستخدم لإيجاد قيمة مجهولة واحدة (x) عندما تكون العلاقة بين المتغيرات خطية. تظهر في مسائل السرعة الثابتة، التكلفة الإجمالية، والتوازن البسيط.',
    method: 'لحل المعادلة الخطية باستخدام الثوابت: 1) نحدد قيم a و b و c. 2) نعزل x بطرح b من الطرفين: ax = c - b. 3) نقسم على a: x = (c - b) / a. 4) نعوض القيم العددية ونحسب الناتج.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 2, b: 3, c: 7 },
        steps: [
          'المعادلة: 2x + 3 = 7',
          'نطرح 3 من الطرفين: 2x = 7 - 3 = 4',
          'نقسم على 2: x = 4 / 2 = 2',
        ],
      },
    ],
    applicationProblems: [
      {
        question: 'تكلفة رحلة أجرة: 10 ليرة ثابتة + 3 ليرة لكل كم. إذا دفع الراكب 70 ليرة، كم كم قطع؟',
        hint: 'استخدم المعادلة 3x + 10 = 70.',
        answer: 'x = 20 كم',
        variables: { a: 3, b: 10, c: 70 },
        expectedValue: 20,
      },
    ],
    variables: [
      { name: 'x', label: 'x' },
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
      { name: 'c', label: 'c' },
    ],
    graph: {
      label: 'الخط المستقيم y = ax + b',
      xRange: [-10, 10],
      params: { a: 1, b: 0 },
      fn: (x, p) => p.a * x + p.b,
    },
    defaultSolveFor: 'x',
    solve(values, solveFor) {
      const a = Number(values.a);
      const b = Number(values.b);
      const c = Number(values.c);
      const target = solveFor || 'x';
      if (target === 'x') {
        if ([a, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
        const x = (c - b) / a;
        return { result: `x = ${fmt(x)}`, steps: [`${a}x + ${b} = ${c}`, `${a}x = ${c - b}`, `x = ${c - b} / ${a} = ${fmt(x)}`] };
      }
      if (target === 'a') {
        const x = Number(values.x);
        if ([x, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (x === 0) return { result: 'x يجب ألا يكون صفراً', steps: [] };
        const aVal = (c - b) / x;
        return { result: `a = ${fmt(aVal)}`, steps: [`${a}x + ${b} = ${c}`, `ax = ${c - b}`, `a = (${c} - ${b}) / ${x} = ${fmt(aVal)}`] };
      }
      if (target === 'b') {
        const x = Number(values.x);
        if ([a, x, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        const bVal = c - a * x;
        return { result: `b = ${fmt(bVal)}`, steps: [`ax + b = ${c}`, `b = ${c} - ${a}×${x} = ${fmt(bVal)}`] };
      }
      if (target === 'c') {
        const x = Number(values.x);
        if ([a, b, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        const cVal = a * x + b;
        return { result: `c = ${fmt(cVal)}`, steps: [`c = ${a}×${x} + ${b} = ${fmt(cVal)}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
{
    id: 'linear-system',
    branchId: 'algebra',
    name: 'نظام معادلتين خطيتين',
    formula: 'A: ax + by = c | B: dx + ey = f',
    description: 'يستخدم لحل معادلتين خطيتين معاً لإيجاد نقطة التقاطع (x, y). يظهر في مسائل التكلفة والدخل، والتوازن الكيميائي، والقوى المتزنة.',
    method: 'لحل نظام معادلتين خطيتين: 1) نكتب المعادلتين: ax + by = c و dx + ey = f. 2) نحسب المحدد: D = a×e - b×d. 3) إذا كان D = 0، لا يوجد حل فريد (الخطان متوازيان أو متطابقان). 4) إذا كان D ≠ 0: x = (c×e - b×f) / D و y = (a×f - c×d) / D. 5) نعوض القيم للتحقق من الناتج.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 2, b: 3, c: 12, d: 1, e: -1, f: 1 },
        steps: [
          'المعادلة (A): 2x + 3y = 12',
          'المعادلة (B): x - y = 1',
          'D = 2×(-1) - 3×1 = -5',
          'x = (12×(-1) - 3×1) / -5 = (-15) / -5 = 3',
          'y = (2×1 - 12×1) / -5 = (-10) / -5 = 2',
          'نقطة التقاطع: (3, 2)',
        ],
      },
    ],
    applicationProblems: [
      {
        question: 'محمصة تبيع كوب قهوة بـ 5 ليرات وكعكة بـ 3 ليرات. إذا اشترى زبون 7 منتجات ودفع 27 ليرة، كم كوب قهوة وكم كعكة اشترى؟',
        hint: 'اكتب المعادلتين: x + y = 7 و 5x + 3y = 27.',
        answer: 'x = 3 أكواب قهوة، y = 4 كعكات',
        variables: { a: 1, b: 1, c: 7, d: 5, e: 3, f: 27 },
        expectedValue: '3, 4',
      },
    ],
    variables: [
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
      { name: 'c', label: 'c' },
      { name: 'd', label: 'd' },
      { name: 'e', label: 'e' },
      { name: 'f', label: 'f' },
    ],
    graph: {
      label: 'المعادلتان A و B كمستقيمين متقاطعين',
      xRange: [-10, 10],
      yRange: [-10, 10],
      params: { a: 2, b: 3, c: 12, d: 1, e: -1, f: 1 },
      fn: () => 0,
      lines: [
        {
          label: 'A: ax + by = c',
          color: '#38bdf8',
          fn: (x, p) => (p.b === 0 ? Number.NaN : (p.c - p.a * x) / p.b),
          verticalX: (p) => (p.b === 0 && p.a !== 0 ? p.c / p.a : Number.NaN),
        },
        {
          label: 'B: dx + ey = f',
          color: '#f472b6',
          fn: (x, p) => (p.e === 0 ? Number.NaN : (p.f - p.d * x) / p.e),
          verticalX: (p) => (p.e === 0 && p.d !== 0 ? p.f / p.d : Number.NaN),
        },
      ],
    },
    solve(values) {
      const a = Number(values.a);
      const b = Number(values.b);
      const c = Number(values.c);
      const d = Number(values.d);
      const e = Number(values.e);
      const f = Number(values.f);
      if ([a, b, c, d, e, f].some((n) => Number.isNaN(n))) {
        return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      }
      const det = a * e - b * d;
      if (det === 0) {
        return { result: 'لا يوجد حل فريد (المحدد = 0)', steps: ['D = a×e - b×d = 0', 'الخطان متوازيان أو متطابقان'] };
      }
      const x = (c * e - b * f) / det;
      const y = (a * f - c * d) / det;
      return {
        result: `x = ${fmt(x)}, y = ${fmt(y)}`,
        steps: [
          `D = ${a}×${e} - ${b}×${d} = ${fmt(det)}`,
          `x = (c×e - b×f) / D = (${c}×${e} - ${b}×${f}) / ${fmt(det)} = ${fmt(x)}`,
          `y = (a×f - c×d) / D = (${a}×${f} - ${c}×${d}) / ${fmt(det)} = ${fmt(y)}`,
          `نقطة التقاطع: (${fmt(x)}, ${fmt(y)})`,
        ],
      };
    },
  },
{
    id: 'quadratic-equation',
    branchId: 'algebra',
    name: 'المعادلة التربيعية',
    formula: 'ax^2 + bx + c = 0',
    description: 'تستخدم لحل المسائل التي تتضمن علاقة تربيعية بين المتغير، مثل مسار القذيفة، مساحة الأشكال، والدوال التربيعية.',
    method: 'لحل المعادلة التربيعية باستخدام الثوابت: 1) نحدد a و b و c. 2) نحسب المميز Δ = b² - 4ac. 3) إذا كان Δ < 0، لا توجد حلول حقيقية. 4) إذا كان Δ ≥ 0، نحسب الجذرين: xف = (-b + √Δ) / 2a و x₂ = (-b - √Δ) / 2a. 5) نعوض القيم العددية للحصول على الحل.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 1, b: -5, c: 6 },
        steps: [
          'المعادلة: x^2 - 5x + 6 = 0',
          'المعاملات: a = 1, b = -5, c = 6',
          'Δ = b^2 - 4ac = (-5)^2 - 4×1×6 = 25 - 24 = 1',
          'x1 = (-(-5) + 1) / 2 = 3',
          'x2 = (-(-5) - 1) / 2 = 2',
        ],
      },
    ],
    applicationProblems: [
      {
        question: 'رام يلقي كرة من ارتفاع 1.5 م بسرعة 20 م/ث. متى تكون الكرة على ارتفاع 10 م؟',
        hint: 'اكتب المعادلة: -4.9t² + 20t + 1.5 = 10، ثم بالصيغة القياسية: -4.9t² + 20t - 8.5 = 0.',
        answer: 't ≈ 0.48 ثانية أو t ≈ 3.60 ثانية',
        variables: { a: -4.9, b: 20, c: -8.5 },
        expectedValue: '0.48, 3.60',
      },
    ],
    relatedExperiments: [
      { id: 'projectile', name: 'حركة القذيفة', route: '/physics/mechanics/projectile', context: 'موقع القذيفة الرأسي يتبع معادلة تربيعية بالزمن عند إيجاد وقت الصعود أو الهبوط.' },
    ],
    variables: [
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
      { name: 'c', label: 'c' },
    ],
    graph: {
      label: 'القطع المكافئ y = ax² + bx + c',
      xRange: [-10, 10],
      yRange: [-20, 20],
      params: { a: 1, b: 0, c: 0 },
      fn: (x, p) => p.a * x * x + p.b * x + p.c,
    },
    solve(values) {
      const a = Number(values.a);
      const b = Number(values.b);
      const c = Number(values.c);
      if ([a, b, c].some((n) => Number.isNaN(n))) {
        return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      }
      if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
      const discriminant = b * b - 4 * a * c;
      const steps = [
        `a = ${a}, b = ${b}, c = ${c}`,
        `Δ = b^2 - 4ac = ${fmt(discriminant)}`,
      ];
      if (discriminant < 0) {
        return { result: 'لا يوجد جذور حقيقية', steps: [...steps, 'Δ < 0'] };
      }
      const sqrtD = Math.sqrt(discriminant);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      return {
        result: `x1 = ${fmt(x1)}, x2 = ${fmt(x2)}`,
        steps: [...steps, `x1 = ${fmt(x1)}, x2 = ${fmt(x2)}`],
      };
    },
  },
{
    id: 'factor-quadratic',
    branchId: 'algebra',
    name: 'تحليل التربيعي',
    formula: 'ax^2 + bx + c',
    description: 'تستخدم لتحليل كثيرة الحدود التربيعية إلى جذرين، مما يسهل إيجاد حلول المعادلة وتحليل الدوال.',
    method: 'لتحليل كثيرة الحدود التربيعية: 1) نحدد a و b و c. 2) نحسب المميز Δ = b² - 4ac. 3) نتحقق أن الجذرين rف و r₂ أعداد صحيحة. 4) نكتب كثيرة الحدود على الصورة: a(x - rف)(x - r₂). 5) نعوض القيم العددية للتحقق.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 1, b: -5, c: 6 },
        steps: [
          'كثيرة الحدود: x^2 - 5x + 6',
          'الجذران: 2 و 3',
          'التحليل: (x - 2)(x - 3)',
        ],
      },
    ],
    variables: [
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
      { name: 'c', label: 'c' },
    ],
    solve(values) {
      const a = Number(values.a);
      const b = Number(values.b);
      const c = Number(values.c);
      if ([a, b, c].some((n) => Number.isNaN(n))) {
        return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      }
      if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) return { result: 'لا يمكن التحليل على الأعداد الحقيقية', steps: [] };
      const sqrtD = Math.sqrt(discriminant);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      if (!Number.isInteger(x1) || !Number.isInteger(x2)) {
        return { result: 'لا يمكن التحليل بجذور صحيحة', steps: [] };
      }
      return {
        result: `${a}(x - ${x1})(x - ${x2})`,
        steps: [`الجذران: ${x1} و ${x2}`, `التحليل: ${a}(x - ${x1})(x - ${x2})`],
      };
    },
  },
{
    id: 'system-linear-2x2',
    branchId: 'algebra',
    name: 'نظام معادلتين خطيتين',
    formula: 'a1x + b1y = c1, a2x + b2y = c2',
    description: 'يستخدم لإيجاد قيمتي مجهولين x و y عندما يكون لدينا معادلتان خطيتان.',
    method: 'لحل النظام: 1) نحدد المعاملات. 2) نحسب D = a1*b2 - a2*b1. 3) x = (c1*b2 - c2*b1) / D. 4) y = (a1*c2 - a2*c1) / D.',
    examples: [{ title: 'مثال', values: { a1: 2, b1: 3, c1: 8, a2: 1, b2: -1, c2: 1 }, steps: ['D = -5', 'x = 2.2, y = 1.2'] }],
    variables: [{ name: 'a1', label: 'a1' }, { name: 'b1', label: 'b1' }, { name: 'c1', label: 'c1' }, { name: 'a2', label: 'a2' }, { name: 'b2', label: 'b2' }, { name: 'c2', label: 'c2' }],
    solve(values) {
      const a1 = Number(values.a1), b1 = Number(values.b1), c1 = Number(values.c1);
      const a2 = Number(values.a2), b2 = Number(values.b2), c2 = Number(values.c2);
      if ([a1, b1, c1, a2, b2, c2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const d = a1 * b2 - a2 * b1;
      if (d === 0) return { result: 'المحدد صفر', steps: [] };
      const x = (c1 * b2 - c2 * b1) / d, y = (a1 * c2 - a2 * c1) / d;
      return { result: `x = ${fmt(x)}, y = ${fmt(y)}`, steps: [`D = ${fmt(d)}`, `x = ${fmt(x)}`, `y = ${fmt(y)}`] };
    },
  },
{
    id: 'direct-proportion',
    branchId: 'algebra',
    name: 'التناسب الطردي',
    formula: 'y = kx',
    description: 'يصف علاقة بين متغيرين تتناسبان طردياً: كلما زاد أحدهما زاد الآخر بمعدل ثابت. أمثلة: ثمن السلعة مع عددها، المسافة مع الزمن عند سرعة ثابتة.',
    method: '1) حدد ثابت التناسب k (أو احسبه من قيم معروفة: k = y/x). 2) أدخل قيمة x المطلوبة. 3) اضرب k في x: y = kx.',
    examples: [{ title: 'مثال', values: { k: 5, x: 4 }, steps: ['y = 5 × 4 = 20'] }],
    variables: [{ name: 'k', label: 'k' }, { name: 'x', label: 'x' }],
    solve(values) {
      const k = Number(values.k), x = Number(values.x);
      if ([k, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `y = ${fmt(k * x)}`, steps: [`y = ${k} × ${x}`, `y = ${fmt(k * x)}`] };
    },
  },
{
    id: 'inverse-proportion',
    branchId: 'algebra',
    name: 'التناسب العكسي',
    formula: 'y = k / x',
    description: 'يصف علاقة بين متغيرين تتناسبان عكسياً: حاصل ضربهما ثابت. أمثلة: الوقت اللازم لإنجاز عمل مع عدد العمال، السرعة مع الزمن لمسافة ثابتة.',
    method: '1) حدد الثابت k من قيم معروفة (k = y×x). 2) أدخل قيمة x الجديدة. 3) اقسم k على x: y = k/x. 4) x يجب ألا يكون صفراً.',
    examples: [{ title: 'مثال', values: { k: 20, x: 4 }, steps: ['y = 20 / 4 = 5'] }],
    variables: [{ name: 'k', label: 'k' }, { name: 'x', label: 'x' }],
    solve(values) {
      const k = Number(values.k), x = Number(values.x);
      if ([k, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (x === 0) return { result: 'x لا يمكن أن يكون صفراً', steps: [] };
      return { result: `y = ${fmt(k / x)}`, steps: [`y = ${k} / ${x}`, `y = ${fmt(k / x)}`] };
    },
  }
];
