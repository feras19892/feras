# تقرير شامل: تجربة "محصلة القوى" (Net Force)

## النظرية العلمية

### محصلة القوى بشكل عام
محصلة القوى هي القوة الواحدة المكافئة لجميع القوى المؤثرة على جسم، تُحسب بالجمع المتجهي:

```
F_net = √(ΣFx² + ΣFy²)
اتجاهها: θ = atan(ΣFy / ΣFx)
```

حسب قانون نيوتن الثاني: `F_net = m × a`

### محصلة القوى التوازنية (Equilibrium)
الجسم في توازن عندما:
```
ΣFx = 0  و  ΣFy = 0  →  F_net = 0
```
- توازن ساكن: الجسم في سكون
- توازن ديناميكي: الجسم بسرعة ثابتة مستقيمة

### محصلة القوى الشعاعية (Centripetal)
في الحركة الدائرية، المحصلة موجهة نحو المركز:
```
Fc = m × v² / r = m × ω² × r
ac = v² / r = ω² × r
v = ω × r
T (الدور) = 2π / ω
```

### القوى المتاحة في التجربة
| القوة | الرمز | الصيغة | الاتجاه |
|---|---|---|---|
| الوزن | W | m×g | لأسفل |
| القوة العمودية | N | m×g×cos(θ_surface) | عمودي على السطح |
| القوة الخارجية | F_app | (يحددها الطالب) | زاوية θ_app |
| الاحتكاك | f | μ×N | عكس الحركة المتوقعة |
| التوتر | T | (يحددها الطالب) | زاوية θ_T |
| القوة المركزية | Fc | m×v²/r | نحو المركز |

---

## هيكل الملفات (15 ملف)

### 1. محرك الفيزياء (2 ملف)
```
apps/web/src/modules/physics/experiments/netforce/
  ├── useNetForcePhysics.ts    (~130 سطر) — الحسابات + دالة step
  └── NetForceExperiment.vue   (~120 سطر) — الواجهة الرئيسية
```

### 2. Composables (5 ملفات)
```
apps/web/src/composables/netforce/
  ├── netforceUtils.ts          (~90 سطر)  — دوال حسابية مساعدة
  ├── useNetForceLab.ts         (~110 سطر) — إدارة RAF + تشغيل/إيقاف
  ├── useNetForceTrials.ts      (~170 سطر) — تسجيل التجارب + CSV + إحصاءات
  ├── useNetForceLayout.ts      (~100 سطر) — إدارة الألواح القابلة للسحب
  └── useNetForceExperiment.ts  (~130 سطر) — تجميع params + lab + layout + trials
```

### 3. مكوّنات الواجهة (8 ملفات)
```
apps/web/src/components/experiment/netforce/
  ├── NetForceMenuBar.vue       (~60 سطر)  — شريط القوائم
  ├── NetForceCanvas.vue        (~250 سطر) — رسم المشهد (Canvas 2D)
  ├── NetForcePanelBody.vue     (~120 سطر) — محتوى الألواح
  ├── NetForceOverlayPanels.vue (~60 سطر)  — الألواح المكبّرة
  ├── NetForceControlBar.vue    (~50 سطر)  — أزرار تشغيل/إيقاف/سرعة
  ├── NetForceHelpModal.vue     (~80 سطر)  — نافذة المساعدة
  ├── NetForceGuidePanel.vue    (~60 سطر)  — دليل إرشادي
  └── NetForceStatusBar.vue     (~30 سطر)  — شريط الحالة
```

### 4. التسجيل (تعديل 4 ملفات موجودة)
```
apps/web/src/modules/physics/catalog.ts           — إضافة تجربة في فرع mechanics
apps/web/src/modules/physics/experiment-loader.ts  — ربط ID بالـ Vue component
apps/web/src/modules/physics/experiment-page.vue   — إضافة لـ expNameKey map
apps/web/src/modules/physics/branch-page.vue       — إضافة لـ expNameKey map
```

### 5. i18n (تعديل 2 ملفات موجودة)
```
apps/web/src/locales/experiments/ar-4a.ts  — مفاتيح عربية
apps/web/src/locales/experiments/en-4a.ts  — مفاتيح إنجليزية
```

---

## التفاصيل التقنية لكل ملف

### useNetForcePhysics.ts
```typescript
interface NetForceParams {
  mode: 'equilibrium' | 'centripetal'
  mass: number           // 0.1–10 kg
  g: number              // m/s² (افتراضي 9.81)
  // وضع التوازن:
  appliedForce: number   // 0–50 N
  appliedAngle: number   // 0–360°
  mu: number             // 0–1
  surfaceAngle: number   // 0–45° (زاوية السطح)
  tension: number        // 0–50 N (اختياري)
  tensionAngle: number   // 0–360°
  // وضع الشعاع:
  radius: number         // 0.1–2 m
  angularVelocity: number // 0.1–10 rad/s
  // عام:
  airResistance: boolean
  cd: number
  area: number
}

interface NetForceState {
  running: boolean
  paused: boolean
  t: number
  angle: number       // الزاوية الحالية للوضع الدائري
  position: number    // الإزاحة للوضع التوازني
  velocity: number
  settled: boolean
}

interface NetForceMeasured {
  netForceX: number | null
  netForceY: number | null
  netForceMag: number | null
  netForceDir: number | null
  normalForce: number | null
  frictionForce: number | null
  centripetalForce: number | null
  centripetalAcc: number | null
  tensionForce: number | null
  isBalanced: boolean | null
}
```

دالة `step(dt, speed)`:
- **وضع التوازن**: تحلل القوى إلى مركبات، تحسب المحصلة، إذا ≠ صفر تحسب التسارع وتحرّك الجسم
- **وضع الشعاع**: تحدّث الزاوية θ(t) = ω×t، تحسب Fc لحظيًا

### netforceUtils.ts
دوال مساعدة:
- `toRad(deg)` — تحويل درجة إلى راديان
- `resolveForce(F, angleDeg)` — يُرجع {fx, fy}
- `calcNetForce(forces: {fx, fy}[])` — يُرجع {mag, dir, fx, fy}
- `calcCentripetal(m, omega, r)` — يُرجع {fc, ac, v, T}
- `calcEquilibrium(params)` — يحسب كل القوى في وضع التوازن
- `calcFriction(mu, N, appliedParallel)` — يحسب قوة الاحتكاك (ساكن/حركي)

### useNetForceLab.ts
نفس نمط `useInclinedLab.ts`:
- `tickFrame()` — requestAnimationFrame loop
- `start()` / `togglePause()` / `stopSim()` / `resetSim()`
- `speed` ref (تباطؤ/تسريع)
- `runNetForceLab(recordTrial)` — سلسلة تجارب آلية:
  - وضع التوازن: يغيّر زاوية القوة من 0° إلى 90° بخطوات 15°
  - وضع الشعاع: يغيّر ω من 1 إلى 10 rad/s بخطوات 2

### useNetForceTrials.ts
```typescript
interface NetForceTrial {
  id: number
  mode: 'equilibrium' | 'centripetal'
  mass: number
  // للتوازن:
  appliedForce: number
  appliedAngle: number
  mu: number
  netForceX: number
  netForceY: number
  netForceMag: number
  isBalanced: boolean
  // للشعاع:
  radius: number
  angularVelocity: number
  centripetalForce: number
  centripetalAcc: number
  // عام:
  err: number
}
```
ميزات (نفس نمط باقي التجارب):
- `recordTrial()` — مع Gaussian noise اختياري
- `undo()` / `redo()` (20 خطوة)
- `autoSave()` / `autoLoad()` في localStorage
- `exportCsv()`
- `trialStats` computed
- `calcNetForce()` / `calcCentripetal()` / `calcMuFromBalance()` / `calcVFromCentripetal()`

### useNetForceLayout.ts
الألواح:
| Panel ID | العمود | الوصف |
|---|---|---|
| `table` | data | جدول التجارب |
| `equations` | data | المعادلات والحسابات |
| `fbd` | data | مخطط الجسم الحر (Free Body Diagram) |
| `tutor` | data | رسائل توجيهية |
| `report` | data | تقرير قابل للطباعة |
| `params` | ctrl | لوحة التحكم بالبارامترات |
| `guide` | ctrl | دليل إرشادي |
| `stats` | ctrl | إحصاءات |

### useNetForceExperiment.ts
يجمع:
- `params` reactive
- `lab` = useNetForceLab(params)
- `layout` = useNetForceLayout()
- `trials` = useNetForceTrials(params, lab.measured, enableNoise)
- `exportToAnalysis()` — يُرسل إلى `/physics/mechanics/analysis-calc`
- `handleDrop()` / `onResizeStart()` — نفس نمط باقي التجارب

### NetForceCanvas.vue
#### وضع التوازن:
- جسم (مربع/دائرة) على سطح
- أسهم ملونة للقوى من مركز الجسم:
  - الوزن (أحمر ↓)
  - القوة العمودية (أزرق ↑)
  - القوة الخارجية (أخضر، زاوية)
  - الاحتكاك (برتقالي، عكس الحركة)
  - التوتر (بنفسجي، زاوية) — اختياري
- المحصلة (سهم سميك منفصل) إذا ≠ صفر
- قيم رقمية بجانب كل سهم
- شبكة إحداثيات خفيفة

#### وضع الشعاع:
- مسار دائري متقطع
- جسم يدور على المحيط
- سهم القوة المركزية (أحمر → المركز)
- سهم السرعة المماسي (أخضر)
- خيط/قضيب يربط الجسم بالمركز
- قيم v, Fc, ac, T معروضة

### NetForcePanelBody.vue
يعرض محتوى مختلف حسب `id`:
- `table`: جدول التجارب + أزرار حذف/تصدير
- `equations`: أزرار حساب + نتيجة HTML
- `fbd`: مخطط الجسم الحر مرسوم بـ SVG بسيط
- `tutor`: رسائل توجيهية حسب حالة المحاكاة
- `report`: تقرير قابل للطباعة
- `params`: sliders + inputs حسب الوضع
- `guide`: خطوات إرشادية
- `stats`: متوسط + انحراف معياري

---

## لوحة التحكم (Params Panel)

### للوضع التوازني
- **الكتلة** m — slider 0.1–10 kg
- **القوة الخارجية** F — slider 0–50 N
- **زاوية القوة** θ — slider 0–360°
- **معامل الاحتكاك** μ — slider 0–1
- **زاوية السطح** — slider 0–45°
- **التوتر** T — slider 0–50 N (اختياري)
- **زاوية التوتر** — slider 0–360°
- **مقاومة الهواء** — toggle
- **زر "موازنة تلقائية"** — يحسب F المطلوبة لـ ΣF=0

### للوضع الشعاعي
- **الكتلة** m — slider 0.1–5 kg
- **نصف القطر** r — slider 0.1–2 m
- **السرعة الزاوية** ω — slider 0.1–10 rad/s
- **مقاومة الهواء** — toggle

---

## التصدير لتحليل البيانات (exportToAnalysis)

```typescript
const payload: AnalysisPayload = {
  sourceExperiment: 'netforce',
  sourceNameAr: t('experiments.expNetForce'),
  hasCalcTab: true,
  readings: trials.map(tr => ({
    mass: tr.mass,
    appliedForce: tr.appliedForce,
    appliedAngle: tr.appliedAngle,
    netForceMag: tr.netForceMag,
    isBalanced: tr.isBalanced,
    radius: tr.radius,
    angularVelocity: tr.angularVelocity,
    centripetalForce: tr.centripetalForce,
  })),
  columns: [
    { key: 'mass', label: 'm (kg)', unit: 'kg' },
    { key: 'appliedForce', label: 'F (N)', unit: 'N' },
    { key: 'appliedAngle', label: 'θ (°)', unit: '°' },
    { key: 'netForceMag', label: 'F_net (N)', unit: 'N' },
    { key: 'radius', label: 'r (m)', unit: 'm' },
    { key: 'angularVelocity', label: 'ω (rad/s)', unit: 'rad/s' },
    { key: 'centripetalForce', label: 'Fc (N)', unit: 'N' },
  ],
  equations: [
    { name: 'محصلة القوى', formula: 'F_net = √(ΣFx² + ΣFy²)', solveFor: ['F_net'] },
    { name: 'القوة المركزية', formula: 'Fc = mv²/r', solveFor: ['Fc', 'v', 'r'] },
    { name: 'شرط التوازن', formula: 'ΣF = 0', solveFor: [] },
  ],
  suggestedPlots: [
    { xKey: 'appliedAngle', yKey: 'netForceMag', type: 'scatter' },
    { xKey: 'angularVelocity', yKey: 'centripetalForce', type: 'scatter' },
  ],
}
```

---

## التسجيل في المشروع

### catalog.ts (فرع mechanics)
```typescript
{ id: 'netforce', name: 'Net Force', nameAr: 'experiments.expNetForce',
  icon: '⚖️', difficulty: 'medium', tags: ['forces', 'equilibrium', 'circular'], route: '', enabled: true },
```

### experiment-loader.ts
```typescript
'netforce': () => import('./experiments/netforce/NetForceExperiment.vue'),
```

### experiment-page.vue + branch-page.vue
إضافة في `expNameKey` map:
```typescript
netforce: 'experiments.expNetForce',
```

### i18n — ar-4a.ts
```
expNetForce: 'محصلة القوى',
eqNetForce: 'محصلة القوى',
eqCentripetal: 'القوة المركزية',
eqEquilibrium: 'شرط التوازن',
varNetForce: 'المحصلة',
varCentripetalForce: 'القوة المركزية',
varRadius: 'نصف القطر',
varAngularVelocity: 'السرعة الزاوية',
varNormalForce: 'القوة العمودية',
varFrictionForce: 'قوة الاحتكاك',
varTension: 'التوتر',
colNetForce: 'المحصلة',
colRadius: 'نصف القطر',
colAngularVelocity: 'ω',
colCentripetalForce: 'Fc',
colNormalForce: 'N',
colFrictionForce: 'f',
```

### i18n — en-4a.ts
```
expNetForce: 'Net Force',
eqNetForce: 'Net Force',
eqCentripetal: 'Centripetal Force',
eqEquilibrium: 'Equilibrium Condition',
varNetForce: 'Net Force',
varCentripetalForce: 'Centripetal Force',
varRadius: 'Radius',
varAngularVelocity: 'Angular Velocity',
varNormalForce: 'Normal Force',
varFrictionForce: 'Friction Force',
varTension: 'Tension',
colNetForce: 'F_net',
colRadius: 'r',
colAngularVelocity: 'ω',
colCentripetalForce: 'Fc',
colNormalForce: 'N',
colFrictionForce: 'f',
```

---

## ميزات تعليمية تفاعلية

### للوضع التوازني
- **عرض لحظي**: كلما غيّر الطالب قيمة، تتحرك الأسهم فورًا
- **زر "التحقق من التوازن"**: يُظهر ✅ إذا ΣF < 0.01 N أو ❌
- **زر "موازنة تلقائية"**: يحسب القوة المطلوبة لـ ΣF = 0
- **جدول تحليل المركبات**: يعرض Fx و Fy لكل قوة

### للوضع الشعاعي
- **مقياس قوة رقمي**: يقرأ Fc لحظيًا
- **تتبع المسار**: أثر حركة الجسم على الدائرة
- **تغيير الكتلة أثناء الدوران**: يُظهر تغير Fc فورًا

### مشتركة
- **مخطط الجسم الحر (FBD)**: لوحة منفصلة
- **اختصارات لوحة المفاتيح**: Space (تشغيل/إيقاف), R (إعادة), S (تسجيل), ? (مساعدة)

---

## ترتيب التنفيذ

1. إنشاء `useNetForcePhysics.ts` + `netforceUtils.ts` (المحرك)
2. إنشاء `useNetForceLab.ts` (إدارة التشغيل)
3. إنشاء `useNetForceTrials.ts` (التجارب)
4. إنشاء `useNetForceLayout.ts` (الألواح)
5. إنشاء `useNetForceExperiment.ts` (التجميع)
6. إنشاء `NetForceCanvas.vue` (الرسم)
7. إنشاء باقي المكوّنات (MenuBar, PanelBody, ControlBar, HelpModal, GuidePanel, StatusBar, OverlayPanels)
8. إنشاء `NetForceExperiment.vue` (الواجهة)
9. التسجيل في catalog.ts + experiment-loader.ts + experiment-page.vue + branch-page.vue
10. إضافة i18n keys في ar-4a.ts + en-4a.ts
11. فحص الأنواع: `pnpm --filter @my-modern-app/web run typecheck`
12. البناء: `cd apps/web && node ../../node_modules/vite/bin/vite.js build`

---

## قيود يجب الالتزام بها
- كل ملف ≤ 300 سطر
- TypeScript strict mode
- اتباع نفس أنماط التجارب الموجودة (inclined, projectile, spring)
- لا كسر أي وظيفة موجودة
- لا إضافة dependencies خارجية
- استخدام DraggablePanel و ResetConfirmModal المشتركين
- استخدام useAnomalyWatcher للمراقبة
- استخدام sendToAnalysis للتصدير
