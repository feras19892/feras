import type { Equation } from './math-types';
import { fmt, parseNumbers, toRad, toDeg } from './math-utils';

export const equations: Equation[] = [
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
        if ([a, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
        const x = (c - b) / a;
        return { result: `x = ${fmt(x)}`, steps: [`${a}x + ${b} = ${c}`, `${a}x = ${c - b}`, `x = ${c - b} / ${a} = ${fmt(x)}`] };
      }
      if (target === 'a') {
        const x = Number(values.x);
        if ([x, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (x === 0) return { result: 'x يجب ألا يكون صفراً', steps: [] };
        const aVal = (c - b) / x;
        return { result: `a = ${fmt(aVal)}`, steps: [`${a}x + ${b} = ${c}`, `ax = ${c - b}`, `a = (${c} - ${b}) / ${x} = ${fmt(aVal)}`] };
      }
      if (target === 'b') {
        const x = Number(values.x);
        if ([a, x, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        const bVal = c - a * x;
        return { result: `b = ${fmt(bVal)}`, steps: [`ax + b = ${c}`, `b = ${c} - ${a}×${x} = ${fmt(bVal)}`] };
      }
      if (target === 'c') {
        const x = Number(values.x);
        if ([a, b, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
    id: 'pythagorean-theorem',
    branchId: 'geometry',
    name: 'نظرية فيثاغورس',
    formula: 'a^2 + b^2 = c^2',
    description: 'تُستخدم في المثلثات القائمة لإيجاد طول ضلع مجهول. تطبق في حساب المسافات، تحليل المتجهات، وحركة القذائف.',
    method: 'لحساب الضلع المجهول في مثلث قائم: 1) نحدد الضلعين المعروفين والوتر c. 2) إذا كان c مجهولاً: c = √(a² + b²). 3) إذا كان a مجهولاً: a = √(c² - b²). 4) إذا كان b مجهولاً: b = √(c² - a²). 5) نعوض القيم العددية ونحسب الناتج.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 3, b: 4 },
        steps: [
          'a = 3, b = 4',
          'c^2 = 3^2 + 4^2 = 9 + 16 = 25',
          'c = √25 = 5',
        ],
      },
    ],
    applicationProblems: [
      {
        question: 'سلم طوله 5 م يستند على حائط. إذا كانت قاعدة السلم على بعد 3 م من الحائط، ما ارتفاع أعلى السلم؟',
        hint: 'استخدم c² = a² + b² حيث c = 5 و a = 3.',
        answer: 'b = 4 م',
        variables: { a: 3, b: 4 },
        expectedValue: 4,
      },
    ],
    relatedExperiments: [
      { id: 'projectile', name: 'حركة القذيفة', route: '/physics/mechanics/projectile', context: 'تستخدم لحساب السرعة الناتجة أو الإزاحة الكلية من مركباتها الأفقية والرأسية.' },
    ],
    variables: [
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
      { name: 'c', label: 'c (الوتر)' },
    ],
    defaultSolveFor: 'c',
    solve(values, solveFor) {
      const target = solveFor || 'c';
      if (target === 'c') {
        const a = Number(values.a);
        const b = Number(values.b);
        if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        const c = Math.sqrt(a * a + b * b);
        return { result: `c = ${fmt(c)}`, steps: [`c^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}`, `c = √${a * a + b * b} = ${fmt(c)}`] };
      }
      if (target === 'a') {
        const b = Number(values.b);
        const c = Number(values.c);
        if ([b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (c * c - b * b < 0) return { result: 'لا يمكن أن يكون الوتر أقصر من الضلع الآخر', steps: [] };
        const a = Math.sqrt(c * c - b * b);
        return { result: `a = ${fmt(a)}`, steps: [`a^2 = c^2 - b^2 = ${c * c} - ${b * b} = ${c * c - b * b}`, `a = √${c * c - b * b} = ${fmt(a)}`] };
      }
      if (target === 'b') {
        const a = Number(values.a);
        const c = Number(values.c);
        if ([a, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (c * c - a * a < 0) return { result: 'لا يمكن أن يكون الوتر أقصر من الضلع الآخر', steps: [] };
        const b = Math.sqrt(c * c - a * a);
        return { result: `b = ${fmt(b)}`, steps: [`b^2 = c^2 - a^2 = ${c * c} - ${a * a} = ${c * c - a * a}`, `b = √${c * c - a * a} = ${fmt(b)}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'area-circle',
    branchId: 'geometry',
    name: 'مساحة الدائرة',
    formula: 'A = πr^2',
    description: 'تُستخدم لحساب مساحة الدائرة عند معرفة نصف القطر. تطبق في حسابات المساحات والأحجام الدائرية.',
    method: 'لحساب مساحة الدائرة: 1) نحدد نصف القطر r. 2) نعوض في القانون: A = πr². 3) نحسب الناتج باستخدام π ≈ 3.14159. 4) إذا أردنا دقة أعلى نستخدم قيمة π الأكثر دقة.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { r: 5 },
        steps: [
          'r = 5',
          'A = π × 5^2 = 25π',
          'A ≈ 78.540',
        ],
      },
    ],
    applicationProblems: [
      {
        question: 'قطعة دائرية من القماش نصف قطرها 7 سم. ما مساحتها؟',
        hint: 'A = π × r².',
        answer: 'A ≈ 153.94 سم²',
        variables: { r: 7 },
        expectedValue: 153.94,
      },
    ],
    variables: [
      { name: 'r', label: 'r' },
      { name: 'A', label: 'A (المساحة)' },
    ],
    defaultSolveFor: 'A',
    solve(values, solveFor) {
      const target = solveFor || 'A';
      if (target === 'A') {
        const r = Number(values.r);
        if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
        const area = Math.PI * r * r;
        return { result: `A = ${fmt(area)}`, steps: [`A = π × ${r}^2`, `A = ${fmt(area)}`] };
      }
      if (target === 'r') {
        const A = Number(values.A);
        if (Number.isNaN(A) || A < 0) return { result: 'أدخل مساحة صحيحة (موجبة)', steps: [] };
        const r = Math.sqrt(A / Math.PI);
        return { result: `r = ${fmt(r)}`, steps: [`r = √(A / π) = √(${A} / π)`, `r = ${fmt(r)}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'sine-rule',
    branchId: 'trigonometry',
    name: 'قانون الجيب',
    formula: 'a / sin(A) = b / sin(B) = c / sin(C)',
    description: 'تُستخدم في المثلثات غير القائمة لإيجاد ضلع أو زاوية مجهولة. تطبق في الموجات والاهتزازات.',
    method: 'لاستخدام قانون الجيب: 1) نحدد الضلع a والزاوية A المقابلة له. 2) نحدد الضلع أو الزاوية المجهولة. 3) نكتب النسبة: a / sin(A) = b / sin(B). 4) نعوض القيم المعروفة ونحل للقيمة المجهولة. 5) مثال: b = a × sin(B) / sin(A).',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 5, A: 30, B: 45 },
        steps: [
          'a = 5, A = 30°, B = 45°',
          'b = a × sin(B) / sin(A) = 5 × sin(45°) / sin(30°)',
          'b = 5 × 0.7071 / 0.5 ≈ 7.071',
        ],
      },
    ],
    variables: [
      { name: 'a', label: 'a' },
      { name: 'A', label: 'A (درجات)' },
      { name: 'B', label: 'B (درجات)' },
    ],
    solve(values) {
      const a = Number(values.a);
      const A = Number(values.A);
      const B = Number(values.B);
      if ([a, A, B].some((n) => Number.isNaN(n))) {
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      }
      const b = (a * Math.sin(toRad(B))) / Math.sin(toRad(A));
      return {
        result: `b = ${fmt(b)}`,
        steps: [
          `b = ${a} × sin(${B}°) / sin(${A}°)`,
          `b = ${fmt(b)}`,
        ],
      };
    },
  },
  {
    id: 'cosine-rule',
    branchId: 'trigonometry',
    name: 'قانون جيب التمام',
    formula: 'c^2 = a^2 + b^2 - 2ab cos(C)',
    description: 'تُستخدم في المثلثات غير القائمة لإيجاد ضلع ثالث عند معرفة ضلعين والزاوية بينهما. تطبق في حسابات المتجهات والقوى.',
    method: 'لاستخدام قانون جيب التمام: 1) نحدد طولي الضلعين a و b والزاوية C بينهما. 2) نحسب: c² = a² + b² - 2ab cos(C). 3) نأخذ الجذر التربيعي: c = √(a² + b² - 2ab cos(C)). 4) نتأكد من أن الزاوية C بالدرجات أو نحولها للراديان حسب الحاسبة.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 3, b: 4, C: 60 },
        steps: [
          'a = 3, b = 4, C = 60°',
          'c^2 = 3^2 + 4^2 - 2×3×4×cos(60°) = 9 + 16 - 12 = 13',
          'c = √13 ≈ 3.606',
        ],
      },
    ],
    variables: [
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
      { name: 'C', label: 'C (درجات)' },
    ],
    solve(values) {
      const a = Number(values.a);
      const b = Number(values.b);
      const C = Number(values.C);
      if ([a, b, C].some((n) => Number.isNaN(n))) {
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      }
      const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(toRad(C)));
      return {
        result: `c = ${fmt(c)}`,
        steps: [
          `c^2 = ${a}^2 + ${b}^2 - 2×${a}×${b}×cos(${C}°)`,
          `c = ${fmt(c)}`,
        ],
      };
    },
  },
  {
    id: 'derivative-power-rule',
    branchId: 'calculus',
    name: 'قاعدة القوة',
    formula: 'd/dx(x^n) = n x^(n-1)',
    description: 'تُستخدم لإيجاد مشتقة الدوال الأسية بسرعة. أساسية في حساب التغيرات والميل.',
    method: 'لإيجاد مشتقة الدالة الأسية: 1) نحدد الأس n. 2) نضرب المعامل في n. 3) نطرح 1 من الأس. 4) النتيجة: d/dx(xⁿ) = n xⁿ⁻¹. 5) مثال: d/dx(x³) = 3x².',
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
    description: 'تُستخدم لإيجاد ميل منحنى كثيرة الحدود عند أي نقطة. تطبق في تحليل الحركة والتغيرات اللحظية.',
    method: 'لإيجاد مشتقة كثيرة الحدود: 1) نحدد كل حد: a xⁿ و b xᵐ. 2) نشتق كل حد بقاعدة القوة: d/dx(a xⁿ) = a n xⁿ⁻¹. 3) نجمع النتائج: المشتقة = a n xⁿ⁻¹ + b m xᵐ⁻¹. 4) نعوض القيم العددية للمعاملات والأسس.',
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
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
    id: 'mean-median-mode',
    branchId: 'statistics',
    name: 'المتوسط والوسيط والمنوال',
    formula: 'mean = Σx / N',
    description: 'تُستخدم لتحليل مجموعة بيانات وإيجاد القيمة النموذجية. تطبق في الإحصاء والاحتمالات.',
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
      if (numbers.length === 0) return { result: 'أدخل أرقاماً', steps: [] };
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
    description: 'تُستخدم لقياس مدى تشتت البيانات حول المتوسط. تطبق في تقييم الجودة والقياسات العلمية.',
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
      if (numbers.length === 0) return { result: 'أدخل أرقاماً', steps: [] };
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
    id: 'area-rectangle',
    branchId: 'geometry',
    name: 'مساحة المستطيل',
    formula: 'A = l × w',
    description: 'تُستخدم لحساب مساحة سطح المستطيل، أي المساحة المحصورة بين أضلاعه الأربعة. تُستخدم في تصميم الغرف، الحدائق، والألواح.',
    method: '1) قِس الطول l (الضلع الأطول). 2) قِس العرض w (الضلع الأقصر). 3) اضرب الطول في العرض: A = l × w. 4) الوحدة الناتجة هي وحدة طول تربيعية (مثلاً م²).',
    examples: [{ title: 'مثال', values: { l: 8, w: 5 }, steps: ['A = 8 × 5 = 40'] }],
    applicationProblems: [
      {
        question: 'حديقة مستطيلة طولها 12 م وعرضها 7 م. ما مساحتها؟',
        hint: 'A = الطول × العرض.',
        answer: 'A = 84 م²',
        variables: { l: 12, w: 7 },
        expectedValue: 84,
      },
    ],
    variables: [{ name: 'l', label: 'الطول' }, { name: 'w', label: 'العرض' }],
    solve(values) {
      const l = Number(values.l), w = Number(values.w);
      if ([l, w].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `A = ${fmt(l * w)}`, steps: [`A = ${l} × ${w}`, `A = ${fmt(l * w)}`] };
    },
  },
  {
    id: 'area-triangle',
    branchId: 'geometry',
    name: 'مساحة المثلث',
    formula: 'A = 0.5 × b × h',
    description: 'تحسب مساحة أي مثلث باستخدام طول قاعدته والارتفاع العمودي من رأس المثلث إلى تلك القاعدة. تُستخدم في المساحات، الرسومات الهندسية، والهندسة المدنية.',
    method: '1) حدد طول القاعدة b. 2) حدد الارتفاع h العمودي على تلك القاعدة. 3) اضرب نصف القاعدة في الارتفاع: A = 0.5 × b × h.',
    examples: [{ title: 'مثال', values: { b: 6, h: 4 }, steps: ['A = 0.5 × 6 × 4 = 12'] }],
    applicationProblems: [
      {
        question: 'مثلث قاعدته 10 سم وارتفاعه 6 سم. ما مساحته؟',
        hint: 'A = 0.5 × القاعدة × الارتفاع.',
        answer: 'A = 30 سم²',
        variables: { b: 10, h: 6 },
        expectedValue: 30,
      },
    ],
    variables: [{ name: 'b', label: 'القاعدة' }, { name: 'h', label: 'الارتفاع' }],
    solve(values) {
      const b = Number(values.b), h = Number(values.h);
      if ([b, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `A = ${fmt(0.5 * b * h)}`, steps: [`A = 0.5 × ${b} × ${h}`, `A = ${fmt(0.5 * b * h)}`] };
    },
  },
  {
    id: 'circumference-circle',
    branchId: 'geometry',
    name: 'محيط الدائرة',
    formula: 'C = 2πr',
    description: 'يحسب طول المحيط (الدائرة) الخارجية للدائرة. يُستخدم في حسابات العجلات، الأنابيب، والأشكال الدائرية.',
    method: '1) أوجد نصف قطر الدائرة r. 2) اضرب نصف القطر في 2π. 3) C = 2πr. 4) الناتج بطول الدائرة الكامل.',
    examples: [{ title: 'مثال', values: { r: 5 }, steps: ['C ≈ 31.416'] }],
    applicationProblems: [
      {
        question: 'عجلة دراجة نصف قطرها 14 بوصة. ما محيطها؟',
        hint: 'C = 2πr.',
        answer: 'C ≈ 87.96 بوصة',
        variables: { r: 14 },
        expectedValue: 87.96,
      },
    ],
    variables: [{ name: 'r', label: 'r' }],
    solve(values) {
      const r = Number(values.r);
      if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `C = ${fmt(2 * Math.PI * r)}`, steps: [`C = 2π × ${r}`, `C = ${fmt(2 * Math.PI * r)}`] };
    },
  },
  {
    id: 'volume-sphere',
    branchId: 'geometry',
    name: 'حجم الكرة',
    formula: 'V = (4/3)πr^3',
    description: 'يحجم حجم الكرة المجوفة الصلبة. يُستخدم في حسابات الكرات، الفقاعات، والأجرام السماوية تقريباً.',
    method: '1) أوجد نصف قطر الكرة r. 2) ارفع r للأس 3. 3) اضرب في (4/3)π. 4) V = (4/3)πr³.',
    examples: [{ title: 'مثال', values: { r: 3 }, steps: ['V ≈ 113.097'] }],
    applicationProblems: [
      {
        question: 'كرة مطاطية نصف قطرها 2 سم. ما حجمها؟',
        hint: 'V = (4/3) × π × r³.',
        answer: 'V ≈ 33.51 سم³',
        variables: { r: 2 },
        expectedValue: 33.51,
      },
    ],
    constants: [{ label: 'π', value: '3.14159', description: 'ثابت Pi' }],
    variables: [{ name: 'r', label: 'r' }],
    solve(values) {
      const r = Number(values.r);
      if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `V = ${fmt((4 / 3) * Math.PI * r ** 3)}`, steps: [`V = (4/3)π × ${r}^3`, `V = ${fmt((4 / 3) * Math.PI * r ** 3)}`] };
    },
  },
  {
    id: 'volume-cylinder',
    branchId: 'geometry',
    name: 'حجم الأسطوانة',
    formula: 'V = πr^2 h',
    description: 'يحسب حجم الأسطوانة الدائرية القائمة، مثل الأنابيب، العلب، والأعمدة.',
    method: '1) أوجد نصف قطر القاعدة r. 2) أوجد ارتفاع الأسطوانة h. 3) احسب مساحة القاعدة πr² ثم اضربها في h. 4) V = πr²h.',
    examples: [{ title: 'مثال', values: { r: 2, h: 5 }, steps: ['V ≈ 62.832'] }],
    applicationProblems: [
      {
        question: 'علبة أسطوانية نصف قطرها 3 سم وارتفاعها 4 سم. ما حجمها؟',
        hint: 'V = π × r² × h.',
        answer: 'V ≈ 113.1 سم³',
        variables: { r: 3, h: 4 },
        expectedValue: 113.1,
      },
    ],
    variables: [{ name: 'r', label: 'r' }, { name: 'h', label: 'h' }],
    solve(values) {
      const r = Number(values.r), h = Number(values.h);
      if ([r, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `V = ${fmt(Math.PI * r * r * h)}`, steps: [`V = π × ${r}^2 × ${h}`, `V = ${fmt(Math.PI * r * r * h)}`] };
    },
  },
  {
    id: 'tangent-angle',
    branchId: 'trigonometry',
    name: 'ظل الزاوية',
    formula: 'tan(θ) = opposite / adjacent',
    description: 'نسبة المثلثات ظل الزاوية تساوي طول الضلع المقابل مقسوماً على طول الضلع المجاور في المثلث القائم. تُستخدم لإيجاد زاوية أو ضلع.',
    method: '1) حدد طول الضلع المقابل للزاوية. 2) حدد طول الضلع المجاور (غير الوتر). 3) tan(θ) = مقابل/مجاور. 4) لإيجاد الزاوية: θ = arctan(المقابل/المجاور).',
    examples: [{ title: 'مثال', values: { opposite: 3, adjacent: 4 }, steps: ['θ ≈ 36.87°'] }],
    graph: {
      label: 'منحنى الظل y = tan(x)',
      xRange: [-180, 180],
      yRange: [-5, 5],
      params: {},
      fn: (x) => Math.tan(toRad(x)),
    },
    variables: [{ name: 'opposite', label: 'المقابل' }, { name: 'adjacent', label: 'المجاور' }],
    solve(values) {
      const o = Number(values.opposite), a = Number(values.adjacent);
      if ([o, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (a === 0) return { result: 'المجاور لا يمكن أن يكون صفراً', steps: [] };
      const theta = Math.atan(o / a) * 180 / Math.PI;
      return { result: `θ = ${fmt(theta)}°`, steps: [`tan(θ) = ${o}/${a}`, `θ = ${fmt(theta)}°`] };
    },
  },
  {
    id: 'degrees-to-radians',
    branchId: 'trigonometry',
    name: 'تحويل الدرجات للراديان',
    formula: 'rad = deg × π / 180',
    description: 'يحول قياس الزاوية من الدرجات إلى الراديان. الراديان هو الوحدة الطبيعية للزوايا في التفاضل والتكامل والفيزياء.',
    method: '1) حدد قياس الزاوية بالدرجات deg. 2) اضربها في π. 3) اقسم على 180: rad = deg × π / 180.',
    examples: [{ title: 'مثال', values: { deg: 180 }, steps: ['rad = π'] }],
    variables: [{ name: 'deg', label: 'درجات' }],
    solve(values) {
      const deg = Number(values.deg);
      if (Number.isNaN(deg)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `rad = ${fmt((deg * Math.PI) / 180)}`, steps: [`rad = ${deg} × π / 180`, `rad = ${fmt((deg * Math.PI) / 180)}`] };
    },
  },
  {
    id: 'radians-to-degrees',
    branchId: 'trigonometry',
    name: 'تحويل الراديان للدرجات',
    formula: 'deg = rad × 180 / π',
    description: 'يحول قياس الزاوية من الراديان إلى الدرجات. مفيد عندما نريد مقارنة الزوايا أو عرضها بالصيغة المألوفة.',
    method: '1) حدد قياس الزاوية بالراديان rad. 2) اضرب في 180. 3) اقسم على π: deg = rad × 180 / π.',
    examples: [{ title: 'مثال', values: { rad: Math.PI / 2 }, steps: ['deg = 90°'] }],
    variables: [{ name: 'rad', label: 'راديان' }],
    solve(values) {
      const rad = Number(values.rad);
      if (Number.isNaN(rad)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `deg = ${fmt(rad * 180 / Math.PI)}°`, steps: [`deg = ${rad} × 180 / π`, `deg = ${fmt(rad * 180 / Math.PI)}°`] };
    },
  },
  {
    id: 'sine-angle',
    branchId: 'trigonometry',
    name: 'جيب الزاوية',
    formula: 'sin(θ) = opposite / hypotenuse',
    description: 'نسبة جيب الزاوية تساوي طول الضلع المقابل مقسوماً على الوتر في المثلث القائم. أساسية في حل المثلثات والموجات.',
    method: '1) حدد الضلع المقابل للزاوية. 2) حدد الوتر (الضلع الأطول في المثلث القائم). 3) sin(θ) = مقابل/وتر. 4) يمكن إعادة الترتيب لإيجاد أي ضلع.',
    examples: [{ title: 'مثال', values: { angle: 30 }, steps: ['sin(30°) = 0.5'] }],
    graph: {
      label: 'منحنى الجيب y = sin(x)',
      xRange: [-360, 360],
      yRange: [-1.5, 1.5],
      params: {},
      fn: (x) => Math.sin(toRad(x)),
    },
    variables: [{ name: 'angle', label: 'θ' }],
    solve(values) {
      const angle = Number(values.angle);
      if (Number.isNaN(angle)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `sin(${angle}°) = ${fmt(Math.sin(toRad(angle)))}`, steps: [`sin(${angle}°) = ${fmt(Math.sin(toRad(angle)))}`] };
    },
  },
  {
    id: 'cosine-angle',
    branchId: 'trigonometry',
    name: 'جيب التمام',
    formula: 'cos(θ) = adjacent / hypotenuse',
    description: 'نسبة جيب التمام تساوي طول الضلع المجاور مقسوماً على الوتر في المثلث القائم. تُستخدم مع الجيب والظل لحل المثلثات الكاملة.',
    method: '1) حدد الضلع المجاور للزاوية. 2) حدد الوتر. 3) cos(θ) = مجاور/وتر. 4) القيمة دائماً بين -1 و 1.',
    examples: [{ title: 'مثال', values: { angle: 60 }, steps: ['cos(60°) = 0.5'] }],
    graph: {
      label: 'منحنى جيب التمام y = cos(x)',
      xRange: [-360, 360],
      yRange: [-1.5, 1.5],
      params: {},
      fn: (x) => Math.cos(toRad(x)),
    },
    variables: [{ name: 'angle', label: 'θ' }],
    solve(values) {
      const angle = Number(values.angle);
      if (Number.isNaN(angle)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `cos(${angle}°) = ${fmt(Math.cos(toRad(angle)))}`, steps: [`cos(${angle}°) = ${fmt(Math.cos(toRad(angle)))}`] };
    },
  },
  {
    id: 'integral-power-rule',
    branchId: 'calculus',
    name: 'تكامل القوة',
    formula: '∫ x^n dx = x^(n+1) / (n+1) + C',
    description: 'يُستخدم لإيجاد تكامل الدوال الأسية من الشكل x^n. قاعدة أساسية في التفاضل والتكامل.',
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
      if ([n, a, b].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (n === -1) return { result: 'n لا يمكن أن تكون -1', steps: [] };
      const result = (b ** (n + 1) - a ** (n + 1)) / (n + 1);
      return { result: `I = ${fmt(result)}`, steps: [`I = (${b}^${n + 1} - ${a}^${n + 1}) / ${n + 1}`, `I = ${fmt(result)}`] };
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
      if ([f, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (t === 0) return { result: 'الكلي لا يمكن أن يكون صفراً', steps: [] };
      return { result: `P = ${fmt(f / t)}`, steps: [`P = ${f}/${t}`, `P = ${fmt(f / t)}`] };
    },
  },
  {
    id: 'combination',
    branchId: 'statistics',
    name: 'التوافيق',
    formula: 'C(n, k) = n! / (k!(n-k)!)',
    description: 'تحسب عدد الطرق لاختيار k عناصر من مجموعة n عنصراً دون اعتبار الترتيب. تُستخدم في اليانصيب، اختيار اللجان، والاحتمالات.',
    method: '1) حدد العدد الكلي n. 2) حدد عدد العناصر المختارة k. 3) احسب المضارب: n! و k! و (n-k)!. 4) C(n,k) = n! / (k! × (n-k)!).',
    examples: [{ title: 'مثال', values: { n: 5, k: 2 }, steps: ['C(5,2) = 10'] }],
    variables: [{ name: 'n', label: 'n' }, { name: 'k', label: 'k' }],
    solve(values) {
      const n = Number(values.n), k = Number(values.k);
      if ([n, k].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (k < 0 || k > n) return { result: 'k يجب أن يكون بين 0 و n', steps: [] };
      const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
      const c = fact(n) / (fact(k) * fact(n - k));
      return { result: `C(${n}, ${k}) = ${fmt(c)}`, steps: [`C(${n}, ${k}) = ${n}!/(${k}!×${n - k}!)`, `C(${n}, ${k}) = ${fmt(c)}`] };
    },
  },
  {
    id: 'velocity-final',
    branchId: 'mechanics',
    name: 'السرعة النهائية',
    formula: 'v = v0 + at',
    description: 'يحسب السرعة النهائية لجسم متحرك بعجلة ثابتة عندما نعرف سرعته الابتدائية والزمن المنقضي.',
    method: '1) حدد السرعة الابتدائية v0. 2) حدد التسارع a (يمكن أن يكون سالباً للتباطؤ). 3) حدد الزمن t. 4) اضرب التسارع في الزمن ثم أضف السرعة الابتدائية: v = v0 + a×t.',
    examples: [{ title: 'مثال', values: { v0: 0, a: 2, t: 5 }, steps: ['v = 10'] }],
    relatedExperiments: [{ id: 'freefall', name: 'السقوط الحر', route: '/physics/mechanics/freefall', context: 'السرعة النهائية تزداد خطياً مع الزمن.' }],
    graph: {
      label: 'السرعة مع الزمن: v = v0 + at',
      xRange: [0, 10],
      yRange: [-20, 20],
      params: { v0: 0, a: 2 },
      fn: (t, p) => p.v0 + p.a * t,
    },
    variables: [{ name: 'v', label: 'v' }, { name: 'v0', label: 'v0' }, { name: 'a', label: 'a' }, { name: 't', label: 't' }],
    defaultSolveFor: 'v',
    solve(values, solveFor) {
      const target = solveFor || 'v';
      if (target === 'v') {
        const v0 = Number(values.v0), a = Number(values.a), t = Number(values.t);
        if ([v0, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        return { result: `v = ${fmt(v0 + a * t)}`, steps: [`v = ${v0} + ${a}×${t}`, `v = ${fmt(v0 + a * t)}`] };
      }
      if (target === 'v0') {
        const v = Number(values.v), a = Number(values.a), t = Number(values.t);
        if ([v, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        return { result: `v0 = ${fmt(v - a * t)}`, steps: [`v0 = v - a×t = ${v} - ${a}×${t}`, `v0 = ${fmt(v - a * t)}`] };
      }
      if (target === 'a') {
        const v = Number(values.v), v0 = Number(values.v0), t = Number(values.t);
        if ([v, v0, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (t === 0) return { result: 't يجب ألا يكون صفراً', steps: [] };
        return { result: `a = ${fmt((v - v0) / t)}`, steps: [`a = (v - v0) / t = (${v} - ${v0}) / ${t}`, `a = ${fmt((v - v0) / t)}`] };
      }
      if (target === 't') {
        const v = Number(values.v), v0 = Number(values.v0), a = Number(values.a);
        if ([v, v0, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
        return { result: `t = ${fmt((v - v0) / a)}`, steps: [`t = (v - v0) / a = (${v} - ${v0}) / ${a}`, `t = ${fmt((v - v0) / a)}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'displacement',
    branchId: 'mechanics',
    name: 'الإزاحة',
    formula: 's = v0t + 0.5at^2',
    description: 'يُستخدم لحساب إزاحة الجسم عندما يتحرك بعجلة ثابتة.',
    method: 's = v0t + 0.5at².',
    examples: [{ title: 'مثال', values: { v0: 0, a: 2, t: 5 }, steps: ['s = 25'] }],
    relatedExperiments: [{ id: 'freefall', name: 'السقوط الحر', route: '/physics/mechanics/freefall', context: 'الإزاحة الرأسية للجسم الساقط.' }],
    graph: {
      label: 'الإزاحة مع الزمن: s = v0t + 0.5at²',
      xRange: [0, 10],
      yRange: [-20, 20],
      params: { v0: 0, a: 2 },
      fn: (t, p) => p.v0 * t + 0.5 * p.a * t * t,
    },
    variables: [{ name: 'v0', label: 'v0' }, { name: 'a', label: 'a' }, { name: 't', label: 't' }],
    solve(values) {
      const v0 = Number(values.v0), a = Number(values.a), t = Number(values.t);
      if ([v0, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `s = ${fmt(v0 * t + 0.5 * a * t * t)}`, steps: [`s = ${v0}×${t} + 0.5×${a}×${t}²`, `s = ${fmt(v0 * t + 0.5 * a * t * t)}`] };
    },
  },
  {
    id: 'kinetic-energy',
    branchId: 'mechanics',
    name: 'الطاقة الحركية',
    formula: 'KE = 0.5mv^2',
    description: 'تحسب الطاقة المختزنة في الجسم بسبب حركته. تزداد بشكل كبير مع السرعة لأنها تتناسب مع مربع السرعة.',
    method: '1) حدد كتلة الجسم m. 2) حدد سرعة الجسم v. 3) ارفع السرعة للأس 2. 4) اضرب في 0.5 × m: KE = 0.5 × m × v².',
    examples: [{ title: 'مثال', values: { m: 2, v: 10 }, steps: ['KE = 100'] }],
    applicationProblems: [
      {
        question: 'كرة كتلتها 5 كغ تتحرك بسرعة 6 م/ث. ما طاقتها الحركية؟',
        hint: 'KE = 0.5 × m × v².',
        answer: 'KE = 90 J',
        variables: { m: 5, v: 6 },
        expectedValue: 90,
      },
    ],
    relatedExperiments: [{ id: 'collision', name: 'التصادم 1D', route: '/physics/mechanics/collision', context: 'الطاقة الحركية تتغير في التصادم.' }],
    graph: {
      label: 'الطاقة الحركية مع السرعة: KE = 0.5mv²',
      xRange: [0, 10],
      yRange: [0, 100],
      params: { m: 2 },
      fn: (v, p) => 0.5 * p.m * v * v,
    },
    variables: [{ name: 'KE', label: 'KE' }, { name: 'm', label: 'm' }, { name: 'v', label: 'v' }],
    defaultSolveFor: 'KE',
    solve(values, solveFor) {
      const target = solveFor || 'KE';
      if (target === 'KE') {
        const m = Number(values.m), v = Number(values.v);
        if ([m, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        return { result: `KE = ${fmt(0.5 * m * v * v)}`, steps: [`KE = 0.5×${m}×${v}²`, `KE = ${fmt(0.5 * m * v * v)}`] };
      }
      if (target === 'm') {
        const KE = Number(values.KE), v = Number(values.v);
        if ([KE, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (v === 0) return { result: 'v يجب ألا يكون صفراً', steps: [] };
        const m = (2 * KE) / (v * v);
        return { result: `m = ${fmt(m)}`, steps: [`m = 2×KE / v² = 2×${KE} / ${v}²`, `m = ${fmt(m)}`] };
      }
      if (target === 'v') {
        const KE = Number(values.KE), m = Number(values.m);
        if ([KE, m].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (m === 0) return { result: 'm يجب ألا يكون صفراً', steps: [] };
        const v = Math.sqrt((2 * KE) / m);
        return { result: `v = ${fmt(v)}`, steps: [`v = √(2×KE / m) = √(2×${KE} / ${m})`, `v = ${fmt(v)}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'potential-energy',
    branchId: 'mechanics',
    name: 'الطاقة الكامنة الجاذبية',
    formula: 'PE = mgh',
    description: 'تحسب الطاقة المختزنة في الجسم بسبب موضعه الارتفاعي فوق نقطة مرجعية. تزداد مع الارتفاع والكتلة.',
    method: '1) حدد كتلة الجسم m. 2) حدد تسارع الجاذبية g (على الأرض ≈ 9.8 m/s²). 3) حدد الارتفاع h. 4) اضرب الثلاثة: PE = m × g × h.',
    examples: [{ title: 'مثال', values: { m: 2, g: 9.8, h: 5 }, steps: ['PE = 98'] }],
    relatedExperiments: [{ id: 'freefall', name: 'السقوط الحر', route: '/physics/mechanics/freefall', context: 'الطاقة الكامنة تتحول إلى حركية.' }],
    constants: [
      { label: 'g', value: '9.8 m/s²', description: 'تسارع الجاذبية الأرضية' },
    ],
    variables: [{ name: 'PE', label: 'PE' }, { name: 'm', label: 'm' }, { name: 'g', label: 'g' }, { name: 'h', label: 'h' }],
    defaultSolveFor: 'PE',
    solve(values, solveFor) {
      const target = solveFor || 'PE';
      if (target === 'PE') {
        const m = Number(values.m), g = Number(values.g), h = Number(values.h);
        if ([m, g, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        return { result: `PE = ${fmt(m * g * h)}`, steps: [`PE = ${m}×${g}×${h}`, `PE = ${fmt(m * g * h)}`] };
      }
      if (target === 'm') {
        const PE = Number(values.PE), g = Number(values.g), h = Number(values.h);
        if ([PE, g, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (g * h === 0) return { result: 'g×h يجب ألا يكون صفراً', steps: [] };
        return { result: `m = ${fmt(PE / (g * h))}`, steps: [`m = PE / (g×h) = ${PE} / (${g}×${h})`, `m = ${fmt(PE / (g * h))}`] };
      }
      if (target === 'g') {
        const PE = Number(values.PE), m = Number(values.m), h = Number(values.h);
        if ([PE, m, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (m * h === 0) return { result: 'm×h يجب ألا يكون صفراً', steps: [] };
        return { result: `g = ${fmt(PE / (m * h))}`, steps: [`g = PE / (m×h) = ${PE} / (${m}×${h})`, `g = ${fmt(PE / (m * h))}`] };
      }
      if (target === 'h') {
        const PE = Number(values.PE), m = Number(values.m), g = Number(values.g);
        if ([PE, m, g].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (m * g === 0) return { result: 'm×g يجب ألا يكون صفراً', steps: [] };
        return { result: `h = ${fmt(PE / (m * g))}`, steps: [`h = PE / (m×g) = ${PE} / (${m}×${g})`, `h = ${fmt(PE / (m * g))}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'newton-second-law',
    branchId: 'mechanics',
    name: 'قانون نيوتن الثاني',
    formula: 'F = ma',
    description: 'يربط القوة المحصلة المؤثرة على جسم بكتلته وتسارعه. أساسي في فهم الحركة والقوى.',
    method: '1) حدد كتلة الجسم m. 2) حدد تسارع الجسم a. 3) اضرب الكتلة في التسارع: F = m × a. 4) القوة تكون في اتجاه التسارع.',
    examples: [{ title: 'مثال', values: { m: 5, a: 2 }, steps: ['F = 10 N'] }],
    applicationProblems: [
      {
        question: 'صندوق كتلته 8 كغ يُدفع بقوة أفقية. إذا تسارع بمعدل 2.5 م/ث²، ما قيمة القوة؟',
        hint: 'F = ma.',
        answer: 'F = 20 N',
        variables: { m: 8, a: 2.5 },
        expectedValue: 20,
      },
    ],
    relatedExperiments: [{ id: 'inclined', name: 'المنحدر', route: '/physics/mechanics/inclined', context: 'القوة المحصلة على الجسم.' }],
    constants: [{ label: 'g', value: '9.8 m/s²', description: 'تسارع الجاذبية الأرضية' }],
    variables: [{ name: 'F', label: 'F' }, { name: 'm', label: 'm' }, { name: 'a', label: 'a' }],
    defaultSolveFor: 'F',
    solve(values, solveFor) {
      const target = solveFor || 'F';
      if (target === 'F') {
        const m = Number(values.m), a = Number(values.a);
        if ([m, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        return { result: `F = ${fmt(m * a)} N`, steps: [`F = ${m}×${a}`, `F = ${fmt(m * a)} N`] };
      }
      if (target === 'm') {
        const F = Number(values.F), a = Number(values.a);
        if ([F, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
        return { result: `m = ${fmt(F / a)} kg`, steps: [`m = F / a = ${F} / ${a}`, `m = ${fmt(F / a)} kg`] };
      }
      if (target === 'a') {
        const F = Number(values.F), m = Number(values.m);
        if ([F, m].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (m === 0) return { result: 'm يجب ألا يكون صفراً', steps: [] };
        return { result: `a = ${fmt(F / m)} m/s²`, steps: [`a = F / m = ${F} / ${m}`, `a = ${fmt(F / m)} m/s²`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'work',
    branchId: 'mechanics',
    name: 'الشغل',
    formula: 'W = Fd',
    description: 'يحسب الشغل المبذول عندما تؤثر قوة على جسم وتنقله مسافة في اتجاه القوة. الأساسي في حسابات الطاقة والآلات.',
    method: '1) حدد القوة F المؤثرة. 2) حدد الإزاحة d في اتجاه القوة. 3) اضرب القوة في الإزاحة: W = F × d. 4) إذا كانت القوة غير متوازية مع الإزاحة، استخدم W = F × d × cos(θ).',
    examples: [{ title: 'مثال', values: { F: 10, d: 5 }, steps: ['W = 50 J'] }],
    applicationProblems: [
      {
        question: 'شخص يدفع صندوقاً بقوة 15 نيوتن لمسافة 8 أمتار. ما الشغل المبذول؟',
        hint: 'W = F × d.',
        answer: 'W = 120 J',
        variables: { F: 15, d: 8 },
        expectedValue: 120,
      },
    ],
    variables: [{ name: 'F', label: 'F' }, { name: 'd', label: 'd' }],
    solve(values) {
      const F = Number(values.F), d = Number(values.d);
      if ([F, d].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `W = ${fmt(F * d)} J`, steps: [`W = ${F}×${d}`, `W = ${fmt(F * d)} J`] };
    },
  },
  {
    id: 'power',
    branchId: 'mechanics',
    name: 'القدرة',
    formula: 'P = W / t',
    description: 'تحسب معدل بذل الشغل أو استهلاك الطاقة مع الزمن. كلما زادت القدرة، تمّ الشغل بشكل أسرع.',
    method: '1) حدد الشغل المبذول W. 2) حدد الزمن t المستغرق. 3) اقسم الشغل على الزمن: P = W / t. 4) يمكن أيضاً استخدام P = F × v.',
    examples: [{ title: 'مثال', values: { W: 100, t: 5 }, steps: ['P = 20 W'] }],
    variables: [{ name: 'W', label: 'W' }, { name: 't', label: 't' }],
    solve(values) {
      const W = Number(values.W), t = Number(values.t);
      if ([W, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (t === 0) return { result: 'الزمن لا يمكن أن يكون صفراً', steps: [] };
      return { result: `P = ${fmt(W / t)} W`, steps: [`P = ${W}/${t}`, `P = ${fmt(W / t)} W`] };
    },
  },
  {
    id: 'momentum',
    branchId: 'mechanics',
    name: 'الزخم',
    formula: 'p = mv',
    description: 'يقيس كمية الحركة للجسم، ويساوي حاصل ضرب كتلته في سرعته. يحفظ الزخم في التصادمات عندما لا تؤثر قوى خارجية.',
    method: '1) حدد كتلة الجسم m. 2) حدد سرعة الجسم v (مع مراعاة الإشارة للاتجاه). 3) اضرب الكتلة في السرعة: p = m × v.',
    examples: [{ title: 'مثال', values: { m: 2, v: 3 }, steps: ['p = 6'] }],
    applicationProblems: [
      {
        question: 'جسم كتلته 4 كغ يتحرك بسرعة 7 م/ث. ما زخمه؟',
        hint: 'p = m × v.',
        answer: 'p = 28 kg·m/s',
        variables: { m: 4, v: 7 },
        expectedValue: 28,
      },
    ],
    relatedExperiments: [{ id: 'collision', name: 'التصادم 1D', route: '/physics/mechanics/collision', context: 'الزخم يحفظ في التصادمات.' }],
    variables: [{ name: 'm', label: 'm' }, { name: 'v', label: 'v' }],
    solve(values) {
      const m = Number(values.m), v = Number(values.v);
      if ([m, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `p = ${fmt(m * v)}`, steps: [`p = ${m}×${v}`, `p = ${fmt(m * v)}`] };
    },
  },
  {
    id: 'density',
    branchId: 'mechanics',
    name: 'الكثافة',
    formula: 'ρ = m / V',
    description: 'تُستخدم لحساب كثافة المادة.',
    method: 'ρ = m / V.',
    examples: [{ title: 'مثال', values: { m: 1000, V: 1 }, steps: ['ρ = 1000'] }],
    variables: [{ name: 'm', label: 'm' }, { name: 'V', label: 'V' }],
    solve(values) {
      const m = Number(values.m), V = Number(values.V);
      if ([m, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (V === 0) return { result: 'V لا يمكن أن يكون صفراً', steps: [] };
      return { result: `ρ = ${fmt(m / V)}`, steps: [`ρ = ${m}/${V}`, `ρ = ${fmt(m / V)}`] };
    },
  },
  {
    id: 'wave-speed',
    branchId: 'waves-optics',
    name: 'سرعة الموجة',
    formula: 'v = fλ',
    description: 'تربط بين سرعة الموجة وترددها وطولها الموجي. تُستخدم في الموجات الصوتية والضوئية والمائية.',
    method: '1) حدد التردد f (عدد الدورات في الثانية). 2) حدد الطول الموجي λ (المسافة بين قمتين متتاليتين). 3) اضرب التردد في الطول الموجي: v = f × λ.',
    examples: [{ title: 'مثال', values: { f: 10, lambda: 2 }, steps: ['v = 20 m/s'] }],
    applicationProblems: [
      {
        question: 'موجة في حوض ماء ترددها 5 هرتز وطولها الموجي 4 سم. ما سرعتها؟',
        hint: 'v = f × λ.',
        answer: 'v = 20 cm/s',
        variables: { f: 5, lambda: 4 },
        expectedValue: 20,
      },
    ],
    relatedExperiments: [{ id: 'speed-of-sound', name: 'سرعة الصوت', route: '/physics/waves/speed-of-sound', context: 'سرعة الصوت تعتمد على التردد وطول الموجة.' }],
    constants: [{ label: 'c', value: '3 × 10^8 m/s', description: 'سرعة الضوء في الفراغ' }],
    variables: [{ name: 'f', label: 'f' }, { name: 'lambda', label: 'λ' }],
    solve(values) {
      const f = Number(values.f), lambda = Number(values.lambda);
      if ([f, lambda].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `v = ${fmt(f * lambda)}`, steps: [`v = ${f}×${lambda}`, `v = ${fmt(f * lambda)}`] };
    },
  },
  {
    id: 'lens-equation',
    branchId: 'waves-optics',
    name: 'معادلة العدسة',
    formula: '1/f = 1/u + 1/v',
    description: 'تُستخدم لحساب البعد البؤري للعدسة.',
    method: '1/f = 1/u + 1/v.',
    examples: [{ title: 'مثال', values: { u: 10, v: 20 }, steps: ['f ≈ 6.667'] }],
    relatedExperiments: [{ id: 'thin-lens', name: 'العدسة الرقيقة', route: '/physics/waves/thin-lens', context: 'تجربة العدسة الرقيقة.' }],
    variables: [{ name: 'u', label: 'u' }, { name: 'v', label: 'v' }],
    solve(values) {
      const u = Number(values.u), v = Number(values.v);
      if ([u, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (u === 0 || v === 0) return { result: 'u و v لا يمكن أن تكونا صفراً', steps: [] };
      const f = 1 / (1 / u + 1 / v);
      return { result: `f = ${fmt(f)}`, steps: [`1/f = 1/${u} + 1/${v}`, `f = ${fmt(f)}`] };
    },
  },
  {
    id: 'snell-law',
    branchId: 'waves-optics',
    name: 'قانون سنل',
    formula: 'n1 sin(θ1) = n2 sin(θ2)',
    description: 'يُستخدم لحساب زاوية الانكسار.',
    method: 'sin(θ2) = (n1/n2) sin(θ1).',
    examples: [{ title: 'مثال', values: { n1: 1, n2: 1.5, theta1: 30 }, steps: ['θ2 ≈ 19.47°'] }],
    relatedExperiments: [{ id: 'light-ray', name: 'شعاع الضوء', route: '/physics/waves/light-ray', context: 'تجربة الانكسار.' }],
    variables: [{ name: 'n1', label: 'n1' }, { name: 'n2', label: 'n2' }, { name: 'theta1', label: 'θ1' }],
    solve(values) {
      const n1 = Number(values.n1), n2 = Number(values.n2), theta1 = Number(values.theta1);
      if ([n1, n2, theta1].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const theta2 = Math.asin((n1 / n2) * Math.sin(toRad(theta1))) * 180 / Math.PI;
      return { result: `θ2 = ${fmt(theta2)}°`, steps: [`sin(θ2) = (${n1}/${n2})×sin(${theta1}°)`, `θ2 = ${fmt(theta2)}°`] };
    },
  },
  {
    id: 'magnification',
    branchId: 'waves-optics',
    name: 'التكبير',
    formula: 'm = v / u',
    description: 'يُستخدم لحساب تكبير الصورة.',
    method: 'm = v / u.',
    examples: [{ title: 'مثال', values: { v: 20, u: 10 }, steps: ['m = 2'] }],
    variables: [{ name: 'v', label: 'v' }, { name: 'u', label: 'u' }],
    solve(values) {
      const v = Number(values.v), u = Number(values.u);
      if ([v, u].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (u === 0) return { result: 'u لا يمكن أن يكون صفراً', steps: [] };
      return { result: `m = ${fmt(v / u)}`, steps: [`m = ${v}/${u}`, `m = ${fmt(v / u)}`] };
    },
  },
  {
    id: 'ohms-law',
    branchId: 'electricity',
    name: 'قانون أوم',
    formula: 'V = IR',
    description: 'يُستخدم لحساب الجهد في دائرة كهربائية.',
    method: 'V = IR.',
    examples: [{ title: 'مثال', values: { I: 2, R: 5 }, steps: ['V = 10 V'] }],
    applicationProblems: [
      {
        question: 'دائرة كهربائية بتيار 0.5 أمبير ومقاومة 20 أوم. ما الجهد؟',
        hint: 'V = I × R.',
        answer: 'V = 10 V',
        variables: { I: 0.5, R: 20 },
        expectedValue: 10,
      },
    ],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'قانون أوم أساسي في الدوائر.' }],
    constants: [{ label: 'ρ0 النحاس', value: '1.68 × 10^-8 Ω·m', description: 'المقاومية النوعية للنحاس' }],
    variables: [{ name: 'V', label: 'V' }, { name: 'I', label: 'I' }, { name: 'R', label: 'R' }],
    defaultSolveFor: 'V',
    solve(values, solveFor) {
      const target = solveFor || 'V';
      if (target === 'V') {
        const I = Number(values.I), R = Number(values.R);
        if ([I, R].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        return { result: `V = ${fmt(I * R)} V`, steps: [`V = ${I}×${R}`, `V = ${fmt(I * R)} V`] };
      }
      if (target === 'I') {
        const V = Number(values.V), R = Number(values.R);
        if ([V, R].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (R === 0) return { result: 'R يجب ألا يكون صفراً', steps: [] };
        return { result: `I = ${fmt(V / R)} A`, steps: [`I = V / R = ${V} / ${R}`, `I = ${fmt(V / R)} A`] };
      }
      if (target === 'R') {
        const V = Number(values.V), I = Number(values.I);
        if ([V, I].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (I === 0) return { result: 'I يجب ألا يكون صفراً', steps: [] };
        return { result: `R = ${fmt(V / I)} Ω`, steps: [`R = V / I = ${V} / ${I}`, `R = ${fmt(V / I)} Ω`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'electric-power',
    branchId: 'electricity',
    name: 'القدرة الكهربائية',
    formula: 'P = VI',
    description: 'تُستخدم لحساب القدرة المستهلكة.',
    method: 'P = VI.',
    examples: [{ title: 'مثال', values: { V: 12, I: 3 }, steps: ['P = 36 W'] }],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'القدرة المستهلكة P = VI.' }],
    variables: [{ name: 'P', label: 'P' }, { name: 'V', label: 'V' }, { name: 'I', label: 'I' }],
    defaultSolveFor: 'P',
    solve(values, solveFor) {
      const target = solveFor || 'P';
      if (target === 'P') {
        const V = Number(values.V), I = Number(values.I);
        if ([V, I].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        return { result: `P = ${fmt(V * I)} W`, steps: [`P = ${V}×${I}`, `P = ${fmt(V * I)} W`] };
      }
      if (target === 'V') {
        const P = Number(values.P), I = Number(values.I);
        if ([P, I].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (I === 0) return { result: 'I يجب ألا يكون صفراً', steps: [] };
        return { result: `V = ${fmt(P / I)} V`, steps: [`V = P / I = ${P} / ${I}`, `V = ${fmt(P / I)} V`] };
      }
      if (target === 'I') {
        const P = Number(values.P), V = Number(values.V);
        if ([P, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
        if (V === 0) return { result: 'V يجب ألا يكون صفراً', steps: [] };
        return { result: `I = ${fmt(P / V)} A`, steps: [`I = P / V = ${P} / ${V}`, `I = ${fmt(P / V)} A`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'resistance-series',
    branchId: 'electricity',
    name: 'المقاومات على التوالي',
    formula: 'R = R1 + R2',
    description: 'يُستخدم لحساب المقاومة الكلية على التوالي.',
    method: 'R = R1 + R2.',
    examples: [{ title: 'مثال', values: { R1: 10, R2: 20 }, steps: ['R = 30 Ω'] }],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'توصيل المقاومات على التوالي.' }],
    variables: [{ name: 'R1', label: 'R1' }, { name: 'R2', label: 'R2' }],
    solve(values) {
      const R1 = Number(values.R1), R2 = Number(values.R2);
      if ([R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `R = ${fmt(R1 + R2)} Ω`, steps: [`R = ${R1} + ${R2}`, `R = ${fmt(R1 + R2)} Ω`] };
    },
  },
  {
    id: 'resistance-parallel',
    branchId: 'electricity',
    name: 'المقاومات على التوازي',
    formula: '1/R = 1/R1 + 1/R2',
    description: 'يُستخدم لحساب المقاومة الكلية على التوازي.',
    method: '1/R = 1/R1 + 1/R2.',
    examples: [{ title: 'مثال', values: { R1: 10, R2: 20 }, steps: ['R ≈ 6.667 Ω'] }],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'توصيل المقاومات على التوازي.' }],
    variables: [{ name: 'R1', label: 'R1' }, { name: 'R2', label: 'R2' }],
    solve(values) {
      const R1 = Number(values.R1), R2 = Number(values.R2);
      if ([R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (R1 === 0 || R2 === 0) return { result: 'R لا يمكن أن تكون صفراً', steps: [] };
      const R = 1 / (1 / R1 + 1 / R2);
      return { result: `R = ${fmt(R)} Ω`, steps: [`1/R = 1/${R1} + 1/${R2}`, `R = ${fmt(R)} Ω`] };
    },
  },
  {
    id: 'capacitance',
    branchId: 'electricity',
    name: 'السعة',
    formula: 'C = Q / V',
    description: 'تُستخدم لحساب سعة المكثف.',
    method: 'C = Q / V.',
    examples: [{ title: 'مثال', values: { Q: 0.01, V: 5 }, steps: ['C = 0.002 F'] }],
    variables: [{ name: 'Q', label: 'Q' }, { name: 'V', label: 'V' }],
    solve(values) {
      const Q = Number(values.Q), V = Number(values.V);
      if ([Q, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (V === 0) return { result: 'V لا يمكن أن يكون صفراً', steps: [] };
      return { result: `C = ${fmt(Q / V)} F`, steps: [`C = ${Q}/${V}`, `C = ${fmt(Q / V)} F`] };
    },
  },
  {
    id: 'magnetic-force',
    branchId: 'electromagnetism',
    name: 'قوة المجال المغناطيسي',
    formula: 'F = qvB',
    description: 'تُستخدم لحساب القوة على شحنة متحركة في مجال مغناطيسي.',
    method: 'F = qvB.',
    examples: [{ title: 'مثال', values: { q: 1e-6, v: 100, B: 0.5 }, steps: ['F = 5e-5 N'] }],
    relatedExperiments: [{ id: 'lorentz-force', name: 'قوة لورينتز', route: '/physics/electromagnetism/lorentz-force', context: 'قوة المجال المغناطيسي.' }],
    variables: [{ name: 'q', label: 'q' }, { name: 'v', label: 'v' }, { name: 'B', label: 'B' }],
    solve(values) {
      const q = Number(values.q), v = Number(values.v), B = Number(values.B);
      if ([q, v, B].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `F = ${fmt(q * v * B)}`, steps: [`F = ${q}×${v}×${B}`, `F = ${fmt(q * v * B)}`] };
    },
  },
  {
    id: 'straight-wire-field',
    branchId: 'electromagnetism',
    name: 'مجال سلك مستقيم',
    formula: 'B = μ0I / (2πr)',
    description: 'يُستخدم لحساب المجال المغناطيسي حول سلك مستقيم.',
    method: 'B = μ0I / (2πr).',
    examples: [{ title: 'مثال', values: { I: 2, r: 0.1 }, steps: ['B = 4e-6 T'] }],
    relatedExperiments: [{ id: 'straight-wire', name: 'مجال السلك المستقيم', route: '/physics/electromagnetism/straight-wire', context: 'حساب المجال المغناطيسي.' }],
    constants: [
      { label: 'μ₀', value: '4π × 10⁻⁷ T·m/A', description: 'نفاذية الفراغ' },
    ],
    variables: [{ name: 'I', label: 'I' }, { name: 'r', label: 'r' }],
    solve(values) {
      const I = Number(values.I), r = Number(values.r);
      if ([I, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (r === 0) return { result: 'r لا يمكن أن يكون صفراً', steps: [] };
      const mu0 = 4 * Math.PI * 1e-7, B = (mu0 * I) / (2 * Math.PI * r);
      return { result: `B = ${fmt(B)} T`, steps: [`B = μ0×${I} / (2π×${r})`, `B = ${fmt(B)} T`] };
    },
  },
  {
    id: 'circular-coil-field',
    branchId: 'electromagnetism',
    name: 'مجال ملف دائري',
    formula: 'B = μ0NI / (2R)',
    description: 'يُستخدم لحساب المجال المغناطيسي في مركز ملف دائري.',
    method: 'B = μ0NI / (2R).',
    examples: [{ title: 'مثال', values: { N: 100, I: 2, R: 0.05 }, steps: ['B = 0.0025 T'] }],
    relatedExperiments: [{ id: 'solenoid', name: 'المحرك اللولبي', route: '/physics/electromagnetism/solenoid', context: 'المجال المغناطيسي داخل الملف.' }],
    constants: [
      { label: 'μ₀', value: '4π × 10⁻⁷ T·m/A', description: 'نفاذية الفراغ' },
    ],
    variables: [{ name: 'N', label: 'N' }, { name: 'I', label: 'I' }, { name: 'R', label: 'R' }],
    solve(values) {
      const N = Number(values.N), I = Number(values.I), R = Number(values.R);
      if ([N, I, R].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (R === 0) return { result: 'R لا يمكن أن يكون صفراً', steps: [] };
      const mu0 = 4 * Math.PI * 1e-7, B = (mu0 * N * I) / (2 * R);
      return { result: `B = ${fmt(B)} T`, steps: [`B = μ0×${N}×${I} / (2×${R})`, `B = ${fmt(B)} T`] };
    },
  },
  {
    id: 'heat-capacity',
    branchId: 'heat',
    name: 'السعة الحرارية',
    formula: 'Q = mcΔT',
    description: 'تُستخدم لحساب الحرارة اللازمة لتغيير درجة الحرارة.',
    method: 'Q = mcΔT.',
    examples: [{ title: 'مثال', values: { m: 1, c: 4186, deltaT: 10 }, steps: ['Q = 41860 J'] }],
    relatedExperiments: [{ id: 'calorimetry', name: 'الكالوريمتر', route: '/physics/heat/calorimetry', context: 'قياس الحرارة.' }],
    constants: [
      { label: 'c الماء', value: '4186 J/(kg·°C)', description: 'الحرارة النوعية للماء' },
      { label: 'c الألمنيوم', value: '900 J/(kg·°C)', description: 'الحرارة النوعية للألمنيوم' },
    ],
    variables: [{ name: 'm', label: 'm' }, { name: 'c', label: 'c' }, { name: 'deltaT', label: 'ΔT' }],
    solve(values) {
      const m = Number(values.m), c = Number(values.c), deltaT = Number(values.deltaT);
      if ([m, c, deltaT].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `Q = ${fmt(m * c * deltaT)} J`, steps: [`Q = ${m}×${c}×${deltaT}`, `Q = ${fmt(m * c * deltaT)} J`] };
    },
  },
  {
    id: 'ideal-gas-law',
    branchId: 'heat',
    name: 'قانون الغاز المثالي',
    formula: 'PV = nRT',
    description: 'يُستخدم لحساب الضغط أو الحجم أو درجة الحرارة للغاز المثالي.',
    method: 'P = nRT / V.',
    examples: [{ title: 'مثال', values: { n: 1, V: 0.0224, T: 273 }, steps: ['P ≈ 101325 Pa'] }],
    relatedExperiments: [{ id: 'ideal-gas', name: 'الغاز المثالي', route: '/physics/heat/ideal-gas', context: 'الغاز المثالي.' }],
    constants: [
      { label: 'R', value: '8.314 J/(mol·K)', description: 'ثابت الغازات العام' },
    ],
    variables: [{ name: 'n', label: 'n' }, { name: 'V', label: 'V' }, { name: 'T', label: 'T' }],
    solve(values) {
      const n = Number(values.n), V = Number(values.V), T = Number(values.T);
      if ([n, V, T].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (V === 0) return { result: 'V لا يمكن أن يكون صفراً', steps: [] };
      const P = (n * 8.314 * T) / V;
      return { result: `P = ${fmt(P)} Pa`, steps: [`P = ${n}×8.314×${T}/${V}`, `P = ${fmt(P)} Pa`] };
    },
  },
  {
    id: 'latent-heat',
    branchId: 'heat',
    name: 'الحرارة الكامنة',
    formula: 'Q = mL',
    description: 'تُستخدم لحساب الحرارة اللازمة لتغيير حالة المادة.',
    method: 'Q = mL.',
    examples: [{ title: 'مثال', values: { m: 0.5, L: 334000 }, steps: ['Q = 167000 J'] }],
    relatedExperiments: [{ id: 'latent-heat', name: 'الحرارة الكامنة', route: '/physics/heat/latent-heat', context: 'الحرارة الكامنة للانصهار.' }],
    constants: [
      { label: 'Lf', value: '334000 J/kg', description: 'حرارة انصهار الماء' },
      { label: 'Lv', value: '2260000 J/kg', description: 'حرارة تبخر الماء' },
    ],
    variables: [{ name: 'm', label: 'm' }, { name: 'L', label: 'L' }],
    solve(values) {
      const m = Number(values.m), L = Number(values.L);
      if ([m, L].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `Q = ${fmt(m * L)} J`, steps: [`Q = ${m}×${L}`, `Q = ${fmt(m * L)} J`] };
    },
  },
  {
    id: 'thermal-expansion',
    branchId: 'heat',
    name: 'التمدد الحراري',
    formula: 'ΔL = αL0ΔT',
    description: 'يُستخدم لحساب التغير في الطول بسبب التغير في الحرارة.',
    method: 'ΔL = αL0ΔT.',
    examples: [{ title: 'مثال', values: { alpha: 1.2e-5, L0: 10, deltaT: 50 }, steps: ['ΔL = 0.006'] }],
    constants: [
      { label: 'α الفولاذ', value: '1.2 × 10^-5 /°C', description: 'معامل التمدد الخطي للفولاذ' },
      { label: 'α الألمنيوم', value: '2.4 × 10^-5 /°C', description: 'معامل التمدد الخطي للألمنيوم' },
      { label: 'α النحاس', value: '1.7 × 10^-5 /°C', description: 'معامل التمدد الخطي للنحاس' },
    ],
    variables: [{ name: 'alpha', label: 'α' }, { name: 'L0', label: 'L0' }, { name: 'deltaT', label: 'ΔT' }],
    solve(values) {
      const alpha = Number(values.alpha), L0 = Number(values.L0), deltaT = Number(values.deltaT);
      if ([alpha, L0, deltaT].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `ΔL = ${fmt(alpha * L0 * deltaT)}`, steps: [`ΔL = ${alpha}×${L0}×${deltaT}`, `ΔL = ${fmt(alpha * L0 * deltaT)}`] };
    },
  },
  {
    id: 'first-law-thermodynamics',
    branchId: 'heat',
    name: 'القانون الأول للديناميكا الحرارية',
    formula: 'ΔU = Q - W',
    description: 'يُستخدم لحساب التغير في الطاقة الداخلية للنظام.',
    method: 'ΔU = Q - W.',
    examples: [{ title: 'مثال', values: { Q: 500, W: 200 }, steps: ['ΔU = 300 J'] }],
    variables: [{ name: 'Q', label: 'Q' }, { name: 'W', label: 'W' }],
    solve(values) {
      const Q = Number(values.Q), W = Number(values.W);
      if ([Q, W].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `ΔU = ${fmt(Q - W)} J`, steps: [`ΔU = ${Q} - ${W}`, `ΔU = ${fmt(Q - W)} J`] };
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
    id: 'derivative-sin',
    branchId: 'calculus',
    name: 'مشتقة الجيب',
    formula: "d/dx(sin(x)) = cos(x)",
    description: 'مشتقة دالة الجيب هي جيب التمام. x بالراديان.',
    method: 'd/dx(sin(x)) = cos(x)، حيث x بالراديان.',
    examples: [{ title: 'مثال', values: { x: 0 }, steps: ['cos(0) = 1'] }],
    graph: {
      label: 'منحنى الجيب y = sin(x)',
      xRange: [-6.283, 6.283],
      yRange: [-1.5, 1.5],
      params: {},
      fn: (x) => Math.sin(x),
    },
    variables: [{ name: 'x', label: 'x (راديان)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `cos(${x}) = ${fmt(Math.cos(x))}`, steps: [`d/dx(sin(${x})) = cos(${x})`, `cos(${x}) = ${fmt(Math.cos(x))}`] };
    },
  },
  {
    id: 'derivative-cos',
    branchId: 'calculus',
    name: 'مشتقة جيب التمام',
    formula: 'd/dx(cos(x)) = -sin(x)',
    description: 'مشتقة دالة جيب التمام هي سالب الجيب. x بالراديان.',
    method: 'd/dx(cos(x)) = -sin(x)، حيث x بالراديان.',
    examples: [{ title: 'مثال', values: { x: 1.571 }, steps: ['-sin(π/2) = -1'] }],
    graph: {
      label: 'منحنى جيب التمام y = cos(x)',
      xRange: [-6.283, 6.283],
      yRange: [-1.5, 1.5],
      params: {},
      fn: (x) => Math.cos(x),
    },
    variables: [{ name: 'x', label: 'x (راديان)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `-sin(${x}) = ${fmt(-Math.sin(x))}`, steps: [`d/dx(cos(${x})) = -sin(${x})`, `-sin(${x}) = ${fmt(-Math.sin(x))}`] };
    },
  },
  {
    id: 'coulomb-law',
    branchId: 'electricity',
    name: 'قانون كولوم',
    formula: 'F = k q1 q2 / r^2',
    description: 'يُستخدم لحساب القوة الكهروستاتيكية بين شحنتين.',
    method: 'F = k × q1 × q2 / r²، حيث k ثابت كولوم.',
    examples: [{ title: 'مثال', values: { q1: 1e-6, q2: 2e-6, r: 0.5 }, steps: ['F ≈ 0.0719 N'] }],
    constants: [{ label: 'k', value: '8.99 × 10^9 N·m²/C²', description: 'ثابت كولوم' }],
    variables: [{ name: 'q1', label: 'q1' }, { name: 'q2', label: 'q2' }, { name: 'r', label: 'r' }],
    solve(values) {
      const q1 = Number(values.q1), q2 = Number(values.q2), r = Number(values.r);
      if ([q1, q2, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (r === 0) return { result: 'r لا يمكن أن يكون صفراً', steps: [] };
      const k = 8.99e9, F = (k * q1 * q2) / (r * r);
      return { result: `F = ${fmt(F)} N`, steps: [`F = k×${q1}×${q2}/${r}²`, `F = ${fmt(F)} N`] };
    },
  },
  {
    id: 'frequency-period',
    branchId: 'waves-optics',
    name: 'التردد والدورة',
    formula: 'f = 1 / T',
    description: 'يربط بين التردد والدورة الزمنية للموجة.',
    method: 'f = 1 / T.',
    examples: [{ title: 'مثال', values: { T: 2 }, steps: ['f = 0.5 Hz'] }],
    variables: [{ name: 'T', label: 'T' }],
    solve(values) {
      const T = Number(values.T);
      if (Number.isNaN(T)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (T === 0) return { result: 'T لا يمكن أن يكون صفراً', steps: [] };
      return { result: `f = ${fmt(1 / T)} Hz`, steps: [`f = 1/${T}`, `f = ${fmt(1 / T)} Hz`] };
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
    id: 'natural-logarithm',
    branchId: 'calculus',
    name: 'اللوغاريتم الطبيعي',
    formula: 'ln(x)',
    description: 'لوغاريتم الأساس e، مهم في التفاضل والتكامل.',
    method: 'd/dx(ln(x)) = 1/x.',
    examples: [{ title: 'مثال', values: { x: Math.E }, steps: ['ln(e) = 1'] }],
    constants: [{ label: 'e', value: '2.71828', description: 'العدد النيبيري' }],
    variables: [{ name: 'x', label: 'x' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (x <= 0) return { result: 'x يجب أن يكون موجباً', steps: [] };
      return { result: `ln(${x}) = ${fmt(Math.log(x))}`, steps: [`ln(${x}) = ${fmt(Math.log(x))}`] };
    },
  },
  {
    id: 'permutation',
    branchId: 'statistics',
    name: 'التباديل',
    formula: 'P(n, r) = n! / (n - r)!',
    description: 'يُستخدم لحساب عدد طرق ترتيب r عناصر من n عنصر.',
    method: 'P(n, r) = n! / (n - r)!.',
    examples: [{ title: 'مثال', values: { n: 5, r: 2 }, steps: ['P(5,2) = 20'] }],
    variables: [{ name: 'n', label: 'n' }, { name: 'r', label: 'r' }],
    solve(values) {
      const n = Number(values.n), r = Number(values.r);
      if ([n, r].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (n < 0 || r < 0 || r > n) return { result: 'أدخل قيماً صحيحة', steps: [] };
      const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));
      return { result: `P(${n},${r}) = ${fmt(fact(n) / fact(n - r))}`, steps: [`P(${n},${r}) = ${n}! / (${n} - ${r})!`, `P(${n},${r}) = ${fmt(fact(n) / fact(n - r))}`] };
    },
  },
  {
    id: 'pressure',
    branchId: 'mechanics',
    name: 'الضغط',
    formula: 'P = F / A',
    description: 'يُستخدم لحساب الضغط الناتج عن قوة موزعة على مساحة.',
    method: 'P = F / A.',
    examples: [{ title: 'مثال', values: { F: 100, A: 2 }, steps: ['P = 50 Pa'] }],
    applicationProblems: [
      {
        question: 'قدم شخص تضغط على الأرض بقوة 80 نيوتن على مساحة 0.5 م². ما الضغط؟',
        hint: 'P = F / A.',
        answer: 'P = 160 Pa',
        variables: { F: 80, A: 0.5 },
        expectedValue: 160,
      },
    ],
    variables: [{ name: 'F', label: 'F' }, { name: 'A', label: 'A' }],
    solve(values) {
      const F = Number(values.F), A = Number(values.A);
      if ([F, A].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (A === 0) return { result: 'A لا يمكن أن تكون صفراً', steps: [] };
      return { result: `P = ${fmt(F / A)} Pa`, steps: [`P = ${F}/${A}`, `P = ${fmt(F / A)} Pa`] };
    },
  },
  {
    id: 'gcd',
    branchId: 'number-theory',
    name: 'القاسم المشترك الأكبر',
    formula: 'gcd(a, b)',
    description: 'يُستخدم لإيجاد أكبر عدد يقسم a و b بدون باقٍ.',
    method: 'نستخدم خوارزمية إقليدس: نقسم a على b، ثم نستبدل a بـ b و b بالباقي، حتى يصبح الباقي صفراً.',
    examples: [{ title: 'مثال', values: { a: 48, b: 18 }, steps: ['gcd(48,18) = 6'] }],
    applicationProblems: [
      {
        question: 'لدينا 48 تفاحة و18 برتقالة. ما أكبر عدد من الصناديق المتساوية يمكن توزيعها فيها؟',
        hint: 'احسب gcd(48, 18).',
        answer: 'gcd = 6 صناديق',
        variables: { a: 48, b: 18 },
        expectedValue: 6,
      },
    ],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      let a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      a = Math.abs(a); b = Math.abs(b);
      const steps: string[] = [`gcd(${a}, ${b})`];
      while (b !== 0) {
        const r = a % b;
        steps.push(`${a} = ${Math.floor(a / b)} × ${b} + ${r}`);
        a = b;
        b = r;
      }
      steps.push(`gcd = ${a}`);
      return { result: `gcd = ${a}`, steps };
    },
  },
  {
    id: 'lcm',
    branchId: 'number-theory',
    name: 'المضاعف المشترك الأصغر',
    formula: 'lcm(a, b) = |a × b| / gcd(a, b)',
    description: 'يُستخدم لإيجاد أصغر عدد يقبل القسمة على a و b.',
    method: 'lcm(a, b) = |a × b| / gcd(a, b).',
    examples: [{ title: 'مثال', values: { a: 4, b: 6 }, steps: ['lcm(4,6) = 12'] }],
    applicationProblems: [
      {
        question: 'تمر قطاران أحدهما كل 4 دقائق والآخر كل 6 دقائق. بعد كم دقيقة يلتقيان في نفس المحطة؟',
        hint: 'احسب lcm(4, 6).',
        answer: 'lcm = 12 دقيقة',
        variables: { a: 4, b: 6 },
        expectedValue: 12,
      },
    ],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      const g = gcd(Math.abs(a), Math.abs(b));
      const result = Math.abs(a * b) / g;
      return { result: `lcm = ${fmt(result)}`, steps: [`gcd(${a}, ${b}) = ${g}`, `lcm = |${a} × ${b}| / ${g} = ${fmt(result)}`] };
    },
  },
  {
    id: 'sum-naturals',
    branchId: 'number-theory',
    name: 'مجموع الأعداد الطبيعية',
    formula: 'S = n(n + 1) / 2',
    description: 'يُستخدم لحساب مجموع الأعداد من 1 إلى n.',
    method: 'S = n(n + 1) / 2.',
    examples: [{ title: 'مثال', values: { n: 10 }, steps: ['S = 55'] }],
    applicationProblems: [
      {
        question: 'ما مجموع الأعداد من 1 إلى 100؟',
        hint: 'S = n(n + 1) / 2 حيث n = 100.',
        answer: 'S = 5050',
        variables: { n: 100 },
        expectedValue: 5050,
      },
    ],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `S = ${fmt((n * (n + 1)) / 2)}`, steps: [`S = ${n} × (${n} + 1) / 2`, `S = ${fmt((n * (n + 1)) / 2)}`] };
    },
  },
  {
    id: 'arithmetic-sequence',
    branchId: 'number-theory',
    name: 'متتالية حسابية',
    formula: 'a_n = a_1 + (n - 1)d',
    description: 'يُستخدم لإيجاد الحد nth في متتالية حسابية.',
    method: 'a_n = a_1 + (n - 1)d، حيث a_1 الحد الأول، d الفرق، n رقم الحد.',
    examples: [{ title: 'مثال', values: { a1: 3, d: 4, n: 5 }, steps: ['a_5 = 19'] }],
    applicationProblems: [
      {
        question: 'متتالية: 3, 7, 11, 15... ما الحد العاشر؟',
        hint: 'a_1 = 3، d = 4، n = 10.',
        answer: 'a_10 = 39',
        variables: { a1: 3, d: 4, n: 10 },
        expectedValue: 39,
      },
    ],
    variables: [{ name: 'a1', label: 'a₁' }, { name: 'd', label: 'd' }, { name: 'n', label: 'n' }],
    solve(values) {
      const a1 = Number(values.a1), d = Number(values.d), n = Number(values.n);
      if ([a1, d, n].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = a1 + (n - 1) * d;
      return { result: `a_${n} = ${fmt(result)}`, steps: [`a_${n} = ${a1} + (${n} - 1) × ${d}`, `a_${n} = ${fmt(result)}`] };
    },
  },
  {
    id: 'geometric-sequence-nth',
    branchId: 'number-theory',
    name: 'الحد العام للمتتالية الهندسية',
    formula: 'a_n = a_1 * r^(n-1)',
    description: 'يُستخدم لإيجاد الحد n في متتالية هندسية، حيث كل حد ينتج بضرب الحد السابق في أساس r.',
    method: '1) حدد الحد الأول a_1. 2) حدد أساس النسبة r. 3) حدد رقم الحد n. 4) احسب a_n = a_1 × r^(n-1).',
    examples: [{ title: 'مثال', values: { a1: 2, r: 3, n: 4 }, steps: ['a_4 = 2 × 3^3 = 54'] }],
    applicationProblems: [
      {
        question: 'متتالية: 5, 15, 45... ما الحد السادس؟',
        hint: 'a_1 = 5، r = 3، n = 6.',
        answer: 'a_6 = 1215',
        variables: { a1: 5, r: 3, n: 6 },
        expectedValue: 1215,
      },
    ],
    variables: [{ name: 'a1', label: 'a₁' }, { name: 'r', label: 'r' }, { name: 'n', label: 'n' }],
    solve(values) {
      const a1 = Number(values.a1), r = Number(values.r), n = Number(values.n);
      if ([a1, r, n].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = a1 * r ** (n - 1);
      return { result: `a_${n} = ${fmt(result)}`, steps: [`a_${n} = ${a1} × ${r}^(${n}-1)`, `a_${n} = ${fmt(result)}`] };
    },
  },
  {
    id: 'sum-geometric',
    branchId: 'number-theory',
    name: 'مجموع المتتالية الهندسية',
    formula: 'S_n = a_1 * (1 - r^n) / (1 - r)',
    description: 'يُستخدم لحساب مجموع أول n حدود في متتالية هندسية عندما لا يكون الأساس يساوي 1.',
    method: '1) تأكد أن r ≠ 1. 2) احسب r^n. 3) S_n = a_1 × (1 - r^n) / (1 - r).',
    examples: [{ title: 'مثال', values: { a1: 2, r: 3, n: 4 }, steps: ['S_4 = 2 × (1 - 81) / (1 - 3) = 80'] }],
    variables: [{ name: 'a1', label: 'a₁' }, { name: 'r', label: 'r' }, { name: 'n', label: 'n' }],
    solve(values) {
      const a1 = Number(values.a1), r = Number(values.r), n = Number(values.n);
      if ([a1, r, n].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (r === 1) return { result: 'r يجب ألا يساوي 1', steps: [] };
      const result = (a1 * (1 - r ** n)) / (1 - r);
      return { result: `S_${n} = ${fmt(result)}`, steps: [`S_${n} = ${a1} × (1 - ${r}^${n}) / (1 - ${r})`, `S_${n} = ${fmt(result)}`] };
    },
  },
  {
    id: 'factorial',
    branchId: 'number-theory',
    name: 'المضروب',
    formula: 'n! = n × (n-1) × ... × 1',
    description: 'يُستخدم لحساب عدد الطرق الممكنة لترتيب n عناصر.',
    method: 'n! = n × (n-1) × ... × 1، مع 0! = 1.',
    examples: [{ title: 'مثال', values: { n: 5 }, steps: ['5! = 120'] }],
    applicationProblems: [
      {
        question: 'كم طريقة يمكن بها ترتيب 6 طلاب في صف؟',
        hint: 'عدد الطرق = 6!',
        answer: '720',
        variables: { n: 6 },
        expectedValue: 720,
      },
    ],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (n < 0 || !Number.isInteger(n)) return { result: 'n يجب أن يكون عدداً صحيحاً غير سالب', steps: [] };
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return { result: `${n}! = ${fmt(result)}`, steps: [`${n}! = ${Array.from({ length: n }, (_, i) => i + 1).reverse().join(' × ')}`, `${n}! = ${fmt(result)}`] };
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
    id: 'area-trapezoid',
    branchId: 'geometry',
    name: 'مساحة شبه المنحرف',
    formula: 'A = (a + b)/2 * h',
    description: 'يحسب مساحة شبه المنحرف باستخدام طولي القاعدتين والارتفاع.',
    method: '1) أوجد طول القاعدة العلوية a. 2) أوجد طول القاعدة السفلى b. 3) أوجد الارتفاع h. 4) A = (a + b)/2 × h.',
    examples: [{ title: 'مثال', values: { a: 5, b: 9, h: 4 }, steps: ['A = (5 + 9)/2 × 4 = 28'] }],
    applicationProblems: [
      {
        question: 'شبه منحرف قاعدتاه 8 و12 والارتفاع 6. ما مساحته؟',
        hint: 'A = (8 + 12)/2 × 6.',
        answer: 'A = 60',
        variables: { a: 8, b: 12, h: 6 },
        expectedValue: 60,
      },
    ],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }, { name: 'h', label: 'h' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b), h = Number(values.h);
      if ([a, b, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = ((a + b) / 2) * h;
      return { result: `A = ${fmt(result)}`, steps: [`A = (${a} + ${b})/2 × ${h}`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'volume-cone',
    branchId: 'geometry',
    name: 'حجم المخروط',
    formula: 'V = (1/3)πr^2h',
    description: 'يحسب حجم مخروط باستخدام نصف القطر والارتفاع.',
    method: '1) أوجد نصف قطر القاعدة r. 2) أوجد الارتفاع h. 3) V = (1/3) × π × r² × h.',
    examples: [{ title: 'مثال', values: { r: 3, h: 7 }, steps: ['V = (1/3) × π × 9 × 7 ≈ 65.97'] }],
    variables: [{ name: 'r', label: 'r' }, { name: 'h', label: 'h' }],
    solve(values) {
      const r = Number(values.r), h = Number(values.h);
      if ([r, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (1 / 3) * Math.PI * r * r * h;
      return { result: `V = ${fmt(result)}`, steps: [`V = (1/3) × π × ${r}² × ${h}`, `V = ${fmt(result)}`] };
    },
  },
  {
    id: 'surface-area-sphere',
    branchId: 'geometry',
    name: 'مساحة سطح الكرة',
    formula: 'A = 4πr^2',
    description: 'يحسب المساحة الكلية لسطح كرة.',
    method: '1) أوجد نصف القطر r. 2) A = 4 × π × r².',
    examples: [{ title: 'مثال', values: { r: 4 }, steps: ['A = 4 × π × 16 ≈ 201.06'] }],
    variables: [{ name: 'r', label: 'r' }],
    solve(values) {
      const r = Number(values.r);
      if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = 4 * Math.PI * r * r;
      return { result: `A = ${fmt(result)}`, steps: [`A = 4 × π × ${r}²`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'double-angle-sin',
    branchId: 'trigonometry',
    name: 'صيغة الجيب المضاعف',
    formula: 'sin(2x) = 2sin(x)cos(x)',
    description: 'تربط بين sin(2x) وقيم sin(x) و cos(x). تُستخدم لتبسيط التعبيرات المثلثية.',
    method: '1) حدد الزاوية x بالدرجات. 2) احسب sin(x) و cos(x). 3) sin(2x) = 2 × sin(x) × cos(x).',
    examples: [{ title: 'مثال', values: { x: 30 }, steps: ['sin(60°) = 2 × 0.5 × 0.866 ≈ 0.866'] }],
    variables: [{ name: 'x', label: 'x (درجات)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = 2 * Math.sin(toRad(x)) * Math.cos(toRad(x));
      return { result: `sin(2×${x}°) = ${fmt(result)}`, steps: [`sin(2×${x}°) = 2 × sin(${x}°) × cos(${x}°)`, `sin(2×${x}°) = ${fmt(result)}`] };
    },
  },
  {
    id: 'pythagorean-identity',
    branchId: 'trigonometry',
    name: 'متطابقة فيثاغورس المثلثية',
    formula: 'sin²(x) + cos²(x) = 1',
    description: 'من أهم المتطابقات المثلثية الأساسية، تربط بين sin و cos لنفس الزاوية.',
    method: '1) احسب sin(x) و cos(x). 2) تحقق أن مجموع مربعيهما يساوي 1.',
    examples: [{ title: 'مثال', values: { x: 60 }, steps: ['(0.866)² + (0.5)² ≈ 1'] }],
    variables: [{ name: 'x', label: 'x (درجات)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = Math.sin(toRad(x)) ** 2 + Math.cos(toRad(x)) ** 2;
      return { result: `sin²(${x}°) + cos²(${x}°) = ${fmt(result)}`, steps: [`sin²(${x}°) + cos²(${x}°) = ${fmt(result)}`, 'النتيجة يجب أن تكون 1 (تقريباً)'] };
    },
  },
  {
    id: 'chain-rule',
    branchId: 'calculus',
    name: 'قاعدة السلسلة',
    formula: "d/dx f(g(x)) = f'(g(x)) * g'(x)",
    description: 'تُستخدم لاشتقاق دالة مركبة (دالة بداخل دالة).',
    method: "1) حدد f(u) و g(x). 2) اشتق f بالنسبة لـ u. 3) اشتق g بالنسبة لـ x. 4) اضرب f'(g(x)) × g'(x).",

    examples: [{ title: 'مثال', values: { a: 3, b: 2 }, steps: ['f(g) = 3g², g(x)=2x → d/dx = 12x'] }],
    applicationProblems: [
      {
        question: 'اشتقق (3x² + 1)⁵.',
        hint: 'f(u)=u⁵، u=3x²+1، f′=5u⁴، u′=6x.',
        answer: '30x(3x²+1)⁴',
        variables: { a: 3, b: 1, c: 5 },
      },
    ],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `d/dx ${a}x + ${b} = ${a}`, steps: [`f'(x) = ${a}`] };
    },
  },
  {
    id: 'product-rule',
    branchId: 'calculus',
    name: 'قاعدة جداء الدالتين',
    formula: "d/dx(u*v) = u'v + uv'",
    description: 'تُستخدم لاشتقاق حاصل ضرب دالتين من المتغير x.',
    method: '1) حدد u(x) و v(x). 2) اشتق كل منهما. 3) الناتج = u′v + uv′.',
    examples: [{ title: 'مثال', values: { a: 2, b: 3 }, steps: ['d/dx(2x * 3x²) = 2*3x² + 2x*6x = 18x²'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `d/dx(${a}x * ${b}x²) = ${3 * a * b}x²`, steps: [`u=${a}x, v=${b}x²`, `u'=${a}, v'=${2 * b}x`, `d/dx = ${a}*${b}x² + ${a}x*${2 * b}x = ${3 * a * b}x²`] };
    },
  },
  {
    id: 'z-score',
    branchId: 'statistics',
    name: 'الدرجة المعيارية',
    formula: 'z = (x - μ) / σ',
    description: 'تقيس بعد قيمة x عن المتوسط بدلالات الانحراف المعياري.',
    method: '1) أوجد المتوسط μ. 2) أوجد الانحراف المعياري σ. 3) z = (x - μ) / σ.',
    examples: [{ title: 'مثال', values: { x: 85, mu: 70, sigma: 10 }, steps: ['z = (85 - 70)/10 = 1.5'] }],
    applicationProblems: [
      {
        question: 'طالب حصل على 92 في امتحان متوسطه 75 وانحرافه المعياري 8. ما درجته المعيارية؟',
        hint: 'z = (92 - 75) / 8.',
        answer: 'z = 2.125',
        variables: { x: 92, mu: 75, sigma: 8 },
        expectedValue: 2.125,
      },
    ],
    variables: [{ name: 'x', label: 'x' }, { name: 'mu', label: 'μ' }, { name: 'sigma', label: 'σ' }],
    solve(values) {
      const x = Number(values.x), mu = Number(values.mu), sigma = Number(values.sigma);
      if ([x, mu, sigma].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (sigma === 0) return { result: 'σ يجب ألا يكون صفراً', steps: [] };
      const result = (x - mu) / sigma;
      return { result: `z = ${fmt(result)}`, steps: [`z = (${x} - ${mu}) / ${sigma}`, `z = ${fmt(result)}`] };
    },
  },
  {
    id: 'binomial-probability',
    branchId: 'statistics',
    name: 'احتمال التوزيع الثنائي',
    formula: 'P(X=k) = C(n,k) * p^k * (1-p)^(n-k)',
    description: 'يحسب احتمال حدوث k نجاحات في n تجربة منفصلة.',
    method: '1) حدد n (عدد التجارب). 2) حدد k (عدد النجاحات). 3) حدد p (احتمال النجاح). 4) P(X=k) = C(n,k) × p^k × (1-p)^(n-k).',
    examples: [{ title: 'مثال', values: { n: 5, k: 2, p: 0.3 }, steps: ['P(X=2) = 10 × 0.09 × 0.16807 ≈ 0.3087'] }],
    applicationProblems: [
      {
        question: 'إذا احتمال نجاح طالب في اختبار 0.7، ما احتمال أن ينجح 8 من 10 طلاب؟',
        hint: 'n=10، k=8، p=0.7.',
        answer: 'P ≈ 0.2335',
        variables: { n: 10, k: 8, p: 0.7 },
        expectedValue: 0.2335,
      },
    ],
    variables: [{ name: 'n', label: 'n' }, { name: 'k', label: 'k' }, { name: 'p', label: 'p' }],
    solve(values) {
      const n = Number(values.n), k = Number(values.k), p = Number(values.p);
      if ([n, k, p].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (k > n || k < 0 || n < 0) return { result: 'k يجب أن يكون بين 0 و n', steps: [] };
      if (p < 0 || p > 1) return { result: 'p يجب أن تكون بين 0 و 1', steps: [] };
      const c = (fact: number) => { let r=1; for(let i=2;i<=fact;i++) r*=i; return r; };
      const comb = c(n) / (c(k) * c(n - k));
      const result = comb * p ** k * (1 - p) ** (n - k);
      return { result: `P(X=${k}) = ${fmt(result)}`, steps: [`C(${n},${k}) = ${fmt(comb)}`, `P = ${fmt(comb)} × ${p}^${k} × ${1-p}^${n-k}`, `P = ${fmt(result)}`] };
    },
  },
  {
    id: 'acceleration',
    branchId: 'mechanics',
    name: 'التسارع',
    formula: 'v = u + at',
    description: 'تربط بين السرعة الابتدائية والنهائية والتسارع والزمن.',
    method: '1) حدد السرعة الابتدائية u. 2) حدد التسارع a. 3) حدد الزمن t. 4) v = u + at.',
    examples: [{ title: 'مثال', values: { u: 5, a: 2, t: 4 }, steps: ['v = 5 + 2×4 = 13 m/s'] }],
    applicationProblems: [
      {
        question: 'سيارة تسير بسرعة 10 m/s وتتسارع بـ 3 m/s² لمدة 5 s. ما سرعتها النهائية؟',
        hint: 'u = 10، a = 3، t = 5.',
        answer: 'v = 25 m/s',
        variables: { u: 10, a: 3, t: 5 },
        expectedValue: 25,
      },
    ],
    variables: [{ name: 'u', label: 'u' }, { name: 'a', label: 'a' }, { name: 't', label: 't' }],
    solve(values) {
      const u = Number(values.u), a = Number(values.a), t = Number(values.t);
      if ([u, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = u + a * t;
      return { result: `v = ${fmt(result)} m/s`, steps: [`v = ${u} + ${a} × ${t}`, `v = ${fmt(result)} m/s`] };
    },
  },
  {
    id: 'friction',
    branchId: 'mechanics',
    name: 'قوة الاحتكاك',
    formula: 'f = μN',
    description: 'تحسب قوة الاحتكاك بين سطحين باستخدام معامل الاحتكاك والقوة العمودية.',
    method: '1) حدد معامل الاحتكاك μ. 2) حدد القوة العمودية N. 3) f = μ × N.',
    examples: [{ title: 'مثال', values: { mu: 0.4, N: 50 }, steps: ['f = 0.4 × 50 = 20 N'] }],
    applicationProblems: [
      {
        question: 'صندوق وزنه 80 N على سطح معامل احتكاكه 0.3. ما قوة الاحتكاك؟',
        hint: 'N = 80 N، μ = 0.3.',
        answer: 'f = 24 N',
        variables: { mu: 0.3, N: 80 },
        expectedValue: 24,
      },
    ],
    variables: [{ name: 'mu', label: 'μ' }, { name: 'N', label: 'N' }],
    solve(values) {
      const mu = Number(values.mu), N = Number(values.N);
      if ([mu, N].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = mu * N;
      return { result: `f = ${fmt(result)} N`, steps: [`f = ${mu} × ${N}`, `f = ${fmt(result)} N`] };
    },
  },
  {
    id: 'spring-force',
    branchId: 'mechanics',
    name: 'قانون هوك',
    formula: 'F = kx',
    description: 'تربط قوة الزنبرك بثابته والإزاحة عن وضعه الطبيعي.',
    method: '1) حدد ثابت الزنبرك k. 2) حدد الإزاحة x. 3) F = kx.',
    examples: [{ title: 'مثال', values: { k: 200, x: 0.15 }, steps: ['F = 200 × 0.15 = 30 N'] }],
    variables: [{ name: 'k', label: 'k' }, { name: 'x', label: 'x' }],
    solve(values) {
      const k = Number(values.k), x = Number(values.x);
      if ([k, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = k * x;
      return { result: `F = ${fmt(result)} N`, steps: [`F = ${k} × ${x}`, `F = ${fmt(result)} N`] };
    },
  },
  {
    id: 'wavelength-frequency',
    branchId: 'waves-optics',
    name: 'العلاقة بين الطول الموجي والتردد',
    formula: 'v = fλ',
    description: 'تربط بين سرعة الموجة وترددها وطولها الموجي.',
    method: '1) حدد سرعة الموجة v. 2) حدد التردد f أو الطول الموجي λ. 3) v = f × λ.',
    examples: [{ title: 'مثال', values: { f: 50, lambda: 6 }, steps: ['v = 50 × 6 = 300 m/s'] }],
    variables: [{ name: 'f', label: 'f' }, { name: 'lambda', label: 'λ' }],
    solve(values) {
      const f = Number(values.f), lambda = Number(values.lambda);
      if ([f, lambda].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = f * lambda;
      return { result: `v = ${fmt(result)} m/s`, steps: [`v = ${f} × ${lambda}`, `v = ${fmt(result)} m/s`] };
    },
  },
  {
    id: 'critical-angle',
    branchId: 'waves-optics',
    name: 'الزاوية الحرجة',
    formula: 'sin(θc) = n2 / n1',
    description: 'تُستخدم في الانكسار الكلي الداخلي، حيث n1 > n2.',
    method: '1) حدد معامل انكسار الوسط الأول n1. 2) حدد معامل انكسار الوسط الثاني n2. 3) θc = arcsin(n2/n1).',
    examples: [{ title: 'مثال', values: { n1: 1.5, n2: 1 }, steps: ['θc = arcsin(1/1.5) ≈ 41.81°'] }],
    variables: [{ name: 'n1', label: 'n₁' }, { name: 'n2', label: 'n₂' }],
    solve(values) {
      const n1 = Number(values.n1), n2 = Number(values.n2);
      if ([n1, n2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (n1 <= n2) return { result: 'n1 يجب أن يكون أكبر من n2', steps: [] };
      const ratio = n2 / n1;
      const result = toDeg(Math.asin(ratio));
      return { result: `θc = ${fmt(result)}°`, steps: [`sin(θc) = ${n2}/${n1} = ${fmt(ratio)}`, `θc = arcsin(${fmt(ratio)}) = ${fmt(result)}°`] };
    },
  },
  {
    id: 'voltage-divider',
    branchId: 'electricity',
    name: 'مقسم الجهد',
    formula: 'Vout = Vin * R2 / (R1 + R2)',
    description: 'يحسب الجهد الناتج عبر مقاومة في مقسم جهد.',
    method: '1) حدد الجهد الداخل Vin. 2) حدد R1 و R2. 3) Vout = Vin × R2/(R1+R2).',
    examples: [{ title: 'مثال', values: { Vin: 12, R1: 1000, R2: 2000 }, steps: ['Vout = 12 × 2000/3000 = 8 V'] }],
    applicationProblems: [
      {
        question: 'مقسم جهد R1=4kΩ و R2=6kΩ متصل بـ 10V. ما Vout؟',
        hint: 'Vout = 10 × 6000/(4000+6000).',
        answer: 'Vout = 6 V',
        variables: { Vin: 10, R1: 4000, R2: 6000 },
        expectedValue: 6,
      },
    ],
    variables: [{ name: 'Vin', label: 'Vin' }, { name: 'R1', label: 'R1' }, { name: 'R2', label: 'R2' }],
    solve(values) {
      const Vin = Number(values.Vin), R1 = Number(values.R1), R2 = Number(values.R2);
      if ([Vin, R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (Vin * R2) / (R1 + R2);
      return { result: `Vout = ${fmt(result)} V`, steps: [`Vout = ${Vin} × ${R2}/(${R1}+${R2})`, `Vout = ${fmt(result)} V`] };
    },
  },
  {
    id: 'resistivity',
    branchId: 'electricity',
    name: 'المقاومية',
    formula: 'R = ρL / A',
    description: 'تربط المقاومة بمقاومية المادة وطولها ومساحة مقطعها.',
    method: '1) حدد المقاومية ρ. 2) حدد الطول L. 3) حدد المساحة A. 4) R = ρL/A.',
    examples: [{ title: 'مثال', values: { rho: 1.68e-8, L: 2, A: 1e-6 }, steps: ['R ≈ 0.0336 Ω'] }],
    variables: [{ name: 'rho', label: 'ρ' }, { name: 'L', label: 'L' }, { name: 'A', label: 'A' }],
    solve(values) {
      const rho = Number(values.rho), L = Number(values.L), A = Number(values.A);
      if ([rho, L, A].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (A === 0) return { result: 'A يجب ألا يكون صفراً', steps: [] };
      const result = (rho * L) / A;
      return { result: `R = ${fmt(result)} Ω`, steps: [`R = ${rho} × ${L} / ${A}`, `R = ${fmt(result)} Ω`] };
    },
  },
  {
    id: 'magnetic-flux',
    branchId: 'electromagnetism',
    name: 'الف-flux المغناطيسي',
    formula: 'Φ = B * A * cos(θ)',
    description: 'يقيس عدد خطوط المجال المغناطيسي العابرة لسطح معين.',
    method: '1) حدد كثافة المجال B. 2) حدد مساحة السطح A. 3) حدد الزاوية θ بين المجال والعمود على السطح. 4) Φ = B × A × cos(θ).',
    examples: [{ title: 'مثال', values: { B: 0.5, A: 0.2, theta: 60 }, steps: ['Φ = 0.5 × 0.2 × cos(60°) = 0.05 Wb'] }],
    variables: [{ name: 'B', label: 'B' }, { name: 'A', label: 'A' }, { name: 'theta', label: 'θ°' }],
    solve(values) {
      const B = Number(values.B), A = Number(values.A), theta = Number(values.theta);
      if ([B, A, theta].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = B * A * Math.cos(toRad(theta));
      return { result: `Φ = ${fmt(result)} Wb`, steps: [`Φ = ${B} × ${A} × cos(${theta}°)`, `Φ = ${fmt(result)} Wb`] };
    },
  },
  {
    id: 'transformer',
    branchId: 'electromagnetism',
    name: 'نسبة المحولة',
    formula: 'V1 / V2 = N1 / N2',
    description: 'تربط بين الجهد وعدد اللفات في محولة مثالية.',
    method: '1) حدد V1 و N1. 2) حدد V2 أو N2. 3) V1/V2 = N1/N2.',
    examples: [{ title: 'مثال', values: { V1: 220, N1: 1000, N2: 100 }, steps: ['V2 = 220 × 100/1000 = 22 V'] }],
    variables: [{ name: 'V1', label: 'V1' }, { name: 'N1', label: 'N1' }, { name: 'N2', label: 'N2' }],
    solve(values) {
      const V1 = Number(values.V1), N1 = Number(values.N1), N2 = Number(values.N2);
      if ([V1, N1, N2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (N1 === 0) return { result: 'N1 يجب ألا يكون صفراً', steps: [] };
      const V2 = (V1 * N2) / N1;
      return { result: `V2 = ${fmt(V2)} V`, steps: [`V2 = ${V1} × ${N2}/${N1}`, `V2 = ${fmt(V2)} V`] };
    },
  },
  {
    id: 'specific-heat',
    branchId: 'heat',
    name: 'الحرارة النوية',
    formula: 'Q = mcΔT',
    description: 'تحسب الحرارة اللازمة لتغيير درجة حرارة جسم بكمية معينة.',
    method: '1) حدد الكتلة m. 2) حدد الحرارة النوية c. 3) حدد التغير في درجة الحرارة ΔT. 4) Q = m × c × ΔT.',
    examples: [{ title: 'مثال', values: { m: 0.5, c: 4186, deltaT: 10 }, steps: ['Q = 0.5 × 4186 × 10 = 20930 J'] }],
    applicationProblems: [
      {
        question: 'كم حرارة لازمة لتسخين 2 kg من الماء من 20°C إلى 80°C؟',
        hint: 'm=2، c=4186، ΔT=60.',
        answer: 'Q = 502320 J',
        variables: { m: 2, c: 4186, deltaT: 60 },
        expectedValue: 502320,
      },
    ],
    variables: [{ name: 'm', label: 'm' }, { name: 'c', label: 'c' }, { name: 'deltaT', label: 'ΔT' }],
    solve(values) {
      const m = Number(values.m), c = Number(values.c), deltaT = Number(values.deltaT);
      if ([m, c, deltaT].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = m * c * deltaT;
      return { result: `Q = ${fmt(result)} J`, steps: [`Q = ${m} × ${c} × ${deltaT}`, `Q = ${fmt(result)} J`] };
    },
  },
  {
    id: 'thermal-efficiency',
    branchId: 'heat',
    name: 'الكفاءة الحرارية',
    formula: 'η = 1 - Qc / Qh',
    description: 'تقيس نسبة الحرارة المفيدة إلى الحرارة المستهلكة في محرك حراري.',
    method: '1) حدد الحرارة المبذولة Qh. 2) حدد الحرارة المفقودة Qc. 3) η = 1 - Qc/Qh.',
    examples: [{ title: 'مثال', values: { Qc: 300, Qh: 1000 }, steps: ['η = 1 - 300/1000 = 0.7'] }],
    variables: [{ name: 'Qc', label: 'Qc' }, { name: 'Qh', label: 'Qh' }],
    solve(values) {
      const Qc = Number(values.Qc), Qh = Number(values.Qh);
      if ([Qc, Qh].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (Qh === 0) return { result: 'Qh يجب ألا يكون صفراً', steps: [] };
      const result = 1 - Qc / Qh;
      return { result: `η = ${fmt(result)} (${fmt(result * 100)}%)`, steps: [`η = 1 - ${Qc}/${Qh}`, `η = ${fmt(result)}`] };
    },
  },
  {
    id: 'quotient-rule',
    branchId: 'calculus',
    name: 'قاعدة خارج قسمة الدالتين',
    formula: "d/dx(u/v) = (u'v - uv') / v²",
    description: 'تُستخدم لاشتقاق خارج قسمة دالتين. الناتج هو دالة أخرى قابلة للاشتقاق.',
    method: '1) حدد u(x) و v(x). 2) اشتق كل منهما للحصول على u′ و v′. 3) طبق القاعدة: (u′v - uv′) / v².',
    examples: [{ title: 'مثال', values: { a: 2, b: 3 }, steps: ['d/dx(2x / 3x²) = (2*3x² - 2x*6x)/(3x²)² = -6x/9x⁴ = -2/(3x³)'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: 'معادلة توضيحية فقط', steps: ['استخدم u(x) و v(x) المناسبتين.'] };
    },
  },
  {
    id: 'integral-sin',
    branchId: 'calculus',
    name: 'تكامل الجيب',
    formula: '∫sin(x) dx = -cos(x) + C',
    description: 'يُستخدم لإيجاد تكامل دالة الجيب بالنسبة لـ x.',
    method: '1) تأكد أن الزاوية x بالراديان. 2) ∫sin(x) dx = -cos(x) + C.',
    examples: [{ title: 'مثال', values: { x: 1.571 }, steps: ['-cos(π/2) + C ≈ 0 + C'] }],
    variables: [{ name: 'x', label: 'x (راديان)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = -Math.cos(x);
      return { result: `∫sin(x) = ${fmt(result)} + C`, steps: [`∫sin(${x}) = -cos(${x})`, `= ${fmt(result)} + C`] };
    },
  },
  {
    id: 'surface-area-cylinder',
    branchId: 'geometry',
    name: 'المساحة الكلية للأسطوانة',
    formula: 'A = 2πr(r + h)',
    description: 'تحسب المساحة الكلية لأسطوانة دائرية قائمة، أي مجموع مساحتي القاعدتين والمساحة الجانبية.',
    method: '1) أوجد نصف القطر r. 2) أوجد الارتفاع h. 3) احسب A = 2πr² + 2πrh أو A = 2πr(r+h).',
    examples: [{ title: 'مثال', values: { r: 2, h: 5 }, steps: ['A = 2π×2×(2+5) ≈ 87.96'] }],
    variables: [{ name: 'r', label: 'r' }, { name: 'h', label: 'h' }],
    solve(values) {
      const r = Number(values.r), h = Number(values.h);
      if ([r, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = 2 * Math.PI * r * (r + h);
      return { result: `A = ${fmt(result)}`, steps: [`A = 2π × ${r} × (${r} + ${h})`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'area-parallelogram',
    branchId: 'geometry',
    name: 'مساحة متوازي الأضلاع',
    formula: 'A = b × h',
    description: 'يحسب مساحة متوازي الأضلاع باستخدام القاعدة والارتفاع العمودي عليها.',
    method: '1) حدد طول القاعدة b. 2) حدد الارتفاع h العمودي على القاعدة. 3) A = b × h.',
    examples: [{ title: 'مثال', values: { b: 7, h: 4 }, steps: ['A = 28'] }],
    applicationProblems: [
      {
        question: 'متوازي أضلاع قاعدته 9 سم وارتفاعه 5 سم. ما مساحته؟',
        hint: 'A = b × h.',
        answer: 'A = 45 سم²',
        variables: { b: 9, h: 5 },
        expectedValue: 45,
      },
    ],
    variables: [{ name: 'b', label: 'b' }, { name: 'h', label: 'h' }],
    solve(values) {
      const b = Number(values.b), h = Number(values.h);
      if ([b, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = b * h;
      return { result: `A = ${fmt(result)}`, steps: [`A = ${b} × ${h}`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'mirror-equation',
    branchId: 'waves-optics',
    name: 'معادلة المرآة الكروية',
    formula: '1/f = 1/u + 1/v',
    description: 'تربط بين البؤرة f وبعد الجسم u وبعد الصورة v في المرآة الكروية.',
    method: '1) حدد البعد البؤري f. 2) حدد بعد الجسم u. 3) أعد ترتيب المعادلة: 1/v = 1/f - 1/u.',
    examples: [{ title: 'مثال', values: { f: 10, u: 30 }, steps: ['1/v = 1/10 - 1/30 → v = 15'] }],
    variables: [{ name: 'f', label: 'f' }, { name: 'u', label: 'u' }],
    solve(values) {
      const f = Number(values.f), u = Number(values.u);
      if ([f, u].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (f === 0 || u === 0 || 1 / f - 1 / u === 0) return { result: 'قيم غير صالحة', steps: [] };
      const v = 1 / (1 / f - 1 / u);
      return { result: `v = ${fmt(v)}`, steps: [`1/v = 1/${f} - 1/${u}`, `v = ${fmt(v)}`] };
    },
  },
  {
    id: 'current-divider',
    branchId: 'electricity',
    name: 'مقسم التيار',
    formula: 'I1 = It * R2 / (R1 + R2)',
    description: 'يحسب التيار عبر أحد فرعين مقاومين متوازيين.',
    method: '1) حدد التيار الكلي It. 2) حدد المقاومتين R1 و R2. 3) I1 = It × R2/(R1+R2).',
    examples: [{ title: 'مثال', values: { It: 6, R1: 4, R2: 8 }, steps: ['I1 = 6 × 8/12 = 4 A'] }],
    variables: [{ name: 'It', label: 'It' }, { name: 'R1', label: 'R1' }, { name: 'R2', label: 'R2' }],
    solve(values) {
      const It = Number(values.It), R1 = Number(values.R1), R2 = Number(values.R2);
      if ([It, R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const I1 = (It * R2) / (R1 + R2);
      return { result: `I1 = ${fmt(I1)} A`, steps: [`I1 = ${It} × ${R2}/(${R1}+${R2})`, `I1 = ${fmt(I1)} A`] };
    },
  },
  {
    id: 'power-joule',
    branchId: 'electricity',
    name: 'قدرة التبديد الحراري',
    formula: 'P = I²R',
    description: 'تحسب القدرة المبدّدة على شكل حرارة في مقاومة عند مرور تيار.',
    method: '1) حدد التيار I. 2) حدد المقاومة R. 3) P = I² × R.',
    examples: [{ title: 'مثال', values: { I: 2, R: 5 }, steps: ['P = 4 × 5 = 20 W'] }],
    variables: [{ name: 'I', label: 'I' }, { name: 'R', label: 'R' }],
    solve(values) {
      const I = Number(values.I), R = Number(values.R);
      if ([I, R].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = I * I * R;
      return { result: `P = ${fmt(result)} W`, steps: [`P = ${I}² × ${R}`, `P = ${fmt(result)} W`] };
    },
  },
  {
    id: 'inductor-voltage',
    branchId: 'electromagnetism',
    name: 'جهد الملف الحثي',
    formula: 'V = L * dI/dt',
    description: 'يحسب الجهد الناتج عبر ملف حثي عند تغير التيار عبره.',
    method: '1) حدد معامل الحث L. 2) حدد معدل تغير التيار ΔI/Δt. 3) V = L × ΔI/Δt.',
    examples: [{ title: 'مثال', values: { L: 0.5, dI: 3, dt: 0.1 }, steps: ['V = 0.5 × 3/0.1 = 15 V'] }],
    variables: [{ name: 'L', label: 'L' }, { name: 'dI', label: 'ΔI' }, { name: 'dt', label: 'Δt' }],
    solve(values) {
      const L = Number(values.L), dI = Number(values.dI), dt = Number(values.dt);
      if ([L, dI, dt].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (dt === 0) return { result: 'Δt يجب ألا يكون صفراً', steps: [] };
      const result = L * (dI / dt);
      return { result: `V = ${fmt(result)} V`, steps: [`V = ${L} × ${dI}/${dt}`, `V = ${fmt(result)} V`] };
    },
  },
  {
    id: 'boyles-law',
    branchId: 'heat',
    name: 'قانون بويل',
    formula: 'P1V1 = P2V2',
    description: 'يصف العلاقة بين الضغط والحجم لغاز مثالي عند درجة حرارة ثابتة.',
    method: '1) حدد الضغط والحجم الابتدائيين P1 و V1. 2) حدد الضغط أو الحجم النهائي. 3) P1V1 = P2V2.',
    examples: [{ title: 'مثال', values: { P1: 100, V1: 2, P2: 200 }, steps: ['V2 = 100×2/200 = 1'] }],
    variables: [{ name: 'P1', label: 'P1' }, { name: 'V1', label: 'V1' }, { name: 'P2', label: 'P2' }],
    solve(values) {
      const P1 = Number(values.P1), V1 = Number(values.V1), P2 = Number(values.P2);
      if ([P1, V1, P2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (P2 === 0) return { result: 'P2 يجب ألا يكون صفراً', steps: [] };
      const V2 = (P1 * V1) / P2;
      return { result: `V2 = ${fmt(V2)}`, steps: [`V2 = ${P1}×${V1}/${P2}`, `V2 = ${fmt(V2)}`] };
    },
  },
  {
    id: 'sum-squares',
    branchId: 'number-theory',
    name: 'مجموع مربعات الأعداد الطبيعية',
    formula: 'Σk² = n(n+1)(2n+1)/6',
    description: 'يحسب مجموع مربعات الأعداد الطبيعية من 1 حتى n.',
    method: '1) حدد n. 2) احسب n(n+1)(2n+1). 3) اقسم على 6.',
    examples: [{ title: 'مثال', values: { n: 4 }, steps: ['Σ = 4×5×9/6 = 30'] }],
    applicationProblems: [
      {
        question: 'ما مجموع مربعات الأعداد من 1 إلى 10؟',
        hint: 'Σk² = n(n+1)(2n+1)/6 مع n=10.',
        answer: '385',
        variables: { n: 10 },
        expectedValue: 385,
      },
    ],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = (n * (n + 1) * (2 * n + 1)) / 6;
      return { result: `Σ = ${fmt(result)}`, steps: [`Σ = ${n}×(${n}+1)×(2×${n}+1)/6`, `Σ = ${fmt(result)}`] };
    },
  },
  {
    id: 'derivative-exp',
    branchId: 'calculus',
    name: 'مشتقة الدالة الأسيّة',
    formula: 'd/dx e^x = e^x',
    description: 'مشتقة الدالة الأسيّة الطبيعية تساوي نفسها. هذه خاصة فريدة للأس e.',
    method: 'd/dx(e^x) = e^x. لأي ثابت a، d/dx(a·e^x) = a·e^x.',
    examples: [{ title: 'مثال', values: { x: 0 }, steps: ['e^0 = 1'] }],
    graph: {
      label: 'y = e^x',
      xRange: [-3, 3],
      yRange: [0, 20],
      params: {},
      fn: (x) => Math.exp(x),
    },
    variables: [{ name: 'x', label: 'x' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = Math.exp(x);
      return { result: `e^${x} = ${fmt(result)}`, steps: [`d/dx(e^${x}) = e^${x}`, `e^${x} = ${fmt(result)}`] };
    },
  },
  {
    id: 'integral-exp',
    branchId: 'calculus',
    name: 'تكامل الدالة الأسيّة',
    formula: '∫e^x dx = e^x + C',
    description: 'تكامل الدالة الأسيّة الطبيعية يساوي نفسها زائد ثابت التكامل.',
    method: '1) أكد أن الدالة e^x. 2) ∫e^x dx = e^x + C.',
    examples: [{ title: 'مثال', values: { x: 1 }, steps: ['∫e^1 dx = e + C ≈ 2.718 + C'] }],
    variables: [{ name: 'x', label: 'x' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = Math.exp(x);
      return { result: `∫e^x = ${fmt(result)} + C`, steps: [`∫e^${x} = e^${x} + C`, `= ${fmt(result)} + C`] };
    },
  },
  {
    id: 'derivative-tan',
    branchId: 'calculus',
    name: 'مشتقة الظل',
    formula: 'd/dx tan(x) = sec²(x)',
    description: 'مشتقة دالة الظل هي مربع القاطع. x بالراديان.',
    method: 'd/dx(tan(x)) = sec²(x) = 1/cos²(x).',
    examples: [{ title: 'مثال', values: { x: 0 }, steps: ['sec²(0) = 1'] }],
    variables: [{ name: 'x', label: 'x (راديان)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const cosx = Math.cos(x);
      if (cosx === 0) return { result: 'غير معرف عند هذه القيمة', steps: [] };
      const result = 1 / (cosx * cosx);
      return { result: `sec²(${x}) = ${fmt(result)}`, steps: [`d/dx(tan(${x})) = 1/cos²(${x})`, `= ${fmt(result)}`] };
    },
  },
  {
    id: 'distance-formula',
    branchId: 'geometry',
    name: 'المسافة بين نقطتين',
    formula: 'd = √((x2-x1)² + (y2-y1)²)',
    description: 'تحسب المسافة الأفقية بين نقطتين في المستوى الإحداثي. مشتقة من نظرية فيثاغورس.',
    method: '1) حدد إحداثيات النقطة الأولى (x1,y1). 2) حدد إحداثيات النقطة الثانية (x2,y2). 3) d = √((x2-x1)² + (y2-y1)²).',
    examples: [{ title: 'مثال', values: { x1: 0, y1: 0, x2: 3, y2: 4 }, steps: ['d = √(9+16) = 5'] }],
    applicationProblems: [
      {
        question: 'ما المسافة بين (1,2) و (4,6)؟',
        hint: 'd = √((4-1)² + (6-2)²).',
        answer: 'd = 5',
        variables: { x1: 1, y1: 2, x2: 4, y2: 6 },
        expectedValue: 5,
      },
    ],
    variables: [{ name: 'x1', label: 'x1' }, { name: 'y1', label: 'y1' }, { name: 'x2', label: 'x2' }, { name: 'y2', label: 'y2' }],
    solve(values) {
      const x1 = Number(values.x1), y1 = Number(values.y1), x2 = Number(values.x2), y2 = Number(values.y2);
      if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return { result: `d = ${fmt(result)}`, steps: [`d = √((${x2} - ${x1})² + (${y2} - ${y1})²)`, `d = ${fmt(result)}`] };
    },
  },
  {
    id: 'midpoint',
    branchId: 'geometry',
    name: 'نقطة المنتصف',
    formula: 'M = ((x1+x2)/2, (y1+y2)/2)',
    description: 'تحديد إحداثيات نقطة المنتصف بين نقطتين في المستوى الإحداثي.',
    method: '1) أوجد متوسط الإحداثيات السينية: (x1+x2)/2. 2) أوجد متوسط الإحداثيات الصادية: (y1+y2)/2.',
    examples: [{ title: 'مثال', values: { x1: 2, y1: 4, x2: 6, y2: 8 }, steps: ['M = (4, 6)'] }],
    variables: [{ name: 'x1', label: 'x1' }, { name: 'y1', label: 'y1' }, { name: 'x2', label: 'x2' }, { name: 'y2', label: 'y2' }],
    solve(values) {
      const x1 = Number(values.x1), y1 = Number(values.y1), x2 = Number(values.x2), y2 = Number(values.y2);
      if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `M = (${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`, steps: [`M = ((${x1}+${x2})/2, (${y1}+${y2})/2)`, `M = (${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`] };
    },
  },
  {
    id: 'double-angle-cos',
    branchId: 'trigonometry',
    name: 'صيغة جيب التمام المضاعف',
    formula: 'cos(2x) = cos²(x) - sin²(x)',
    description: 'تربط cos(2x) بـ cos(x) و sin(x). يمكن كتابتها أيضاً كـ 2cos²(x)-1 أو 1-2sin²(x).',
    method: '1) حدد x بالدرجات. 2) احسب cos(x) و sin(x). 3) cos(2x) = cos²(x) - sin²(x).',
    examples: [{ title: 'مثال', values: { x: 30 }, steps: ['cos(60°) = 0.75 - 0.25 = 0.5'] }],
    variables: [{ name: 'x', label: 'x (درجات)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = Math.cos(toRad(x)) ** 2 - Math.sin(toRad(x)) ** 2;
      return { result: `cos(2×${x}°) = ${fmt(result)}`, steps: [`cos(2×${x}°) = cos²(${x}°) - sin²(${x}°)`, `= ${fmt(result)}`] };
    },
  },
  {
    id: 'tan-sum',
    branchId: 'trigonometry',
    name: 'صيغة جمع الظل',
    formula: 'tan(A+B) = (tan(A)+tan(B))/(1-tan(A)tan(B))',
    description: 'تحسب ظل مجموع زاويتين باستخدام ظل كل منهما. تُستخدم في تبسيط التعبيرات المثلثية.',
    method: '1) حدد A و B بالدرجات. 2) احسب tan(A) و tan(B). 3) استخدم الصيغة: (tanA+tanB)/(1-tanA·tanB).',
    examples: [{ title: 'مثال', values: { A: 30, B: 45 }, steps: ['tan(75°) ≈ 3.732'] }],
    variables: [{ name: 'A', label: 'A°' }, { name: 'B', label: 'B°' }],
    solve(values) {
      const A = Number(values.A), B = Number(values.B);
      if ([A, B].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const tanA = Math.tan(toRad(A)), tanB = Math.tan(toRad(B));
      const denom = 1 - tanA * tanB;
      if (denom === 0) return { result: 'غير معرف عند هذه القيم', steps: [] };
      const result = (tanA + tanB) / denom;
      return { result: `tan(${A}°+${B}°) = ${fmt(result)}`, steps: [`tan(${A}°+${B}°) = (${fmt(tanA)} + ${fmt(tanB)}) / (1 - ${fmt(tanA)}×${fmt(tanB)})`, `= ${fmt(result)}`] };
    },
  },
  {
    id: 'conditional-probability',
    branchId: 'statistics',
    name: 'الاحتمال الشرطي',
    formula: 'P(A|B) = P(A∩B) / P(B)',
    description: 'يحسب احتمال وقوع حدث A بشرط أن يكون B قد وقع.',
    method: '1) حدد P(B) (> 0). 2) حدد P(A∩B). 3) P(A|B) = P(A∩B) / P(B).',
    examples: [{ title: 'مثال', values: { pAB: 0.2, pB: 0.5 }, steps: ['P(A|B) = 0.2/0.5 = 0.4'] }],
    variables: [{ name: 'pAB', label: 'P(A∩B)' }, { name: 'pB', label: 'P(B)' }],
    solve(values) {
      const pAB = Number(values.pAB), pB = Number(values.pB);
      if ([pAB, pB].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (pB === 0) return { result: 'P(B) يجب ألا يكون صفراً', steps: [] };
      const result = pAB / pB;
      return { result: `P(A|B) = ${fmt(result)}`, steps: [`P(A|B) = ${pAB}/${pB}`, `P(A|B) = ${fmt(result)}`] };
    },
  },
  {
    id: 'variance',
    branchId: 'statistics',
    name: 'التباين',
    formula: 'σ² = Σ(x - μ)² / N',
    description: 'يقيس مدى انتشار البيانات حول المتوسط. مربع الانحراف المعياري.',
    method: '1) أوجد المتوسط μ. 2) اطرح المتوسط من كل قيمة وربّع الفرق. 3) اجمع واقسم على عدد القيم N.',
    examples: [{ title: 'مثال', values: { numbers: '2,4,4,6,8' }, steps: ['μ=4.8, σ²=3.44'] }],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0) return { result: 'أدخل أرقاماً', steps: [] };
      const mean = numbers.reduce((s, n) => s + n, 0) / numbers.length;
      const variance = numbers.reduce((s, n) => s + (n - mean) ** 2, 0) / numbers.length;
      return { result: `σ² = ${fmt(variance)}`, steps: [`μ = ${fmt(mean)}`, `σ² = Σ(x - μ)² / ${numbers.length}`, `σ² = ${fmt(variance)}`] };
    },
  },
  {
    id: 'modular',
    branchId: 'number-theory',
    name: 'النموذج الحسابي',
    formula: 'a mod m = r',
    description: 'يحسب باقي قسمة a على m. يُستخدم في التشفير، جداول الأوقات، والنماذج الدورية.',
    method: '1) قسّم a على m. 2) الباقي r هو الناتج: a mod m. 3) 0 ≤ r < m.',
    examples: [{ title: 'مثال', values: { a: 17, m: 5 }, steps: ['17 mod 5 = 2'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'm', label: 'm' }],
    solve(values) {
      const a = Number(values.a), m = Number(values.m);
      if ([a, m].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (m === 0) return { result: 'm يجب ألا يكون صفراً', steps: [] };
      const result = ((a % m) + m) % m;
      return { result: `${a} mod ${m} = ${fmt(result)}`, steps: [`${a} ÷ ${m} = ${Math.floor(a/m)} باقي ${fmt(result)}`, `${a} mod ${m} = ${fmt(result)}`] };
    },
  },
  {
    id: 'prime-check',
    branchId: 'number-theory',
    name: 'التحقق من العدد الأولي',
    formula: 'first n > 1 with no divisors except 1 and itself',
    description: 'يتحقق ما إذا كان عدد أكبر من 1 أولياً (لا يقبل القسمة إلا على 1 ونفسه).',
    method: '1) إذا كان n ≤ 1 فهو غير أولي. 2) اختبر القسمة على الأعداد من 2 إلى √n. 3) إذا لم يوجد قاسم، فالعدد أولي.',
    examples: [{ title: 'مثال', values: { n: 17 }, steps: ['17 أولي'] }],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (!Number.isInteger(n)) return { result: 'n يجب أن يكون عدداً صحيحاً', steps: [] };
      if (n <= 1) return { result: 'غير أولي', steps: ['n ≤ 1 → غير أولي'] };
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return { result: 'غير أولي', steps: [`${n} يقبل القسمة على ${i}`, 'إذن ليس أولياً'] };
      }
      return { result: 'أولي', steps: [`${n} لا يقبل القسمة على أي عدد بين 2 و √${n}`, 'إذن العدد أولي'] };
    },
  },
  {
    id: 'displacement-uvt',
    branchId: 'mechanics',
    name: 'الإزاحة باستخدام السرعتين',
    formula: 's = (u + v)/2 * t',
    description: 'تحسب إزاحة الجسم عندما نعرف السرعة الابتدائية والنهائية والزمن.',
    method: '1) حدد السرعة الابتدائية u. 2) حدد السرعة النهائية v. 3) حدد الزمن t. 4) s = ((u+v)/2) × t.',
    examples: [{ title: 'مثال', values: { u: 2, v: 8, t: 5 }, steps: ['s = (2+8)/2 × 5 = 25'] }],
    variables: [{ name: 'u', label: 'u' }, { name: 'v', label: 'v' }, { name: 't', label: 't' }],
    solve(values) {
      const u = Number(values.u), v = Number(values.v), t = Number(values.t);
      if ([u, v, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = ((u + v) / 2) * t;
      return { result: `s = ${fmt(result)}`, steps: [`s = (${u} + ${v})/2 × ${t}`, `s = ${fmt(result)}`] };
    },
  },
  {
    id: 'projectile-range',
    branchId: 'mechanics',
    name: 'مدى القذيفة',
    formula: 'R = (v² sin(2θ)) / g',
    description: 'يحسب المدى الأفقي الأقصى لقذيفة أطلقت بسرعة زاوية من سطح أفقي.',
    method: '1) حدد السرعة الابتدائية v. 2) حدد زاوية الإطلاق θ بالدرجات. 3) R = v² × sin(2θ) / g.',
    examples: [{ title: 'مثال', values: { v: 20, theta: 45, g: 9.8 }, steps: ['R = 400 × sin(90°) / 9.8 ≈ 40.82'] }],
    constants: [{ label: 'g', value: '9.8 m/s²', description: 'تسارع الجاذبية الأرضية' }],
    variables: [{ name: 'v', label: 'v' }, { name: 'theta', label: 'θ°' }, { name: 'g', label: 'g' }],
    solve(values) {
      const v = Number(values.v), theta = Number(values.theta), g = Number(values.g);
      if ([v, theta, g].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (g === 0) return { result: 'g يجب ألا يكون صفراً', steps: [] };
      const result = (v * v * Math.sin(2 * toRad(theta))) / g;
      return { result: `R = ${fmt(result)} m`, steps: [`R = ${v}² × sin(2×${theta}°) / ${g}`, `R = ${fmt(result)} m`] };
    },
  },
  {
    id: 'doppler-effect',
    branchId: 'waves-optics',
    name: 'تأثير دوبلر (الموجات الصوتية)',
    formula: 'f\' = f * (v ± vo) / (v ∓ vs)',
    description: 'يحسب التغير في التردد الملاحظ عندما يتحرك المصدر أو الملاحظ.',
    method: '1) حدد التردد الأصلي f. 2) حدد سرعة الصوت v. 3) حدد سرعة الملاحظ vo (موجب نحو المصدر). 4) حدد سرعة المصدر vs (موجب بعيداً). 5) f\' = f(v+vo)/(v-vs).',
    examples: [{ title: 'مثال', values: { f: 500, v: 340, vo: 0, vs: 34 }, steps: ['f\' = 500 × 340/(340-34) ≈ 555.56'] }],
    variables: [{ name: 'f', label: 'f' }, { name: 'v', label: 'v' }, { name: 'vo', label: 'vo' }, { name: 'vs', label: 'vs' }],
    solve(values) {
      const f = Number(values.f), v = Number(values.v), vo = Number(values.vo), vs = Number(values.vs);
      if ([f, v, vo, vs].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const denom = v - vs;
      if (denom === 0) return { result: 'قيم غير صالحة', steps: [] };
      const result = f * (v + vo) / denom;
      return { result: `f' = ${fmt(result)} Hz`, steps: [`f' = ${f} × (${v} + ${vo}) / (${v} - ${vs})`, `f' = ${fmt(result)} Hz`] };
    },
  },
  {
    id: 'charles-law',
    branchId: 'heat',
    name: 'قانون شارل',
    formula: 'V1/T1 = V2/T2',
    description: 'يصف العلاقة بين الحجم ودرجة الحرارة المطلقة لغاز مثالي عند ضغط ثابت.',
    method: '1) حدد الحجم والحرارة الابتدائيين V1 و T1 (بالكلفن). 2) حدد الحجم أو الحرارة النهائي. 3) V1/T1 = V2/T2.',
    examples: [{ title: 'مثال', values: { V1: 2, T1: 300, T2: 400 }, steps: ['V2 = 2×400/300 ≈ 2.667'] }],
    variables: [{ name: 'V1', label: 'V1' }, { name: 'T1', label: 'T1' }, { name: 'T2', label: 'T2' }],
    solve(values) {
      const V1 = Number(values.V1), T1 = Number(values.T1), T2 = Number(values.T2);
      if ([V1, T1, T2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (T1 === 0) return { result: 'T1 يجب ألا يكون صفراً', steps: [] };
      const V2 = (V1 * T2) / T1;
      return { result: `V2 = ${fmt(V2)}`, steps: [`V2 = ${V1}×${T2}/${T1}`, `V2 = ${fmt(V2)}`] };
    },
  },
  {
    id: 'lorentz-force',
    branchId: 'electromagnetism',
    name: 'قوة لورنتز',
    formula: 'F = q(v × B)',
    description: 'تحسب القوة المؤثرة على شحنة متحركة داخل مجال مغناطيسي.',
    method: '1) حدد الشحنة q. 2) حدد سرعة الشحنة v. 3) حدد كثافة المجال B. 4) إذا كانت v عمودية على B: F = qvB.',
    examples: [{ title: 'مثال', values: { q: 1e-6, v: 200, B: 0.5 }, steps: ['F = 1e-6 × 200 × 0.5 = 1e-4 N'] }],
    variables: [{ name: 'q', label: 'q' }, { name: 'v', label: 'v' }, { name: 'B', label: 'B' }],
    solve(values) {
      const q = Number(values.q), v = Number(values.v), B = Number(values.B);
      if ([q, v, B].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = q * v * B;
      return { result: `F = ${fmt(result)} N`, steps: [`F = ${q} × ${v} × ${B}`, `F = ${fmt(result)} N`] };
    },
  },
  {
    id: 'rc-time-constant',
    branchId: 'electricity',
    name: 'ثابت زمن الدائرة RC',
    formula: 'τ = RC',
    description: 'يحسب الوقت اللازم لشحن أو تفريغ مكثف عبر مقاومة إلى حوالي 63% من التغير الكلي.',
    method: '1) حدد المقاومة R. 2) حدد السعة C. 3) τ = R × C.',
    examples: [{ title: 'مثال', values: { R: 1000, C: 0.001 }, steps: ['τ = 1000 × 0.001 = 1 s'] }],
    variables: [{ name: 'R', label: 'R' }, { name: 'C', label: 'C' }],
    solve(values) {
      const R = Number(values.R), C = Number(values.C);
      if ([R, C].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = R * C;
      return { result: `τ = ${fmt(result)} s`, steps: [`τ = ${R} × ${C}`, `τ = ${fmt(result)} s`] };
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
    id: 'volume-pyramid',
    branchId: 'geometry',
    name: 'حجم الهرم',
    formula: 'V = (1/3)Bh',
    description: 'يحسب حجم الهرم باستخدام مساحة القاعدة والارتفاع. ينطبق على أهرامات بأي شكل قاعدة.',
    method: '1) أوجد مساحة قاعدة الهرم B. 2) أوجد الارتفاع العمودي h. 3) V = (1/3) × B × h.',
    examples: [{ title: 'مثال', values: { B: 9, h: 4 }, steps: ['V = (1/3) × 9 × 4 = 12'] }],
    variables: [{ name: 'B', label: 'B' }, { name: 'h', label: 'h' }],
    solve(values) {
      const B = Number(values.B), h = Number(values.h);
      if ([B, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (1 / 3) * B * h;
      return { result: `V = ${fmt(result)}`, steps: [`V = (1/3) × ${B} × ${h}`, `V = ${fmt(result)}`] };
    },
  },
  {
    id: 'area-sector',
    branchId: 'geometry',
    name: 'مساحة القطاع الدائري',
    formula: 'A = (θ/360) × πr²',
    description: 'يحسب مساحة قطاع دائري محصور بين زاوية مركزية وقوسها.',
    method: '1) حدد زاوية القطاع θ بالدرجات. 2) حدد نصف القطر r. 3) A = (θ/360) × πr².',
    examples: [{ title: 'مثال', values: { theta: 90, r: 4 }, steps: ['A = (90/360) × π × 16 ≈ 12.566'] }],
    variables: [{ name: 'theta', label: 'θ°' }, { name: 'r', label: 'r' }],
    solve(values) {
      const theta = Number(values.theta), r = Number(values.r);
      if ([theta, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (theta / 360) * Math.PI * r * r;
      return { result: `A = ${fmt(result)}`, steps: [`A = (${theta}/360) × π × ${r}²`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'sum-cubes',
    branchId: 'number-theory',
    name: 'مجموع مكعبات الأعداد الطبيعية',
    formula: 'Σk³ = (n(n+1)/2)²',
    description: 'يحسب مجموع مكعبات الأعداد من 1 إلى n. يساوي دائماً مربع مجموع الأعداد نفسها.',
    method: '1) أوجد مجموع الأعداد من 1 إلى n: S = n(n+1)/2. 2) ارفع الناتج للأس 2.',
    examples: [{ title: 'مثال', values: { n: 3 }, steps: ['Σ = (3×4/2)² = 36'] }],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const s = (n * (n + 1)) / 2;
      const result = s * s;
      return { result: `Σ = ${fmt(result)}`, steps: [`S = ${n}×(${n}+1)/2 = ${fmt(s)}`, `Σ = ${fmt(s)}² = ${fmt(result)}`] };
    },
  },
  {
    id: 'expected-value',
    branchId: 'statistics',
    name: 'القيمة المتوقعة',
    formula: 'E(X) = Σ x_i · P(x_i)',
    description: 'تحسب المتوسط المرجّح لنتائج متغير عشوائي، حيث تُضرب كل قيمة باحتمال حدوثها.',
    method: '1) أدخل القيم مفصولة بفواصل. 2) أدخل احتمالاتها المقابلة. 3) اضرب كل قيمة في احتمالها واجمع.',
    examples: [{ title: 'مثال', values: { values: '1,2,3', probabilities: '0.2,0.5,0.3' }, steps: ['E = 1×0.2 + 2×0.5 + 3×0.3 = 2.1'] }],
    variables: [{ name: 'values', label: 'القيم', type: 'list' }, { name: 'probabilities', label: 'الاحتمالات', type: 'list' }],
    solve(values) {
      const xs = parseNumbers(values.values ?? ''), ps = parseNumbers(values.probabilities ?? '');
      if (xs.length === 0 || xs.length !== ps.length) return { result: 'أدخل قيم واحتمالات متطابقة', steps: [] };
      if (ps.reduce((s, p) => s + p, 0) !== 1) return { result: 'مجموع الاحتمالات يجب أن يساوي 1', steps: [] };
      const result = xs.reduce((s, x, i) => s + x * ps[i], 0);
      return { result: `E(X) = ${fmt(result)}`, steps: [`E = ${xs.map((x, i) => `${x}×${ps[i]}`).join(' + ')}`, `E = ${fmt(result)}`] };
    },
  },
  {
    id: 'geometric-mean',
    branchId: 'statistics',
    name: 'المتوسط الهندسي',
    formula: 'GM = (Πx_i)^(1/n)',
    description: 'يحسب المتوسط المناسب للأرقام المضاعفة أو النسب المئوية. الجذر n للحاصل الضربي.',
    method: '1) أدخل الأرقام مفصولة بفواصل. 2) اضربها معاً. 3) خذ الجذر n للحاصل.',
    examples: [{ title: 'مثال', values: { numbers: '2,8' }, steps: ['GM = √(2×8) = 4'] }],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0 || numbers.some((n) => n <= 0)) return { result: 'أدخل أرقاماً موجبة', steps: [] };
      const product = numbers.reduce((s, n) => s * n, 1);
      const result = product ** (1 / numbers.length);
      return { result: `GM = ${fmt(result)}`, steps: [`GM = (${numbers.join(' × ')})^(1/${numbers.length})`, `GM = ${fmt(result)}`] };
    },
  },
  {
    id: 'capacitor-energy',
    branchId: 'electricity',
    name: 'طاقة المكثف',
    formula: 'E = 0.5CV²',
    description: 'تحسب الطاقة المختزنة في مكثف مشحون. تزداد مع السعة ومربع الجهد.',
    method: '1) حدد السعة C. 2) حدد الجهد V عبر المكثف. 3) E = 0.5 × C × V².',
    examples: [{ title: 'مثال', values: { C: 0.001, V: 100 }, steps: ['E = 0.5 × 0.001 × 10000 = 5 J'] }],
    variables: [{ name: 'C', label: 'C' }, { name: 'V', label: 'V' }],
    solve(values) {
      const C = Number(values.C), V = Number(values.V);
      if ([C, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = 0.5 * C * V * V;
      return { result: `E = ${fmt(result)} J`, steps: [`E = 0.5 × ${C} × ${V}²`, `E = ${fmt(result)} J`] };
    },
  },
  {
    id: 'capacitors-parallel',
    branchId: 'electricity',
    name: 'مكثفات على التوازي',
    formula: 'Ceq = C1 + C2 + C3',
    description: 'يحسب السعة المكافئة لمكثفات متصلة على التوازي. الجهد متساوٍ عبرها.',
    method: '1) حدد قيم السعات. 2) اجمعها: Ceq = C1 + C2 + ... + Cn.',
    examples: [{ title: 'مثال', values: { c1: 2, c2: 3, c3: 5 }, steps: ['Ceq = 2 + 3 + 5 = 10 F'] }],
    variables: [{ name: 'c1', label: 'C1' }, { name: 'c2', label: 'C2' }, { name: 'c3', label: 'C3' }],
    solve(values) {
      const c1 = Number(values.c1), c2 = Number(values.c2), c3 = Number(values.c3);
      if ([c1, c2, c3].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = c1 + c2 + c3;
      return { result: `Ceq = ${fmt(result)} F`, steps: [`Ceq = ${c1} + ${c2} + ${c3}`, `Ceq = ${fmt(result)} F`] };
    },
  },
  {
    id: 'gay-lussac-law',
    branchId: 'heat',
    name: 'قانون غاي-لوساك',
    formula: 'P1/T1 = P2/T2',
    description: 'يصف العلاقة بين الضغط ودرجة الحرارة المطلقة لغاز مثالي عند حجم ثابت.',
    method: '1) حدد الضغط والحرارة الابتدائيين P1 و T1 (بالكلفن). 2) حدد الضغط أو الحرارة النهائي. 3) P1/T1 = P2/T2.',
    examples: [{ title: 'مثال', values: { P1: 100, T1: 300, T2: 400 }, steps: ['P2 = 100×400/300 ≈ 133.33'] }],
    variables: [{ name: 'P1', label: 'P1' }, { name: 'T1', label: 'T1' }, { name: 'T2', label: 'T2' }],
    solve(values) {
      const P1 = Number(values.P1), T1 = Number(values.T1), T2 = Number(values.T2);
      if ([P1, T1, T2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (T1 === 0) return { result: 'T1 يجب ألا يكون صفراً', steps: [] };
      const P2 = (P1 * T2) / T1;
      return { result: `P2 = ${fmt(P2)}`, steps: [`P2 = ${P1}×${T2}/${T1}`, `P2 = ${fmt(P2)}`] };
    },
  },
  {
    id: 'centripetal-force',
    branchId: 'mechanics',
    name: 'القوة المحيطية',
    formula: 'F = mv² / r',
    description: 'تحسب القوة المطلوبة لإبقاء جسم في حركة دائرية بسرعة ثابتة. تتجه نحو مركز الدائرة.',
    method: '1) حدد كتلة الجسم m. 2) حدد سرعته v. 3) حدد نصف قطر المسار r. 4) F = m × v² / r.',
    examples: [{ title: 'مثال', values: { m: 2, v: 5, r: 1 }, steps: ['F = 2 × 25 / 1 = 50 N'] }],
    variables: [{ name: 'm', label: 'm' }, { name: 'v', label: 'v' }, { name: 'r', label: 'r' }],
    solve(values) {
      const m = Number(values.m), v = Number(values.v), r = Number(values.r);
      if ([m, v, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (r === 0) return { result: 'r يجب ألا يكون صفراً', steps: [] };
      const result = (m * v * v) / r;
      return { result: `F = ${fmt(result)} N`, steps: [`F = ${m}×${v}²/${r}`, `F = ${fmt(result)} N`] };
    },
  },
  {
    id: 'impulse',
    branchId: 'mechanics',
    name: 'الدفع',
    formula: 'J = FΔt = Δp',
    description: 'يحسب التغير في الزخم الناتج عن قوة تؤثر لفترة زمنية. يساوي مساحة المنحنى تحت قوة-زمن.',
    method: '1) حدد القوة F. 2) حدد الزمن Δt. 3) J = F × Δt. الناتج يساوي Δp = mΔv.',
    examples: [{ title: 'مثال', values: { F: 10, dt: 0.5 }, steps: ['J = 10 × 0.5 = 5 N·s'] }],
    variables: [{ name: 'F', label: 'F' }, { name: 'dt', label: 'Δt' }],
    solve(values) {
      const F = Number(values.F), dt = Number(values.dt);
      if ([F, dt].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = F * dt;
      return { result: `J = ${fmt(result)} N·s`, steps: [`J = ${F} × ${dt}`, `J = ${fmt(result)} N·s`] };
    },
  },
  {
    id: 'lens-magnification',
    branchId: 'waves-optics',
    name: 'تكبير العدسة',
    formula: 'M = -v / u',
    description: 'يحسب نسبة ارتفاع الصورة إلى ارتفاع الجسم. الإشارة السالبة تشير إلى انعكاس الصورة.',
    method: '1) حدد بعد الصورة v. 2) حدد بعد الجسم u. 3) M = -v/u. |M| < 1 تصغير، |M| > 1 تكبير.',
    examples: [{ title: 'مثال', values: { v: 30, u: 10 }, steps: ['M = -30/10 = -3 (تكبير 3×)'] }],
    variables: [{ name: 'v', label: 'v' }, { name: 'u', label: 'u' }],
    solve(values) {
      const v = Number(values.v), u = Number(values.u);
      if ([v, u].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (u === 0) return { result: 'u يجب ألا يكون صفراً', steps: [] };
      const result = -v / u;
      return { result: `M = ${fmt(result)}`, steps: [`M = -${v}/${u}`, `M = ${fmt(result)}`] };
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
    id: 'diagonal-rectangle',
    branchId: 'geometry',
    name: 'قطر المستطيل',
    formula: 'd = √(l² + w²)',
    description: 'يحسب طول القطر في مستطيل باستخدام طوله وعرضه. مشتقة مباشرة من نظرية فيثاغورس.',
    method: '1) حدد الطول l. 2) حدد العرض w. 3) d = √(l² + w²).',
    examples: [{ title: 'مثال', values: { l: 6, w: 8 }, steps: ['d = √(36+64) = 10'] }],
    applicationProblems: [
      {
        question: 'ما طول قطر شاشة مستطيلة أبعادها 16 و 9؟',
        hint: 'd = √(16² + 9²).',
        answer: 'd = √337 ≈ 18.36',
        variables: { l: 16, w: 9 },
        expectedValue: 18.36,
      },
    ],
    variables: [{ name: 'l', label: 'l' }, { name: 'w', label: 'w' }],
    solve(values) {
      const l = Number(values.l), w = Number(values.w);
      if ([l, w].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.sqrt(l * l + w * w);
      return { result: `d = ${fmt(result)}`, steps: [`d = √(${l}² + ${w}²)`, `d = ${fmt(result)}`] };
    },
  },
  {
    id: 'surface-area-cone',
    branchId: 'geometry',
    name: 'المساحة الكلية للمخروط',
    formula: 'A = πr(r + l)',
    description: 'تحسب المساحة الكلية لمخروط، أي مجموع مساحة القاعدة والمساحة الجانبية، حيث l هو طول الضلع الجانبي.',
    method: '1) حدد نصف قطر القاعدة r. 2) حدد طول الضلع الجانبي l. 3) A = πr(r + l).',
    examples: [{ title: 'مثال', values: { r: 3, l: 5 }, steps: ['A = π×3×(3+5) ≈ 75.4'] }],
    variables: [{ name: 'r', label: 'r' }, { name: 'l', label: 'l' }],
    solve(values) {
      const r = Number(values.r), l = Number(values.l);
      if ([r, l].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.PI * r * (r + l);
      return { result: `A = ${fmt(result)}`, steps: [`A = π × ${r} × (${r} + ${l})`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'arc-length',
    branchId: 'geometry',
    name: 'طول القوس',
    formula: 's = (θ/360) × 2πr',
    description: 'يحسب طول قوس دائري محصور بزاوية مركزية θ بالدرجات ونصف قطر r.',
    method: '1) حدد الزاوية المركزية θ بالدرجات. 2) حدد نصف القطر r. 3) s = (θ/360) × 2πr.',
    examples: [{ title: 'مثال', values: { theta: 90, r: 4 }, steps: ['s = (90/360) × 2π×4 ≈ 6.283'] }],
    variables: [{ name: 'theta', label: 'θ°' }, { name: 'r', label: 'r' }],
    solve(values) {
      const theta = Number(values.theta), r = Number(values.r);
      if ([theta, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (theta / 360) * 2 * Math.PI * r;
      return { result: `s = ${fmt(result)}`, steps: [`s = (${theta}/360) × 2π × ${r}`, `s = ${fmt(result)}`] };
    },
  },
  {
    id: 'ellipse-area',
    branchId: 'geometry',
    name: 'مساحة القطع الناقص',
    formula: 'A = πab',
    description: 'يحسب مساحة قطع ناقص بمحورين شبه قطرهما a و b. يعمم دائرة عند a = b = r.',
    method: '1) حدد نصف المحور الأكبر a. 2) حدد نصف المحور الأصغر b. 3) A = π × a × b.',
    examples: [{ title: 'مثال', values: { a: 5, b: 3 }, steps: ['A = π×5×3 ≈ 47.12'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.PI * a * b;
      return { result: `A = ${fmt(result)}`, steps: [`A = π × ${a} × ${b}`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'half-angle-sin',
    branchId: 'trigonometry',
    name: 'صيغة نصف الزاوية للجيب',
    formula: 'sin(x/2) = ±√((1-cos(x))/2)',
    description: 'تربط sin(x/2) بـ cos(x). الإشارة تعتمد على ربع الزاوية x/2.',
    method: '1) حدد x بالدرجات. 2) احسب cos(x). 3) sin(x/2) = ±√((1 - cos(x))/2).',
    examples: [{ title: 'مثال', values: { x: 60 }, steps: ['sin(30°) = √((1-0.5)/2) = 0.5'] }],
    variables: [{ name: 'x', label: 'x (درجات)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const c = Math.cos(toRad(x));
      const result = Math.sqrt((1 - c) / 2);
      return { result: `sin(${x/2}°) = ${fmt(result)}`, steps: [`sin(${x/2}°) = √((1 - ${fmt(c)})/2)`, `sin(${x/2}°) = ${fmt(result)}`] };
    },
  },
  {
    id: 'half-angle-cos',
    branchId: 'trigonometry',
    name: 'صيغة نصف الزاوية لجيب التمام',
    formula: 'cos(x/2) = ±√((1+cos(x))/2)',
    description: 'تربط cos(x/2) بـ cos(x). الإشارة تعتمد على ربع الزاوية x/2.',
    method: '1) حدد x بالدرجات. 2) احسب cos(x). 3) cos(x/2) = ±√((1 + cos(x))/2).',
    examples: [{ title: 'مثال', values: { x: 60 }, steps: ['cos(30°) = √((1+0.5)/2) ≈ 0.866'] }],
    variables: [{ name: 'x', label: 'x (درجات)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const c = Math.cos(toRad(x));
      const result = Math.sqrt((1 + c) / 2);
      return { result: `cos(${x/2}°) = ${fmt(result)}`, steps: [`cos(${x/2}°) = √((1 + ${fmt(c)})/2)`, `cos(${x/2}°) = ${fmt(result)}`] };
    },
  },
  {
    id: 'cosecant-angle',
    branchId: 'trigonometry',
    name: 'قاطع الزاوية',
    formula: 'csc(θ) = hypotenuse / opposite',
    description: 'يقطع الزاوية هو مقلوب الجيب: csc(θ) = 1/sin(θ). يربط الوتر بالضلع المقابل.',
    method: '1) حدد الوتر. 2) حدد الضلع المقابل. 3) csc(θ) = وتر/مقابل.',
    examples: [{ title: 'مثال', values: { angle: 30 }, steps: ['csc(30°) = 2'] }],
    variables: [{ name: 'angle', label: 'θ°' }],
    solve(values) {
      const angle = Number(values.angle);
      if (Number.isNaN(angle)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const s = Math.sin(toRad(angle));
      if (s === 0) return { result: 'غير معرف عند هذه القيمة', steps: [] };
      const result = 1 / s;
      return { result: `csc(${angle}°) = ${fmt(result)}`, steps: [`csc(${angle}°) = 1/sin(${angle}°)`, `csc(${angle}°) = ${fmt(result)}`] };
    },
  },
  {
    id: 'amplitude-period',
    branchId: 'trigonometry',
    name: 'سعة ودور الدالة المثلثية',
    formula: 'y = A·sin(Bx), amplitude = |A|, period = 2π/|B|',
    description: 'يحديد السعة (الارتفاع الأقصى) والدور (طول دورة كاملة) لدالة جيب من الشكل y = A·sin(Bx).',
    method: '1) حدد A (السعة). 2) حدد B. 3) السعة = |A|. 4) الدور = 2π/|B|.',
    examples: [{ title: 'مثال', values: { A: 3, B: 2 }, steps: ['سعة=3، دور=π'] }],
    variables: [{ name: 'A', label: 'A' }, { name: 'B', label: 'B' }],
    solve(values) {
      const A = Number(values.A), B = Number(values.B);
      if ([A, B].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (B === 0) return { result: 'B يجب ألا يكون صفراً', steps: [] };
      return { result: `سعة = ${fmt(Math.abs(A))}, الدور = ${fmt(2 * Math.PI / Math.abs(B))}`, steps: [`سعة = |${A}| = ${fmt(Math.abs(A))}`, `الدور = 2π/|${B}| = ${fmt(2 * Math.PI / Math.abs(B))}`] };
    },
  },
  {
    id: 'integral-cos',
    branchId: 'calculus',
    name: 'تكامل جيب التمام',
    formula: '∫cos(x) dx = sin(x) + C',
    description: 'يُستخدم لإيجاد تكامل دالة جيب التمام. x بالراديان.',
    method: '1) تأكد أن x بالراديان. 2) ∫cos(x) dx = sin(x) + C.',
    examples: [{ title: 'مثال', values: { x: 0 }, steps: ['∫cos(0) = sin(0) + C = 0 + C'] }],
    variables: [{ name: 'x', label: 'x (راديان)' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = Math.sin(x);
      return { result: `∫cos(x) = ${fmt(result)} + C`, steps: [`∫cos(${x}) = sin(${x})`, `= ${fmt(result)} + C`] };
    },
  },
  {
    id: 'integral-1-x',
    branchId: 'calculus',
    name: 'تكامل 1/x',
    formula: '∫(1/x) dx = ln|x| + C',
    description: 'تكامل مقلوب x هو اللوغاريتم الطبيعي للقيمة المطلقة لـ x. حالة خاصة عندما يكون الأس -1.',
    method: '1) تأكد أن x ≠ 0. 2) ∫(1/x) dx = ln|x| + C.',
    examples: [{ title: 'مثال', values: { x: 2 }, steps: ['∫(1/2) = ln(2) + C ≈ 0.693 + C'] }],
    variables: [{ name: 'x', label: 'x' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (x === 0) return { result: 'x يجب ألا يكون صفراً', steps: [] };
      const result = Math.log(Math.abs(x));
      return { result: `∫(1/x) = ${fmt(result)} + C`, steps: [`∫(1/${x}) = ln|${x}|`, `= ${fmt(result)} + C`] };
    },
  },
  {
    id: 'derivative-sum',
    branchId: 'calculus',
    name: 'اشتقاق مجموع الدوال',
    formula: "d/dx(u + v) = u' + v'",
    description: 'مشتقة مجموع دالتين هي مجموع مشتقتيهما. قاعدة خطية أساسية في الاشتقاق.',
    method: '1) اشتق كل دالة على حدة. 2) اجمع الناتجين: (u+v)′ = u′ + v′.',
    examples: [{ title: 'مثال', values: { a: 3, b: 4 }, steps: ['d/dx(3x²+4x) = 6x+4'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `d/dx(${a}x² + ${b}x) = ${2 * a}x + ${b}`, steps: [`d/dx(${a}x²) = ${2 * a}x`, `d/dx(${b}x) = ${b}`, `d/dx = ${2 * a}x + ${b}`] };
    },
  },
  {
    id: 'second-derivative',
    branchId: 'calculus',
    name: 'المشتقة الثانية',
    formula: "f''(x) = d²/dx² f(x)",
    description: 'تمثل معدل تغير المشتقة الأولى. تُستخدم لتحديد تقعر المنحنى والنقاط الحرجة.',
    method: '1) أوجد المشتقة الأولى f′(x). 2) اشتقها مرة أخرى للحصول على f″(x).',
    examples: [{ title: 'مثال', values: { a: 2 }, steps: ['f(x)=2x³ → f″(x)=12x'] }],
    variables: [{ name: 'a', label: 'a' }],
    solve(values) {
      const a = Number(values.a);
      if (Number.isNaN(a)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `f''(x) = ${12 * a}x`, steps: [`f(x) = ${a}x³`, `f'(x) = ${3 * a}x²`, `f''(x) = ${6 * a}x`] };
    },
  },
  {
    id: 'median',
    branchId: 'statistics',
    name: 'الوسيط',
    formula: 'القيمة الوسطى بعد الترتيب',
    description: 'يقيس مركز البيانات عن طريق قيمة الوسط بعد ترتيب الأرقام تصاعدياً. أقل تأثراً بالقيم المتطرفة من المتوسط.',
    method: '1) رتّب الأرقام. 2) إذا كان العدد فردياً: القيمة الوسطى. 3) إذا كان زوجياً: متوسط القيمتين الوسطيين.',
    examples: [{ title: 'مثال', values: { numbers: '3,1,2,5,4' }, steps: ['ترتيب: 1,2,3,4,5 → الوسيط 3'] }],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '').sort((a, b) => a - b);
      if (numbers.length === 0) return { result: 'أدخل أرقاماً', steps: [] };
      const mid = Math.floor(numbers.length / 2);
      const result = numbers.length % 2 === 1 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;
      return { result: `الوسيط = ${fmt(result)}`, steps: [`ترتيب: ${numbers.join(', ')}`, `الوسيط = ${fmt(result)}`] };
    },
  },
  {
    id: 'range',
    branchId: 'statistics',
    name: 'المتوسط الحسابي (المدى)',
    formula: 'range = max - min',
    description: 'يقيس انتشار البيانات البسيط كفرق بين القيمة الكبرى والصغرى.',
    method: '1) أوجد أصغر قيمة. 2) أوجد أكبر قيمة. 3) اطرح: range = max - min.',
    examples: [{ title: 'مثال', values: { numbers: '4,8,2,10,6' }, steps: ['المدى = 10 - 2 = 8'] }],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0) return { result: 'أدخل أرقاماً', steps: [] };
      const result = Math.max(...numbers) - Math.min(...numbers);
      return { result: `المدى = ${fmt(result)}`, steps: [`min = ${fmt(Math.min(...numbers))}`, `max = ${fmt(Math.max(...numbers))}`, `المدى = ${fmt(result)}`] };
    },
  },
  {
    id: 'probability-complement',
    branchId: 'statistics',
    name: 'احتمال المتممة',
    formula: 'P(not A) = 1 - P(A)',
    description: 'يحسب احتمال عدم وقوع حدث A. مجموع احتمال الحدث ومتممته يساوي 1.',
    method: '1) حدد احتمال الحدث P(A). 2) اطرح من 1: P(not A) = 1 - P(A).',
    examples: [{ title: 'مثال', values: { pA: 0.3 }, steps: ['P(not A) = 1 - 0.3 = 0.7'] }],
    variables: [{ name: 'pA', label: 'P(A)' }],
    solve(values) {
      const pA = Number(values.pA);
      if (Number.isNaN(pA)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = 1 - pA;
      return { result: `P(not A) = ${fmt(result)}`, steps: [`P(not A) = 1 - ${pA}`, `P(not A) = ${fmt(result)}`] };
    },
  },
  {
    id: 'fibonacci',
    branchId: 'number-theory',
    name: 'الحد في متتالية فيبوناتشي',
    formula: 'F(n) = F(n-1) + F(n-2)',
    description: 'متتالية كل حد فيها مجموع الحدين السابقين: 0, 1, 1, 2, 3, 5, 8... تظهر في الطبيعة والفن.',
    method: '1) حدد رقم الحد n. 2) F(0)=0، F(1)=1. 3) احسب التسلسل حتى الحد n.',
    examples: [{ title: 'مثال', values: { n: 7 }, steps: ['F(7) = 13'] }],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (!Number.isInteger(n) || n < 0) return { result: 'n يجب أن يكون عدداً صحيحاً غير سالب', steps: [] };
      if (n === 0) return { result: 'F(0) = 0', steps: ['F(0) = 0'] };
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) { const t = a + b; a = b; b = t; }
      return { result: `F(${n}) = ${n === 1 ? 1 : b}`, steps: [`F(${n}) = ${n === 1 ? 1 : b}`] };
    },
  },
  {
    id: 'divisors-count',
    branchId: 'number-theory',
    name: 'عدد القواسم',
    formula: 'τ(n) = عدد الأعداد الصحيحة التي تقسم n',
    description: 'يحسب عدد القواسم الموجبة للعدد n. مفيد في نظرية الأعداد.',
    method: '1) حدد n. 2) اختبر الأعداد من 1 إلى n. 3) عدّ الأعداد التي تقسم n بدون باقي.',
    examples: [{ title: 'مثال', values: { n: 12 }, steps: ['القواسم: 1,2,3,4,6,12 → 6'] }],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (!Number.isInteger(n) || n <= 0) return { result: 'n يجب أن يكون عدداً صحيحاً موجباً', steps: [] };
      let count = 0;
      for (let i = 1; i <= n; i++) if (n % i === 0) count++;
      return { result: `τ(${n}) = ${count}`, steps: [`عدد القواسم = ${count}`] };
    },
  },
  {
    id: 'euclidean-gcd',
    branchId: 'number-theory',
    name: 'خوارزمية إقليدس للقاسم المشترك الأكبر',
    formula: 'gcd(a,b) = gcd(b, a mod b)',
    description: 'تستخدم القسمة المتكررة لإيجاد القاسم المشترك الأكبر بكفاءة.',
    method: '1) قسّم a على b واحسب الباقي. 2) استبدل a بـ b و b بالباقي. 3) كرر حتى يصبح الباقي 0. 4) القاسم هو gcd.',
    examples: [{ title: 'مثال', values: { a: 48, b: 18 }, steps: ['gcd(48,18) = gcd(18,12) = gcd(12,6) = 6'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      let a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (!Number.isInteger(a) || !Number.isInteger(b)) return { result: 'أدخل أعداداً صحيحة', steps: [] };
      a = Math.abs(a); b = Math.abs(b);
      const steps: string[] = [];
      while (b !== 0) {
        steps.push(`gcd(${a}, ${b})`);
        const t = b;
        b = a % b;
        a = t;
      }
      return { result: `gcd = ${a}`, steps: [...steps, `gcd = ${a}`] };
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
    id: 'circle-equation',
    branchId: 'geometry',
    name: 'معادلة الدائرة',
    formula: '(x - h)² + (y - k)² = r²',
    description: 'معادلة الدائرة ذات المركز (h,k) ونصف القطر r في المستوى الإحداثي.',
    method: '1) حدد إحداثيات المركز (h,k). 2) حدد نصف القطر r. 3) عوّض في المعادلة.',
    examples: [{ title: 'مثال', values: { h: 0, k: 0, r: 5 }, steps: ['x² + y² = 25'] }],
    variables: [{ name: 'h', label: 'h' }, { name: 'k', label: 'k' }, { name: 'r', label: 'r' }],
    solve(values) {
      const h = Number(values.h), k = Number(values.k), r = Number(values.r);
      if ([h, k, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = r * r;
      return { result: `(x - ${h})² + (y - ${k})² = ${result}`, steps: [`(x - ${h})² + (y - ${k})² = ${r}²`, `(x - ${h})² + (y - ${k})² = ${result}`] };
    },
  },
  {
    id: 'point-line-distance',
    branchId: 'geometry',
    name: 'المسافة من نقطة إلى مستقيم',
    formula: 'd = |Ax0 + By0 + C| / √(A² + B²)',
    description: 'تحسب المسافة القصيرة من نقطة (x0,y0) إلى مستقيم بصيغة Ax + By + C = 0.',
    method: '1) حدد معاملات المستقيم A و B و C. 2) حدد إحداثيات النقطة (x0,y0). 3) d = |Ax0+By0+C| / √(A²+B²).',
    examples: [{ title: 'مثال', values: { A: 3, B: 4, C: -5, x0: 1, y0: 2 }, steps: ['d = |3+8-5|/5 = 1.2'] }],
    variables: [{ name: 'A', label: 'A' }, { name: 'B', label: 'B' }, { name: 'C', label: 'C' }, { name: 'x0', label: 'x0' }, { name: 'y0', label: 'y0' }],
    solve(values) {
      const A = Number(values.A), B = Number(values.B), C = Number(values.C), x0 = Number(values.x0), y0 = Number(values.y0);
      if ([A, B, C, x0, y0].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const num = Math.abs(A * x0 + B * y0 + C);
      const den = Math.sqrt(A * A + B * B);
      if (den === 0) return { result: 'A و B لا يمكن أن يكونا صفرين معاً', steps: [] };
      const result = num / den;
      return { result: `d = ${fmt(result)}`, steps: [`d = |${A}×${x0} + ${B}×${y0} + ${C}| / √(${A}² + ${B}²)`, `d = ${fmt(result)}`] };
    },
  },
  {
    id: 'area-regular-polygon',
    branchId: 'geometry',
    name: 'مساحة المضلع المنتظم',
    formula: 'A = (n s²) / (4 tan(π/n))',
    description: 'يحسب مساحة مضلع منتظم ذو n ضلعاً وطول ضلع s.',
    method: '1) حدد عدد الأضلاع n (n ≥ 3). 2) حدد طول الضلع s. 3) A = (n·s²)/(4·tan(π/n)).',
    examples: [{ title: 'مثال', values: { n: 6, s: 4 }, steps: ['A = (6×16)/(4×tan(π/6)) ≈ 41.57'] }],
    variables: [{ name: 'n', label: 'n' }, { name: 's', label: 's' }],
    solve(values) {
      const n = Number(values.n), s = Number(values.s);
      if ([n, s].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (n < 3) return { result: 'n يجب أن يكون 3 أو أكبر', steps: [] };
      const result = (n * s * s) / (4 * Math.tan(Math.PI / n));
      return { result: `A = ${fmt(result)}`, steps: [`A = (${n}×${s}²)/(4×tan(π/${n}))`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'secant-angle',
    branchId: 'trigonometry',
    name: 'قاطع التمام',
    formula: 'sec(θ) = hypotenuse / adjacent',
    description: 'قاطع التمام مقلوب جيب التمام: sec(θ) = 1/cos(θ). يربط الوتر بالضلع المجاور.',
    method: '1) حدد الوتر. 2) حدد الضلع المجاور. 3) sec(θ) = وتر/مجاور.',
    examples: [{ title: 'مثال', values: { angle: 60 }, steps: ['sec(60°) = 2'] }],
    variables: [{ name: 'angle', label: 'θ°' }],
    solve(values) {
      const angle = Number(values.angle);
      if (Number.isNaN(angle)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const c = Math.cos(toRad(angle));
      if (c === 0) return { result: 'غير معرف عند هذه القيمة', steps: [] };
      const result = 1 / c;
      return { result: `sec(${angle}°) = ${fmt(result)}`, steps: [`sec(${angle}°) = 1/cos(${angle}°)`, `sec(${angle}°) = ${fmt(result)}`] };
    },
  },
  {
    id: 'cotangent-angle',
    branchId: 'trigonometry',
    name: 'ظل التمام',
    formula: 'cot(θ) = adjacent / opposite',
    description: 'ظل التمام مقلوب الظل: cot(θ) = 1/tan(θ). يربط الضلع المجاور بالمقابل.',
    method: '1) حدد الضلع المجاور. 2) حدد المقابل. 3) cot(θ) = مجاور/مقابل.',
    examples: [{ title: 'مثال', values: { angle: 45 }, steps: ['cot(45°) = 1'] }],
    variables: [{ name: 'angle', label: 'θ°' }],
    solve(values) {
      const angle = Number(values.angle);
      if (Number.isNaN(angle)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const t = Math.tan(toRad(angle));
      if (t === 0) return { result: 'غير معرف عند هذه القيمة', steps: [] };
      const result = 1 / t;
      return { result: `cot(${angle}°) = ${fmt(result)}`, steps: [`cot(${angle}°) = 1/tan(${angle}°)`, `cot(${angle}°) = ${fmt(result)}`] };
    },
  },
  {
    id: 'derivative-ln',
    branchId: 'calculus',
    name: 'مشتقة اللوغاريتم الطبيعي',
    formula: "d/dx ln(x) = 1/x",
    description: 'مشتقة اللوغاريتم الطبيعي لـ x هي مقلوب x. الأساسية في حل المعادلات التفاضلية.',
    method: '1) تأكد أن x > 0. 2) d/dx(ln(x)) = 1/x.',
    examples: [{ title: 'مثال', values: { x: 4 }, steps: ['d/dx ln(4) = 1/4 = 0.25'] }],
    variables: [{ name: 'x', label: 'x' }],
    solve(values) {
      const x = Number(values.x);
      if (Number.isNaN(x)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (x <= 0) return { result: 'x يجب أن يكون أكبر من 0', steps: [] };
      const result = 1 / x;
      return { result: `d/dx ln(${x}) = ${fmt(result)}`, steps: [`d/dx ln(${x}) = 1/${x}`, `= ${fmt(result)}`] };
    },
  },
  {
    id: 'integration-by-parts',
    branchId: 'calculus',
    name: 'التكامل بالتجزئة',
    formula: '∫u dv = uv - ∫v du',
    description: 'تُستخدم لتكامل حاصل ضرب دالتين بتحويلها إلى دالة أبسط. أساسية في حساب التكاملات المعقدة.',
    method: '1) اختر u بحيث تبسط عند الاشتقاق. 2) حدد dv. 3) اشتق u للحصول على du. 4) اكامل dv للحصول على v. 5) طبّق الصيغة.',
    examples: [{ title: 'مثال', values: { u: 'x', dv: 'e^x' }, steps: ['∫x·e^x = x·e^x - e^x + C'] }],
    variables: [{ name: 'u', label: 'u' }, { name: 'dv', label: 'dv' }],
    solve(_values) {
      return { result: 'استخدم الصيغة ∫u dv = uv - ∫v du', steps: ['اختر u و dv بعناية', 'اشتق u وكامل dv', 'طبّق الصيغة'] };
    },
  },
  {
    id: 'lcm-using-gcd',
    branchId: 'number-theory',
    name: 'المضاعف المشترك الأصغر باستخدام gcd',
    formula: 'lcm(a,b) = |a·b| / gcd(a,b)',
    description: 'يحسب المضاعف المشترك الأصغر لعددين من خلال علاقتهما بالقاسم المشترك الأكبر.',
    method: '1) أوجد gcd(a,b). 2) اضرب a في b وأخذ القيمة المطلقة. 3) اقسم على gcd.',
    examples: [{ title: 'مثال', values: { a: 12, b: 18 }, steps: ['lcm = 216/6 = 36'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      let a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (!Number.isInteger(a) || !Number.isInteger(b)) return { result: 'أدخل أعداداً صحيحة', steps: [] };
      if (a === 0 || b === 0) return { result: 'lcm = 0', steps: ['أحد الأعداد صفر'] };
      a = Math.abs(a); b = Math.abs(b);
      const gcd = (x: number, y: number): number => { while (y !== 0) { const t = y; y = x % y; x = t; } return x; };
      const g = gcd(a, b);
      const result = (a * b) / g;
      return { result: `lcm = ${fmt(result)}`, steps: [`gcd(${a},${b}) = ${g}`, `lcm = (${a}×${b})/${g} = ${fmt(result)}`] };
    },
  },
  {
    id: 'perfect-square-check',
    branchId: 'number-theory',
    name: 'التحقق من العدد التام',
    formula: 'n = k²',
    description: 'يتحقق ما إذا كان عدد ما مربعاً كاملاً (أي يساوي مربع عدد صحيح).',
    method: '1) أخذ الجذر التربيعي لـ n. 2) إذا كان الجذر صحيحاً فالعدد مربع كامل.',
    examples: [{ title: 'مثال', values: { n: 64 }, steps: ['√64 = 8 → مربع كامل'] }],
    variables: [{ name: 'n', label: 'n' }],
    solve(values) {
      const n = Number(values.n);
      if (Number.isNaN(n)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (!Number.isInteger(n) || n < 0) return { result: 'n يجب أن يكون عدداً صحيحاً غير سالب', steps: [] };
      const root = Math.sqrt(n);
      if (Number.isInteger(root)) return { result: 'مربع كامل', steps: [`√${n} = ${fmt(root)}`, `${n} = ${fmt(root)}²`] };
      return { result: 'ليس مربعاً كاملاً', steps: [`√${n} ≈ ${fmt(root)} (غير صحيح)`] };
    },
  },
  {
    id: 'mode',
    branchId: 'statistics',
    name: 'المنوال',
    formula: 'القيمة الأكثر تكراراً',
    description: 'يقيس الاتجاه الأكثر شيوعاً في مجموعة بيانات. قد تكون القيمة واحدة أو أكثر.',
    method: '1) رتّب البيانات. 2) عدّ تكرار كل قيمة. 3) القيمة الأكثر تكراراً هي المنوال.',
    examples: [{ title: 'مثال', values: { numbers: '2,3,3,5,5,5,7' }, steps: ['المنوال = 5'] }],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0) return { result: 'أدخل أرقاماً', steps: [] };
      const freq = new Map<number, number>();
      numbers.forEach((n) => freq.set(n, (freq.get(n) || 0) + 1));
      const maxFreq = Math.max(...freq.values());
      const modes = Array.from(freq.entries()).filter(([, c]) => c === maxFreq).map(([n]) => n).sort((a, b) => a - b);
      return { result: `المنوال = ${modes.join(', ')}`, steps: [`تكرار القيم: ${Array.from(freq.entries()).map(([n, c]) => `${n}:${c}`).join(', ')}`, `المنوال = ${modes.join(', ')}`] };
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
  },
  {
    id: 'ellipse-foci',
    branchId: 'geometry',
    name: 'البعد البؤري للقطع الناقص',
    formula: 'c = √(a² - b²)',
    description: 'يحسب المسافة من مركز القطع الناقص إلى كل بؤرة، حيث a نصف المحور الأكبر و b نصف المحور الأصغر.',
    method: '1) حدد نصف المحور الأكبر a. 2) حدد نصف المحور الأصغر b (b ≤ a). 3) c = √(a² - b²).',
    examples: [{ title: 'مثال', values: { a: 5, b: 3 }, steps: ['c = √(25-9) = 4'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (a < b) return { result: 'a يجب أن يكون ≥ b', steps: [] };
      const result = Math.sqrt(a * a - b * b);
      return { result: `c = ${fmt(result)}`, steps: [`c = √(${a}² - ${b}²)`, `c = ${fmt(result)}`] };
    },
  },
];
