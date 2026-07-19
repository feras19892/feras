import type { Equation } from '../math-types';
import { fmt, parseNumbers, toRad, toDeg } from '../math-utils';

export const algebraEquations: Equation[] = [
  {
    id: 'linear-equation',
    branchId: 'algebra',
    name: 'المعادلة الخطية',
    formula: 'ax + b = c',
    description: 'تُستخدم لإيجاد قيمة مجهولة واحدة (x) عندما تكون العلاقة بين المتغيرات خطية. تظهر في مسائل السرعة الثابتة، التكلفة الإجمالية، والتوازن البسيط.',
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
    solve(values) {
      const a = Number(values.a);
      const b = Number(values.b);
      const c = Number(values.c);
      if ([a, b, c].some((n) => Number.isNaN(n))) {
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      }
      if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
      const x = (c - b) / a;
      return {
        result: `x = ${fmt(x)}`,
        steps: [`${a}x + ${b} = ${c}`, `${a}x = ${c - b}`, `x = ${c - b} / ${a} = ${fmt(x)}`],
      };
    },
  },
  {
    id: 'linear-system',
    branchId: 'algebra',
    name: 'نظام معادلتين خطيتين',
    formula: 'A: ax + by = c | B: dx + ey = f',
    description: 'يُستخدم لحل معادلتين خطيتين معاً لإيجاد نقطة التقاطع (x, y). يظهر في مسائل التكلفة والدخل، والتوازن الكيميائي، والقوى المتزنة.',
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
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
    description: 'تُستخدم لحل المسائل التي تتضمن علاقة تربيعية بين المتغير، مثل مسار القذيفة، مساحة الأشكال، والدوال التربيعية.',
    method: 'لحل المعادلة التربيعية باستخدام الثوابت: 1) نحدد a و b و c. 2) نحسب المميز Δ = b² - 4ac. 3) إذا كان Δ < 0، لا توجد حلول حقيقية. 4) إذا كان Δ ≥ 0، نحسب الجذرين: x₁ = (-b + √Δ) / 2a و x₂ = (-b - √Δ) / 2a. 5) نعوض القيم العددية للحصول على الحل.',
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
        question: 'رامٍ يلقي كرة من ارتفاع 1.5 م بسرعة 20 م/ث. متى تكون الكرة على ارتفاع 10 م؟',
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
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
    description: 'تُستخدم لتحليل كثيرة الحدود التربيعية إلى جذرين، مما يسهل إيجاد حلول المعادلة وتحليل الدوال.',
    method: 'لتحليل كثيرة الحدود التربيعية: 1) نحدد a و b و c. 2) نحسب المميز Δ = b² - 4ac. 3) نتحقق أن الجذرين r₁ و r₂ أعداد صحيحة. 4) نكتب كثيرة الحدود على الصورة: a(x - r₁)(x - r₂). 5) نعوض القيم العددية للتحقق.',
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
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
    description: 'يُستخدم لإيجاد قيمتي مجهولين x و y عندما يكون لدينا معادلتان خطيتان.',
    method: 'لحل النظام: 1) نحدد المعاملات. 2) نحسب D = a1*b2 - a2*b1. 3) x = (c1*b2 - c2*b1) / D. 4) y = (a1*c2 - a2*c1) / D.',
    examples: [{ title: 'مثال', values: { a1: 2, b1: 3, c1: 8, a2: 1, b2: -1, c2: 1 }, steps: ['D = -5', 'x = 2.2, y = 1.2'] }],
    variables: [{ name: 'a1', label: 'a1' }, { name: 'b1', label: 'b1' }, { name: 'c1', label: 'c1' }, { name: 'a2', label: 'a2' }, { name: 'b2', label: 'b2' }, { name: 'c2', label: 'c2' }],
    solve(values) {
      const a1 = Number(values.a1), b1 = Number(values.b1), c1 = Number(values.c1);
      const a2 = Number(values.a2), b2 = Number(values.b2), c2 = Number(values.c2);
      if ([a1, b1, c1, a2, b2, c2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([k, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([k, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (x === 0) return { result: 'x لا يمكن أن يكون صفراً', steps: [] };
      return { result: `y = ${fmt(k / x)}`, steps: [`y = ${k} / ${x}`, `y = ${fmt(k / x)}`] };
    },
  },
  {
    id: 'absolute-value-equation',
    branchId: 'algebra',
    name: 'معادلة القيمة المطلقة',
    formula: '|ax + b| = c',
    description: 'يُستخدم لحل المعادلات التي تتضمن قيمة مطلقة.',
    method: 'إذا كان c < 0 لا يوجد حل. إذا كان c ≥ 0، فإن ax + b = c أو ax + b = -c.',
    examples: [{ title: 'مثال', values: { a: 2, b: -3, c: 5 }, steps: ['2x - 3 = 5 → x = 4', '2x - 3 = -5 → x = -1'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }, { name: 'c', label: 'c' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b), c = Number(values.c);
      if ([a, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (c < 0) return { result: 'لا يوجد حل', steps: [] };
      if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
      const x1 = (c - b) / a;
      const x2 = (-c - b) / a;
      return { result: `x = ${fmt(x1)} أو x = ${fmt(x2)}`, steps: [`${a}x + ${b} = ${c} → x = ${fmt(x1)}`, `${a}x + ${b} = -${c} → x = ${fmt(x2)}`] };
    },
  },
  {
    id: 'exponential-growth',
    branchId: 'algebra',
    name: 'النمو الأسي',
    formula: 'A = P(1 + r)^t',
    description: 'يُستخدم لحساب النمو أو التضخم أو الفائدة المركبة.',
    method: 'A = P(1 + r)^t، حيث P المبلغ الأولي، r معدل النمو، t الزمن.',
    examples: [{ title: 'مثال', values: { P: 1000, r: 0.05, t: 3 }, steps: ['A = 1000 × 1.05^3 ≈ 1157.625'] }],
    applicationProblems: [
      {
        question: 'أودع شخص 2000 ليرة بفائدة 4% سنوياً. ما المبلغ بعد 5 سنوات؟',
        hint: 'A = P(1 + r)^t.',
        answer: 'A ≈ 2433.31 ليرة',
        variables: { P: 2000, r: 0.04, t: 5 },
        expectedValue: 2433.31,
      },
    ],
    graph: {
      label: 'النمو الأسي A = P(1 + r)^t',
      xRange: [0, 10],
      yRange: [0, 2000],
      params: { P: 1000, r: 0.05 },
      fn: (t, p) => p.P * (1 + p.r) ** t,
    },
    variables: [{ name: 'P', label: 'P' }, { name: 'r', label: 'r' }, { name: 't', label: 't' }],
    solve(values) {
      const P = Number(values.P), r = Number(values.r), t = Number(values.t);
      if ([P, r, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `A = ${fmt(P * (1 + r) ** t)}`, steps: [`A = ${P} × (1 + ${r})^${t}`, `A = ${fmt(P * (1 + r) ** t)}`] };
    },
  },
  {
    id: 'logarithm',
    branchId: 'algebra',
    name: 'اللوغاريتم',
    formula: 'log_a(x) = y',
    description: 'يُستخدم لإيجاد الأس الذي يرفع إليه الأساس a لإعطاء x.',
    method: 'log_a(x) = y يعني a^y = x.',
    examples: [{ title: 'مثال', values: { a: 10, x: 100 }, steps: ['log10(100) = 2'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'x', label: 'x' }],
    solve(values) {
      const a = Number(values.a), x = Number(values.x);
      if ([a, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (a <= 0 || a === 1 || x <= 0) return { result: 'أدخل قيماً صحيحة للأساس والعدد', steps: [] };
      return { result: `log_${a}(${x}) = ${fmt(Math.log(x) / Math.log(a))}`, steps: [`log_${a}(${x}) = ln(${x})/ln(${a})`, `log_${a}(${x}) = ${fmt(Math.log(x) / Math.log(a))}`] };
    },
  },
  {
    id: 'compound-interest',
    branchId: 'algebra',
    name: 'الفائدة المركبة',
    formula: 'A = P(1 + r/n)^(nt)',
    description: 'يحسب المبلغ النهائي عند إضافة الفائدة عدة مرات خلال السنة.',
    method: '1) حدد المبلغ الأولي P. 2) معدل الفائدة السنوي r. 3) عدد المرات n. 4) عدد السنوات t. 5) A = P(1 + r/n)^(nt).',
    examples: [{ title: 'مثال', values: { P: 1000, r: 0.05, n: 4, t: 3 }, steps: ['A ≈ 1161.47'] }],
    applicationProblems: [
      {
        question: 'أودع 5000 ليرة بفائدة 6% مركبة شهرياً لمدة 4 سنوات. ما المبلغ النهائي؟',
        hint: 'P = 5000، r = 0.06، n = 12، t = 4.',
        answer: 'A ≈ 6352.45',
        variables: { P: 5000, r: 0.06, n: 12, t: 4 },
        expectedValue: 6352.45,
      },
    ],
    variables: [{ name: 'P', label: 'P' }, { name: 'r', label: 'r' }, { name: 'n', label: 'n' }, { name: 't', label: 't' }],
    solve(values) {
      const P = Number(values.P), r = Number(values.r), n = Number(values.n), t = Number(values.t);
      if ([P, r, n, t].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = P * (1 + r / n) ** (n * t);
      return { result: `A = ${fmt(result)}`, steps: [`A = ${P} × (1 + ${r}/${n})^(${n}×${t})`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'logarithm-base',
    branchId: 'algebra',
    name: 'اللوغاريتم',
    formula: 'log_b(x) = y',
    description: 'يحسب الأس y الذي يجب رفع العدد b إليه للحصول على x.',
    method: '1) حدد الأساس b (> 0, ≠ 1). 2) حدد x (> 0). 3) y = ln(x) / ln(b).',
    examples: [{ title: 'مثال', values: { b: 2, x: 32 }, steps: ['log₂(32) = 5'] }],
    variables: [{ name: 'b', label: 'b' }, { name: 'x', label: 'x' }],
    solve(values) {
      const b = Number(values.b), x = Number(values.x);
      if ([b, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (b <= 0 || b === 1) return { result: 'b يجب أن يكون أكبر من 0 ولا يساوي 1', steps: [] };
      if (x <= 0) return { result: 'x يجب أن يكون أكبر من 0', steps: [] };
      const result = Math.log(x) / Math.log(b);
      return { result: `log_${b}(${x}) = ${fmt(result)}`, steps: [`log_${b}(${x}) = ln(${x}) / ln(${b})`, `log_${b}(${x}) = ${fmt(result)}`] };
    },
  },
  {
    id: 'simple-interest',
    branchId: 'algebra',
    name: 'الفائدة البسيطة',
    formula: 'I = Prt',
    description: 'تحسب الفائدة المكتسبة على مبلغ أصلي دون إضافة الفائدة إلى الأصل. تُستخدم في الودائع والقروض البسيطة.',
    method: '1) حدد المبلغ الأولي P. 2) حدد معدل الفائدة السنوي r. 3) حدد عدد السنوات t. 4) I = P × r × t.',
    examples: [{ title: 'مثال', values: { P: 1000, r: 0.05, t: 3 }, steps: ['I = 1000 × 0.05 × 3 = 150'] }],
    applicationProblems: [
      {
        question: 'ما الفائدة البسيطة لقرض 5000 بفائدة 8% لمدة 2 سنة؟',
        hint: 'I = P × r × t.',
        answer: 'I = 800',
        variables: { P: 5000, r: 0.08, t: 2 },
        expectedValue: 800,
      },
    ],
    variables: [{ name: 'P', label: 'P' }, { name: 'r', label: 'r' }, { name: 't', label: 't' }],
    solve(values) {
      const P = Number(values.P), r = Number(values.r), t = Number(values.t);
      if ([P, r, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = P * r * t;
      return { result: `I = ${fmt(result)}`, steps: [`I = ${P} × ${r} × ${t}`, `I = ${fmt(result)}`] };
    },
  },
  {
    id: 'arithmetic-mean',
    branchId: 'algebra',
    name: 'المتوسط الحسابي',
    formula: 'AM = (a + b) / 2',
    description: 'يحسب المتوسط الحسابي لعددين، وهو القيمة الوسطية التي تقع بالتساوي بينهما.',
    method: '1) حدد العددين a و b. 2) اجمعهما. 3) اقسم على 2: AM = (a + b)/2.',
    examples: [{ title: 'مثال', values: { a: 4, b: 10 }, steps: ['AM = (4 + 10)/2 = 7'] }],
    applicationProblems: [
      {
        question: 'ما المتوسط الحسابي بين 12 و 20؟',
        hint: 'AM = (12 + 20)/2.',
        answer: '16',
        variables: { a: 12, b: 20 },
        expectedValue: 16,
      },
    ],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (a + b) / 2;
      return { result: `AM = ${fmt(result)}`, steps: [`AM = (${a} + ${b})/2`, `AM = ${fmt(result)}`] };
    },
  },
  {
    id: 'weighted-average',
    branchId: 'algebra',
    name: 'المتوسط المرجح',
    formula: 'WA = Σ(w_i·x_i) / Σw_i',
    description: 'يحسب المتوسط عندما تختلف أهمية القيم بأوزان مختلفة، مثل معدلات الدرجات الدراسية.',
    method: '1) أدخل القيم مفصولة بفواصل. 2) أدخل الأوزان المقابلة. 3) اضرب كل قيمة في وزنها واجمع. 4) اقسم على مجموع الأوزان.',
    examples: [{ title: 'مثال', values: { values: '80,90,70', weights: '2,3,1' }, steps: ['WA = (160+270+70)/6 = 83.33'] }],
    variables: [{ name: 'values', label: 'القيم', type: 'list' }, { name: 'weights', label: 'الأوزان', type: 'list' }],
    solve(values) {
      const xs = parseNumbers(values.values ?? ''), ws = parseNumbers(values.weights ?? '');
      if (xs.length === 0 || xs.length !== ws.length) return { result: 'أدخل قيم وأوزان متطابقة', steps: [] };
      if (ws.some((w) => w <= 0)) return { result: 'الأوزان يجب أن تكون موجبة', steps: [] };
      const num = xs.reduce((s, x, i) => s + x * ws[i], 0);
      const den = ws.reduce((s, w) => s + w, 0);
      const result = num / den;
      return { result: `WA = ${fmt(result)}`, steps: [`WA = (${xs.map((x, i) => `${x}×${ws[i]}`).join(' + ')}) / ${den}`, `WA = ${fmt(result)}`] };
    },
  },
  {
    id: 'percent-change',
    branchId: 'algebra',
    name: 'نسبة التغير',
    formula: 'percent = (new - old) / old × 100%',
    description: 'تحسب نسبة الزيادة أو النقصان بين قيمتين. الناتج الموجب زيادة والسالب نقصان.',
    method: '1) حدد القيمة القديمة old. 2) حدد القيمة الجديدة new. 3) percent = (new - old)/old × 100.',
    examples: [{ title: 'مثال', values: { old: 50, new: 65 }, steps: ['% = (65-50)/50 × 100 = 30%'] }],
    variables: [{ name: 'old', label: 'القديم' }, { name: 'new', label: 'الجديد' }],
    solve(values) {
      const old = Number(values.old), newv = Number(values.new);
      if ([old, newv].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (old === 0) return { result: 'القيمة القديمة لا يمكن أن تكون صفراً', steps: [] };
      const result = ((newv - old) / old) * 100;
      return { result: `${fmt(result)}%`, steps: [`% = (${newv} - ${old}) / ${old} × 100`, `% = ${fmt(result)}%`] };
    },
  },
  {
    id: 'quadratic-roots-sum-product',
    branchId: 'algebra',
    name: 'مجموع وحاصل جذور المعادلة التربيعية',
    formula: 'x1+x2 = -b/a, x1·x2 = c/a',
    description: 'يعطي علاقة فييتا للمعادلة ax² + bx + c = 0: مجموع الجذور = -b/a وحاصل ضربهما = c/a.',
    method: '1) حدد معاملات a و b و c. 2) المجموع = -b/a. 3) الحاصل = c/a.',
    examples: [{ title: 'مثال', values: { a: 1, b: -5, c: 6 }, steps: ['x1+x2 = 5, x1·x2 = 6'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }, { name: 'c', label: 'c' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b), c = Number(values.c);
      if ([a, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
      return { result: `x1+x2 = ${fmt(-b/a)}, x1·x2 = ${fmt(c/a)}`, steps: [`x1+x2 = -${b}/${a} = ${fmt(-b/a)}`, `x1·x2 = ${c}/${a} = ${fmt(c/a)}`] };
    },
  },
  {
    id: 'harmonic-mean',
    branchId: 'algebra',
    name: 'المتوسط التوافقي',
    formula: 'HM = n / Σ(1/x_i)',
    description: 'يحسب المتوسط المناسب للمعدلات والنسب. مقلوب متوسط المقلوبات.',
    method: '1) أدخل الأرقام الموجبة مفصولة بفواصل. 2) احسب مجموع مقلوباتها. 3) اقسم عدد القيم على المجموع.',
    examples: [{ title: 'مثال', values: { numbers: '2,4,8' }, steps: ['HM = 3 / (1/2+1/4+1/8) = 3.43'] }],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0 || numbers.some((n) => n <= 0)) return { result: 'أدخل أرقاماً موجبة', steps: [] };
      const sumInv = numbers.reduce((s, n) => s + 1 / n, 0);
      const result = numbers.length / sumInv;
      return { result: `HM = ${fmt(result)}`, steps: [`HM = ${numbers.length} / (${numbers.map((n) => `1/${n}`).join(' + ')})`, `HM = ${fmt(result)}`] };
    },
  },
  {
    id: 'slope',
    branchId: 'algebra',
    name: 'ميل المستقيم',
    formula: 'm = (y2 - y1) / (x2 - x1)',
    description: 'يحسب ميل المستقيم المار بنقطتين. يصف معدل التغير والانحدار.',
    method: '1) حدد النقطتين (x1,y1) و (x2,y2). 2) m = (y2-y1)/(x2-x1).',
    examples: [{ title: 'مثال', values: { x1: 1, y1: 2, x2: 4, y2: 8 }, steps: ['m = (8-2)/(4-1) = 2'] }],
    applicationProblems: [
      {
        question: 'ما ميل المستقيم المار بالنقطتين (2,3) و (5,9)؟',
        hint: 'm = (9-3)/(5-2).',
        answer: 'm = 2',
        variables: { x1: 2, y1: 3, x2: 5, y2: 9 },
        expectedValue: 2,
      },
    ],
    variables: [{ name: 'x1', label: 'x1' }, { name: 'y1', label: 'y1' }, { name: 'x2', label: 'x2' }, { name: 'y2', label: 'y2' }],
    solve(values) {
      const x1 = Number(values.x1), y1 = Number(values.y1), x2 = Number(values.x2), y2 = Number(values.y2);
      if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (x2 === x1) return { result: 'خط رأسي (ميل غير محدد)', steps: [] };
      const result = (y2 - y1) / (x2 - x1);
      return { result: `m = ${fmt(result)}`, steps: [`m = (${y2} - ${y1}) / (${x2} - ${x1})`, `m = ${fmt(result)}`] };
    },
  }
];
