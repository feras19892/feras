import type { Equation } from '../math-types';
import { fmt, parseNumbers } from '../math-utils';

export const equationsAdvanced_algebra: Equation[] = [
{
    id: 'absolute-value-equation',
    branchId: 'algebra',
    name: 'معادلة القيمة المطلقة',
    formula: '|ax + b| = c',
    description: 'يستخدم لحل المعادلات التي تتضمن قيمة مطلقة.',
    method: 'إذا كان c < 0 لا يوجد حل. إذا كان c ≥ 0، فإن ax + b = c أو ax + b = -c.',
    examples: [{ title: 'مثال', values: { a: 2, b: -3, c: 5 }, steps: ['2x - 3 = 5 → x = 4', '2x - 3 = -5 → x = -1'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }, { name: 'c', label: 'c' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b), c = Number(values.c);
      if ([a, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    description: 'يستخدم لحساب النمو أو التضخم أو الفائدة المركبة.',
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
      if ([P, r, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `A = ${fmt(P * (1 + r) ** t)}`, steps: [`A = ${P} × (1 + ${r})^${t}`, `A = ${fmt(P * (1 + r) ** t)}`] };
    },
  },
{
    id: 'logarithm',
    branchId: 'algebra',
    name: 'اللوغاريتم',
    formula: 'log_a(x) = y',
    description: 'يستخدم لإيجاد الأس الذي يرفع إليه الأساس a لإعطاء x.',
    method: 'log_a(x) = y يعني a^y = x.',
    examples: [{ title: 'مثال', values: { a: 10, x: 100 }, steps: ['log10(100) = 2'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'x', label: 'x' }],
    solve(values) {
      const a = Number(values.a), x = Number(values.x);
      if ([a, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([P, r, n, t].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([b, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    description: 'تحسب الفائدة المكتسبة على مبلغ أصلي دون إضافة الفائدة إلى الأصل. تستخدم في الودائع والقروض البسيطة.',
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
      if ([P, r, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([old, newv].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([a, b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if (numbers.length === 0 || numbers.some((n) => n <= 0)) return { result: 'أدخل أرقاماًً موجبة', steps: [] };
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
      if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (x2 === x1) return { result: 'خط رأسي (ميل غير محدد)', steps: [] };
      const result = (y2 - y1) / (x2 - x1);
      return { result: `m = ${fmt(result)}`, steps: [`m = (${y2} - ${y1}) / (${x2} - ${x1})`, `m = ${fmt(result)}`] };
    },
  }
];
