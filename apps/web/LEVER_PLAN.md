# خطة بناء تجربة: توازن عارضة ميكانيكية (Lever Equilibrium)

## الهدف
بناء تجربة "ميزان العزوم / قانون الروافع" بنفس النسق المستخدم في بقية المشروع (Spring, Pendulum, Collision, ...).

## قاعدة مهمة
- ❌ أي ملف .vue > 300 سطر يجب فصله إلى مكونات أصغر.
- ❌ أي ملف .ts > 200 سطر يجب فصله.
- ❌ لا تبسط UI — انقل النمط الموجود حرفياً.

---

## الجزء 1: تسجيل التجربة (2 ملفات)

### 1.1 modules/physics/catalog.ts
- إضافة كائن ExperimentMeta جديد:
  - id: `'lever'`
  - name: `'Lever Balance'`
  - nameAr: `'توازن العارضة'`
  - icon: `'⚖️'`
  - difficulty: `'easy'`
  - tags: `['equilibrium', 'torque', 'lever']`
  - route: `''` (يتم بناؤه تلقائياً)

### 1.2 modules/physics/experiment-loader.ts
- إضافة في experimentMap:
  - `'lever': () => import('./experiments/lever/LeverExperiment.vue')`

---

## الجزء 2: محرك الفيزياء (Physics Engine)

### 2.1 modules/physics/experiments/lever/useLeverPhysics.ts (الأساس — < 200 سطر)

#### الواجهات:
```ts
export interface LeverMass {
  id: number;       // معرّف فريد
  mass: number;     // kg
  x: number;        // m (سلب = يسار الارتكاز، موجب = يمين)
  color: string;    // لون الثقل في الـ Canvas
}

export interface LeverParams {
  beamLength: number;   // m (طول العارضة الكلي، افتراضي 10)
  g: number;            // m/s² (افتراضي 9.81)
  maxTiltDeg: number;   // ° (أقصى ميلان، افتراضي 15)
  snapStep: number;     // m (خطوة التثبيت، افتراضي 0.5)
}

export interface LeverState {
  running: boolean;
  paused: boolean;
  tiltDeg: number;      // زاوية الميلان الحالية
  netTorque: number;    // N·m
  isBalanced: boolean;
  masses: LeverMass[];
  nextMassId: number;
}
```

#### الدوال:
- `useLeverPhysics(params: LeverParams)`
  - `state: LeverState` — reactive
  - `addMass(mass: number, x: number): number` — يُرجع `id` الجديد
  - `removeMass(id: number): void`
  - `moveMass(id: number, x: number): void` — snap إلى `snapStep`
  - `setUnknownMass(id: number): void` — يحدد ثقلًا كـ "مجهول" (للتجربة الثالثة)
  - `calculateTorque(): number` — `Σ(m·g·x)`
  - `calculateTilt(): number` — `clamp(torque * k, -maxTiltDeg, +maxTiltDeg)`
    - `k = maxTiltDeg / (maxTorqueReference)` حيث `maxTorqueReference = 5kg × 9.81 × 5m = 245.25 N·m`
    - أي `torque / 245.25 * 15` مع clamp.
  - `togglePause(): void` — يبدأ/يوقف المحاكاة
  - `reset(): void` — يعيد كل شيء للافتراضي (يحذف الثقالات)

#### منطق الخطوة (Step):
لا يوجد تكامل زمني (integration) معقد. العزم يتغير فقط عند:
- إضافة/حذف/نقل ثقل.
- المحاكاة "تعمل" دائماً لكن الحالة تُحسب فوراً.

لكن يجب أن ندعم حلقة `requestAnimationFrame` مشابهة للباقي:
- `step()` — يُعيد حساب `netTorque` و `tiltDeg` و `isBalanced`.
- `isBalanced` = `Math.abs(netTorque) < 0.01` (عتبة صغيرة).

---

## الجزء 3: Composables (المنطق المشترك)

### 3.1 composables/lever/useLeverLab.ts (< 200 سطر)
- يُدير حلقة `requestAnimationFrame`.
- `useLeverLab(params, onTick?)`
- `running, paused, speed`
- `tickFrame()` — تستدعي `physics.step()` إذا لم تكن متوقفة.
- `start(), togglePause(), stopSim(), resetSim()`

### 3.2 composables/lever/useLeverTrials.ts (< 200 سطر)

#### Trial:
```ts
interface LeverTrial {
  id: number;
  trialNo: number;
  netTorque: number;
  tiltDeg: number;
  isBalanced: boolean;
  masses: { mass: number; x: number }[];
  unknownMass?: number;  // كتلة الثقل المجهول إن وُجد
}
```

- `trials: Ref<LeverTrial[]>`
- `recordTrial()` — يلتقط الحالة الحالية (Masses + Torque + Tilt).
- `removeTrial(id)`, `clearTrials()`
- `undo(), redo(), canUndo(), canRedo()` — نفس نمط history المُستخدم في Spring/Collision.
- `exportCsv()` — ينتج ملف CSV بالأعمدة:
  - `trialNo, massLeft_kg, massRight_kg, xLeft_m, xRight_m, netTorque_Nm, tiltDeg_deg, isBalanced`
- `autoLoad(), autoSave()` — localStorage.

### 3.3 composables/lever/useLeverLayout.ts (< 200 سطر)

#### Panel IDs:
- `table` — 📋 جدول القراءات
- `params` — ⚙️ المعاملات
- `guide` — 📋 دليل
- `stats` — 📊 إحصائيات
- `signal` — 📈 توزيع العزوم
- `equation` — 🧮 المعادلة
- `report` — 📝 التقرير
- `challenge` — 🎯 التحدي (الكتلة المجهولة)

#### Default Layout:
- data: `['table']`
- vis: `[]`
- ctrl: `['params', 'guide']`

- نفس الدوال: `isPanelVisible, togglePanel, showAllPanels, maximizePanel, movePanel, applyPersistedLayout`.

### 3.4 composables/lever/useLeverExperiment.ts (< 300 سطر — حد أقصى)

هذا الملف هو "المدير" — يجمع كل شيء.

```ts
export function useLeverExperiment() {
  const params = reactive<LeverParams>({ beamLength: 10, g: 9.81, maxTiltDeg: 15, snapStep: 0.5 })
  const lab = useLeverLab(params)
  const layout = useLeverLayout()
  const trials = useLeverTrials(params, lab.sim)

  // === لوائح البيانات ===
  const stepIndex = computed(() => trials.trials.value.length)
  const tutorType = computed(() => lab.sim.isBalanced ? 'success' : 'info')
  const tutorMessage = computed(() => {
    if (lab.sim.masses.length === 0) return 'اسحب ثقالاً على العارضة'
    if (lab.sim.isBalanced) return 'متوازن! اضغط تسجيل'
    return lab.sim.netTorque > 0 ? 'العزم لليمين أكبر' : 'العزم لليسار أكبر'
  })

  // === Challenge (الكتلة المجهولة) ===
  const unknownMassId = ref<number | null>(null)
  const challengeSolved = ref(false)

  function startChallenge() {
    lab.resetSim()
    const unknownMass = Math.round((1 + Math.random() * 5) * 10) / 10  // 1.0 to 6.0 kg
    const id = lab.sim.addMass(unknownMass, -3)  // يسار الارتكاز بـ 3m
    unknownMassId.value = id
    // يضيف كتلة مرجعية معروفة في اليمين
    lab.sim.addMass(2, 3)
    challengeSolved.value = false
  }

  function checkChallenge(guess: number) {
    if (unknownMassId.value === null) return false
    const realMass = lab.sim.masses.find(m => m.id === unknownMassId.value)?.mass ?? 0
    challengeSolved.value = Math.abs(guess - realMass) < 0.1
    return challengeSolved.value
  }

  // === Drag & Drop resizing ===
  const colClasses = { data: 'data-col', vis: 'vis-col', ctrl: 'ctrl-col' }
  const colWidths = reactive({ data: 280, vis: 0, ctrl: 280 })

  function onResizeStart(side: 'data' | 'vis', e: MouseEvent) { /* نفس Spring */ }
  function handleDrop(id: string, x: number, y: number) { /* نفس Spring */ }
  function getColumnPanels(col: string) { /* نفس Spring */ }

  // === Export to Analysis ===
  function exportToAnalysis() {
    const tList = trials.trials.value
    if (tList.length === 0) { alert('لا توجد قراءات'); return }

    const readings = tList.map(t => ({
      trialNo: t.trialNo,
      massLeft: t.masses.filter(m => m.x < 0).reduce((s, m) => s + m.mass, 0),
      massRight: t.masses.filter(m => m.x > 0).reduce((s, m) => s + m.mass, 0),
      xLeft: Math.min(...t.masses.map(m => m.x), 0),
      xRight: Math.max(...t.masses.map(m => m.x), 0),
      netTorque: t.netTorque,
      tiltDeg: t.tiltDeg,
    }))

    const payload: AnalysisPayload = {
      sourceExperiment: 'lever',
      sourceNameAr: 'توازن العارضة',
      readings,
      columns: [
        { key: 'trialNo', label: 'رقم المحاولة' },
        { key: 'massLeft', label: 'الكتلة اليسرى', unit: 'kg' },
        { key: 'massRight', label: 'الكتلة اليمنى', unit: 'kg' },
        { key: 'xLeft', label: 'ذراع اليسار', unit: 'm' },
        { key: 'xRight', label: 'ذراع اليمين', unit: 'm' },
        { key: 'netTorque', label: 'العزم الصافي', unit: 'N·m' },
        { key: 'tiltDeg', label: 'زاوية الميلان', unit: '°' },
      ],
      equations: [
        {
          name: 'قانون الروافع',
          formula: 'τ = m · g · x',
          variables: [
            { symbol: 'm', label: 'الكتلة' },
            { symbol: 'g', label: 'الجاذبية' },
            { symbol: 'x', label: 'المسافة من الارتكاز' },
          ],
          solveFor: ['m', 'x'],
        },
      ],
      suggestedPlots: [
        { xKey: 'xLeft', yKey: 'massLeft', xLabel: 'x_يسار (m)', yLabel: 'm_يسار (kg)', type: 'scatter' },
        { xKey: 'xRight', yKey: 'massRight', xLabel: 'x_يمين (m)', yLabel: 'm_يمين (kg)', type: 'scatter' },
      ],
    }
    sendToAnalysis(payload)
  }

  return {
    params, lab, layout, trials,
    stepIndex, tutorType, tutorMessage,
    unknownMassId, challengeSolved, startChallenge, checkChallenge,
    colClasses, colWidths, onResizeStart, handleDrop, getColumnPanels,
    exportToAnalysis, resetSim: lab.resetSim,
  }
}
```

---

## الجزء 4: Vue Components

### 4.1 modules/physics/experiments/lever/LeverExperiment.vue (< 300 سطر)

هيكل مشابه لـ `SpringExperiment.vue`:
- imports: `useLeverExperiment`, `LeverMenuBar`, `LeverCanvas`, `LeverControlBar`, `LeverStatusBar`, `LeverHelpModal`, `LeverPanelBody`, `LeverOverlayPanels`, `DraggablePanel`
- keyboard shortcuts: Space (بدء/توقف), R (إعادة), S (تسجيل), Ctrl+Z (تراجع), Ctrl+Y (إعادة), ? (مساعدة)
- template: `lab-grid` بـ 3 أعمدة (data | vis | ctrl)
- vis-col: يحتوي فقط `LeverCanvas`
- data-col + ctrl-col: لوائح قابلة للسحب والإفلات

### 4.2 components/experiment/lever/LeverMenuBar.vue (< 200 سطر)

نسخة مُعدلة من `SpringMenuBar.vue`:
- props: `title`, `icon`, `experimentRoute`, `experimentName`
- emit: `togglePanel`, `showAllPanels`, `exportCsv`, `togglePause`, `reset`, `recordTrial`, `toggleHelp`, `analyzeResults`
- قائمة "عرض": table, params, guide, stats, signal, equation, report, challenge
- زر "تحليل النتائج" (أخضر)
- زر "مساعدة"

### 4.3 components/experiment/lever/LeverCanvas.vue (< 300 سطر)

هذا هو المكون الأهم — يُرسم العارضة والثقالات وأسهم القوى.

#### Canvas Drawing Plan:
- الخلفية: `#0f172a`
- العارضة: خط أفقي في المنتصف (الارتكاز) بعرض `beamLength`.
- الارتكاز: مثلث في المنتصف (x=0).
- نقاط التعليق: دوائر صغيرة كل `0.5m` على طول العارضة.
- الثقالات: دوائر كبيرة (نصف قطر = `10 + mass * 5` px) فوق نقاط التعليق.
- لون الثقل: يختلف حسب الكتلة (فاتح = خفيف، غامق = ثقيل).
- أسهم القوى: سهم متجه للأسفل من كل ثقل.
  - الطول = `mass * 8` px (الكتلة 5kg → سهم طوله 40px).
- زاوية الميلان: `ctx.rotate(tiltDeg * Math.PI / 180)` حول مركز الارتكاز.
- رسوم متحركة: `transition: transform 0.3s ease-out` (في CSS لـ wrapper).

#### Interaction:
- Click على نقطة فارغة: يضيف ثقل (افتراضي 1kg).
- Drag & Drop ثقل: يُنقل إلى أقرب نقطة تعليق (Snap).
- Double click على ثقل: يفتح مربع حوار لتغيير الكتلة.
- زر "إزالة" (X) فوق كل ثقل.
- زر "الكتلة المجهولة": يبدأ التحدي.

#### Props:
```ts
const props = defineProps<{
  params: LeverParams
  simState: LeverState
}>()
```

#### Emit:
```ts
const emit = defineEmits<{
  (e: 'addMass', mass: number, x: number): void
  (e: 'removeMass', id: number): void
  (e: 'moveMass', id: number, x: number): void
  (e: 'snapshot', dataUrl: string): void
}>()
```

### 4.4 components/experiment/lever/LeverPanelBody.vue (< 200 سطر)

مثل `SpringPanelBody.vue` — يُحمل اللوحات الفرعية بناءً على `id`.

```vue
<LeverParamsPanel v-if="id === 'params'" :params="params" @update:params="emit('update:params', $event)" />
<LeverTablePanel v-else-if="id === 'table'" :trials="trials" @remove="emit('remove', $event)" @clear="emit('clear')" />
<LeverStatsPanel v-else-if="id === 'stats'" :trials="trials" :sim="sim" />
<LeverSignalPanel v-else-if="id === 'signal'" :trials="trials" />
<LeverEquationPanel v-else-if="id === 'equation'" />
<LeverGuidePanel v-else-if="id === 'guide'" />
<LeverReportPanel v-else-if="id === 'report'" :trials="trials" />
<LeverChallengePanel v-else-if="id === 'challenge'" :sim="sim" :challenge-solved="challengeSolved" @start-challenge="emit('startChallenge')" @check-challenge="emit('checkChallenge', $event)" />
<div v-else>اللوحة {{ id }}</div>
```

### 4.5 components/experiment/lever/LeverControlBar.vue (< 200 سطر)

نسخة من `SpringControlBar.vue`:
- زر "بدء/توقف" (togglePause)
- زر "إعادة" (reset)
- زر "تسجيل" (recordTrial)
- زر "تراجع" / "إعادة" (undo / redo)
- زر "مسح" (clearTrials)
- زر "CSV" (exportCsv)
- سرعة المحاكاة (speed) — غير ضرورية لكن نحتفظ بها للتناسق.
- زر "+ ثقل" — إضافة ثقل جديد عند x=0
- زر "تحدي" — يبدأ `startChallenge()`

### 4.6 components/experiment/lever/LeverStatusBar.vue (< 200 سطر)

مثل `SpringStatusBar.vue`:
- عرض: `Στ = {netTorque.toFixed(2)} N·m`
- إذا متزن: ✅ متزن
- إذا غير متزن: ↺ أو ↻ مع قيمة العزم
- عدد الثقالات: `{masses.length}`

### 4.7 components/experiment/lever/LeverOverlayPanels.vue (< 200 سطر)

نسخة من `SpringOverlayPanels.vue` — يُعرض اللوائح maximized.

### 4.8 components/experiment/lever/LeverHelpModal.vue (< 200 سطر)

نسخة من `SpringHelpModal.vue` — شرح الاختصارات والتجارب.

### 4.9 اللوائح الداخلية (Sub-Panels)

كل لوحة < 300 سطر:

#### LeverParamsPanel.vue:
- `beamLength` (slider: 4-16m)
- `g` (input: 9.81)
- `maxTiltDeg` (slider: 5-30°)
- `snapStep` (radio: 0.25, 0.5, 1.0m)
- زر "تطبيق" (يُعيد المحاكاة)

#### LeverTablePanel.vue:
- جدول: `رقم | الثقالات | العزم الصافي | الميلان | حالة`
- زر "إزالة" لكل صف
- زر "مسح الكل"

#### LeverStatsPanel.vue:
- `عدد المحاولات: {trials.length}`
- `متوسط العزم: {avgTorque}`
- `أقصى ميلان: {maxTilt}`
- `عدد مرات التوازن: {balanceCount}`

#### LeverSignalPanel.vue:
- رسم بياني: عرض العزوم على طول العارضة (torque distribution).

#### LeverEquationPanel.vue:
- `τ = m · g · x`
- مثال حسابي: `2kg × 9.81 × 3m = 58.86 N·m`

#### LeverGuidePanel.vue:
- خطوات التجربة 1: التناسب العكسي
- خطوات التجربة 2: تجميع العزوم
- خطوات التجربة 3: الكتلة المجهولة

#### LeverReportPanel.vue:
- ملخص المحاولات.
- زر "طباعة".

#### LeverChallengePanel.vue:
- زر "🎯 بدء التحدي" — يضع كتلة مجهولة + كتلة مرجعية.
- حقل إدخال: "ما كتلة الجسم المجهول؟"
- زر "تحقق" — يتحقق من `checkChallenge(guess)`.
- إذا صح: 🎉 تهانينا!
- إذا خطأ: ❌ جرب مجدداً.

---

## الجزء 5: أدوات مساعدة

### 5.1 composables/lever/leverUtils.ts (< 200 سطر)
```ts
export function calculateTorque(mass: number, x: number, g: number): number {
  return mass * g * x;
}

export function calculateNetTorque(masses: { mass: number; x: number }[], g: number): number {
  return masses.reduce((sum, m) => sum + m.mass * g * m.x, 0);
}

export function snapPosition(x: number, step: number, beamLength: number): number {
  const half = beamLength / 2;
  const snapped = Math.round(x / step) * step;
  return Math.max(-half, Math.min(half, snapped));
}

export function isBalanced(torque: number, threshold = 0.01): boolean {
  return Math.abs(torque) < threshold;
}

export function calculateTilt(torque: number, maxTorque: number, maxTiltDeg: number): number {
  if (maxTorque <= 0) return 0;
  const ratio = torque / maxTorque;
  return Math.max(-maxTiltDeg, Math.min(maxTiltDeg, ratio * maxTiltDeg));
}
```

### 5.2 composables/lever/leverUtils.test.ts
- `calculateTorque(2, 3, 9.81) === 58.86`
- `calculateNetTorque([{mass:2,x:-3},{mass:1,x:6}], 9.81) === 0`
- `snapPosition(2.3, 0.5, 10) === 2.5`
- `isBalanced(0.005) === true`, `isBalanced(0.1) === false`

---

## الجزء 6: ملخص الملفات (إجمالي: 28 ملف)

| # | المسار | النوع | السطور التقديرية |
|---|--------|------|------------------|
| 1 | `modules/physics/catalog.ts` | تعديل | +1 سطر |
| 2 | `modules/physics/experiment-loader.ts` | تعديل | +1 سطر |
| 3 | `modules/physics/experiments/lever/useLeverPhysics.ts` | جديد | 180 |
| 4 | `composables/lever/leverUtils.ts` | جديد | 60 |
| 5 | `composables/lever/leverUtils.test.ts` | جديد | 40 |
| 6 | `composables/lever/useLeverLab.ts` | جديد | 120 |
| 7 | `composables/lever/useLeverTrials.ts` | جديد | 180 |
| 8 | `composables/lever/useLeverLayout.ts` | جديد | 140 |
| 9 | `composables/lever/useLeverExperiment.ts` | جديد | 280 |
| 10 | `modules/physics/experiments/lever/LeverExperiment.vue` | جديد | 200 |
| 11 | `components/experiment/lever/LeverMenuBar.vue` | جديد | 120 |
| 12 | `components/experiment/lever/LeverCanvas.vue` | جديد | 280 |
| 13 | `components/experiment/lever/LeverPanelBody.vue` | جديد | 80 |
| 14 | `components/experiment/lever/LeverControlBar.vue` | جديد | 80 |
| 15 | `components/experiment/lever/LeverStatusBar.vue` | جديد | 60 |
| 16 | `components/experiment/lever/LeverOverlayPanels.vue` | جديد | 80 |
| 17 | `components/experiment/lever/LeverHelpModal.vue` | جديد | 80 |
| 18 | `components/experiment/lever/LeverParamsPanel.vue` | جديد | 100 |
| 19 | `components/experiment/lever/LeverTablePanel.vue` | جديد | 100 |
| 20 | `components/experiment/lever/LeverStatsPanel.vue` | جديد | 60 |
| 21 | `components/experiment/lever/LeverSignalPanel.vue` | جديد | 80 |
| 22 | `components/experiment/lever/LeverEquationPanel.vue` | جديد | 60 |
| 23 | `components/experiment/lever/LeverGuidePanel.vue` | جديد | 80 |
| 24 | `components/experiment/lever/LeverReportPanel.vue` | جديد | 60 |
| 25 | `components/experiment/lever/LeverChallengePanel.vue` | جديد | 100 |
| 26 | `composables/lever/fuzz-lever-physics.test.ts` | جديد | 80 |
| 27 | `composables/lever/property-lever.test.ts` | جديد | 60 |

---

## الجزء 7: تسلسل البناء (الخطوات المنطقية)

1. **بناء محرك الفيزياء** (`useLeverPhysics.ts` + `leverUtils.ts` + tests)
2. **بناء Lab, Trials, Layout** (`useLeverLab.ts` + `useLeverTrials.ts` + `useLeverLayout.ts`)
3. **بناء التجربة الرئيسية** (`useLeverExperiment.ts`)
4. **بناء Canvas** (`LeverCanvas.vue`)
5. **بناء الأزرار** (`LeverMenuBar.vue` + `LeverControlBar.vue` + `LeverStatusBar.vue`)
6. **بناء اللوائح** (`LeverPanelBody.vue` + اللوائح الفرعية)
7. **بناء الصفحة** (`LeverExperiment.vue`)
8. **ربط التجربة** (`catalog.ts` + `experiment-loader.ts`)
9. **اختبارات fuzz + property**
10. **lint + typecheck**

---

## ملاحظات أخنية

- **العرضة** تُرسم بشكل ثابت (لا توجد حركة زمنية معقدة) — كل التغيير يحدث فوراً عند تعديل الكتل.
- **الـ Canvas** هو الوحيد المعقد — كل شيء آخر نسخ/لصق مُعدل من Spring/Pendulum.
- **الـ Challenge** (الكتلة المجهولة) يُضيف "لعبة" تعليمية — يمكن تخطيها إذا أردنا البساطة.
- **ألوان الثقالات**: نستخدم مقياس HSL حيث `lightness = 80 - mass * 8` (أخف = كتلة أكبر).
