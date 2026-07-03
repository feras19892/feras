# خطة بناء تجربة: محصلة توازن القوى (Equilibrium of Forces)

## 0. المبدأ التصميمي
كل شيء يبنى بنفس نمط Spring/FreeFall/Collision — لا انحراف.

---

## 1. Physics Layer
**الملف:** `modules/physics/experiments/lever/useLeverPhysics.ts`

### الواجهة (State)
```ts
interface LeverState {
  running: boolean
  paused: boolean
  // القوى
  forces: Force[]      // { id, magnitude, angleDeg, fx, fy }
  // القوة الناقصة للتوازن
  equilibriumForce: { magnitude: number; angleDeg: number; fx: number; fy: number } | null
  // المحصلة
  resultant: { fx: number; fy: number; magnitude: number; angleDeg: number }
  // هل متوازن؟
  isBalanced: boolean
}
```

### الدوال
- `addForce(magnitude, angleDeg)` — إضافة قوة جديدة
- `removeForce(id)` — حذف قوة
- `updateForce(id, magnitude, angleDeg)` — تعديل قوة
- `computeResultant()` — حساب المحصلة ∑Fx, ∑Fy → |R|, θ
- `computeEquilibrium()` — القوة الموازنة: -R
- `checkBalance()` — هل |R| < threshold (مثلاً 0.01 N)
- `reset()` — مسح كل القوى
- `step()` — لا يوجد animation loop فعلي (محاكاة استاتيكية) لكن نحافظ على النمط

---

## 2. Lab Layer
**الملف:** `composables/lever/useLeverLab.ts`

- Wrapper حول Physics
- `running`, `paused`, `speed` refs
- لا يوجد RAF loop حقيقي (القوى استاتيكية) لكن نحتفظ بالـ wrapper للتوافق
- `cleanup()` فاضية

---

## 3. Trials Layer
**الملف:** `composables/lever/useLeverTrials.ts`

### Trial Interface
```ts
interface LeverTrial {
  id: number
  trialNo: number
  forceCount: number      // عدد القوى
  sumFx: number            // مجموع المركبات x
  sumFy: number             // مجموع المركبات y
  resultantMag: number      // مقدار المحصلة
  resultantAngle: number   // زاوية المحصلة
  eqForceMag: number       // مقدار القوة الناقصة
  eqForceAngle: number     // زاوية القوة الناقصة
  isBalanced: boolean
}
```

### الدوال
- `recordTrial()` — تسجيل حالة القوى الحالية كمحاولة
- `undo()`, `redo()`, `canUndo()`, `canRedo()`
- `exportCsv()` — تصدير البيانات
- `autoSave()` / `autoLoad()` — localStorage
- دوال حسابية:
  - `calcComponents()` — عرض المركبات Fx = F·cosθ, Fy = F·sinθ
  - `calcPolygon()` — التحقق من إغلاق المضلع

---

## 4. Layout Layer
**الملف:** `composables/lever/useLeverLayout.ts`

### Panels
- `table` — جدول المحاولات
- `signal` — رسم بياني لتوزيع القوى (شكل نجمة/قطبي)
- `equations` — المعادلات (∑Fx=0, ∑Fy=0)
- `guide` — دليل خطوات التجربة
- `report` — تقرير مختصر

### الأعمدة
- `data`: table, signal
- `vis`: (فارغ افتراضياً)
- `ctrl`: equations, guide, report

---

## 5. Experiment Orchestrator
**الملف:** `composables/lever/useLeverExperiment.ts`

- يجمع `lab + layout + trials`
- `exportToAnalysis()`:
  - readings: [{ trialNo, forceCount, sumFx, sumFy, resultantMag, resultantAngle, eqForceMag, eqForceAngle, isBalanced }]
  - columns: trialNo, sumFx, sumFy, resultantMag, resultantAngle, eqForceMag, eqForceAngle
  - equations:
    - ∑Fx = 0 (التوازن الانسحابي)
    - ∑Fy = 0 (التوازن الانسحابي)
    - R = √(∑Fx² + ∑Fy²) (المحصلة)
    - F_eq = -R (القوة الموازنة)
  - suggestedPlots:
    - scatter: القوى حسب الزاوية (قطبي)
- Keyboard: Space (لا عمل), R reset, S record, Ctrl+Z/Y

---

## 6. Vue Components

### a. LeverCanvas.vue
**الملف:** `components/experiment/lever/LeverCanvas.vue`

رسم Canvas تفاعلي:
- **نقطة الأصل** في مركز Canvas
- **محور x** يمين، **محور y** لأعلى
- كل قوة → سهم من نقطة الأصل:
  - الطول ∝ magnitude (بمقياس رسم)
  - الاتجاه = angleDeg (من +x)
  - لون مختلف لكل قوة
- **المحصلة** → سهم بلون أحمر (نتيجة متجهية)
- **القوة الناقصة** → سهم بلون أخضر منقط
- **دائرة وحدة** أو **شبكة دائرية** (0° إلى 360°)
- عند التوازن: علامة ✅ خضراء مركزية
- interactions:
  - pointer drag لتحريك نهاية السهم (تغيير magnitude و angle)
  - double click لحذف قوة
  - زر "+ قوة" يضيف قوة جديدة عشوائية

### b. LeverMenuBar.vue
نفس نمط SpringMenuBar:
- File (export CSV, restore UI)
- View (table, signal, equations, guide, report)
- Run (no-op لأن تجربة استاتيكية)
- Analyze (export to analysis)
- Help

### c. LeverControlBar.vue
- Reset | Record | Clear | Undo | Redo | Export CSV
- لا يوجد Start/Pause لأن التجربة استاتيكية

### d. LeverStatusBar.vue
- عدد القوى | ∑Fx | ∑Fy | |R| | حالة التوازن ✅/❌

### e. LeverPanelBody.vue
موزع حسب id:
- `table` → LeverTablePanel
- `signal` → LeverSignalPanel (رسم القطبي)
- `equations` → LeverEquationPanel (∑Fx, ∑Fy, R, F_eq)
- `guide` → LeverGuidePanel (خطوات التجربة)
- `report` → LeverReportPanel

### f. LeverHelpModal.vue
شرح نظري + عملي + كيفية الرسم

---

## 7. Experiment Page
**الملف:** `modules/physics/experiments/lever/LeverExperiment.vue`

بنفس نمط SpringExperiment.vue:
- MenuBar
- HelpModal
- 3-column grid (data | vis | ctrl)
- Canvas في vis-col
- DraggablePanels في data و ctrl
- Hint-bar: "أضف قوى وتحقق من التوازن" → "القوى غير متوازنة" → "✅ متوازن!"
- StatusBar + ControlBar

---

## 8. Registration (تجديد)
- ✅ catalog.ts — موجود
- ✅ experiment-loader.ts — موجود
- ✅ branch-page.vue — موجود
- ✅ experiment-page.vue — موجود
- Locales (إضافات مطلوبة):
  - ar-4: expLever, leverTitle, leverGuideStep1-5, colSumFx, colSumFy, colResultantMag, colResultantAngle, colEqForceMag, colEqForceAngle, eqSumFx, eqSumFy, eqResultant, eqEquilibriumForce
  - en-4: نفس المفاتيح بالإنجليزية
  - es-4: نفس المفاتيح بالإسبانية
  - ar-2: leverLabReport, noDataForReport
  - en-2/es-2: نفس المفاتيح

---

## 9. التسلسل الزمني للبناء
1. Physics (useLeverPhysics.ts)
2. Lab (useLeverLab.ts)
3. Trials (useLeverTrials.ts)
4. Layout (useLeverLayout.ts)
5. Orchestrator (useLeverExperiment.ts)
6. Canvas (LeverCanvas.vue)
7. MenuBar + ControlBar + StatusBar
8. PanelBody + Panels
9. HelpModal
10. LeverExperiment.vue (الجامع)
11. Locales
12. Type Check

---

## ملاحظات تصميمية
- التجربة **استاتيكية** — لا يوجد animation loop
- لكن نحافظ على wrapper lab للتوافق مع النمط العام
- Canvas هو القلب — يجب أن يكون تفاعلياً (drag forces)
- المقياس الرسمي: كل 10 N = 50 px
- الزوايا: 0° = شرق، 90° = شمال، 180° = غرب، 270° = جنوب
- عند التوازن: تظهر علامة ✅ + نص "متوازن" + القوة الناقصة = صفر
