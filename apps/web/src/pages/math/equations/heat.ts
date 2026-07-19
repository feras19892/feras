import type { Equation } from '../math-types';
import { fmt } from '../math-utils';

export const heatEquations: Equation[] = [
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
  }
];
