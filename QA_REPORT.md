# 🐛 تقرير QA — فحص ثغرات الورشة الكهربائية
> تاريخ: 2026-07-18 | فاحص: QA Engineer (AI)

---

## القسم 1: الحالات الحرجة للأسلاك والـ Canvas (UI/UX Edge Cases)

### 🟡 BUG #1: wireCrossings لا يكتشف التقاطعات المائلة (Diagonal Crossings)

**الملف**: `wireCrossings.ts:63-89`

**المشكلة**: دالة `segmentCrossing` تكتشف **فقط** التقاطعات بين خط أفقي (horizontal) وخط عمودي (vertical). أي تقاطع بين قطعين مائلين (diagonal) يتم تجاهله:

```typescript
// سطر 69-70: يتجاهل القطع المائلة تماماً
if ((aHoriz && bHoriz) || (aVert && bVert)) return null
if (!aHoriz && !aVert && !bHoriz && !bVert) return null  // ← يتجاهل المائل×المائل
```

**التأثير**: إذا أنشأ المستخدم سلكين مائلين (عبر `manualPoints`) يتقاطعان، لن يظهر hop-over arc، وسيبدوان كأنهما متصلان كهربائياً رغم أنهما غير متصلين.

**الخطورة**: 🟡 متوسطة (بصري فقط، لا يؤثر على الحلّال)

**الإصلاح المقترح**: إضافة حساب تقاطع عام باستخدام معادلة تقاطع قطعتين خطيتين (parametric line intersection):

```typescript
function segmentCrossing(a: WireSegment, b: WireSegment): { x: number; y: number } | null {
  // ... الكود الحالي للأفقي/العمودي ...
  
  // تقاطع عام لقطعتين مائلتين
  const d1x = a.x2 - a.x1, d1y = a.y2 - a.y1
  const d2x = b.x2 - b.x1, d2y = b.y2 - b.y1
  const denom = d1x * d2y - d1y * d2x
  if (Math.abs(denom) < 1e-10) return null  // متوازيان
  const t = ((b.x1 - a.x1) * d2y - (b.y1 - a.y1) * d2x) / denom
  const s = ((b.x1 - a.x1) * d1y - (b.y1 - a.y1) * d1x) / denom
  if (t > 0.01 && t < 0.99 && s > 0.01 && s < 0.99) {
    return { x: a.x1 + t * d1x, y: a.y1 + t * d1y }
  }
  return null
}
```

---

### 🔴 BUG #2: الحذف أثناء التشغيل لا يعيد الحل فوراً في جميع المسارات

**الملف**: `useEditActions.ts:42-57`, `useComponentEditor.ts:51-72`, `useWorkshop.ts:90-91`

**المشكلة**: عند حذف مكون/سلك أثناء `running == true`:
- `useEditActions.ts` يستدعي `workshop.solve()` ✅
- `useComponentEditor.ts` يستدعي `workshop.solve()` ✅
- **لكن** `removeComponent()` و `removeWire()` في `useWorkshop.ts` نفسها لا تستدعي `solve()`. فإذا تم الحذف من مسار آخر (مثلاً keyboard shortcut مباشر، أو حذف برمجي)، سيستمر الـ solver في استخدام مكونات/أسلاك محذوفة → قيم stale → قد تظهر قراءات خاطئة حتى الـ solve التالي.

**التأثير**: قراءات خاطئة مؤقتة، أو رسم current flow animation على أسلاك محذوفة.

**الخطورة**: 🔴 عالية (بيانات غير متسقة)

**الإصلاح المقترح**: إضافة استدعاء `solve()` داخل `removeComponent` و `removeWire` في `useWorkshop.ts` إذا كان `running.value == true`:

```typescript
function removeComponent(id: number) {
  compOps.removeComponent(compCtx, id)
  if (running.value) solve()
}
function removeWire(id: number) {
  wireOps.removeWire(wireCtx, id)
  if (running.value) solve()
}
```

---

### 🟢 PASS: الـ Pan/Zoom والـ Hit-test

**الملف**: `useWorkshopCanvas.ts:27-57`

**النتيجة**: ✅ يعمل بشكل صحيح.
- `worldToScreen` و `screenToWorld` يطبقان `zoom` و `pan` بشكل متسق.
- `hitTestComponent` يستخدم `worldToScreen` للموضع ويضرب الأبعاد بـ `zoom.value`.
- لا توجد قيود (clamping) على إحداثيات المكونات، لذا يمكن سحبها خارج الشاشة، لكنها تبقى قابلة للتحديد عبر Pan.
- `hitTestTerminal` و `hitTestWire` يستخدمان `worldToScreen` و `zoom.value` بشكل صحيح.

**ملاحظة بسيطة**: لا يوجد حد أدنى/أعلى لـ `zoom` — يمكن للمستخدم التكبير لـ `zoom = 0` مما يقسم على صفر في `screenToWorld`. يُنصح بإضافة `zoom = Math.max(0.1, Math.min(10, zoom))`.

---

## القسم 2: المنطق الفيزيائي والـ Solvers

### 🔴 BUG #3: Relay Chattering — لا يوجد حد أقصى للتكرار يمنع التذبذب اللانهائي

**الملف**: `workshopSolver.ts:20-31`, `solver-dc.ts:223-249`

**المشكلة**: في `workshopSolver.ts`، حلقة relay iteration تستخدم `maxIter = 5`:

```typescript
let maxIter = 5
let changed = true
while (changed && maxIter > 0) {
  const result = solveCircuit(ctx.components, ctx.wires)
  // ... تحديث voltages/currents ...
  changed = updateRelayStates(ctx.components)
  maxIter--
}
```

**السيناريو الحرج**: إذا صمم المستخدم دائرة يكون فيها:
- الريليه مغلق → يمر تيار في الملف → يفتح الريليه
- الريليه مفتوح → لا يمر تيار في الملف → يغلق الريليه
- يتكرر...

بعد 5 تكرارات، تتوقف الحلقة. لكن `changed` قد يكون `true`، والمكونات تبقى في حالة غير مستقرة. **الأسوأ**: الـ solve النهائي (سطر 32) يُجرى على آخر حالة للريليه، والتي قد تكون عشوائية (إما مفتوح أو مغلق حسب عدد التكرارات الفردية/الزوجية).

**التأثير**: قراءات غير متسقة، ريليه يومض بصرياً، نتائج solve مختلفة بين كل ضغطة زر "Run".

**الخطورة**: 🔴 عالية (عدم استقرار + سلوك غير حتمي)

**الإصلاح المقترح**: 
1. بعد انتهاء الحلقة بدون استقرار، اضبط الريليه على آخر حالة مستقرة معروفة.
2. أضف رسالة خطأ واضحة للمستخدم:

```typescript
let maxIter = 10  // زيادة الحد
let changed = true
let lastStableResult: SolveResult | null = null
while (changed && maxIter > 0) {
  const result = solveCircuit(ctx.components, ctx.wires)
  ctx.solveResult.value = result
  for (const comp of ctx.components) {
    comp.voltage = result.componentVoltages.get(comp.id) ?? 0
    comp.current = result.componentCurrents.get(comp.id) ?? 0
  }
  changed = updateRelayStates(ctx.components)
  if (!changed) lastStableResult = result
  maxIter--
}
if (!lastStableResult) {
  ctx.error.value = 'ew.fault.relayChattering'  // تحذير: دائرة غير مستقرة
}
```

---

### 🔴 BUG #4: Potentiometer wiperRatio = 0 أو 1 يسبب مقاومة صفرية

**الملف**: `solver-dc.ts:70-78`

**المشكلة**: 
```typescript
const wiperRatio = (comp as any).wiperRatio ?? 0.5
const rWiper = R * wiperRatio
addConductance(n0, wiper, 1 / Math.max(rWiper, 1e-6))      // ← حماية 1e-6
addConductance(wiper, n1, 1 / Math.max(R - rWiper, 1e-6))   // ← حماية 1e-6
```

عند `wiperRatio = 0`: `rWiper = 0` → `Math.max(0, 1e-6) = 1e-6` → موصلية = 1e6 (مقاومة 1µΩ). هذا **محمي** ✅.

عند `wiperRatio = 1`: `R - rWiper = 0` → نفس الحماية. **محمي** ✅.

**لكن**: القيمة الافتراضية لـ `comp.value` في potentiometer هي 1000Ω. إذا ضبط المستخدم `comp.value = 0`:
```typescript
const R = Math.max(comp.value || 1000, 1)  // ← R = 1000 (fallback)
```
هذا **محمي** ✅.

**النتيجة**: 🟡 منخفضة الخطورة — الحماية موجودة، لكن `wiperRatio` غير معرّف في النوع `WorkshopComponent` (يُaccess عبر `(comp as any)`)، مما يعني أنه لا يمكن للمستخدم تغييره عبر UI. القيمة الافتراضية دائماً 0.5.

**الإصلاح المقترح**: إضافة `wiperRatio?: number` إلى `WorkshopComponent` في `types.ts`، وربطه بـ slider في الـ UI.

---

### 🔴 BUG #5: AC Resonance — تردد رنين حاد جداً يسبب تجاوز سعة (Overflow)

**الملف**: `solver-ac.ts:63-69`, `solver-transient.ts:88-96`

**المشكلة**: في AC solver، المقاومة السعوية `Xc = 1/(ωC)`:
```typescript
const C = comp.value * 1e-6
addY(n0, n1, { re: 0, im: omega * C })
```

عند الرنين: `ωL = 1/(ωC)`، المقاومة الكلية `Z = R` (min). لكن:

1. **قيم R صغيرة جداً** (مثلاً R=0.01Ω): تيار = V/R = 220/0.01 = 22000A → قيم ضخمة → قد تسبب `Infinity` في الحسابات.
2. **قيم C/L متطرفة** (C=1µF, L=1mH, f=50Hz): `Xc = 1/(2π×50×1e-6) = 3183Ω`, `Xl = 2π×50×1e-3 = 0.314Ω` — لا رنين، لكن القيم صحيحة.
3. **في transient**: `Geq = 2*C/dt` — إذا كان `dt` صغيراً جداً (f عالية)، `Geq` يصبح ضخماً → مصفوفة ill-conditioned → نتائج غير دقيقة.

**التأثير**: في الحالات المتطرفة (R≈0 عند الرنين)، قد تظهر قيم `Infinity` أو `NaN` في القراءات.

**الخطورة**: 🟡 متوسطة (يتطلب قيم متطرفة من المستخدم)

**الإصلاح المقترح**: 
- في `solver-ac.ts`: إضافة حد أدنى للمقاومة الكلية: `const R = Math.max(comp.value, 1e-3)`.
- في `solver-transient.ts`: التأكد من أن `dt` لا يصبح أصغر من حد معين: `const dt = Math.max(period / stepsPerCycle, 1e-6)`.

---

### 🟡 BUG #6: AC Transient — Transformer لا يحدثّ primary voltage في كل خطوة

**الملف**: `solver-transient.ts:227-233`

**المشكلة**: 
```typescript
for (const tf of transformers) {
  const ratio = tf.transformerRatio ?? 1
  const vsRow = numNodes + acSources.length + tfVsI
  RHS[vsRow] = (tfPrimaryVPrev.get(tf.id) ?? 0) * ratio
  tfVsI++
}
```

وفي سطر 281-282:
```typescript
const vPri = x[sp0] - x[sp1]
tfPrimaryVPrev.set(comp.id, vPri)
```

**المشكلة الفعلية**: `tfPrimaryVPrev` يُحدّث **بعد** حل كل خطوة، لكن الـ RHS يستخدم القيمة **السابقة**. هذا صحيح لـ trapezoidal integration. **لكن** في الخطوة الأولى (step=0)، `tfPrimaryVPrev = 0`، مما يعني أن الجهد الثانوي يبدأ من صفر ثم يقفز. هذا **صحيح فيزيائياً** (transient response).

**النتيجة**: ✅ صحيح — لا يوجد bug هنا.

---

### 🟡 BUG #7: AC Transient — Relay contacts لا تتحدث أثناء المحاكاة

**الملف**: `solver-transient.ts:97-105`

**المشكلة**:
```typescript
} else if (comp.type === 'relay') {
  // ... coil as inductor ...
  const nc0 = getTerminalNode(comp.id, 2)
  const nc1 = getTerminalNode(comp.id, 3)
  addG(nc0, nc1, comp.relayState ? 1e6 : 1e-12)
}
```

الـ relay contacts تستخدم `comp.relayState` **الثابت** طوال المحاكاة. لا يتم تحديثه بناءً على تيار الملف أثناء الـ transient. هذا يعني أن الريليه لن يفتح/يغلق أثناء المحاكاة الحركية حتى لو تغير التيار.

**التأثير**: محاكاة transient لدائرة بها relay لن تظهر سلوك التبديل الديناميكي.

**الخطورة**: 🟡 متوسطة (قيود وظيفية، ليس crash)

**الإصلاح المقترح**: داخل حلقة `for (let step = 0; step <= totalSteps; step++)`، بعد حساب التيار، تحديث `relayState`:
```typescript
for (const comp of components) {
  if (comp.type === 'relay') {
    const st = indState.get(comp.id)!
    const coilI = st.iPrev
    const threshold = comp.value * 1e-3
    comp.relayState = Math.abs(coilI) > threshold
  }
}
// إعادة بناء G matrix إذا تغير relayState
```

---

### 🟡 BUG #8: AC Transient — LED و Motor و Potentiometer لا تُحسب تياراتها

**الملف**: `solver-transient.ts:260-312`

**المشكلة**: في حلقة حساب التيار لكل مكون (سطر 262-312)، LED و motor و potentiometer تقع في `else { cc.push(0) }` — تيار صفر. هذا **خطأ** — يجب حساب تيارها مثل resistor:

```typescript
// الكود الحالي لا يحتوي على:
// } else if (comp.type === 'led') { ... }
// } else if (comp.type === 'motor') { ... }
// } else if (comp.type === 'potentiometer') { ... }
```

**التأثير**: oscilloscope متصل عبر LED/motor سيعرض جهد صحيح لكن تيار صفر في الـ transient.

**الخطورة**: 🟡 متوسطة

**الإصلاح المقترح**: إضافة حالات في حلقة حساب التيار:
```typescript
} else if (comp.type === 'led') {
  const Vf = comp.value || 2
  cc.push(v > Vf ? (v - Vf) / 100 : 0)
} else if (comp.type === 'motor') {
  cc.push(v / Math.max(comp.value || 6, 1e-6))
} else if (comp.type === 'potentiometer') {
  cc.push(v / Math.max(comp.value || 1000, 1))
}
```

---

## القسم 3: تطابق الشرح مع المكونات (Scientific UX Mismatch)

### 🔴 BUG #9: dcExplainCalcs للتجارب الجديدة يستخدم نصوص ثابتة (Hardcoded) بدلاً من حسابات ديناميكية

**الملف**: `dcExplainCalcs.ts:23-28`

**المشكلة**: التجارب الجديدة (`rc_charge`, `rl_transient`, `wheatstone`, `thevenin`, `superposition`, `maxpower`) تستخدم دوال سطر واحد ترجع نص ثابت:

```typescript
rc_charge: (ctx) => `<h3>${ctx.t('ew.exp.rc_charge')}</h3><p>V(t) = V₀(1 − e^(−t/RC))</p>`,
rl_transient: (ctx) => `<h3>${ctx.t('ew.exp.rl_transient')}</h3><p>I(t) = (V/R)(1 − e^(−Rt/L))</p>`,
wheatstone: (ctx) => `<h3>${ctx.t('ew.exp.wheatstone')}</h3><p>R₁R₄ = R₂R₃ (balanced bridge)</p>`,
```

هذه لا تأخذ القيم الفعلية من `ctx.resistors` أو `ctx.batteries`. المستخدم يرى مقاومات مختلفة على Canvas لكن الشرح يعرض صيغة عامة فقط بدون أرقام.

**التأثير**: المستخدم يرى شرح عام لا يطابق قيم مكوناته الفعلية.

**الخطورة**: 🔴 عالية (تجربة تعليمية ناقصة)

**الإصلاح المقترح**: كتابة دوال شرح كاملة تأخذ القيم من `ctx`:
```typescript
rc_charge: (ctx) => {
  const V = ctx.V
  const R = ctx.resistors[0]?.value ?? 100
  const C = (ctx.comps.find(c => c.type === 'capacitor')?.value ?? 100) * 1e-6
  const tau = R * C
  return `<h3>${ctx.t('ew.exp.rc_charge')}</h3>
    <p>V = ${V}V, R = ${R}Ω, C = ${C*1e6}µF</p>
    <p>τ = RC = ${R} × ${C*1e6}e-6 = ${tau.toFixed(4)}s</p>
    <p>V(t) = ${V}(1 − e^(−t/${tau.toFixed(4)}))</p>`
}
```

---

### 🟡 BUG #10: acExplainCalcs للـ powerfactor و resonance يستخدم القيم الديناميكية لكن بشكل مبسط

**الملف**: `acExplainCalcs.ts:31-44`

**المشكلة**: الشرح للـ `ac_powerfactor` و `ac_resonance` **يأخذ القيم ديناميكياً** ✅:

```typescript
const R = ctx.resistors.reduce((s, r) => s + r.value, 0)
const XL = ctx.inductors.length > 0 ? ctx.omega * ctx.inductors[0].value * 1e-3 : 0
```

**لكن**: 
1. يستخدم `ctx.inductors[0]` فقط — يتجاهل لفات إضافية.
2. لا يحسب التيار الفعلي أو الاستطاعة — يعرض صيغ عامة فقط.
3. لا يعرض قيم القراءات من الـ solver (V, I, P الفعلية).

**الخطورة**: 🟡 متوسطة (القيم صحيحة لكن الشرح غير كامل)

---

### 🟢 PASS: ألوان المقاومات تتطابق مع القيم الرياضية

**الملف**: `resistorColors.ts:30-65`, `solver-dc.ts:182`

**النتيجة**: ✅ متطابق.
- `valueToResistorBands(value)` يحول القيمة العددية إلى ألوان بشكل صحيح.
- `getResistorBandColors(value)` يرجع ألوان hex.
- الـ solver يحسب التيار بـ `V / (comp.value || 1)` — يستخدم نفس `comp.value` الذي يُعرض كألوان.
- لوحة القراءات تعرض `comp.value` كقيمة عددية.

**ملاحظة**: القيم الكسرية (مثل 4.7Ω) قد لا تتطابق تماماً مع نظام الألوان القياسي (4-band) لأن `valueToResistorBands` يستخدم `toFixed(0)` للقيم ≥ 1. القيم مثل 4.7Ω ستصبح 5Ω في الألوان. هذا **خطأ في الدقة**:

```typescript
// سطر 37: const str = absVal.toFixed(0)  ← يقرب 4.7 إلى 5
```

**الإصلاح المقترح**: استخدام نظام 5-band للقيم الكسرية، أو عرض band خامس (tolerance) للقيم غير الصحيحة.

---

### 🟡 BUG #11: dcExplainCalcs1 — حسابات تستخدم القيم من ctx لكن قد لا تتطابق مع قراءات الـ solver

**الملف**: `dcExplainCalcs1.ts:15-62`

**المشكلة**: دالة `explainOhm` تحسب التيار يدوياً:
```typescript
const Icalc = V / R  // V من ctx.V (totalVoltage), R من ctx.resistors[0]?.value
```

بينما الـ solver يحسب التيار عبر MNA وقد تختلف القيم في دوائر معقدة (مثلاً مع ammeter resistance، wire resistance، أو عدة مصادر).

**التأثير**: في الدوائر البسيطة (ohm فقط) → متطابق ✅. في دوائر معقدة مع مكونات إضافية → الشرح يعرض قيم مختلفة عن القراءات.

**الخطورة**: 🟡 متوسطة (يقتصر على الدوائر المعقدة)

**الإصلاح المقترح**: استخدام `ctx.I` (من `workshop.totalCurrent.value`) بدلاً من إعادة حساب `V/R`:
```typescript
const Icalc = ctx.I  // التيار الفعلي من الـ solver
```

---

## ملخص الأخطاء

| # | الخطورة | النوع | الملف | الوصف |
|---|---------|------|------|------|
| 1 | 🟡 متوسطة | بصري | wireCrossings.ts | تقاطعات الأسلاك المائلة غير مكتشفة |
| 2 | 🔴 عالية | منطقي | useWorkshop.ts | الحذف أثناء التشغيل لا يعيد solve في جميع المسارات |
| 3 | 🔴 عالية | فيزيائي | workshopSolver.ts | Relay chattering — عدم استقرار + سلوك غير حتمي |
| 4 | 🟡 منخفضة | نوعي | types.ts | wiperRatio غير معرّف في النوع |
| 5 | 🟡 متوسطة | فيزيائي | solver-ac.ts | قيم R≈0 عند الرنين تسبب overflow |
| 6 | ✅ — | — | solver-transient.ts | Transformer transient — صحيح |
| 7 | 🟡 متوسطة | منطقي | solver-transient.ts | Relay contacts لا تتحدث أثناء AC transient |
| 8 | 🟡 متوسطة | منطقي | solver-transient.ts | LED/motor/potentiometer تيار صفر في AC transient |
| 9 | 🔴 عالية | تعليمي | dcExplainCalcs.ts | شرح ثابت للتجارب الجديدة بدون قيم ديناميكية |
| 10 | 🟡 متوسطة | تعليمي | acExplainCalcs.ts | شرح powerfactor/resonance غير كامل |
| 11 | 🟡 متوسطة | تعليمي | dcExplainCalcs1.ts | حسابات شرح قد تختلف عن قراءات solver |

**الإجمالي**: 4 أخطاء 🔴 عالية + 6 أخطاء 🟡 متوسطة/منخفضة + 2 ✅ سليم

---

## ترتيب الإصلاح المقترح (حسب الأولوية)

1. **BUG #3** (Relay chattering) — خطر تجمد/عدم استقرار
2. **BUG #2** (حذف أثناء التشغيل) — بيانات غير متسقة
3. **BUG #9** (شرح ثابت) — تجربة تعليمية ناقصة
4. **BUG #8** (تيار صفر في transient) — نتائج خاطئة
5. **BUG #7** (relay في transient) — قيود وظيفية
6. **BUG #1** (تقاطعات مائلة) — بصري
7. **BUG #5** (overflow عند الرنين) — قيم متطرفة
8. **BUG #11** (اختلاف الشرح) — دقة
9. **BUG #10** (شرح AC غير كامل) — تحسين
10. **BUG #4** (wiperRatio نوعي) — تحسين
