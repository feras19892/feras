import type { Equation } from '../math-types';
import { fmt, toRad } from '../math-utils';

export const equationsAdvanced_trigonometry: Equation[] = [
{
    id: 'double-angle-sin',
    branchId: 'trigonometry',
    name: 'صيغة الجيب المضاعفف',
    formula: 'sin(2x) = 2sin(x)cos(x)',
    description: 'تربط بين sin(2x) وقيم sin(x) و cos(x). تستخدم لتبسيط التعبيرات المثلثية.',
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
    description: 'تحسب ظل مجموع زاويتين باستخدام ظل كل منهما. تستخدم في تبسيط التعبيرات المثلثية.',
    method: '1) حدد A و B بالدرجات. 2) احسب tan(A) و tan(B). 3) استخدم الصيغة: (tanA+tanB)/(1-tanA·tanB).',
    examples: [{ title: 'مثال', values: { A: 30, B: 45 }, steps: ['tan(75°) ≈ 3.732'] }],
    variables: [{ name: 'A', label: 'A°' }, { name: 'B', label: 'B°' }],
    solve(values) {
      const A = Number(values.A), B = Number(values.B);
      if ([A, B].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const tanA = Math.tan(toRad(A)), tanB = Math.tan(toRad(B));
      const denom = 1 - tanA * tanB;
      if (denom === 0) return { result: 'غير معرف عند هذه القيم', steps: [] };
      const result = (tanA + tanB) / denom;
      return { result: `tan(${A}°+${B}°) = ${fmt(result)}`, steps: [`tan(${A}°+${B}°) = (${fmt(tanA)} + ${fmt(tanB)}) / (1 - ${fmt(tanA)}×${fmt(tanB)})`, `= ${fmt(result)}`] };
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
      if ([A, B].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (B === 0) return { result: 'B يجب ألا يكون صفراً', steps: [] };
      return { result: `سعة = ${fmt(Math.abs(A))}, الدور = ${fmt(2 * Math.PI / Math.abs(B))}`, steps: [`سعة = |${A}| = ${fmt(Math.abs(A))}`, `الدور = 2π/|${B}| = ${fmt(2 * Math.PI / Math.abs(B))}`] };
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
  }
];
