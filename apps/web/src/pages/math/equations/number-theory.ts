import type { Equation } from '../math-types';
import { fmt, parseNumbers, toRad, toDeg } from '../math-utils';

export const number_theoryEquations: Equation[] = [
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
  }
];
