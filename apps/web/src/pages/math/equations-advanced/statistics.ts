import type { Equation } from '../math-types';
import { fmt, parseNumbers } from '../math-utils';

export const equationsAdvanced_statistics: Equation[] = [
{
    id: 'permutation',
    branchId: 'statistics',
    name: 'التباديل',
    formula: 'P(n, r) = n! / (n - r)!',
    description: 'يستخدم لحساب عدد طرق ترتيب r عناصر من n عنصر.',
    method: 'P(n, r) = n! / (n - r)!.',
    examples: [{ title: 'مثال', values: { n: 5, r: 2 }, steps: ['P(5,2) = 20'] }],
    variables: [{ name: 'n', label: 'n' }, { name: 'r', label: 'r' }],
    solve(values) {
      const n = Number(values.n), r = Number(values.r);
      if ([n, r].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (n < 0 || r < 0 || r > n) return { result: 'أدخل قيماً صحيحة', steps: [] };
      const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));
      return { result: `P(${n},${r}) = ${fmt(fact(n) / fact(n - r))}`, steps: [`P(${n},${r}) = ${n}! / (${n} - ${r})!`, `P(${n},${r}) = ${fmt(fact(n) / fact(n - r))}`] };
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
      if ([x, mu, sigma].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([n, k, p].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (k > n || k < 0 || n < 0) return { result: 'k يجب أن يكون بين 0 و n', steps: [] };
      if (p < 0 || p > 1) return { result: 'p يجب أن تكون بين 0 و 1', steps: [] };
      const c = (fact: number) => { let r=1; for(let i=2;i<=fact;i++) r*=i; return r; };
      const comb = c(n) / (c(k) * c(n - k));
      const result = comb * p ** k * (1 - p) ** (n - k);
      return { result: `P(X=${k}) = ${fmt(result)}`, steps: [`C(${n},${k}) = ${fmt(comb)}`, `P = ${fmt(comb)} × ${p}^${k} × ${1-p}^${n-k}`, `P = ${fmt(result)}`] };
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
      if ([pAB, pB].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if (numbers.length === 0) return { result: 'أدخل أرقاماًً', steps: [] };
      const mean = numbers.reduce((s, n) => s + n, 0) / numbers.length;
      const variance = numbers.reduce((s, n) => s + (n - mean) ** 2, 0) / numbers.length;
      return { result: `σ² = ${fmt(variance)}`, steps: [`μ = ${fmt(mean)}`, `σ² = Σ(x - μ)² / ${numbers.length}`, `σ² = ${fmt(variance)}`] };
    },
  },
{
    id: 'expected-value',
    branchId: 'statistics',
    name: 'القيمة المتوقعة',
    formula: 'E(X) = Σ x_i · P(x_i)',
    description: 'تحسب المتوسط المرجّح لنتائج متغير عشوائي، حيث تضرب كل قيمة باحتمال حدوثها.',
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
      if (numbers.length === 0 || numbers.some((n) => n <= 0)) return { result: 'أدخل أرقاماًً موجبة', steps: [] };
      const product = numbers.reduce((s, n) => s * n, 1);
      const result = product ** (1 / numbers.length);
      return { result: `GM = ${fmt(result)}`, steps: [`GM = (${numbers.join(' × ')})^(1/${numbers.length})`, `GM = ${fmt(result)}`] };
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
      if (numbers.length === 0) return { result: 'أدخل أرقاماًً', steps: [] };
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
      if (numbers.length === 0) return { result: 'أدخل أرقاماًً', steps: [] };
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
    id: 'mode',
    branchId: 'statistics',
    name: 'المنوال',
    formula: 'القيمة الأكثر تكراراًً',
    description: 'يقيس الاتجاه الأكثر شيوعاً في مجموعة بيانات. قد تكون القيمة واحدة أو أكثر.',
    method: '1) رتّب البيانات. 2) عدّ تكرار كل قيمة. 3) القيمة الأكثر تكراراًً هي المنوال.',
    examples: [{ title: 'مثال', values: { numbers: '2,3,3,5,5,5,7' }, steps: ['المنوال = 5'] }],
    variables: [{ name: 'numbers', label: 'أرقام (مفصولة بفاصلة)', type: 'list' }],
    solve(values) {
      const numbers = parseNumbers(values.numbers ?? '');
      if (numbers.length === 0) return { result: 'أدخل أرقاماًً', steps: [] };
      const freq = new Map<number, number>();
      numbers.forEach((n) => freq.set(n, (freq.get(n) || 0) + 1));
      const maxFreq = Math.max(...freq.values());
      const modes = Array.from(freq.entries()).filter(([, c]) => c === maxFreq).map(([n]) => n).sort((a, b) => a - b);
      return { result: `المنوال = ${modes.join(', ')}`, steps: [`تكرار القيم: ${Array.from(freq.entries()).map(([n, c]) => `${n}:${c}`).join(', ')}`, `المنوال = ${modes.join(', ')}`] };
    },
  }
];
