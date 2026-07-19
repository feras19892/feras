import type { Equation } from '../math-types';
import { fmt, toRad } from '../math-utils';

export const electromagnetismEquations: Equation[] = [
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
  }
];
