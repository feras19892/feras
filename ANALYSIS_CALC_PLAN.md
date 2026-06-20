# خطة بناء صفحة التحليل والحساب (Analysis & Calculation)

## الهدف
صفحة مركزية تجمع قراءات الطالب من أي تجربة فيزيائية، وتعرضها في:
- جدول قياسات
- رسم بياني (Scatter / Line)
- المعادلات الفيزيائية المرتبطة
- آلة حاسبة للقيم المفقودة

---

## 1. تدفق البيانات (Data Flow)

```
┌──────────────────┐      ┌─────────────────────────┐      ┌──────────────────────┐
│  تجربة الفيزياء  │ ───► │  shared analysis store  │ ───► │  صفحة التحليل        │
│  (أي تجربة)      │      │  (قراءات + معادلات)     │      │  (رسم + حساب)        │
└──────────────────┘      └─────────────────────────┘      └──────────────────────┘
```

### آلية النقل
- كل تجربة تحتوي على زر **"📊 تحليل النتائج"**
- عند الضغط: تُرسل `trialData[] + experimentType + equations[] + variables[]` إلى `analysisStore`
- التوجيه التلقائي إلى `/physics/mechanics/analysis-calc`

---

## 2. المكونات الجديدة المطلوبة

### A. مخزن مركزي (Store)
| الملف | الوظيفة |
|---|---|
| `stores/analysis.store.ts` | يحفظ بيانات التجربة القادمة + نوعها + المعادلات |

### B. صفحة التحليل الرئيسية
| الملف | الوظيفة |
|---|---|
| `AnalysisCalcExperiment.vue` | تجميع كل الأجزاء |
| `AnalysisMenuBar.vue` | شريط علوي (اسم التجربة القادمة + رجوع + مسح) |
| `DataTable.vue` | عرض قراءات التجربة في جدول (قابل للتعديل!) |
| `ChartWorkspace.vue` | رسم بياني تفاعلي (اختيار محور X/Y + نوع الرسم) |
| `EquationsPanel.vue` | عرض المعادلات مع تعبئة القيم تلقائياً |
| `CalcSolver.vue` | حل للمتغير المفقود: الطالب يختار "أحسب g" ← يظهر الحل خطوة بخطوة |
| `ExportPanel.vue` | تصدير الجدول + الرسم + المعادلات كـ PDF/PNG |

### C. زر النقل (في كل تجربة موجودة)
- إضافة زر في `MenuBar` أو `ControlBar` لكل تجربة: **"📊 تحليل النتائج"**
- عند الضغط: يستدعي `analysisStore.loadFromExperiment(...)` ثم `router.push(...)`

---

## 3. هيكل البيانات المشترك (Interface)

```ts
interface AnalysisPayload {
  sourceExperiment: string;        // 'spring' | 'pendulum' | 'freefall' ...
  sourceNameAr: string;            // 'تجربة النابض'
  readings: Record<string, number>[];  // صفوف الجدول
  columns: ColumnMeta[];           // { key, label, unit }
  equations: EquationMeta[];       // المعادلات المرتبطة
  suggestedPlots: PlotConfig[];    // اقتراحات الرسم (مثلاً T² vs m)
}

interface EquationMeta {
  name: string;         // 'قانون هوك'
  formula: string;        // 'T = 2π√(m/k)'
  variables: Variable[];  // [{ symbol: 'T', label: 'الدورة', value?: number }]
  solveFor: string[];     // ['k', 'T']
}
```

---

## 4. التعديلات على التجارب الموجودة (6 تجارب)

لكل تجربة نضيف دالة `exportToAnalysis()` ترسل:
- `readings`: القراءات المسجلة
- `equations`: المعادلات الخاصة بالتجربة
- `suggestedPlots`: ما يُرسم (مثلاً في النابض: T² ضد m)

| التجربة | البيانات المرسلة | المعادلات |
|---|---|---|
| Spring | (m, T, T²) | T=2π√(m/k), k=4π²m/T² |
| Pendulum | (L, t₁,t₂,t₃, T, T²) | T=2π√(L/g), g=4π²L/T² |
| FreeFall | (h, t₁,t₂,t₃, t, g) | h=½gt², g=2h/t² |
| Inclined | (θ, s, t, a) | s=½at², a=g·sinθ |
| Collision | (m₁,m₂,v₁,v₂,v₁',v₂') | p=m·v, KE=½mv² |
| Projectile | (v₀, θ, R, H, T) | R=v₀²sin2θ/g |

---

## 5. مراحل البناء (Step by Step)

### المرحلة 1: الأساس
1. إنشاء `stores/analysis.store.ts`
2. تحديث `types/physics.ts` بإضافة `AnalysisPayload`
3. بناء `AnalysisCalcExperiment.vue` الهيكل الأساسي (3 أعمدة: جدول | رسم | معادلات)

### المرحلة 2: صفحة التحليل
4. `AnalysisMenuBar.vue`
5. `DataTable.vue` (عرض + تعديل خلايا)
6. `ChartWorkspace.vue` (Canvas 2D بسيط: scatter + line + axis)
7. `EquationsPanel.vue` (عرض المعادلات + إدخال القيم)
8. `CalcSolver.vue` (حل المعادلة للمتغير المطلوب)

### المرحلة 3: التكامل
9. إضافة زر "📊 تحليل النتائج" في `SpringExperiment.vue`
10. ربط البيانات: من Spring → analysisStore → Analysis page
11. اختبار نهاية-للنهاية

### المرحلة 4: تعميم
12. نفس الشيء لبقية التجارب (Pendulum, FreeFall, Inclined, Collision, Projectile)

---

## 6. ملاحظات تقنية

- لا نحذف أي ميزة موجودة في التجارب — فقط نضيف زر جديد
- `analysisStore` يستخدم Pinia (موجود في المشروع)
- الرسم البياني Canvas 2D خاص بنا (لا نضيف مكتبات جديدة ثقيلة)
- المعادلات تُعرض كنص + قيم قابلة للتعديل
- إذا دخل الطالب الصفحة بدون بيانات ← رسالة "لم تُرسل بيانات بعد"
