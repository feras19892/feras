import type { Equation } from './math-types';
import { fmt, toRad } from './math-utils';

export const equationsPhysics: Equation[] = [
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
    variables: [{ name: 'v', label: 'v' }, { name: 'v0', label: 'v0' }, { name: 'a', label: 'a' }, { name: 't', label: 't' }],
    defaultSolveFor: 'v',
    solve(values, solveFor) {
      const target = solveFor || 'v';
      if (target === 'v') {
        const v0 = Number(values.v0), a = Number(values.a), t = Number(values.t);
        if ([v0, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        return { result: `v = ${fmt(v0 + a * t)}`, steps: [`v = ${v0} + ${a}×${t}`, `v = ${fmt(v0 + a * t)}`] };
      }
      if (target === 'v0') {
        const v = Number(values.v), a = Number(values.a), t = Number(values.t);
        if ([v, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        return { result: `v0 = ${fmt(v - a * t)}`, steps: [`v0 = v - a×t = ${v} - ${a}×${t}`, `v0 = ${fmt(v - a * t)}`] };
      }
      if (target === 'a') {
        const v = Number(values.v), v0 = Number(values.v0), t = Number(values.t);
        if ([v, v0, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (t === 0) return { result: 't يجب ألا يكون صفراً', steps: [] };
        return { result: `a = ${fmt((v - v0) / t)}`, steps: [`a = (v - v0) / t = (${v} - ${v0}) / ${t}`, `a = ${fmt((v - v0) / t)}`] };
      }
      if (target === 't') {
        const v = Number(values.v), v0 = Number(values.v0), a = Number(values.a);
        if ([v, v0, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
        return { result: `t = ${fmt((v - v0) / a)}`, steps: [`t = (v - v0) / a = (${v} - ${v0}) / ${a}`, `t = ${fmt((v - v0) / a)}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'displacement',
    branchId: 'mechanics',
    name: 'الإزاحة',
    formula: 's = v0t + 0.5at^2',
    description: 'يستخدم لحساب إزاحة الجسم عندما يتحرك بعجلة ثابتة.',
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
      if ([v0, a, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    variables: [{ name: 'KE', label: 'KE' }, { name: 'm', label: 'm' }, { name: 'v', label: 'v' }],
    defaultSolveFor: 'KE',
    solve(values, solveFor) {
      const target = solveFor || 'KE';
      if (target === 'KE') {
        const m = Number(values.m), v = Number(values.v);
        if ([m, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        return { result: `KE = ${fmt(0.5 * m * v * v)}`, steps: [`KE = 0.5×${m}×${v}²`, `KE = ${fmt(0.5 * m * v * v)}`] };
      }
      if (target === 'm') {
        const KE = Number(values.KE), v = Number(values.v);
        if ([KE, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (v === 0) return { result: 'v يجب ألا يكون صفراً', steps: [] };
        const m = (2 * KE) / (v * v);
        return { result: `m = ${fmt(m)}`, steps: [`m = 2×KE / v² = 2×${KE} / ${v}²`, `m = ${fmt(m)}`] };
      }
      if (target === 'v') {
        const KE = Number(values.KE), m = Number(values.m);
        if ([KE, m].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (m === 0) return { result: 'm يجب ألا يكون صفراً', steps: [] };
        const v = Math.sqrt((2 * KE) / m);
        return { result: `v = ${fmt(v)}`, steps: [`v = √(2×KE / m) = √(2×${KE} / ${m})`, `v = ${fmt(v)}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
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
    variables: [{ name: 'PE', label: 'PE' }, { name: 'm', label: 'm' }, { name: 'g', label: 'g' }, { name: 'h', label: 'h' }],
    defaultSolveFor: 'PE',
    solve(values, solveFor) {
      const target = solveFor || 'PE';
      if (target === 'PE') {
        const m = Number(values.m), g = Number(values.g), h = Number(values.h);
        if ([m, g, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        return { result: `PE = ${fmt(m * g * h)}`, steps: [`PE = ${m}×${g}×${h}`, `PE = ${fmt(m * g * h)}`] };
      }
      if (target === 'm') {
        const PE = Number(values.PE), g = Number(values.g), h = Number(values.h);
        if ([PE, g, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (g * h === 0) return { result: 'g×h يجب ألا يكون صفراً', steps: [] };
        return { result: `m = ${fmt(PE / (g * h))}`, steps: [`m = PE / (g×h) = ${PE} / (${g}×${h})`, `m = ${fmt(PE / (g * h))}`] };
      }
      if (target === 'g') {
        const PE = Number(values.PE), m = Number(values.m), h = Number(values.h);
        if ([PE, m, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (m * h === 0) return { result: 'm×h يجب ألا يكون صفراً', steps: [] };
        return { result: `g = ${fmt(PE / (m * h))}`, steps: [`g = PE / (m×h) = ${PE} / (${m}×${h})`, `g = ${fmt(PE / (m * h))}`] };
      }
      if (target === 'h') {
        const PE = Number(values.PE), m = Number(values.m), g = Number(values.g);
        if ([PE, m, g].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (m * g === 0) return { result: 'm×g يجب ألا يكون صفراً', steps: [] };
        return { result: `h = ${fmt(PE / (m * g))}`, steps: [`h = PE / (m×g) = ${PE} / (${m}×${g})`, `h = ${fmt(PE / (m * g))}`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
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
        question: 'صندوق كتلته 8 كغ يدفع بقوة أفقية. إذا تسارع بمعدل 2.5 م/ث²، ما قيمة القوة؟',
        hint: 'F = ma.',
        answer: 'F = 20 N',
        variables: { m: 8, a: 2.5 },
        expectedValue: 20,
      },
    ],
    relatedExperiments: [{ id: 'inclined', name: 'المنحدر', route: '/physics/mechanics/inclined', context: 'القوة المحصلة على الجسم.' }],
    constants: [{ label: 'g', value: '9.8 m/s²', description: 'تسارع الجاذبية الأرضية' }],
    variables: [{ name: 'F', label: 'F' }, { name: 'm', label: 'm' }, { name: 'a', label: 'a' }],
    defaultSolveFor: 'F',
    solve(values, solveFor) {
      const target = solveFor || 'F';
      if (target === 'F') {
        const m = Number(values.m), a = Number(values.a);
        if ([m, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        return { result: `F = ${fmt(m * a)} N`, steps: [`F = ${m}×${a}`, `F = ${fmt(m * a)} N`] };
      }
      if (target === 'm') {
        const F = Number(values.F), a = Number(values.a);
        if ([F, a].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (a === 0) return { result: 'a يجب ألا يكون صفراً', steps: [] };
        return { result: `m = ${fmt(F / a)} kg`, steps: [`m = F / a = ${F} / ${a}`, `m = ${fmt(F / a)} kg`] };
      }
      if (target === 'a') {
        const F = Number(values.F), m = Number(values.m);
        if ([F, m].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (m === 0) return { result: 'm يجب ألا يكون صفراً', steps: [] };
        return { result: `a = ${fmt(F / m)} m/s²`, steps: [`a = F / m = ${F} / ${m}`, `a = ${fmt(F / m)} m/s²`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
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
      if ([F, d].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([W, t].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
      if ([m, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `p = ${fmt(m * v)}`, steps: [`p = ${m}×${v}`, `p = ${fmt(m * v)}`] };
    },
  },
  {
    id: 'density',
    branchId: 'mechanics',
    name: 'الكثافة',
    formula: 'ف = m / V',
    description: 'تستخدم لحساب كثافة المادة.',
    method: 'ف = m / V.',
    examples: [{ title: 'مثال', values: { m: 1000, V: 1 }, steps: ['ف = 1000'] }],
    variables: [{ name: 'm', label: 'm' }, { name: 'V', label: 'V' }],
    solve(values) {
      const m = Number(values.m), V = Number(values.V);
      if ([m, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (V === 0) return { result: 'V لا يمكن أن يكون صفراً', steps: [] };
      return { result: `ف = ${fmt(m / V)}`, steps: [`ف = ${m}/${V}`, `ف = ${fmt(m / V)}`] };
    },
  },
  {
    id: 'wave-speed',
    branchId: 'waves-optics',
    name: 'سرعة الموجة',
    formula: 'v = fλ',
    description: 'تربط بين سرعة الموجة وترددها وطولها الموجي. تستخدم في الموجات الصوتية والضوئية والمائية.',
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
      if ([f, lambda].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `v = ${fmt(f * lambda)}`, steps: [`v = ${f}×${lambda}`, `v = ${fmt(f * lambda)}`] };
    },
  },
  {
    id: 'lens-equation',
    branchId: 'waves-optics',
    name: 'معادلة العدسة',
    formula: '1/f = 1/u + 1/v',
    description: 'تستخدم لحساب البعد البؤري للعدسة.',
    method: '1/f = 1/u + 1/v.',
    examples: [{ title: 'مثال', values: { u: 10, v: 20 }, steps: ['f ≈ 6.667'] }],
    relatedExperiments: [{ id: 'thin-lens', name: 'العدسة الرقيقة', route: '/physics/waves/thin-lens', context: 'تجربة العدسة الرقيقة.' }],
    variables: [{ name: 'u', label: 'u' }, { name: 'v', label: 'v' }],
    solve(values) {
      const u = Number(values.u), v = Number(values.v);
      if ([u, v].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
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
    description: 'يستخدم لحساب زاوية الانكسار.',
    method: 'sin(θ2) = (n1/n2) sin(θ1).',
    examples: [{ title: 'مثال', values: { n1: 1, n2: 1.5, theta1: 30 }, steps: ['θ2 ≈ 19.47°'] }],
    relatedExperiments: [{ id: 'light-ray', name: 'شعاع الضوء', route: '/physics/waves/light-ray', context: 'تجربة الانكسار.' }],
    variables: [{ name: 'n1', label: 'n1' }, { name: 'n2', label: 'n2' }, { name: 'theta1', label: 'θ1' }],
    solve(values) {
      const n1 = Number(values.n1), n2 = Number(values.n2), theta1 = Number(values.theta1);
      if ([n1, n2, theta1].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      const theta2 = Math.asin((n1 / n2) * Math.sin(toRad(theta1))) * 180 / Math.PI;
      return { result: `θ2 = ${fmt(theta2)}°`, steps: [`sin(θ2) = (${n1}/${n2})×sin(${theta1}°)`, `θ2 = ${fmt(theta2)}°`] };
    },
  },
  {
    id: 'magnification',
    branchId: 'waves-optics',
    name: 'التكبير',
    formula: 'm = v / u',
    description: 'يستخدم لحساب تكبير الصورة.',
    method: 'm = v / u.',
    examples: [{ title: 'مثال', values: { v: 20, u: 10 }, steps: ['m = 2'] }],
    variables: [{ name: 'v', label: 'v' }, { name: 'u', label: 'u' }],
    solve(values) {
      const v = Number(values.v), u = Number(values.u);
      if ([v, u].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (u === 0) return { result: 'u لا يمكن أن يكون صفراً', steps: [] };
      return { result: `m = ${fmt(v / u)}`, steps: [`m = ${v}/${u}`, `m = ${fmt(v / u)}`] };
    },
  },
  {
    id: 'ohms-law',
    branchId: 'electricity',
    name: 'قانون أوم',
    formula: 'V = IR',
    description: 'يستخدم لحساب الجهد في دائرة كهربائية.',
    method: 'V = IR.',
    examples: [{ title: 'مثال', values: { I: 2, R: 5 }, steps: ['V = 10 V'] }],
    applicationProblems: [
      {
        question: 'دائرة كهربائية بتيار 0.5 أمبير ومقاومة 20 أوم. ما الجهد؟',
        hint: 'V = I × R.',
        answer: 'V = 10 V',
        variables: { I: 0.5, R: 20 },
        expectedValue: 10,
      },
    ],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'قانون أوم أساسي في الدوائر.' }],
    constants: [{ label: 'ف0 النحاس', value: '1.68 × 10^-8 Ω·m', description: 'المقاومية النوعية للنحاس' }],
    variables: [{ name: 'V', label: 'V' }, { name: 'I', label: 'I' }, { name: 'R', label: 'R' }],
    defaultSolveFor: 'V',
    solve(values, solveFor) {
      const target = solveFor || 'V';
      if (target === 'V') {
        const I = Number(values.I), R = Number(values.R);
        if ([I, R].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        return { result: `V = ${fmt(I * R)} V`, steps: [`V = ${I}×${R}`, `V = ${fmt(I * R)} V`] };
      }
      if (target === 'I') {
        const V = Number(values.V), R = Number(values.R);
        if ([V, R].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (R === 0) return { result: 'R يجب ألا يكون صفراً', steps: [] };
        return { result: `I = ${fmt(V / R)} A`, steps: [`I = V / R = ${V} / ${R}`, `I = ${fmt(V / R)} A`] };
      }
      if (target === 'R') {
        const V = Number(values.V), I = Number(values.I);
        if ([V, I].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (I === 0) return { result: 'I يجب ألا يكون صفراً', steps: [] };
        return { result: `R = ${fmt(V / I)} Ω`, steps: [`R = V / I = ${V} / ${I}`, `R = ${fmt(V / I)} Ω`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'electric-power',
    branchId: 'electricity',
    name: 'القدرة الكهربائية',
    formula: 'P = VI',
    description: 'تستخدم لحساب القدرة المستهلكة.',
    method: 'P = VI.',
    examples: [{ title: 'مثال', values: { V: 12, I: 3 }, steps: ['P = 36 W'] }],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'القدرة المستهلكة P = VI.' }],
    variables: [{ name: 'P', label: 'P' }, { name: 'V', label: 'V' }, { name: 'I', label: 'I' }],
    defaultSolveFor: 'P',
    solve(values, solveFor) {
      const target = solveFor || 'P';
      if (target === 'P') {
        const V = Number(values.V), I = Number(values.I);
        if ([V, I].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        return { result: `P = ${fmt(V * I)} W`, steps: [`P = ${V}×${I}`, `P = ${fmt(V * I)} W`] };
      }
      if (target === 'V') {
        const P = Number(values.P), I = Number(values.I);
        if ([P, I].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (I === 0) return { result: 'I يجب ألا يكون صفراً', steps: [] };
        return { result: `V = ${fmt(P / I)} V`, steps: [`V = P / I = ${P} / ${I}`, `V = ${fmt(P / I)} V`] };
      }
      if (target === 'I') {
        const P = Number(values.P), V = Number(values.V);
        if ([P, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
        if (V === 0) return { result: 'V يجب ألا يكون صفراً', steps: [] };
        return { result: `I = ${fmt(P / V)} A`, steps: [`I = P / V = ${P} / ${V}`, `I = ${fmt(P / V)} A`] };
      }
      return { result: 'متغير غير مدعوم', steps: [] };
    },
  },
  {
    id: 'resistance-series',
    branchId: 'electricity',
    name: 'المقاومات على التوالي',
    formula: 'R = R1 + R2',
    description: 'يستخدم لحساب المقاومة الكلية على التوالي.',
    method: 'R = R1 + R2.',
    examples: [{ title: 'مثال', values: { R1: 10, R2: 20 }, steps: ['R = 30 Ω'] }],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'توصيل المقاومات على التوالي.' }],
    variables: [{ name: 'R1', label: 'R1' }, { name: 'R2', label: 'R2' }],
    solve(values) {
      const R1 = Number(values.R1), R2 = Number(values.R2);
      if ([R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      return { result: `R = ${fmt(R1 + R2)} Ω`, steps: [`R = ${R1} + ${R2}`, `R = ${fmt(R1 + R2)} Ω`] };
    },
  },
  {
    id: 'resistance-parallel',
    branchId: 'electricity',
    name: 'المقاومات على التوازي',
    formula: '1/R = 1/R1 + 1/R2',
    description: 'يستخدم لحساب المقاومة الكلية على التوازي.',
    method: '1/R = 1/R1 + 1/R2.',
    examples: [{ title: 'مثال', values: { R1: 10, R2: 20 }, steps: ['R ≈ 6.667 Ω'] }],
    relatedExperiments: [{ id: 'electric-workshop', name: 'ورشة الكهرباء', route: '/physics/electricity/electric-workshop', context: 'توصيل المقاومات على التوازي.' }],
    variables: [{ name: 'R1', label: 'R1' }, { name: 'R2', label: 'R2' }],
    solve(values) {
      const R1 = Number(values.R1), R2 = Number(values.R2);
      if ([R1, R2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (R1 === 0 || R2 === 0) return { result: 'R لا يمكن أن تكون صفراً', steps: [] };
      const R = 1 / (1 / R1 + 1 / R2);
      return { result: `R = ${fmt(R)} Ω`, steps: [`1/R = 1/${R1} + 1/${R2}`, `R = ${fmt(R)} Ω`] };
    },
  },
  {
    id: 'capacitance',
    branchId: 'electricity',
    name: 'السعة',
    formula: 'C = Q / V',
    description: 'تستخدم لحساب سعة المكثف.',
    method: 'C = Q / V.',
    examples: [{ title: 'مثال', values: { Q: 0.01, V: 5 }, steps: ['C = 0.002 F'] }],
    variables: [{ name: 'Q', label: 'Q' }, { name: 'V', label: 'V' }],
    solve(values) {
      const Q = Number(values.Q), V = Number(values.V);
      if ([Q, V].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماًً صحيحة', steps: [] };
      if (V === 0) return { result: 'V لا يمكن أن يكون صفراً', steps: [] };
      return { result: `C = ${fmt(Q / V)} F`, steps: [`C = ${Q}/${V}`, `C = ${fmt(Q / V)} F`] };
    },
  },

];
