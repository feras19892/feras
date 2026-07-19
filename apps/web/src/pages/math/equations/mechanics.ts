import type { Equation } from '../math-types';
import { fmt, parseNumbers, toRad, toDeg } from '../math-utils';

export const mechanicsEquations: Equation[] = [
  {
    id: 'velocity-final',
    branchId: 'mechanics',
    name: 'السرعة النهائية',
    formula: 'v = v0 + at',
    description: 'يحسب السرعة النهائية لجسم متحرك بعجلة ثابتة عندما نعرف سرعته الابتدائية والزمن المنقضي.',
    method: '1) حدد السرعة الابتدائية v0. 2) حدد التسارع a (يمكن أن يكون سالباً للتباطؤ). 3) حدد الزمن t. 4) اضرب التسارع في الزمن ثم أضف السرعة الابتدائية: v = v0 + a×t.',
    examples: [{ title: 'مثال', values: { v0: 0, a: 2, t: 5 }, steps: ['v = 10'] }],
    relatedExperiments: [{ id: 'freefall', name: 'السقوط الحر', route: '/physics/mechanics/freefall', context: 'السرعة النهائية تزداد خطياً مع الزمن.' }],
    graph: {
      label: 'السرعة مع الزمن: v = v0 + at',
      xRange: [0, 10],
      yRange: [-20, 20],
      params: { v0: 0, a: 2 },
      fn: (t, p) => p.v0 + p.a * t,
    },
    variables: [{ name: 'v0', label: 'v0' }, { name: 'a', label: 'a' }, { name: 't', label: 't' }],
    solve(values) {
      const v0 = Number(values.v0), a = Number(values.a), t = Number(values.t);
      if ([v0, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `v = ${fmt(v0 + a * t)}`, steps: [`v = ${v0} + ${a}×${t}`, `v = ${fmt(v0 + a * t)}`] };
    },
  },
  {
    id: 'displacement',
    branchId: 'mechanics',
    name: 'الإزاحة',
    formula: 's = v0t + 0.5at^2',
    description: 'يُستخدم لحساب إزاحة الجسم عندما يتحرك بعجلة ثابتة.',
    method: 's = v0t + 0.5at².',
    examples: [{ title: 'مثال', values: { v0: 0, a: 2, t: 5 }, steps: ['s = 25'] }],
    relatedExperiments: [{ id: 'freefall', name: 'السقوط الحر', route: '/physics/mechanics/freefall', context: 'الإزاحة الرأسية للجسم الساقط.' }],
    graph: {
      label: 'الإزاحة مع الزمن: s = v0t + 0.5at²',
      xRange: [0, 10],
      yRange: [-20, 20],
      params: { v0: 0, a: 2 },
      fn: (t, p) => p.v0 * t + 0.5 * p.a * t * t,
    },
    variables: [{ name: 'v0', label: 'v0' }, { name: 'a', label: 'a' }, { name: 't', label: 't' }],
    solve(values) {
      const v0 = Number(values.v0), a = Number(values.a), t = Number(values.t);
      if ([v0, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `s = ${fmt(v0 * t + 0.5 * a * t * t)}`, steps: [`s = ${v0}×${t} + 0.5×${a}×${t}²`, `s = ${fmt(v0 * t + 0.5 * a * t * t)}`] };
    },
  },
  {
    id: 'kinetic-energy',
    branchId: 'mechanics',
    name: 'الطاقة الحركية',
    formula: 'KE = 0.5mv^2',
    description: 'تحسب الطاقة المختزنة في الجسم بسبب حركته. تزداد بشكل كبير مع السرعة لأنها تتناسب مع مربع السرعة.',
    method: '1) حدد كتلة الجسم m. 2) حدد سرعة الجسم v. 3) ارفع السرعة للأس 2. 4) اضرب في 0.5 × m: KE = 0.5 × m × v².',
    examples: [{ title: 'مثال', values: { m: 2, v: 10 }, steps: ['KE = 100'] }],
    applicationProblems: [
      {
        question: 'كرة كتلتها 5 كغ تتحرك بسرعة 6 م/ث. ما طاقتها الحركية؟',
        hint: 'KE = 0.5 × m × v².',
        answer: 'KE = 90 J',
        variables: { m: 5, v: 6 },
        expectedValue: 90,
      },
    ],
    relatedExperiments: [{ id: 'collision', name: 'التصادم 1D', route: '/physics/mechanics/collision', context: 'الطاقة الحركية تتغير في التصادم.' }],
    graph: {
      label: 'الطاقة الحركية مع السرعة: KE = 0.5mv²',
      xRange: [0, 10],
      yRange: [0, 100],
      params: { m: 2 },
      fn: (v, p) => 0.5 * p.m * v * v,
    },
    variables: [{ name: 'm', label: 'm' }, { name: 'v', label: 'v' }],
    solve(values) {
      const m = Number(values.m), v = Number(values.v);
      if ([m, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `KE = ${fmt(0.5 * m * v * v)}`, steps: [`KE = 0.5×${m}×${v}²`, `KE = ${fmt(0.5 * m * v * v)}`] };
    },
  },
  {
    id: 'potential-energy',
    branchId: 'mechanics',
    name: 'الطاقة الكامنة الجاذبية',
    formula: 'PE = mgh',
    description: 'تحسب الطاقة المختزنة في الجسم بسبب موضعه الارتفاعي فوق نقطة مرجعية. تزداد مع الارتفاع والكتلة.',
    method: '1) حدد كتلة الجسم m. 2) حدد تسارع الجاذبية g (على الأرض ≈ 9.8 m/s²). 3) حدد الارتفاع h. 4) اضرب الثلاثة: PE = m × g × h.',
    examples: [{ title: 'مثال', values: { m: 2, g: 9.8, h: 5 }, steps: ['PE = 98'] }],
    relatedExperiments: [{ id: 'freefall', name: 'السقوط الحر', route: '/physics/mechanics/freefall', context: 'الطاقة الكامنة تتحول إلى حركية.' }],
    constants: [
      { label: 'g', value: '9.8 m/s²', description: 'تسارع الجاذبية الأرضية' },
    ],
    variables: [{ name: 'm', label: 'm' }, { name: 'g', label: 'g' }, { name: 'h', label: 'h' }],
    solve(values) {
      const m = Number(values.m), g = Number(values.g), h = Number(values.h);
      if ([m, g, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `PE = ${fmt(m * g * h)}`, steps: [`PE = ${m}×${g}×${h}`, `PE = ${fmt(m * g * h)}`] };
    },
  },
  {
    id: 'newton-second-law',
    branchId: 'mechanics',
    name: 'قانون نيوتن الثاني',
    formula: 'F = ma',
    description: 'يربط القوة المحصلة المؤثرة على جسم بكتلته وتسارعه. أساسي في فهم الحركة والقوى.',
    method: '1) حدد كتلة الجسم m. 2) حدد تسارع الجسم a. 3) اضرب الكتلة في التسارع: F = m × a. 4) القوة تكون في اتجاه التسارع.',
    examples: [{ title: 'مثال', values: { m: 5, a: 2 }, steps: ['F = 10 N'] }],
    applicationProblems: [
      {
        question: 'صندوق كتلته 8 كغ يُدفع بقوة أفقية. إذا تسارع بمعدل 2.5 م/ث²، ما قيمة القوة؟',
        hint: 'F = ma.',
        answer: 'F = 20 N',
        variables: { m: 8, a: 2.5 },
        expectedValue: 20,
      },
    ],
    relatedExperiments: [{ id: 'inclined', name: 'المنحدر', route: '/physics/mechanics/inclined', context: 'القوة المحصلة على الجسم.' }],
    constants: [{ label: 'g', value: '9.8 m/s²', description: 'تسارع الجاذبية الأرضية' }],
    variables: [{ name: 'm', label: 'm' }, { name: 'a', label: 'a' }],
    solve(values) {
      const m = Number(values.m), a = Number(values.a);
      if ([m, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `F = ${fmt(m * a)} N`, steps: [`F = ${m}×${a}`, `F = ${fmt(m * a)} N`] };
    },
  },
  {
    id: 'work',
    branchId: 'mechanics',
    name: 'الشغل',
    formula: 'W = Fd',
    description: 'يحسب الشغل المبذول عندما تؤثر قوة على جسم وتنقله مسافة في اتجاه القوة. الأساسي في حسابات الطاقة والآلات.',
    method: '1) حدد القوة F المؤثرة. 2) حدد الإزاحة d في اتجاه القوة. 3) اضرب القوة في الإزاحة: W = F × d. 4) إذا كانت القوة غير متوازية مع الإزاحة، استخدم W = F × d × cos(θ).',
    examples: [{ title: 'مثال', values: { F: 10, d: 5 }, steps: ['W = 50 J'] }],
    applicationProblems: [
      {
        question: 'شخص يدفع صندوقاً بقوة 15 نيوتن لمسافة 8 أمتار. ما الشغل المبذول؟',
        hint: 'W = F × d.',
        answer: 'W = 120 J',
        variables: { F: 15, d: 8 },
        expectedValue: 120,
      },
    ],
    variables: [{ name: 'F', label: 'F' }, { name: 'd', label: 'd' }],
    solve(values) {
      const F = Number(values.F), d = Number(values.d);
      if ([F, d].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `W = ${fmt(F * d)} J`, steps: [`W = ${F}×${d}`, `W = ${fmt(F * d)} J`] };
    },
  },
  {
    id: 'power',
    branchId: 'mechanics',
    name: 'القدرة',
    formula: 'P = W / t',
    description: 'تحسب معدل بذل الشغل أو استهلاك الطاقة مع الزمن. كلما زادت القدرة، تمّ الشغل بشكل أسرع.',
    method: '1) حدد الشغل المبذول W. 2) حدد الزمن t المستغرق. 3) اقسم الشغل على الزمن: P = W / t. 4) يمكن أيضاً استخدام P = F × v.',
    examples: [{ title: 'مثال', values: { W: 100, t: 5 }, steps: ['P = 20 W'] }],
    variables: [{ name: 'W', label: 'W' }, { name: 't', label: 't' }],
    solve(values) {
      const W = Number(values.W), t = Number(values.t);
      if ([W, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (t === 0) return { result: 'الزمن لا يمكن أن يكون صفراً', steps: [] };
      return { result: `P = ${fmt(W / t)} W`, steps: [`P = ${W}/${t}`, `P = ${fmt(W / t)} W`] };
    },
  },
  {
    id: 'momentum',
    branchId: 'mechanics',
    name: 'الزخم',
    formula: 'p = mv',
    description: 'يقيس كمية الحركة للجسم، ويساوي حاصل ضرب كتلته في سرعته. يحفظ الزخم في التصادمات عندما لا تؤثر قوى خارجية.',
    method: '1) حدد كتلة الجسم m. 2) حدد سرعة الجسم v (مع مراعاة الإشارة للاتجاه). 3) اضرب الكتلة في السرعة: p = m × v.',
    examples: [{ title: 'مثال', values: { m: 2, v: 3 }, steps: ['p = 6'] }],
    applicationProblems: [
      {
        question: 'جسم كتلته 4 كغ يتحرك بسرعة 7 م/ث. ما زخمه؟',
        hint: 'p = m × v.',
        answer: 'p = 28 kg·m/s',
        variables: { m: 4, v: 7 },
        expectedValue: 28,
      },
    ],
    relatedExperiments: [{ id: 'collision', name: 'التصادم 1D', route: '/physics/mechanics/collision', context: 'الزخم يحفظ في التصادمات.' }],
    variables: [{ name: 'm', label: 'm' }, { name: 'v', label: 'v' }],
    solve(values) {
      const m = Number(values.m), v = Number(values.v);
      if ([m, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `p = ${fmt(m * v)}`, steps: [`p = ${m}×${v}`, `p = ${fmt(m * v)}`] };
    },
  },
  {
    id: 'density',
    branchId: 'mechanics',
    name: 'الكثافة',
    formula: 'ρ = m / V',
    description: 'تُستخدم لحساب كثافة المادة.',
    method: 'ρ = m / V.',
    examples: [{ title: 'مثال', values: { m: 1000, V: 1 }, steps: ['ρ = 1000'] }],
    variables: [{ name: 'm', label: 'm' }, { name: 'V', label: 'V' }],
    solve(values) {
      const m = Number(values.m), V = Number(values.V);
      if ([m, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (V === 0) return { result: 'V لا يمكن أن يكون صفراً', steps: [] };
      return { result: `ρ = ${fmt(m / V)}`, steps: [`ρ = ${m}/${V}`, `ρ = ${fmt(m / V)}`] };
    },
  },
  {
    id: 'pressure',
    branchId: 'mechanics',
    name: 'الضغط',
    formula: 'P = F / A',
    description: 'يُستخدم لحساب الضغط الناتج عن قوة موزعة على مساحة.',
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
      if ([F, A].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([u, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([mu, N].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([k, x].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([u, v, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([v, theta, g].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([m, v, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
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
      if ([F, dt].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = F * dt;
      return { result: `J = ${fmt(result)} N·s`, steps: [`J = ${F} × ${dt}`, `J = ${fmt(result)} N·s`] };
    },
  }
];
