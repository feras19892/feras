# خطة شاملة — نظام الطالب والمدرس
## فحص شامل + خطة بناء + قواعد صارمة

---

## 🔴 الجزء الأول: كتالوج المشاكل (Audit)

### 1.1 — مشاكل البيانات (Database)

| # | المشكلة | الموقع | التأثير |
|---|---------|--------|---------|
| 1.1.1 | `experiment_reports` لا يخزن `student_info` | `002_reports.sql` | المدرس لا يعرف اسم الطالب إلا من `users.name` |
| 1.1.2 | لا يخزن `conclusion` | `002_reports.sql` | المدرس لا يرى الخاتمة |
| 1.1.3 | لا يخزن `columns` (تعريف الأعمدة) | `002_reports.sql` | المدرس لا يعرف رؤوس الجدول |
| 1.1.4 | لا يخزن `equations` | `002_reports.sql` | المدرس لا يرى المعادلات |
| 1.1.5 | لا يخزن `plots` | `002_reports.sql` | المدرس لا يرى الرسومات المقترحة |
| 1.1.6 | `chart_snapshot_path` فارغ دائماً | `002_reports.sql` | لا صورة للرسم البياني |
| 1.1.7 | `readings` مخزن كـ `TEXT` JSON — بدون `columns` يفقد المعنى | `002_reports.sql` | أرقام بلا سياق |

### 1.2 — مشاكل الـ API (Backend)

| # | المشكلة | الموقع | التأثير |
|---|---------|--------|---------|
| 1.2.1 | `createReport` لا يستقبل `conclusion`, `student_info`, `columns`, `equations`, `plots` | `reports/services.ts:3` | البيانات مفقودة من البداية |
| 1.2.2 | `getReports` يُرجع `readings` JSON فقط — المدرس يرى أرقام | `reports/services.ts:23` | لا يوجد سياق للبيانات |
| 1.2.3 | لا يوجد endpoint `GET /api/reports/:id` — يوجد handler لكن لا يُستخدم | `reports/handlers.ts:49` | لا يُستخدم |

### 1.3 — مشاكل الـ Frontend

| # | المشكلة | الموقع | التأثير |
|---|---------|--------|---------|
| 1.3.1 | `SubmitReportModal.vue` لا يجمع `conclusion`, `studentInfo`, `columns`, `equations`, `plots` | `SubmitReportModal.vue:43` | يرسل بيانات ناقصة |
| 1.3.2 | `AnalysisReportPreview.vue` مثالي — لكن لا يُستخدم إلا للـ preview المحلي | `AnalysisReportPreview.vue` | لا يُرسل للمدرس |
| 1.3.3 | `TeacherGrading.vue` يعرض `<pre>{{ JSON.parse(...) }}</pre>` — عرض بدائي | `TeacherGrading.vue:159` | المدرس لا يفهم شيئاً |
| 1.3.4 | لا يوجد `ReportViewer.vue` مشترك بين الطالب والمدرس | — | تكرار أو عرض مختلف |
| 1.3.5 | `SubmitReportModal.vue` يُرسل `readings` فقط — مفقود باقي التقرير | `SubmitReportModal.vue` | تقرير ناقص |

### 1.4 — مشاكل التدفق (Flow)

| # | المشكلة | التأثير |
|---|---------|---------|
| 1.4.1 | الطالب يرسل تقرير من `SpringExperiment.vue` — لا من `AnalysisCalcExperiment.vue` | التقرير فارغ من البيانات |
| 1.4.2 | الـ Modal يُرسل البيانات بدون خاتمة أو معلومات الطالب | المدرس يرى أرقام بلا سياق |
| 1.4.3 | المدرس يضغط "تصحيح" قبل رؤية التقرير | لا يستطيع التقييم |

---

## 🟢 الجزء الثاني: الخطة — 5 مراحل

---

### المرحلة 1: إثراء DB (Data Enrichment)

**الهدف:** كل بيانات التقرير تُخزن في DB

#### الملفات:

```
api/src/db/migrations/003_enrich_reports.sql          ← NEW
```

#### الأعمدة الجديدة في `experiment_reports`:

| العمود | النوع | الوصف |
|--------|-------|-------|
| `student_info` | TEXT (JSON) | `{ name, email, grade, notes }` |
| `conclusion` | TEXT | نص الخاتمة |
| `conclusion_errors` | TEXT | مصادر الخطأ |
| `conclusion_improvements` | TEXT | اقتراحات التحسين |
| `columns` | TEXT (JSON) | تعريف الأعمدة: `[{ key, label, unit }]` |
| `equations` | TEXT (JSON) | المعادلات: `[{ name, formula, variables }]` |
| `plots` | TEXT (JSON) | الرسومات: `[{ xKey, yKey, xLabel, yLabel, type }]` |
| `chart_snapshot` | TEXT | base64 PNG من canvas |

#### `reports/services.ts` — تعديل `createReport`:

```ts
export async function createReport(data: {
  student_id: number;
  class_id: string;
  experiment_type: string;
  experiment_name: string;
  readings: string;           // JSON
  params?: string;             // JSON
  student_info?: string;      // JSON ← جديد
  conclusion?: string;       // ← جديد
  conclusion_errors?: string; // ← جديد
  conclusion_improvements?: string; // ← جديد
  columns?: string;          // JSON ← جديد
  equations?: string;        // JSON ← جديد
  plots?: string;             // JSON ← جديد
  chart_snapshot?: string;   // base64 ← جديد
})
```

#### `reports/schemas.ts` — تعديل Zod:

```ts
export const createReportSchema = z.object({
  class_id: z.string().min(1),
  experiment_type: z.string().min(1).max(50),
  experiment_name: z.string().min(1).max(100),
  readings: z.string(),
  params: z.string().optional(),
  student_info: z.string().optional(),      // ← جديد
  conclusion: z.string().optional(),         // ← جديد
  conclusion_errors: z.string().optional(),  // ← جديد
  conclusion_improvements: z.string().optional(), // ← جديد
  columns: z.string().optional(),            // ← جديد
  equations: z.string().optional(),          // ← جديد
  plots: z.string().optional(),              // ← جديد
  chart_snapshot: z.string().optional(),     // ← جديد
});
```

#### `reports/handlers.ts` — تعديل `POST /`:

```ts
const result = await svc.createReport({
  student_id: user.id,
  class_id: body.class_id,
  experiment_type: body.experiment_type,
  experiment_name: body.experiment_name,
  readings: body.readings,
  params: body.params,
  student_info: body.student_info,           // ← جديد
  conclusion: body.conclusion,               // ← جديد
  conclusion_errors: body.conclusion_errors, // ← جديد
  conclusion_improvements: body.conclusion_improvements, // ← جديد
  columns: body.columns,                     // ← جديد
  equations: body.equations,                 // ← جديد
  plots: body.plots,                         // ← جديد
  chart_snapshot: body.chart_snapshot,       // ← جديد
});
```

---

### المرحلة 2: جمع البيانات الكاملة (SubmitReportModal)

**الهدف:** الطالب يرسل تقرير كامل كما يراه في `AnalysisReportPreview.vue`

#### الملفات:

```
web/src/composables/useReportSubmission.ts              ← NEW
web/src/components/shared/ReportViewer.vue              ← NEW
```

#### `SubmitReportModal.vue` — تعديل Props:

```ts
const props = defineProps<{
  show: boolean;
  experimentType: string;
  experimentName: string;
  readings: string;        // JSON array
  params?: string;         // JSON object
  studentInfo?: string;     // JSON ← جديد
  conclusion?: string;      // JSON { conclusion, errors, improvements } ← جديد
  columns?: string;        // JSON array ← جديد
  equations?: string;      // JSON array ← جديد
  plots?: string;          // JSON array ← جديد
  chartSnapshot?: string;  // base64 ← جديد
}>();
```

#### `SubmitReportModal.vue` — تعديل `submit()`:

```ts
const res = await createReport({
  class_id: selectedClassId.value,
  experiment_type: props.experimentType,
  experiment_name: props.experimentName,
  readings: props.readings,
  params: props.params,
  student_info: props.studentInfo,     // ← جديد
  conclusion: props.conclusion,        // ← جديد
  columns: props.columns,              // ← جديد
  equations: props.equations,          // ← جديد
  plots: props.plots,                  // ← جديد
  chart_snapshot: props.chartSnapshot, // ← جديد
});
```

#### `AnalysisCalcExperiment.vue` — تعديل `SubmitReportModal` binding:

```vue
<SubmitReportModal
  v-model:show="reportOpen"
  experiment-type="analysis"
  :experiment-name="sourceName || 'تجربة فيزيائية'"
  :readings="JSON.stringify(readings)"
  :params="JSON.stringify(params)"
  :student-info="JSON.stringify(studentInfo)"           // ← جديد
  :conclusion="JSON.stringify(conclusionData)"         // ← جديد
  :columns="JSON.stringify(columns)"                   // ← جديد
  :equations="JSON.stringify(equations)"               // ← جديد
  :plots="JSON.stringify(plots)"                     // ← جديد
  :chart-snapshot="chartSnapshot"                      // ← جديد
/>
```

#### `chartSnapshot` — كيفية الحصول عليه:

```ts
// في AnalysisCalcExperiment.vue
const chartSnapshot = ref('');

function captureChart() {
  const canvas = document.querySelector('.chart-panel canvas') as HTMLCanvasElement;
  if (canvas) chartSnapshot.value = canvas.toDataURL('image/png');
}
```

---

### المرحلة 3: إنشاء ReportViewer.vue (Component مشترك)

**الهدف:** نفس العرض للطالب والمدرس

#### `ReportViewer.vue` — يُعيد استخدام `AnalysisReportPreview.vue`

```vue
<script setup lang="ts">
import AnalysisReportPreview from './AnalysisReportPreview.vue';

const props = defineProps<{
  report: Report; // من API
}>();

const parsed = computed(() => ({
  sourceName: props.report.experiment_name,
  reportDate: props.report.submitted_at?.slice(0, 10) || '',
  studentInfo: JSON.parse(props.report.student_info || '{}'),
  readings: JSON.parse(props.report.readings || '[]'),
  columns: JSON.parse(props.report.columns || '[]'),
  equations: JSON.parse(props.report.equations || '[]'),
  plots: JSON.parse(props.report.plots || '[]'),
  conclusion: {
    conclusion: props.report.conclusion || '',
    errors: props.report.conclusion_errors || '',
    improvements: props.report.conclusion_improvements || '',
  },
}));
</script>

<template>
  <AnalysisReportPreview
    :source-name="parsed.sourceName"
    :report-date="parsed.reportDate"
    :student-info="parsed.studentInfo"
    :readings="parsed.readings"
    :columns="parsed.columns"
    :equations="parsed.equations"
    :plots="parsed.plots"
    :conclusion="parsed.conclusion"
  />
  <!-- صورة الرسم البياني -->
  <img v-if="report.chart_snapshot" :src="report.chart_snapshot" class="chart-img" />
</template>
```

---

### المرحلة 4: ربط TeacherGrading بـ ReportViewer

**الهدف:** المدرس يضغط التقرير → يرى التقرير كما رآه الطالب

#### `TeacherGrading.vue` — تعديل `openView()`:

```ts
function openView(r: Report) {
  viewReport.value = r;
  viewOpen.value = true;
}
```

#### `TeacherGrading.vue` — تعديل Modal العرض:

```vue
<!-- View Report Modal -->
<div v-if="viewOpen && viewReport" class="modal-overlay" @click.self="viewOpen = false">
  <div class="view-modal">
    <!-- استخدام ReportViewer -->
    <ReportViewer :report="viewReport" />
    
    <div class="actions">
      <button class="btn-cancel" @click="viewOpen = false">إغلاق</button>
      <button class="btn-submit" @click="viewOpen = false; openGrade(viewReport)">
        ✏️ تصحيح
      </button>
    </div>
  </div>
</div>
```

#### `TeacherGrading.vue` — CSS للـ modal (عرض أكبر):

```css
.view-modal {
  width: 90%;
  max-width: 900px;        /* ← عرض أكبر لعرض التقرير */
  max-height: 85vh;
  overflow-y: auto;
}
```

---

### المرحلة 5: ربط StudentReports بـ ReportViewer

**الهدف:** الطالب يرى نسخته + الدرجة

#### `StudentReports.vue` — إضافة عرض التقرير:

```vue
<script setup>
import ReportViewer from '../shared/ReportViewer.vue';

const viewOpen = ref(false);
const selectedReport = ref<Report | null>(null);

function openReport(r: Report) {
  selectedReport.value = r;
  viewOpen.value = true;
}
</script>

<template>
  <div v-for="r in reports" :key="r.id" class="report-card" @click="openReport(r)">
    <!-- summary -->
  </div>
  
  <div v-if="viewOpen && selectedReport" class="modal-overlay">
    <div class="view-modal">
      <!-- عرض الدرجة والملاحظات في الأعلى -->
      <div v-if="selectedReport.status === 'graded'" class="grade-banner">
        <span class="grade-score">{{ selectedReport.grade }}/100</span>
        <span class="grade-feedback">{{ selectedReport.feedback }}</span>
      </div>
      
      <!-- عرض التقرير -->
      <ReportViewer :report="selectedReport" />
    </div>
  </div>
</template>
```

---

## 🗓️ ترتيب التنفيذ (Step-by-Step)

| # | الخطوة | الملفات | المدة التقديرية |
|---|--------|---------|-----------------|
| 1 | **Migration** `003_enrich_reports.sql` | 1 ملف | 10 دقيقة |
| 2 | **Backend** `reports/schemas.ts` — إضافة الحقول | 1 ملف | 5 دقائق |
| 3 | **Backend** `reports/services.ts` — تعديل `createReport` | 1 ملف | 10 دقائق |
| 4 | **Backend** `reports/handlers.ts` — تمرير الحقول | 1 ملف | 5 دقائق |
| 5 | **Frontend** `report.service.ts` — إضافة الحقول للـ `Report` type | 1 ملف | 5 دقائق |
| 6 | **Frontend** `SubmitReportModal.vue` — تعديل props + submit | 1 ملف | 10 دقائق |
| 7 | **Frontend** `AnalysisCalcExperiment.vue` — تمرير البيانات الكاملة | 1 ملف | 10 دقائق |
| 8 | **Frontend** `ReportViewer.vue` — إنشاء component مشترك | 1 ملف | 15 دقيقة |
| 9 | **Frontend** `TeacherGrading.vue` — استخدام `ReportViewer` | 1 ملف | 15 دقيقة |
| 10 | **Frontend** `StudentReports.vue` — إضافة عرض التقرير | 1 ملف | 15 دقيقة |
| 11 | **Test** end-to-end | الكل | 20 دقيقة |

---

## 📋 قائمة الملفات الكاملة (18 ملف)

### Backend (5)
```
api/src/db/migrations/003_enrich_reports.sql          ← NEW
api/src/modules/reports/schemas.ts                    ← EDIT
api/src/modules/reports/services.ts                   ← EDIT
api/src/modules/reports/handlers.ts                   ← EDIT
api/src/index.ts                                      ← (لا تغيير)
```

### Frontend (13)
```
web/src/services/report.service.ts                    ← EDIT (إضافة الحقول)
web/src/composables/useReportSubmission.ts            ← NEW (اختياري)
web/src/components/shared/ReportViewer.vue            ← NEW
web/src/components/experiment/SubmitReportModal.vue   ← EDIT
web/src/modules/physics/experiments/analysis-calc/AnalysisCalcExperiment.vue  ← EDIT
web/src/components/teacher/TeacherGrading.vue         ← EDIT
web/src/components/student/StudentReports.vue       ← EDIT
web/src/components/layout/AppNavbar.vue             ← (لا تغيير)
```

---

## 🔄 التدفق النهائي (End-to-End)

```
المدرس: dashboard → "فصولي" → إنشاء فصل → نسخ الكود
       ↓
الطالب: dashboard → "فصولي" → إدخال الكود → انضمام
       ↓
الطالب: "الفروع" → تجربة النابض → تسجيل قراءات → "تحليل النتائج"
       ↓
الطالب: AnalysisCalcExperiment → معلومات الطالب + خاتمة + رسم
       ↓
الطالب: "📧 إرسال للمعلم" → SubmitReportModal → اختيار الفصل → إرسال
       ↓
النظام: يخزن في DB كل البيانات (readings + conclusion + columns + equations + plots + chart_snapshot + student_info)
       ↓
المدرس: 🔴 Badge أحمر على "تصحيح"
       ↓
المدرس: "تصحيح" → TeacherGrading → اختيار الفصل
       ↓
المدرس: يرى قائمة التقارير (اسم الطالب + التجربة + التاريخ + الحالة)
       ↓
المدرس: يضغط على التقرير → ReportViewer يفتح
       ↓
المدرس: يرى التقرير كما رآه الطالب:
       ├─ معلومات الطالب
       ├─ جدول القراءات المنسق
       ├─ إحصائيات
       ├─ المعادلات
       ├─ الرسم البياني (صورة)
       └─ الخاتمة
       ↓
المدرس: يضغط "✏️ تصحيح" → يدخل الدرجة + ملاحظات → يحفظ
       ↓
النظام: يخزن الدرجة في DB
       ↓
الطالب: "تقاريري" → يرى تقريره + الدرجة + ملاحظات المدرس
       ↓
الطالب: يضغط التقرير → ReportViewer يفتح + banner الدرجة في الأعلى
```

---

## ❌ ممنوعات (قواعد صارمة)

| # | ممنوع | القاعدة |
|---|-------|---------|
| 1 | لا تُغير `AnalysisReportPreview.vue` | انقل "كما هو" |
| 2 | لا تُبسط الـ UI | "كما هو" |
| 3 | لا تحذف ميزة موجودة | "كما هو" |
| 4 | لا تضع منطق في Pages | Pages = تركيب فقط |
| 5 | لا تترك ملف > 300 سطر | فصل إلى components |
| 6 | لا تكتب كود من عندك | انقل فقط |
| 7 | لا تستخدم localStorage للبيانات الحقيقية | API فقط |

---

## ✅ التحقق النهائي (Checklist)

- [ ] DB يخزن `student_info`, `conclusion`, `columns`, `equations`, `plots`, `chart_snapshot`
- [ ] `SubmitReportModal` يجمع كل البيانات
- [ ] `ReportViewer.vue` يُعيد استخدام `AnalysisReportPreview.vue`
- [ ] المدرس يضغط التقرير → يرى التقرير كما رآه الطالب
- [ ] المدرس يضغط "تصحيح" بعد الاطلاع
- [ ] الطالب يرى `ReportViewer` + الدرجة في "تقاريري"
- [ ] لا يوجد JSON.parse في `<pre>`
- [ ] الـ build نظيف (فقط أخطاء `PanelId` القديمة)
