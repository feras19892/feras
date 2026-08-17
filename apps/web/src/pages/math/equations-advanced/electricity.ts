import type { Equation } from '../math-types';
import { fmt } from '../math-utils';

export const equationsAdvanced_electricity: Equation[] = [
{
    id: 'coulomb-law',
    branchId: 'electricity',
    name: 'قانون كولوم',
    formula: 'F = k q1 q2 / r^2',
    description: 'يستخدم لحساب القوة الكهروستاتيكية بين شحنتين.',
    method: 'F = k × q1 × q2 / r²، حيث k ثابت كولوم.',
    examples: [{ title: 'مثال', values: { q1: 1e-6, q2: 2e-6, r: 0.5 }, steps: ['F ≈ 0.0719 N'] }],
    constants: [{ label: 'k', value: '8.99 × 10^9 N·m²/C²', description: 'ثابت كولوم' }],
    variables: [{ name: 'q1', label: 'q1' }, { name: 'q2', label: 'q2' }, { name: 'r', label: 'r' }],
    solve(values) {
      const q1 = Number(values.q1), q2 = Number(values.q2), r = Number(values.r);
      if ([q1, q2, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (r === 0) return { result: 'r لا يمكن أن يكون صفراً', steps: [] };
      const k = 8.99e9, F = (k * q1 * q2) / (r * r);
      return { result: `F = ${fmt(F)} N`, steps: [`F = k×${q1}×${q2}/${r}²`, `F = ${fmt(F)} N`] };
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
      if ([Vin, R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = (Vin * R2) / (R1 + R2);
      return { result: `Vout = ${fmt(result)} V`, steps: [`Vout = ${Vin} × ${R2}/(${R1}+${R2})`, `Vout = ${fmt(result)} V`] };
    },
  },
{
    id: 'resistivity',
    branchId: 'electricity',
    name: 'المقاومية',
    formula: 'R = فL / A',
    description: 'تربط المقاومة بمقاومية المادة وطولها ومساحة مقطعها.',
    method: '1) حدد المقاومية ف. 2) حدد الطول L. 3) حدد المساحة A. 4) R = فL/A.',
    examples: [{ title: 'مثال', values: { rho: 1.68e-8, L: 2, A: 1e-6 }, steps: ['R ≈ 0.0336 Ω'] }],
    variables: [{ name: 'rho', label: 'ف' }, { name: 'L', label: 'L' }, { name: 'A', label: 'A' }],
    solve(values) {
      const rho = Number(values.rho), L = Number(values.L), A = Number(values.A);
      if ([rho, L, A].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (A === 0) return { result: 'A يجب ألا يكون صفراً', steps: [] };
      const result = (rho * L) / A;
      return { result: `R = ${fmt(result)} Ω`, steps: [`R = ${rho} × ${L} / ${A}`, `R = ${fmt(result)} Ω`] };
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
      if ([It, R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([I, R].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = I * I * R;
      return { result: `P = ${fmt(result)} W`, steps: [`P = ${I}² × ${R}`, `P = ${fmt(result)} W`] };
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
      if ([R, C].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = R * C;
      return { result: `τ = ${fmt(result)} s`, steps: [`τ = ${R} × ${C}`, `τ = ${fmt(result)} s`] };
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
      if ([C, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = 0.5 * C * V * V;
      return { result: `E = ${fmt(result)} J`, steps: [`E = 0.5 × ${C} × ${V}²`, `E = ${fmt(result)} J`] };
    },
  },
{
    id: 'capacitors-parallel',
    branchId: 'electricity',
    name: 'مكثفات على التوازي',
    formula: 'Ceq = C1 + C2 + C3',
    description: 'يحسب السعة المكافئة لمكثفات متصلة على التوازي. الجهد متساو عبرها.',
    method: '1) حدد قيم السعات. 2) اجمعها: Ceq = C1 + C2 + ... + Cn.',
    examples: [{ title: 'مثال', values: { c1: 2, c2: 3, c3: 5 }, steps: ['Ceq = 2 + 3 + 5 = 10 F'] }],
    variables: [{ name: 'c1', label: 'C1' }, { name: 'c2', label: 'C2' }, { name: 'c3', label: 'C3' }],
    solve(values) {
      const c1 = Number(values.c1), c2 = Number(values.c2), c3 = Number(values.c3);
      if ([c1, c2, c3].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = c1 + c2 + c3;
      return { result: `Ceq = ${fmt(result)} F`, steps: [`Ceq = ${c1} + ${c2} + ${c3}`, `Ceq = ${fmt(result)} F`] };
    },
  }
];
