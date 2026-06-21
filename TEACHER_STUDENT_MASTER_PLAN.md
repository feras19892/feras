# خطة شاملة مُطوّرة — نظام الطالب والمدرس

---

## 🔴 الفحص العميق — 11 مشكلة

### مشاكل البيانات
| # | المشكلة | الموقع |
|---|---------|--------|
| 1 | DB لا يخزن `student_info` | `002_reports.sql` |
| 2 | لا يخزن `conclusion` | `002_reports.sql` |
| 3 | لا يخزن `columns` | `002_reports.sql` |
| 4 | لا يخزن `equations` | `002_reports.sql` |
| 5 | لا يخزن `plots` | `002_reports.sql` |
| 6 | لا يخزن `chart_snapshot` | `002_reports.sql` |
| 7 | `readings` JSON بدون `columns` | `002_reports.sql` |

### مشاكل العرض
| # | المشكلة | الموقع |
|---|---------|--------|
| 8 | `SubmitReportModal` يرسل بيانات ناقصة | `SubmitReportModal.vue` |
| 9 | `TeacherGrading` يعرض `<pre>` فقط | `TeacherGrading.vue` |
| 10 | لا يوجد `ReportViewer.vue` مشترك | — |
| 11 | `AnalysisReportPreview` لا يُرسل للمدرس | `AnalysisReportPreview.vue` |

---

## 🟢 الخطة — 6 مراحل + 3 ميزات متقدمة

### المرحلة 1: إثراء DB (Foundation)

**Migration `003_enrich_reports.sql`:**
```sql
ALTER TABLE experiment_reports ADD COLUMN student_info TEXT;      -- JSON
ALTER TABLE experiment_reports ADD COLUMN conclusion TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion_errors TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion_improvements TEXT;
ALTER TABLE experiment_reports ADD COLUMN columns TEXT;           -- JSON
ALTER TABLE experiment_reports ADD COLUMN equations TEXT;         -- JSON
ALTER TABLE experiment_reports ADD COLUMN plots TEXT;             -- JSON
ALTER TABLE experiment_reports ADD COLUMN chart_snapshot TEXT;    -- base64
ALTER TABLE experiment_reports ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE experiment_reports ADD COLUMN teacher_seen INTEGER DEFAULT 0;
ALTER TABLE experiment_reports ADD COLUMN graded_by INTEGER;
ALTER TABLE experiment_reports ADD COLUMN graded_by_name TEXT;

-- تعليقات
CREATE TABLE report_comments (id, report_id, author_id, author_name, author_role, content, created_at);

-- إشعارات
CREATE TABLE notifications (id, user_id, type, title, message, report_id, is_read, created_at);

-- سجل التصحيح
CREATE TABLE grade_history (id, report_id, teacher_id, teacher_name, old_grade, new_grade, old_feedback, new_feedback, created_at);
```

### المرحلة 2: Backend API

** reports module — تعديل:**
- `createReport` يستقبل كل الحقول الجديدة
- `GET /api/reports/:id` يُرجع كل البيانات
- `POST /api/reports/:id/comments` — تعليقات
- `GET /api/reports/:id/history` — سجل التصحيح
- `PATCH /api/reports/:id/seen` — تحديد كمفتوح

** notifications module — جديد:**
- `GET /api/notifications` — قائمة
- `PATCH /api/notifications/:id/read` — مقروء
- `GET /api/notifications/unread-count` — للـ badge

### المرحلة 3: Frontend Services

**`report.service.ts` — إضافة حقول:**
```ts
export interface Report {
  // ...existing...
  student_info?: string;
  conclusion?: string;
  conclusion_errors?: string;
  conclusion_improvements?: string;
  columns?: string;
  equations?: string;
  plots?: string;
  chart_snapshot?: string;
  version: number;
  teacher_seen: boolean;
  graded_by?: number;
  graded_by_name?: string;
}

// Functions جديدة
export async function addComment(reportId: number, content: string)
export async function getComments(reportId: number)
export async function getGradeHistory(reportId: number)
export async function markAsSeen(reportId: number)
```

**`notification.service.ts` — جديد:**
```ts
export async function getNotifications()
export async function markAsRead(id: number)
export async function getUnreadCount()
```

### المرحلة 4: SubmitReportModal (جمع كل البيانات)

**Props جديدة:**
```ts
studentInfo?: string     // JSON
conclusion?: string     // JSON {conclusion, errors, improvements}
columns?: string         // JSON
equations?: string       // JSON
plots?: string           // JSON
chartSnapshot?: string   // base64
```

**Binding في AnalysisCalcExperiment.vue:**
```vue
<SubmitReportModal
  :student-info="JSON.stringify(studentInfo)"
  :conclusion="JSON.stringify(conclusionData)"
  :columns="JSON.stringify(columns)"
  :equations="JSON.stringify(equations)"
  :plots="JSON.stringify(plots)"
  :chart-snapshot="chartSnapshot"
/>
```

### المرحلة 5: ReportViewer.vue (مشترك)

```vue
<script setup>
import AnalysisReportPreview from '../experiment/analysis-calc/AnalysisReportPreview.vue'

const props = defineProps<{ report: Report }>()

const parsed = computed(() => ({
  sourceName: props.report.experiment_name,
  reportDate: props.report.submitted_at?.slice(0,10),
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
}))
</script>

<template>
  <AnalysisReportPreview v-bind="parsed" />
  <img v-if="report.chart_snapshot" :src="report.chart_snapshot" />
</template>
```

### المرحلة 6: TeacherGrading (عرض + تعليقات + سجل)

**Modal العرض:**
```
┌─────────────────────────────────────────┐
│ 📄 تقرير: النابض     أحمد | 2026-06-20 │
├─────────────────────────────────────────┤
│ [ReportViewer يعرض التقرير كاملاً]     │
├─────────────────────────────────────────┤
│ 💬 التعليقات:                           │
│ 👨‍🏫 المدرس: أعد حساب k                  │
│ 🎓 أحمد: تم التعديل                     │
│ [أضف تعليق...]                         │
├─────────────────────────────────────────┤
│ [إغلاق] [✏️ تصحيح]                     │
└─────────────────────────────────────────┘
```

**Grade Modal:**
```
┌─────────────────────────────────────────┐
│ ✏️ تصحيح — أحمد                        │
│ الدرجة: [████████░░] 80/100            │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 المعايير (قابل للتوسع):        │ │
│ │ دقة القراءات (30%): [25/30]       │ │
│ │ الخاتمة (20%): [18/20]             │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│ ملاحظات: [أعد حساب k...]              │
│ [حفظ]                                  │
└─────────────────────────────────────────┘
```

---

## 🌟 ميزات متقدمة (Phase 2)

| # | الميزة | الوصف |
|---|--------|-------|
| 1 | **إعادة الإرسال** | الطالب يُعدل التقرير بعد التصحيح ويعيد الإرسال (version++) |
| 2 | **تعليقات مباشرة** | محادثة بين المدرس والطالب على كل تقرير |
| 3 | **إشعارات فورية** | toast عند إرسال/تصحيح/تعليق جديد |
| 4 | **سجل التصحيح** | `grade_history` — من صحح متى وما تغير |
| 5 | **قوالب تقييم** | المدرس يُنشئ rubric مع معايير موزونة |
| 6 | **تصحيح آلي جزئي** | فحص تلقائي: عدد القراءات، وجود خاتمة، صحة الحسابات |
| 7 | **مقارنة الطلاب** | chart يُقارن أداء الطلاب في نفس التجربة |
| 8 | **تصدير PDF/Excel** | تصدير التقارير للأرشفة |
| 9 | **مواعيد نهائية** | Due dates للتقارير + تذكيرات |
| 10 | **إحصائيات متقدمة** | متوسط الفصل، توزيع الدرجات، التقارير المتأخرة |

---

## 📋 قائمة الملفات (28 ملف)

### Backend (7)
```
api/src/db/migrations/003_enrich_reports.sql          ← NEW
api/src/modules/reports/schemas.ts                    ← EDIT
api/src/modules/reports/services.ts                   ← EDIT
api/src/modules/reports/handlers.ts                   ← EDIT
api/src/modules/notifications/schemas.ts              ← NEW
api/src/modules/notifications/services.ts             ← NEW
api/src/modules/notifications/handlers.ts             ← NEW
```

### Frontend Services (3)
```
web/src/services/report.service.ts                    ← EDIT
web/src/services/notification.service.ts                ← NEW
web/src/services/class.service.ts                     ← (موجود)
```

### Composables (4)
```
web/src/composables/useReportSubmission.ts            ← NEW
web/src/composables/useReportGrading.ts               ← NEW
web/src/composables/useNotifications.ts               ← NEW
web/src/composables/teacher/useClassManager.ts        ← (موجود)
```

### Components (12)
```
web/src/components/shared/ReportViewer.vue            ← NEW
web/src/components/shared/NotificationBell.vue        ← NEW
web/src/components/shared/NotificationToast.vue       ← NEW
web/src/components/teacher/TeacherGrading.vue           ← EDIT
web/src/components/teacher/GradeModal.vue             ← NEW (مُستخرج)
web/src/components/teacher/ClassManager.vue             ← (موجود)
web/src/components/student/StudentClasses.vue         ← (موجود)
web/src/components/student/StudentReports.vue         ← EDIT
web/src/components/student/SubmitReportModal.vue      ← EDIT
web/src/components/student/ReportResubmitModal.vue  ← NEW
web/src/components/experiment/analysis-calc/AnalysisReportPreview.vue  ← (موجود)
web/src/components/layout/AppNavbar.vue               ← EDIT (badge)
```

### Pages (1)
```
web/src/pages/dashboard.vue                           ← EDIT
```

### Types (1)
```
packages/shared-types/src/index.ts                    ← EDIT (Report type)
```

---

## 🔄 التدفق النهائي

```
الطالب: تجربة → تحليل → معلومات + خاتمة + رسم
        ↓
        SubmitReportModal → يجمع كل البيانات
        ↓
        POST /api/reports → DB يخزن كل شيء
        ↓
        🔔 إشعار للمدرس
        ↓
المدرس: Navbar 🔴 → "تصحيح"
        ↓
        يرى قائمة التقارير
        ↓
        يضغط تقرير → ReportViewer يفتح
        ↓
        يرى التقرير كما رآه الطالب (جدول + رسم + خاتمة)
        ↓
        💬 يُضيف تعليق أو ✏️ يُصحح مباشرة
        ↓
        الدرجة + الملاحظات → DB
        ↓
        🔔 إشعار للطالب
        ↓
الطالب: "تقاريري" → يرى الدرجة + ملاحظات المدرس
        ↓
        يضغط التقرير → ReportViewer + banner الدرجة
        ↓
        ↩️ يُعدل ويعيد الإرسال (إن أراد)
```

---

## ❌ القواعد الصارمة

| # | القاعدة |
|---|---------|
| 1 | لا تُغير `AnalysisReportPreview.vue` — انقل "كما هو" |
| 2 | لا تُبسط UI |
| 3 | لا تحذف ميزة موجودة |
| 4 | لا تضع منطق في Pages |
| 5 | لا تترك ملف > 300 سطر |
| 6 | لا تكتب كود من عندك — انقل وأسس |
| 7 | لا تستخدم localStorage للبيانات الحقيقية |

---

## ✅ Checklist التحقق

- [ ] DB يخزن كل بيانات التقرير
- [ ] `SubmitReportModal` يجمع كل البيانات
- [ ] `ReportViewer.vue` يُعيد استخدام `AnalysisReportPreview.vue`
- [ ] المدرس يضغط التقرير → يرى العرض الكامل
- [ ] المدرس يضغط "تصحيح" بعد الاطلاع
- [ ] تعليقات على التقرير
- [ ] إشعارات فورية
- [ ] سجل التصحيح
- [ ] الطالب يرى `ReportViewer` + الدرجة
- [ ] إعادة إرسال ممكنة
- [ ] Badge الإشعارات في Navbar
- [ ] build نظيف
