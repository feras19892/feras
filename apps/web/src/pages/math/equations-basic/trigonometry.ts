import type { Equation } from '../math-types';
import { fmt, toRad } from '../math-utils';

export const equationsBasic_trigonometry: Equation[] = [
{
    id: 'sine-rule',
    branchId: 'trigonometry',
    name: 'قانون الجيب',
    formula: 'a / sin(A) = b / sin(B) = c / sin(C)',
    description: 'تستخدم في المثلثات غير القائمة لإيجاد ضلع أو زاوية مجهولة. تطبق في الموجات والاهتزازات.',
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
        return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    description: 'تستخدم في المثلثات غير القائمة لإيجاد ضلع ثالث عند معرفة ضلعين والزاوية بينهما. تطبق في حسابات المتجهات والقوى.',
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
        return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    id: 'tangent-angle',
    branchId: 'trigonometry',
    name: 'ظل الزاوية',
    formula: 'tan(θ) = opposite / adjacent',
    description: 'نسبة المثلثات ظل الزاوية تساوي طول الضلع المقابل مقسوماً على طول الضلع المجاور في المثلث القائم. تستخدم لإيجاد زاوية أو ضلع.',
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
      if ([o, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    description: 'نسبة جيب التمام تساوي طول الضلع المجاور مقسوماً على الوتر في المثلث القائم. تستخدم مع الجيب والظل لحل المثلثات الكاملة.',
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
  }
];
