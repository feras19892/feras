import type { Equation } from '../math-types';
import { fmt } from '../math-utils';

export const equationsBasic_geometry: Equation[] = [
{
    id: 'pythagorean-theorem',
    branchId: 'geometry',
    name: 'نظرية فيثاغورس',
    formula: 'a^2 + b^2 = c^2',
    description: 'تستخدم في المثلثات القائمة لإيجاد طول ضلع مجهول. تطبق في حساب المسافات، تحليل المتجهات، وحركة القذائف.',
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
        if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        const c = Math.sqrt(a * a + b * b);
        return { result: `c = ${fmt(c)}`, steps: [`c^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}`, `c = √${a * a + b * b} = ${fmt(c)}`] };
      }
      if (target === 'a') {
        const b = Number(values.b);
        const c = Number(values.c);
        if ([b, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (c * c - b * b < 0) return { result: 'لا يمكن أن يكون الوتر أقصر من الضلع الآخر', steps: [] };
        const a = Math.sqrt(c * c - b * b);
        return { result: `a = ${fmt(a)}`, steps: [`a^2 = c^2 - b^2 = ${c * c} - ${b * b} = ${c * c - b * b}`, `a = √${c * c - b * b} = ${fmt(a)}`] };
      }
      if (target === 'b') {
        const a = Number(values.a);
        const c = Number(values.c);
        if ([a, c].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    description: 'تستخدم لحساب مساحة الدائرة عند معرفة نصف القطر. تطبق في حسابات المساحات والأحجام الدائرية.',
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
    id: 'area-rectangle',
    branchId: 'geometry',
    name: 'مساحة المستطيل',
    formula: 'A = l × w',
    description: 'تستخدم لحساب مساحة سطح المستطيل، أي المساحة المحصورة بين أضلاعه الأربعة. تستخدم في تصميم الغرف، الحدائق، والألواح.',
    method: '1) قس الطول l (الضلع الأطول). 2) قس العرض w (الضلع الأقصر). 3) اضرب الطول في العرض: A = l × w. 4) الوحدة الناتجة هي وحدة طول تربيعية (مثلاً م²).',
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
      if ([l, w].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `A = ${fmt(l * w)}`, steps: [`A = ${l} × ${w}`, `A = ${fmt(l * w)}`] };
    },
  },
{
    id: 'area-triangle',
    branchId: 'geometry',
    name: 'مساحة المثلث',
    formula: 'A = 0.5 × b × h',
    description: 'تحسب مساحة أي مثلث باستخدام طول قاعدته والارتفاع العمودي من رأس المثلث إلى تلك القاعدة. تستخدم في المساحات، الرسومات الهندسية، والهندسة المدنية.',
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
      if ([b, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `A = ${fmt(0.5 * b * h)}`, steps: [`A = 0.5 × ${b} × ${h}`, `A = ${fmt(0.5 * b * h)}`] };
    },
  },
{
    id: 'circumference-circle',
    branchId: 'geometry',
    name: 'محيط الدائرة',
    formula: 'C = 2πr',
    description: 'يحسب طول المحيط (الدائرة) الخارجية للدائرة. يستخدم في حسابات العجلات، الأنابيب، والأشكال الدائرية.',
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
    description: 'يحجم حجم الكرة المجوفة الصلبة. يستخدم في حسابات الكرات، الفقاعات، والأجرام السماوية تقريباً.',
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
      if ([r, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `V = ${fmt(Math.PI * r * r * h)}`, steps: [`V = π × ${r}^2 × ${h}`, `V = ${fmt(Math.PI * r * r * h)}`] };
    },
  }
];
