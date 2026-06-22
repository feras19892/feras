# خطة الإصلاح العميق والتطوير — تجربة المنشور (Prism Dispersion)

> **القواعد المطبقة:** MIGRATION_RULES.md — لا تبسيط UI، لا حذف ميزات، فصل الملفات >300 سطر (.vue) و >200 سطر (.ts)، البنية: components/experiment/prism/, composables/prism/, types/.

---

## المرحلة 1: تصحيح الأخطاء الحرجة (Critical Fixes)
> **هدف:** إصلاح ما قد يُعطل التجربة الآن بدون تغيير UI/UX.

### 1.1 تصليح أنواع `PrismTrial` — `null` في TIR
- **الملف:** `apps/web/src/composables/prism/usePrismTrials.ts`
- **المشكلة:** `angleEmergence: number` لكن `calculatePrismAngles` تُعيد `null` عند TIR.
- **الإجراء:** تغيير الواجهة (interface):
  ```ts
  angleEmergence: number | null
  deviation: number | null
  ```
- **التأثير:** يجب تحديث `PrismPanelBody.vue` لعرض `'TIR'` عند `null`.

### 1.2 تصليح `exportCsv` — `toFixed` على `null`
- **الملف:** `apps/web/src/composables/prism/usePrismTrials.ts`
- **المشكلة:** `t.angleEmergence.toFixed(1)` يتعطل عند `null`.
- **الإجراء:** استبدال `.toFixed(1)` بـ helper:
  ```ts
  function fmt(v: number | null, digits = 1): string {
    return v !== null ? v.toFixed(digits) : 'TIR'
  }
  ```

### 1.3 إضافة `downloadCsv` — تصدير فعلي للملف
- **الملف:** `apps/web/src/composables/prism/usePrismExperiment.ts`
- **المشكلة:** زر "تصدير CSV" لا يُنزّل ملفاً.
- **الإجراء:** إضافة دالة `downloadCsv()` تُنشئ `Blob` + `URL.createObjectURL` + `<a download>`.
- **التأثير:** تغيير `@export-csv` في `PrismMenuBar.vue` و `PrismControlBar.vue` لاستدعاء `ex.downloadCsv` بدلاً من `ex.trials.exportCsv`.
- **لا تغيير في UI:** الزر نفسه، السلوك فقط يتغير.

### 1.4 إصلاح `nFromRegression` — عرض `nValue` الصحيح
- **الملف:** `apps/web/src/composables/prism/usePrismExperiment.ts`
- **المشكلة:** `-b/m` لا معنى فيزيائي له.
- **الإجراء:** استبدال `nFromRegression` بـ `avgNFromTrials`:
  ```ts
  const avgN = computed(() => {
    if (trials.trials.value.length === 0) return null
    return trials.trials.value.reduce((s, t) => s + t.n, 0) / trials.trials.value.length
  })
  ```
- **التأثير:** تحديث `PrismPanelBody.vue` لعرض `avgN` في لوحة `readings` و `results`.

### 1.5 إصلاح `handleDrop` — خوارزمية Swap
- **الملف:** `apps/web/src/composables/prism/usePrismExperiment.ts`
- **المشكلة:** `remove-then-insert` يُغيّر `ti` إذا `fi < ti` في نفس المصفوفة.
- **الإجراء:** استخدام Swap صحيح:
  ```ts
  const temp = arr[fi]; arr[fi] = arr[ti]; arr[ti] = temp
  ```

---

## المرحلة 2: تصحيح الأساس الفيزيائي (Physics Corrections)
> **هدف:** ضمان صحة المعادلات والقيم بدون تغيير UI.

### 2.1 التحقق من معادلة Cauchy
- **الملف:** `apps/web/src/composables/prism/usePrismCalculations.ts`
- **المشكلة:** معاملات `B` و `C` غير موثقة.
- **الإجراء:** إضافة تعليق توثيقي:
  ```ts
  // Cauchy: n(λ) = B + C/λ²  (λ in μm)
  // Glass (BK7 approx): B=1.504, C=0.0042 μm² → n(588nm)=1.516
  ```
- **لا تغيير في القيم** إذا كانت تعطي نتائج معقولة.

### 2.2 إضافة Clamp للمعاملات
- **الملف:** `apps/web/src/composables/prism/usePrismExperiment.ts`
- **المشكلة:** `prismAngle` قد يصبح <0 أو >180.
- **الإجراء:** إضافة watchers تُطبّق `clamp` على `params.prismAngle` و `params.angleIncidence` و `params.wavelength`.
- **لا تغيير في UI:** الـ sliders لها `min/max` بالفعل، هذا احتياط إضافي.

### 2.3 إعادة تصميم الانحدار والاستنتاج
- **الملف:** `apps/web/src/composables/prism/usePrismExperiment.ts`
- **المشكلة:** الانحدار على `(λ, δ)` لا يُعطي `n`.
- **الإجراء:**
  1. حذف `nFromRegression` نهائياً.
  2. في لوحة `results` عرض: `n المتوسط` (من التجارب المسجلة) + `n الحسابي` (الحالي).
  3. في لوحة `chart` عرض منحنى `δ` مقابل `θᵢ` بدلاً من `δ` مقابل `n`.
- **التأثير:** تعديل `PrismPanelBody.vue` (قسم `chart` و `results`).

### 2.4 إضافة ميزة "البحث عن δ_min"
- **الملف:** جديد `usePrismMinDeviation.ts`
- **الوصف:** composable يحسب `δ` لمجموعة من `θᵢ` (10..80°) ويجد النقطة الدنيّة.
- **الإجراء:** إنشاء ملف <200 سطر:
  ```ts
  export function usePrismMinDeviation(prismAngle: number, wavelength: number, material: string) {
    const points = computed(() => {
      const pts = []
      for (let theta = 10; theta <= 80; theta += 1) {
        const r = calculatePrismAngles(prismAngle, theta, wavelength, material)
        if (!r.tir && r.deviation !== null) pts.push({ theta_i: theta, delta: r.deviation })
      }
      return pts
    })
    const minDelta = computed(() => points.value.length ? Math.min(...points.value.map(p => p.delta)) : null)
    const minTheta = computed(() => {
      const pt = points.value.find(p => p.delta === minDelta.value)
      return pt ? pt.theta_i : null
    })
    return { points, minDelta, minTheta }
  }
  ```
- **الربط:** إضافة زر "احسب δ_min" في لوحة `laws` — عند الضغط يُظهر جدول النقاط + القيمة الدنيّة.

---

## المرحلة 3: إعادة بناء الرسم البصري (Canvas Renderer Refactor)
> **هدف:** فصل `usePrismRenderer.ts` (>200 سطر) وتحسين الأداء.
> **⚠️ لا تغيير في الشكل البصري النهائي.**

### 3.1 فصل الهندسة الرياضية
- **ملف جديد:** `apps/web/src/composables/prism/prism-geometry.ts`
- **المحتوى:** `toRad`, `toDeg`, `getLineIntersection`, حساب نقاط المثلث (`pA`, `pB`, `pC`), حساب Normals.
- **الحد:** <200 سطر.

### 3.2 فصل تتبع الأشعة (Ray Tracer)
- **ملف جديد:** `apps/web/src/composables/prism/prism-raytracer.ts`
- **المحتوى:** `traceSingleRay()` — تتبع شعاع واحد عبر المنشور، إرجاع `{ p2, emergentAngle, tir, reflectionAngle }`.
- **الحد:** <200 سطر.

### 3.3 فصل الدوال الرسومية
- **ملف جديد:** `apps/web/src/composables/prism/prism-drawing.ts`
- **المحتوى:** `drawPrismShape()`, `drawRay()`, `drawNormal()`, `drawLabel()`, `drawSpectrum()`.
- **الحد:** <200 سطر.

### 3.4 إعادة ربط `usePrismRenderer.ts`
- **الملف:** `apps/web/src/composables/prism/usePrismRenderer.ts`
- **الإجراء:** استيراد الثلاثة ملفات أعلاه وتجميعها فقط في `drawPrism()`.
- **الحد:** <100 سطر (تركيب فقط).

### 3.5 تحسين الأداء
- **الملف:** `apps/web/src/composables/prism/prism-drawing.ts`
- **الإجراء:**
  - إلغاء `shadowBlur` للأشعة الملونة (تبقى للشعاع الأبيض فقط).
  - استخدام `requestAnimationFrame` في `PrismCanvas.vue` بدلاً من `watch()` مباشر.

---

## المرحلة 4: فصل `PrismPanelBody.vue`
> **هدف:** الملف 207 سطر — يتجاوز حد 200 سطر (.ts/.vue script). لا يتجاوز 300 سطر لكن قسم `template` ضخم.
> **القاعدة:** `<template> كبير → فصّل إلى <component> منفصلة.`

### 4.1 فصل كل لوحة إلى مكون مستقل
- **المكونات الجديدة:**
  - `apps/web/src/components/experiment/prism/panels/PrismReadingsPanel.vue`
  - `apps/web/src/components/experiment/prism/panels/PrismChartPanel.vue`
  - `apps/web/src/components/experiment/prism/panels/PrismTrialsPanel.vue`
  - `apps/web/src/components/experiment/prism/panels/PrismParamsPanel.vue`
  - `apps/web/src/components/experiment/prism/panels/PrismLawsPanel.vue`
  - `apps/web/src/components/experiment/prism/panels/PrismResultsPanel.vue`
- **الحد:** كل مكون <200 سطر.
- **التأثير:** `PrismPanelBody.vue` يصبح router فقط:
  ```vue
  <PrismReadingsPanel v-if="id === 'readings'" ... />
  <PrismChartPanel v-else-if="id === 'chart'" ... />
  <!-- ... -->
  ```

### 4.2 إنشاء types مشتركة
- **ملف جديد:** `apps/web/src/types/prism.ts`
- **المحتوى:** `PrismTrial`, `PrismParams`, `RegressionResult`, `PrismPoint`.
- **الحد:** <100 سطر.
- **الإجراء:** تحديث جميع الاستيرادات لاستخدام `types/prism.ts`.

---

## المرحلة 5: إضافة ميزات علمية متقدمة
> **هدف:** تعزيز القيمة التعليمية بدون تغيير البنية الأساسية.

### 5.1 وضع "البحث عن δ_min"
- **الملف:** `apps/web/src/components/experiment/prism/panels/PrismLawsPanel.vue`
- **الإجراء:** إضافة زر "حساب δ_min" يستدعي `usePrismMinDeviation` ويعرض جدول + قيمة δ_min.
- **لا تغيير في UI الحالي:** إضافة قسم جديد فقط.

### 5.2 مؤشر الطيف الكامل
- **الملف:** `apps/web/src/components/experiment/prism/panels/PrismParamsPanel.vue`
- **الإجراء:** إضافة checkbox "عرض الطيف الكامل" — عند التفعيل، `PrismCanvas` يرسم جميع أطياف SPECTRUM بدلاً من الطول الموجي المحدد فقط.

### 5.3 مقارنة المواد
- **الملف:** `apps/web/src/components/experiment/prism/panels/PrismResultsPanel.vue`
- **الإجراء:** عند تغيير المادة، يُسجل `n` السابق تلقائياً (اختياري). عرض جدول مقارنة.

---

## المرحلة 6: اختبار وتوثيق

### 6.1 اختبار المعادلات
- **الملف:** جديد `apps/web/src/composables/prism/__tests__/calculations.test.ts`
- **الاختبارات:**
  - `calculatePrismAngles(60, 45, 580, 'glass')` → `n ≈ 1.516`, `δ` معروفة.
  - TIR عند `θᵢ = 90°` على `diamond`.
  - `linearRegression` على نقاط معروفة (y = 2x + 1) → `m=2, b=1, r2=1`.

### 6.2 اختبار CSV
- **الملف:** جديد `apps/web/src/composables/prism/__tests__/trials.test.ts`
- **الاختبارات:**
  - `recordTrial` عند `angleEmergence = null` → لا يُسجل.
  - `exportCsv` عند تجارب تحتوي `null` → يُنتج `'TIR'` بدون خطأ.

### 6.3 توثيق المعادلات
- **الملف:** `apps/web/src/composables/prism/usePrismCalculations.ts`
- **الإجراء:** إضافة تعليق فوق كل دالة:
  ```ts
  /**
   * Cauchy's equation for refractive index:
   * n(λ) = B + C/λ²  where λ is in μm.
   * @see https://en.wikipedia.org/wiki/Cauchy%27s_equation
   */
  ```

---

## جدول التنفيذ (Prioritized)

| المرحلة | المهمة | الأولوية | الملفات المتأثرة | حجم التغيير |
|---------|--------|----------|------------------|-------------|
| 1.1 | تصحيح `PrismTrial` types | **حرجة** | `usePrismTrials.ts`, `PrismPanelBody.vue` | صغير |
| 1.2 | تصحيح `exportCsv` null | **حرجة** | `usePrismTrials.ts` | صغير |
| 1.3 | إضافة `downloadCsv` | **حرجة** | `usePrismExperiment.ts`, `PrismMenuBar.vue`, `PrismControlBar.vue` | صغير |
| 1.4 | إصلاح `nFromRegression` | **حرجة** | `usePrismExperiment.ts`, `PrismPanelBody.vue` | صغير |
| 1.5 | إصلاح `handleDrop` | **حرجة** | `usePrismExperiment.ts` | صغير |
| 2.2 | Clamp المعاملات | متوسطة | `usePrismExperiment.ts` | صغير |
| 2.4 | إعادة تصميم الانحدار | متوسطة | `usePrismExperiment.ts`, `PrismPanelBody.vue` | متوسط |
| 3.1-3.4 | فصل Renderer | متوسطة | `usePrismRenderer.ts` + 3 ملفات جديدة | متوسط |
| 4.1 | فصل `PrismPanelBody` | متوسطة | `PrismPanelBody.vue` + 6 مكونات جديدة | كبير |
| 4.2 | Types مشتركة | متوسطة | `types/prism.ts` + جميع الاستيرادات | متوسط |
| 2.3 | `usePrismMinDeviation` | منخفضة | ملف جديد + `PrismLawsPanel.vue` | صغير |
| 5.1-5.3 | ميزات متقدمة | منخفضة | `PrismLawsPanel.vue`, `PrismParamsPanel.vue`, `PrismResultsPanel.vue` | صغير |
| 6.1-6.3 | Tests + Docs | منخفضة | ملفات test + تعليقات | صغير |

---

## قواعد صارمة للتنفيذ

1. **لا تبسط UI** — أي تغيير في الـ template يجب أن يحافظ على الـ classes والـ styles الموجودة.
2. **لا تحذف ميزة** — حتى لو "تبدو غير مهمة".
3. **فصل الملفات >300 سطر** — `PrismPanelBody.vue` (207 سطر) يجب فصله لأن `<template>` ضخم.
4. **فصل الملفات .ts >200 سطر** — `usePrismRenderer.ts` (231 سطر) يجب فصله.
5. **لا تكتب كود من عندك** — نقل/تفكيك فقط، إضافة helpers ضرورية فقط.
6. **components/experiment/prism/panels/** — بنية المكونات الجديدة.
7. **composables/prism/** — composables الفيزياء والرسم.
8. **types/prism.ts** — أنواع مشتركة.
