import type { Equation } from '../math-types';
import { fmt } from '../math-utils';

export const calculusEquations: Equation[] = [
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
  }
];
