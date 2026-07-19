import type { Equation } from '../math-types';
import { fmt, parseNumbers, toRad, toDeg } from '../math-utils';

export const waves_opticsEquations: Equation[] = [
  {
    id: 'wave-speed',
    branchId: 'waves-optics',
    name: 'سرعة الموجة',
    formula: 'v = fλ',
    description: 'تربط بين سرعة الموجة وترددها وطولها الموجي. تُستخدم في الموجات الصوتية والضوئية والمائية.',
    method: '1) حدد التردد f (عدد الدورات في الثانية). 2) حدد الطول الموجي λ (المسافة بين قمتين متتاليتين). 3) اضرب التردد في الطول الموجي: v = f × λ.',
    examples: [{ title: 'مثال', values: { f: 10, lambda: 2 }, steps: ['v = 20 m/s'] }],
    applicationProblems: [
      {
        question: 'موجة في حوض ماء ترددها 5 هرتز وطولها الموجي 4 سم. ما سرعتها؟',
        hint: 'v = f × λ.',
        answer: 'v = 20 cm/s',
        variables: { f: 5, lambda: 4 },
        expectedValue: 20,
      },
    ],
    relatedExperiments: [{ id: 'speed-of-sound', name: 'سرعة الصوت', route: '/physics/waves/speed-of-sound', context: 'سرعة الصوت تعتمد على التردد وطول الموجة.' }],
    constants: [{ label: 'c', value: '3 × 10^8 m/s', description: 'سرعة الضوء في الفراغ' }],
    variables: [{ name: 'f', label: 'f' }, { name: 'lambda', label: 'λ' }],
    solve(values) {
      const f = Number(values.f), lambda = Number(values.lambda);
      if ([f, lambda].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `v = ${fmt(f * lambda)}`, steps: [`v = ${f}×${lambda}`, `v = ${fmt(f * lambda)}`] };
    },
  },
  {
    id: 'lens-equation',
    branchId: 'waves-optics',
    name: 'معادلة العدسة',
    formula: '1/f = 1/u + 1/v',
    description: 'تُستخدم لحساب البعد البؤري للعدسة.',
    method: '1/f = 1/u + 1/v.',
    examples: [{ title: 'مثال', values: { u: 10, v: 20 }, steps: ['f ≈ 6.667'] }],
    relatedExperiments: [{ id: 'thin-lens', name: 'العدسة الرقيقة', route: '/physics/waves/thin-lens', context: 'تجربة العدسة الرقيقة.' }],
    variables: [{ name: 'u', label: 'u' }, { name: 'v', label: 'v' }],
    solve(values) {
      const u = Number(values.u), v = Number(values.v);
      if ([u, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (u === 0 || v === 0) return { result: 'u و v لا يمكن أن تكونا صفراً', steps: [] };
      const f = 1 / (1 / u + 1 / v);
      return { result: `f = ${fmt(f)}`, steps: [`1/f = 1/${u} + 1/${v}`, `f = ${fmt(f)}`] };
    },
  },
  {
    id: 'snell-law',
    branchId: 'waves-optics',
    name: 'قانون سنل',
    formula: 'n1 sin(θ1) = n2 sin(θ2)',
    description: 'يُستخدم لحساب زاوية الانكسار.',
    method: 'sin(θ2) = (n1/n2) sin(θ1).',
    examples: [{ title: 'مثال', values: { n1: 1, n2: 1.5, theta1: 30 }, steps: ['θ2 ≈ 19.47°'] }],
    relatedExperiments: [{ id: 'light-ray', name: 'شعاع الضوء', route: '/physics/waves/light-ray', context: 'تجربة الانكسار.' }],
    variables: [{ name: 'n1', label: 'n1' }, { name: 'n2', label: 'n2' }, { name: 'theta1', label: 'θ1' }],
    solve(values) {
      const n1 = Number(values.n1), n2 = Number(values.n2), theta1 = Number(values.theta1);
      if ([n1, n2, theta1].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const theta2 = Math.asin((n1 / n2) * Math.sin(toRad(theta1))) * 180 / Math.PI;
      return { result: `θ2 = ${fmt(theta2)}°`, steps: [`sin(θ2) = (${n1}/${n2})×sin(${theta1}°)`, `θ2 = ${fmt(theta2)}°`] };
    },
  },
  {
    id: 'magnification',
    branchId: 'waves-optics',
    name: 'التكبير',
    formula: 'm = v / u',
    description: 'يُستخدم لحساب تكبير الصورة.',
    method: 'm = v / u.',
    examples: [{ title: 'مثال', values: { v: 20, u: 10 }, steps: ['m = 2'] }],
    variables: [{ name: 'v', label: 'v' }, { name: 'u', label: 'u' }],
    solve(values) {
      const v = Number(values.v), u = Number(values.u);
      if ([v, u].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (u === 0) return { result: 'u لا يمكن أن يكون صفراً', steps: [] };
      return { result: `m = ${fmt(v / u)}`, steps: [`m = ${v}/${u}`, `m = ${fmt(v / u)}`] };
    },
  },
  {
    id: 'frequency-period',
    branchId: 'waves-optics',
    name: 'التردد والدورة',
    formula: 'f = 1 / T',
    description: 'يربط بين التردد والدورة الزمنية للموجة.',
    method: 'f = 1 / T.',
    examples: [{ title: 'مثال', values: { T: 2 }, steps: ['f = 0.5 Hz'] }],
    variables: [{ name: 'T', label: 'T' }],
    solve(values) {
      const T = Number(values.T);
      if (Number.isNaN(T)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      if (T === 0) return { result: 'T لا يمكن أن يكون صفراً', steps: [] };
      return { result: `f = ${fmt(1 / T)} Hz`, steps: [`f = 1/${T}`, `f = ${fmt(1 / T)} Hz`] };
    },
  },
  {
    id: 'wavelength-frequency',
    branchId: 'waves-optics',
    name: 'العلاقة بين الطول الموجي والتردد',
    formula: 'v = fλ',
    description: 'تربط بين سرعة الموجة وترددها وطولها الموجي.',
    method: '1) حدد سرعة الموجة v. 2) حدد التردد f أو الطول الموجي λ. 3) v = f × λ.',
    examples: [{ title: 'مثال', values: { f: 50, lambda: 6 }, steps: ['v = 50 × 6 = 300 m/s'] }],
    variables: [{ name: 'f', label: 'f' }, { name: 'lambda', label: 'λ' }],
    solve(values) {
      const f = Number(values.f), lambda = Number(values.lambda);
      if ([f, lambda].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = f * lambda;
      return { result: `v = ${fmt(result)} m/s`, steps: [`v = ${f} × ${lambda}`, `v = ${fmt(result)} m/s`] };
    },
  },
  {
    id: 'critical-angle',
    branchId: 'waves-optics',
    name: 'الزاوية الحرجة',
    formula: 'sin(θc) = n2 / n1',
    description: 'تُستخدم في الانكسار الكلي الداخلي، حيث n1 > n2.',
    method: '1) حدد معامل انكسار الوسط الأول n1. 2) حدد معامل انكسار الوسط الثاني n2. 3) θc = arcsin(n2/n1).',
    examples: [{ title: 'مثال', values: { n1: 1.5, n2: 1 }, steps: ['θc = arcsin(1/1.5) ≈ 41.81°'] }],
    variables: [{ name: 'n1', label: 'n₁' }, { name: 'n2', label: 'n₂' }],
    solve(values) {
      const n1 = Number(values.n1), n2 = Number(values.n2);
      if ([n1, n2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (n1 <= n2) return { result: 'n1 يجب أن يكون أكبر من n2', steps: [] };
      const ratio = n2 / n1;
      const result = toDeg(Math.asin(ratio));
      return { result: `θc = ${fmt(result)}°`, steps: [`sin(θc) = ${n2}/${n1} = ${fmt(ratio)}`, `θc = arcsin(${fmt(ratio)}) = ${fmt(result)}°`] };
    },
  },
  {
    id: 'mirror-equation',
    branchId: 'waves-optics',
    name: 'معادلة المرآة الكروية',
    formula: '1/f = 1/u + 1/v',
    description: 'تربط بين البؤرة f وبعد الجسم u وبعد الصورة v في المرآة الكروية.',
    method: '1) حدد البعد البؤري f. 2) حدد بعد الجسم u. 3) أعد ترتيب المعادلة: 1/v = 1/f - 1/u.',
    examples: [{ title: 'مثال', values: { f: 10, u: 30 }, steps: ['1/v = 1/10 - 1/30 → v = 15'] }],
    variables: [{ name: 'f', label: 'f' }, { name: 'u', label: 'u' }],
    solve(values) {
      const f = Number(values.f), u = Number(values.u);
      if ([f, u].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (f === 0 || u === 0 || 1 / f - 1 / u === 0) return { result: 'قيم غير صالحة', steps: [] };
      const v = 1 / (1 / f - 1 / u);
      return { result: `v = ${fmt(v)}`, steps: [`1/v = 1/${f} - 1/${u}`, `v = ${fmt(v)}`] };
    },
  },
  {
    id: 'doppler-effect',
    branchId: 'waves-optics',
    name: 'تأثير دوبلر (الموجات الصوتية)',
    formula: 'f\' = f * (v ± vo) / (v ∓ vs)',
    description: 'يحسب التغير في التردد الملاحظ عندما يتحرك المصدر أو الملاحظ.',
    method: '1) حدد التردد الأصلي f. 2) حدد سرعة الصوت v. 3) حدد سرعة الملاحظ vo (موجب نحو المصدر). 4) حدد سرعة المصدر vs (موجب بعيداً). 5) f\' = f(v+vo)/(v-vs).',
    examples: [{ title: 'مثال', values: { f: 500, v: 340, vo: 0, vs: 34 }, steps: ['f\' = 500 × 340/(340-34) ≈ 555.56'] }],
    variables: [{ name: 'f', label: 'f' }, { name: 'v', label: 'v' }, { name: 'vo', label: 'vo' }, { name: 'vs', label: 'vs' }],
    solve(values) {
      const f = Number(values.f), v = Number(values.v), vo = Number(values.vo), vs = Number(values.vs);
      if ([f, v, vo, vs].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const denom = v - vs;
      if (denom === 0) return { result: 'قيم غير صالحة', steps: [] };
      const result = f * (v + vo) / denom;
      return { result: `f' = ${fmt(result)} Hz`, steps: [`f' = ${f} × (${v} + ${vo}) / (${v} - ${vs})`, `f' = ${fmt(result)} Hz`] };
    },
  },
  {
    id: 'lens-magnification',
    branchId: 'waves-optics',
    name: 'تكبير العدسة',
    formula: 'M = -v / u',
    description: 'يحسب نسبة ارتفاع الصورة إلى ارتفاع الجسم. الإشارة السالبة تشير إلى انعكاس الصورة.',
    method: '1) حدد بعد الصورة v. 2) حدد بعد الجسم u. 3) M = -v/u. |M| < 1 تصغير، |M| > 1 تكبير.',
    examples: [{ title: 'مثال', values: { v: 30, u: 10 }, steps: ['M = -30/10 = -3 (تكبير 3×)'] }],
    variables: [{ name: 'v', label: 'v' }, { name: 'u', label: 'u' }],
    solve(values) {
      const v = Number(values.v), u = Number(values.u);
      if ([v, u].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (u === 0) return { result: 'u يجب ألا يكون صفراً', steps: [] };
      const result = -v / u;
      return { result: `M = ${fmt(result)}`, steps: [`M = -${v}/${u}`, `M = ${fmt(result)}`] };
    },
  }
];
