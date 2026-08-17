import type { Equation } from '../math-types';
import { fmt, toRad } from '../math-utils';

export const equationsAdvanced_mechanics: Equation[] = [
{
    id: 'pressure',
    branchId: 'mechanics',
    name: 'الضغط',
    formula: 'P = F / A',
    description: 'يستخدم لحساب الضغط الناتج عن قوة موزعة على مساحة.',
    method: 'P = F / A.',
    examples: [{ title: 'مثال', values: { F: 100, A: 2 }, steps: ['P = 50 Pa'] }],
    applicationProblems: [
      {
        question: 'قدم شخص تضغط على الأرض بقوة 80 نيوتن على مساحة 0.5 م². ما الضغط؟',
        hint: 'P = F / A.',
        answer: 'P = 160 Pa',
        variables: { F: 80, A: 0.5 },
        expectedValue: 160,
      },
    ],
    variables: [{ name: 'F', label: 'F' }, { name: 'A', label: 'A' }],
    solve(values) {
      const F = Number(values.F), A = Number(values.A);
      if ([F, A].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (A === 0) return { result: 'A لا يمكن أن تكون صفراً', steps: [] };
      return { result: `P = ${fmt(F / A)} Pa`, steps: [`P = ${F}/${A}`, `P = ${fmt(F / A)} Pa`] };
    },
  },
{
    id: 'acceleration',
    branchId: 'mechanics',
    name: 'التسارع',
    formula: 'v = u + at',
    description: 'تربط بين السرعة الابتدائية والنهائية والتسارع والزمن.',
    method: '1) حدد السرعة الابتدائية u. 2) حدد التسارع a. 3) حدد الزمن t. 4) v = u + at.',
    examples: [{ title: 'مثال', values: { u: 5, a: 2, t: 4 }, steps: ['v = 5 + 2×4 = 13 m/s'] }],
    applicationProblems: [
      {
        question: 'سيارة تسير بسرعة 10 m/s وتتسارع بـ 3 m/s² لمدة 5 s. ما سرعتها النهائية؟',
        hint: 'u = 10، a = 3، t = 5.',
        answer: 'v = 25 m/s',
        variables: { u: 10, a: 3, t: 5 },
        expectedValue: 25,
      },
    ],
    variables: [{ name: 'u', label: 'u' }, { name: 'a', label: 'a' }, { name: 't', label: 't' }],
    solve(values) {
      const u = Number(values.u), a = Number(values.a), t = Number(values.t);
      if ([u, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = u + a * t;
      return { result: `v = ${fmt(result)} m/s`, steps: [`v = ${u} + ${a} × ${t}`, `v = ${fmt(result)} m/s`] };
    },
  },
{
    id: 'friction',
    branchId: 'mechanics',
    name: 'قوة الاحتكاك',
    formula: 'f = μN',
    description: 'تحسب قوة الاحتكاك بين سطحين باستخدام معامل الاحتكاك والقوة العمودية.',
    method: '1) حدد معامل الاحتكاك μ. 2) حدد القوة العمودية N. 3) f = μ × N.',
    examples: [{ title: 'مثال', values: { mu: 0.4, N: 50 }, steps: ['f = 0.4 × 50 = 20 N'] }],
    applicationProblems: [
      {
        question: 'صندوق وزنه 80 N على سطح معامل احتكاكه 0.3. ما قوة الاحتكاك؟',
        hint: 'N = 80 N، μ = 0.3.',
        answer: 'f = 24 N',
        variables: { mu: 0.3, N: 80 },
        expectedValue: 24,
      },
    ],
    variables: [{ name: 'mu', label: 'μ' }, { name: 'N', label: 'N' }],
    solve(values) {
      const mu = Number(values.mu), N = Number(values.N);
      if ([mu, N].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = mu * N;
      return { result: `f = ${fmt(result)} N`, steps: [`f = ${mu} × ${N}`, `f = ${fmt(result)} N`] };
    },
  },
{
    id: 'spring-force',
    branchId: 'mechanics',
    name: 'قانون هوك',
    formula: 'F = kx',
    description: 'تربط قوة الزنبرك بثابته والإزاحة عن وضعه الطبيعي.',
    method: '1) حدد ثابت الزنبرك k. 2) حدد الإزاحة x. 3) F = kx.',
    examples: [{ title: 'مثال', values: { k: 200, x: 0.15 }, steps: ['F = 200 × 0.15 = 30 N'] }],
    variables: [{ name: 'k', label: 'k' }, { name: 'x', label: 'x' }],
    solve(values) {
      const k = Number(values.k), x = Number(values.x);
      if ([k, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = k * x;
      return { result: `F = ${fmt(result)} N`, steps: [`F = ${k} × ${x}`, `F = ${fmt(result)} N`] };
    },
  },
{
    id: 'displacement-uvt',
    branchId: 'mechanics',
    name: 'الإزاحة باستخدام السرعتين',
    formula: 's = (u + v)/2 * t',
    description: 'تحسب إزاحة الجسم عندما نعرف السرعة الابتدائية والنهائية والزمن.',
    method: '1) حدد السرعة الابتدائية u. 2) حدد السرعة النهائية v. 3) حدد الزمن t. 4) s = ((u+v)/2) × t.',
    examples: [{ title: 'مثال', values: { u: 2, v: 8, t: 5 }, steps: ['s = (2+8)/2 × 5 = 25'] }],
    variables: [{ name: 'u', label: 'u' }, { name: 'v', label: 'v' }, { name: 't', label: 't' }],
    solve(values) {
      const u = Number(values.u), v = Number(values.v), t = Number(values.t);
      if ([u, v, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = ((u + v) / 2) * t;
      return { result: `s = ${fmt(result)}`, steps: [`s = (${u} + ${v})/2 × ${t}`, `s = ${fmt(result)}`] };
    },
  },
{
    id: 'projectile-range',
    branchId: 'mechanics',
    name: 'مدى القذيفة',
    formula: 'R = (v² sin(2θ)) / g',
    description: 'يحسب المدى الأفقي الأقصى لقذيفة أطلقت بسرعة زاوية من سطح أفقي.',
    method: '1) حدد السرعة الابتدائية v. 2) حدد زاوية الإطلاق θ بالدرجات. 3) R = v² × sin(2θ) / g.',
    examples: [{ title: 'مثال', values: { v: 20, theta: 45, g: 9.8 }, steps: ['R = 400 × sin(90°) / 9.8 ≈ 40.82'] }],
    constants: [{ label: 'g', value: '9.8 m/s²', description: 'تسارع الجاذبية الأرضية' }],
    variables: [{ name: 'v', label: 'v' }, { name: 'theta', label: 'θ°' }, { name: 'g', label: 'g' }],
    solve(values) {
      const v = Number(values.v), theta = Number(values.theta), g = Number(values.g);
      if ([v, theta, g].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (g === 0) return { result: 'g يجب ألا يكون صفراً', steps: [] };
      const result = (v * v * Math.sin(2 * toRad(theta))) / g;
      return { result: `R = ${fmt(result)} m`, steps: [`R = ${v}² × sin(2×${theta}°) / ${g}`, `R = ${fmt(result)} m`] };
    },
  },
{
    id: 'centripetal-force',
    branchId: 'mechanics',
    name: 'القوة المحيطية',
    formula: 'F = mv² / r',
    description: 'تحسب القوة المطلوبة لإبقاء جسم في حركة دائرية بسرعة ثابتة. تتجه نحو مركز الدائرة.',
    method: '1) حدد كتلة الجسم m. 2) حدد سرعته v. 3) حدد نصف قطر المسار r. 4) F = m × v² / r.',
    examples: [{ title: 'مثال', values: { m: 2, v: 5, r: 1 }, steps: ['F = 2 × 25 / 1 = 50 N'] }],
    variables: [{ name: 'm', label: 'm' }, { name: 'v', label: 'v' }, { name: 'r', label: 'r' }],
    solve(values) {
      const m = Number(values.m), v = Number(values.v), r = Number(values.r);
      if ([m, v, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (r === 0) return { result: 'r يجب ألا يكون صفراً', steps: [] };
      const result = (m * v * v) / r;
      return { result: `F = ${fmt(result)} N`, steps: [`F = ${m}×${v}²/${r}`, `F = ${fmt(result)} N`] };
    },
  },
{
    id: 'impulse',
    branchId: 'mechanics',
    name: 'الدفع',
    formula: 'J = FΔt = Δp',
    description: 'يحسب التغير في الزخم الناتج عن قوة تؤثر لفترة زمنية. يساوي مساحة المنحنى تحت قوة-زمن.',
    method: '1) حدد القوة F. 2) حدد الزمن Δt. 3) J = F × Δt. الناتج يساوي Δp = mΔv.',
    examples: [{ title: 'مثال', values: { F: 10, dt: 0.5 }, steps: ['J = 10 × 0.5 = 5 N·s'] }],
    variables: [{ name: 'F', label: 'F' }, { name: 'dt', label: 'Δt' }],
    solve(values) {
      const F = Number(values.F), dt = Number(values.dt);
      if ([F, dt].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const result = F * dt;
      return { result: `J = ${fmt(result)} N·s`, steps: [`J = ${F} × ${dt}`, `J = ${fmt(result)} N·s`] };
    },
  }
];
