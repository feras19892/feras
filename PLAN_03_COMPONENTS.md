# الخطة الجزء 3: Frontend — Components

## القواعد الصارمة
- أي ملف .vue > 300 سطر → فصله
- لا تُعدل `AnalysisReportPreview.vue` — أعد استخدامه
- Pages = تركيب فقط — لا منطق

---

## 3.1 Components — مشتركة (Shared)

### A. `ReportViewer.vue` (~80 سطر) NEW
**الملف:** `apps/web/src/components/shared/ReportViewer.vue`
**القاعدة:** أعد استخدام `AnalysisReportPreview.vue` — لا تُعدله
**الوظيفة:** عرض التقرير كما رآه الطالب — نفس العرض للمدرس والطالب

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { Report } from '../../services/report.service';
import AnalysisReportPreview from '../experiment/analysis-calc/AnalysisReportPreview.vue';

const props = defineProps<{ report: Report }>();

const parsed = computed(() => ({
  sourceName: props.report.experiment_name,
  reportDate: props.report.submitted_at?.slice(0, 10) || '',
  studentInfo: safeJsonParse(props.report.student_info, { name: props.report.student_name || '', email: '', grade: '', notes: '' }),
  readings: safeJsonParse(props.report.readings, []),
  columns: safeJsonParse(props.report.columns, []),
  equations: safeJsonParse(props.report.equations, []),
  plots: safeJsonParse(props.report.plots, []),
  conclusion: {
    conclusion: props.report.conclusion || '',
    errors: props.report.conclusion_errors || '',
    improvements: props.report.conclusion_improvements || '',
  },
}));

function safeJsonParse<T>(str: string | undefined, fallback: T): T {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}
</script>

<template>
  <div class="report-viewer-wrapper">
    <AnalysisReportPreview v-bind="parsed" />
    <div v-if="report.chart_snapshot" class="chart-section">
      <h4>📈 الرسم البياني</h4>
      <img :src="report.chart_snapshot" alt="Chart" class="chart-img" />
    </div>
  </div>
</template>
```

### B. `NotificationBell.vue` (~120 سطر) NEW
**الملف:** `apps/web/src/components/shared/NotificationBell.vue`
**الوظيفة:** جرس إشعارات في Navbar

```
┌─────────┐
│ 🔔 5    │ ← الضغط يفتح dropdown
└────┬────┘
     ▼
┌─────────────────────────────┐
│ 📢 الإشعارات      [تحديد الكل]│
├─────────────────────────────┤
│ 🆕 أحمد أرسل تقريراً        │
│    تجربة النابض — منذ 5 دقائق│
│ ─────────────────────────── │
│ 💬 تعليق من أحمد            │
│ ─────────────────────────── │
│ ⭐ تم تصحيح تقريرك: 85/100  │
└─────────────────────────────┘
```

### C. `NotificationToast.vue` (~40 سطر) NEW
**الملف:** `apps/web/src/components/shared/NotificationToast.vue`
**الوظيفة:** Toast يظهر في زاوية الشاشة

```
┌─────────────────────────────────┐
│ 🆕 تقرير جديد من أحمد!         │
│    تجربة النابض — اضغط لعرضه   │
│                           [✕]  │
└─────────────────────────────────┘
```

---

## 3.2 Components — الطالب

### A. `SubmitReportModal.vue` (~160 سطر) EDIT
**الملف:** `apps/web/src/components/experiment/SubmitReportModal.vue`
**التعديل:** إضافة 7 props جديدة + تعديل `submit()`

**Props جديدة:**
```ts
studentInfo?: string      // JSON {name, email, grade, notes}
conclusion?: string       // JSON {conclusion, errors, improvements}
columns?: string          // JSON [{key, label, unit}]
equations?: string        // JSON [{name, formula, variables}]
plots?: string            // JSON [{xKey, yKey, xLabel, yLabel, type}]
chartSnapshot?: string     // base64 PNG
```

**submit():**
```ts
const res = await createReport({
  class_id: selectedClassId.value,
  experiment_type: props.experimentType,
  experiment_name: props.experimentName,
  readings: props.readings,
  params: props.params,
  student_info: props.studentInfo,
  conclusion: props.conclusion,
  conclusion_errors: props.conclusion ? JSON.parse(props.conclusion).errors : undefined,
  conclusion_improvements: props.conclusion ? JSON.parse(props.conclusion).improvements : undefined,
  columns: props.columns,
  equations: props.equations,
  plots: props.plots,
  chart_snapshot: props.chartSnapshot,
});
```

**الواجهة:**
```
┌─────────────────────────────────────────┐
│ 📤 إرسال التقرير للمدرس                 │
├─────────────────────────────────────────┤
│ الفصل: ▼ الفيزياء 10A                   │
├─────────────────────────────────────────┤
│ 📋 ملخص:                                │
│    التجربة: النابض                       │
│    القراءات: 5                          │
│    الخاتمة: ✅ مكتوبة                   │
│    الرسم: ✅ مرفق                       │
├─────────────────────────────────────────┤
│ [mini preview من ReportViewer]          │
├─────────────────────────────────────────┤
│ [❌ إلغاء]    [✅ تأكيد الإرسال]        │
└─────────────────────────────────────────┘
```

### B. `ReportResubmitModal.vue` (~100 سطر) NEW (Phase 2)
**الملف:** `apps/web/src/components/student/ReportResubmitModal.vue`
**الوظيفة:** إعادة إرسال تقرير بعد التصحيح

```
┌─────────────────────────────────────────┐
│ ↩️ إعادة إرسال التقرير                   │
├─────────────────────────────────────────┤
│ ملاحظات المدرس السابقة:                 │
│ "أعد حساب k باستخدام الانحدار"          │
├─────────────────────────────────────────┤
│ [نموذج تعديل التقرير — نفس SubmitReportModal]│
├─────────────────────────────────────────┤
│ [❌ إلغاء]    [✅ إعادة الإرسال]        │
└─────────────────────────────────────────┘
```

### C. `StudentReports.vue` (~130 سطر) EDIT
**الملف:** `apps/web/src/components/student/StudentReports.vue`
**التعديل:** إضافة عرض التقرير + banner الدرجة

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 تقاريري                                  [🔔 3]         │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐  │
│ │ 🧪 تجربة النابض              ⭐ 85/100  ✅ مُصحح       │  │
│ │ 📅 2026-06-20 | 🏫 الفيزياء 10A | 💬 تعليق جديد!     │  │
│ │ [📄 عرض التقرير]  [↩️ إعادة إرسال]                   │  │
│ └───────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ 🧪 تجربة السقوط الحر         ⏳ قيد الانتظار          │  │
│ │ [📄 عرض التقرير]                                      │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Modal عند الضغط:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⭐ درجتك: 85/100                                          │
│ 💬 "أعد حساب k باستخدام الانحدار"                        │
├─────────────────────────────────────────────────────────────┤
│ [ReportViewer يعرض التقرير كاملاً]                       │
├─────────────────────────────────────────────────────────────┤
│ [❌ إغلاق]  [↩️ إعادة الإرسال]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.3 Components — المدرس

### A. `TeacherGrading.vue` (~280 سطر) EDIT
**الملف:** `apps/web/src/components/teacher/TeacherGrading.vue`
**التعديلات الكبيرة:**

**قبل:**
- صف واحد: اسم + تجربة + تاريخ + زر "تصحيح"
- الضغط يفتح modal درجة + ملاحظات مباشرة
- `<pre>{{ JSON.parse(...) }}</pre>`

**بعد:**
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ تصحيح التقارير                    [🔴 3 جديد]          │
├─────────────────────────────────────────────────────────────┤
│ الفصل: ▼ الفيزياء 10A    [الكل] [معلق] [مصحح] [غير مفتوح]│
├─────────────────────────────────────────────────────────────┤
│ 📊 الإحصائيات:                                              │
│ ┌─────┬─────┬─────┬─────┬─────┐                            │
│ │ 12  │  8  │  4  │  76 │ 2.3 │                            │
│ │كلية │مصحح│معلق│متوسط│متوسط│                            │
│ └─────┴─────┴─────┴─────┴─────┘                            │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐  │
│ │ 🎓 أحمد        🧪 النابض      📅 2026-06-20          │  │
│ │ ⭐ 85/100   💬 2 تعليقات   👁️ غير مفتوح             │  │
│ │ [📄 عرض]  [✏️ تصحيح]  [💬 تعليق]                    │  │
│ └───────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ 🎓 سارة        🧪 السقوط الحر   📅 2026-06-21        │  │
│ │ ⏳ قيد الانتظار   👁️ مفتوح                            │  │
│ │ [📄 عرض]  [✏️ تصحيح]  [💬 تعليق]                    │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**التعديلات الفنية:**
- `openView(r)` — يفتح modal مع `ReportViewer`
- `openGrade(r)` — يفتح `GradeModal`
- `@click` على صف التقرير → `openView`
- زر "تصحيح" → `@click.stop="openGrade(r)"`

### B. `GradeModal.vue` (~120 سطر) NEW (مستخرج)
**الملف:** `apps/web/src/components/teacher/GradeModal.vue`
**القاعدة:** إذا TeacherGrading > 300 سطر → استخرج هذا
**الوظيفة:** نافذة التصحيح منفصلة

```
┌─────────────────────────────────────────┐
│ ✏️ تصحيح — أحمد                        │
├─────────────────────────────────────────┤
│ الدرجة: [████████░░] 80/100            │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 المعايير (قابل للتوسع):        │ │
│ │ دقة القراءات (30%): [25/30]       │ │
│ │ الخاتمة (20%): [18/20]             │ │
│ │ الرسم (20%): [17/20]               │ │
│ │ الحسابات (20%): [15/20]            │ │
│ │ التنسيق (10%): [05/10]             │ │
│ │ ─────────────────────────────────  │ │
│ │ المجموع: 80/100                     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ ملاحظات: [أعد حساب k...]              │
├─────────────────────────────────────────┤
│ [❌ إلغاء]    [💾 حفظ]                  │
└─────────────────────────────────────────┘
```

### C. `ReportCommentThread.vue` (~80 سطر) NEW
**الملف:** `apps/web/src/components/teacher/ReportCommentThread.vue`
**الوظيفة:** تعليقات على التقرير

```
┌─────────────────────────────────────────┐
│ 💬 المحادثة                             │
├─────────────────────────────────────────┤
│ 👨‍🏫 المدرس (14:30):                     │
│    "أعد حساب k باستخدام الانحدار"      │
│ ─────────────────────────────────────  │
│ 🎓 أحمد (15:45):                        │
│    "تم التعديل وإعادة الإرسال"          │
│ ─────────────────────────────────────  │
│ [أضف تعليق...]  [إرسال]                │
└─────────────────────────────────────────┘
```

---

## 3.4 Component — Layout

### A. `AppNavbar.vue` (~260 سطر) EDIT
**الملف:** `apps/web/src/components/layout/AppNavbar.vue`
**التعديل:** إضافة `NotificationBell` + استبدال pending count badge

**قبل:**
```
تصحيح [🔴 3]
```

**بعد:**
```
تصحيح [🔴 3]    🔔 5
```

**التعديل:**
- استيراد `NotificationBell`
- `pendingCount` من `useNotifications().unreadCount` (للإشعارات)
- أو الاحتفاظ بـ `pendingCount` من `/api/classes/stats/pending`

---

## 3.5 ملخص Components (10 ملف)

| # | الملف | النوع | الحجم | مسؤول |
|---|-------|-------|-------|-------|
| 1 | `ReportViewer.vue` | NEW | 80 | مشترك |
| 2 | `NotificationBell.vue` | NEW | 120 | مشترك |
| 3 | `NotificationToast.vue` | NEW | 40 | مشترك |
| 4 | `SubmitReportModal.vue` | EDIT | 160 | طالب |
| 5 | `ReportResubmitModal.vue` | NEW | 100 | طالب |
| 6 | `StudentReports.vue` | EDIT | 130 | طالب |
| 7 | `TeacherGrading.vue` | EDIT | 280 | مدرس |
| 8 | `GradeModal.vue` | NEW | 120 | مدرس |
| 9 | `ReportCommentThread.vue` | NEW | 80 | مدرس |
| 10 | `AppNavbar.vue` | EDIT | 260 | layout |

---

## 3.6 ملخص كل الملفات (25 ملف)

### Backend (8)
```
api/src/db/migrations/003_enrich_reports.sql          NEW
api/src/modules/reports/schemas.ts                    EDIT
api/src/modules/reports/services.ts                   EDIT
api/src/modules/reports/handlers.ts                   EDIT
api/src/modules/notifications/schemas.ts              NEW
api/src/modules/notifications/services.ts             NEW
api/src/modules/notifications/handlers.ts             NEW
api/src/index.ts                                      EDIT
```

### Frontend (17)
```
web/src/services/report.service.ts                    EDIT
web/src/services/notification.service.ts              NEW
web/src/composables/useNotifications.ts               NEW
web/src/composables/useReportSubmission.ts            NEW
web/src/composables/useReportGrading.ts             NEW
web/src/components/shared/ReportViewer.vue            NEW
web/src/components/shared/NotificationBell.vue        NEW
web/src/components/shared/NotificationToast.vue       NEW
web/src/components/student/SubmitReportModal.vue      EDIT
web/src/components/student/ReportResubmitModal.vue  NEW
web/src/components/student/StudentReports.vue       EDIT
web/src/components/teacher/TeacherGrading.vue         EDIT
web/src/components/teacher/GradeModal.vue           NEW
web/src/components/teacher/ReportCommentThread.vue  NEW
web/src/components/layout/AppNavbar.vue             EDIT
web/src/pages/dashboard.vue                           EDIT
```
