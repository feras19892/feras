# الخطة الجزء 4: التدفق + Checklist

---

## 4.1 التدفق الكامل (End-to-End)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   المدرس    │     │    الطالب   │     │   النظام    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  1. ينشئ فصل + كود  │                   │
       │ ─────────────────>│                   │
       │                   │  2. يدخل الكود    │
       │                   │ ───────────────>│
       │                   │                   │
       │                   │  3. يُجرب التجربة  │
       │                   │  4. يضغط "تحليل"  │
       │                   │  5. يملأ البيانات │
       │                   │     (readings + conclusion + chart + info)
       │                   │                   │
       │                   │  6. يضغط "إرسال"  │
       │                   │ ───────────────>│
       │                   │                   │ DB: يخزن كل شيء
       │                   │                   │
       │  🔴 إشعار فوري    │                   │
       │ <─────────────────│                   │
       │                   │                   │
       │  7. يفتح "تصحيح"  │                   │
       │  8. يرى قائمة التقارير
       │  9. يضغط تقرير أحمد
       │                   │                   │
       │  10. ReportViewer يفتح
       │  11. يرى التقرير كامل:
       │      ├─ معلومات الطالب
       │      ├─ جدول القراءات المُنسق
       │      ├─ إحصائيات
       │      ├─ المعادلات
       │      ├─ الرسم البياني (صورة)
       │      └─ الخاتمة
       │                   │                   │
       │  12. يضيف تعليق:
       │      "أعد حساب k بالانحدار"
       │  13. يضغط "تصحيح"
       │  14. يدخل 85/100 + ملاحظات
       │ ─────────────────────────────────────>│
       │                   │                   │ DB: يخزن الدرجة + grade_history
       │                   │                   │
       │                   │  🔔 إشعار: "تم التصحيح: 85/100"
       │                   │ <─────────────────│
       │                   │                   │
       │                   │  15. يفتح "تقاريري"
       │                   │  16. يرى 85/100 + الملاحظة
       │                   │  17. يضغط التقرير → ReportViewer + banner الدرجة
       │                   │                   │
       │                   │  18. يُعدل الخاتمة
       │                   │  19. يعيد الإرسال (version 2)
       │                   │ ───────────────>│
       │                   │                   │
       │  🔴 إشعار: "أحمد أعاد إرسال التقرير"
       │ <─────────────────│                   │
       │                   │                   │
```

---

## 4.2 Checklist — كل الخطوات

### المرحلة 1: Backend Foundation (الأسبوع 1)

| # | المهمة | الملف | الحالة |
|---|--------|-------|--------|
| 1.1 | إنشاء `003_enrich_reports.sql` | `api/src/db/migrations/` | ⬜ |
| 1.2 | تعديل `reports/schemas.ts` — 7 حقول جديدة + addCommentSchema | `api/src/modules/reports/` | ⬜ |
| 1.3 | تعديل `reports/services.ts` — createReport مع 16 حقل + resubmit + comment + history + seen | `api/src/modules/reports/` | ⬜ |
| 1.4 | تعديل `reports/handlers.ts` — 6 endpoints جديدة | `api/src/modules/reports/` | ⬜ |
| 1.5 | إنشاء `notifications/schemas.ts` | `api/src/modules/notifications/` | ⬜ |
| 1.6 | إنشاء `notifications/services.ts` — 6 دوال | `api/src/modules/notifications/` | ⬜ |
| 1.7 | إنشاء `notifications/handlers.ts` — 5 endpoints | `api/src/modules/notifications/` | ⬜ |
| 1.8 | تسجيل notifications في `index.ts` | `api/src/index.ts` | ⬜ |
| 1.9 | اختبار API بالـ curl/Postman | — | ⬜ |

### المرحلة 2: Frontend Services (الأسبوع 2)

| # | المهمة | الملف | الحالة |
|---|--------|-------|--------|
| 2.1 | تعديل `report.service.ts` — Report interface + 9 functions | `web/src/services/` | ⬜ |
| 2.2 | إنشاء `notification.service.ts` | `web/src/services/` | ⬜ |
| 2.3 | إنشاء `useNotifications.ts` — polling + unread count | `web/src/composables/` | ⬜ |
| 2.4 | إنشاء `useReportSubmission.ts` | `web/src/composables/` | ⬜ |
| 2.5 | إنشاء `useReportGrading.ts` — load + grade + comment + history | `web/src/composables/` | ⬜ |

### المرحلة 3: Components — مشتركة (الأسبوع 3)

| # | المهمة | الملف | الحالة |
|---|--------|-------|--------|
| 3.1 | إنشاء `ReportViewer.vue` — يُعيد استخدام AnalysisReportPreview | `web/src/components/shared/` | ⬜ |
| 3.2 | إنشاء `NotificationBell.vue` — dropdown + unread badge | `web/src/components/shared/` | ⬜ |
| 3.3 | إنشاء `NotificationToast.vue` | `web/src/components/shared/` | ⬜ |

### المرحلة 4: Components — الطالب (الأسبوع 4)

| # | المهمة | الملف | الحالة |
|---|--------|-------|--------|
| 4.1 | تعديل `SubmitReportModal.vue` — 7 props + معاينة | `web/src/components/student/` | ⬜ |
| 4.2 | تعديل `AnalysisCalcExperiment.vue` — تمرير كل البيانات + chartSnapshot | `web/src/modules/physics/experiments/analysis-calc/` | ⬜ |
| 4.3 | إنشاء `ReportResubmitModal.vue` (Phase 2) | `web/src/components/student/` | ⬜ |
| 4.4 | تعديل `StudentReports.vue` — عرض التقرير + banner الدرجة | `web/src/components/student/` | ⬜ |

### المرحلة 5: Components — المدرس (الأسبوع 5)

| # | المهمة | الملف | الحالة |
|---|--------|-------|--------|
| 5.1 | تعديل `TeacherGrading.vue` — قائمة + stats + تصفية + ReportViewer modal | `web/src/components/teacher/` | ⬜ |
| 5.2 | إنشاء `GradeModal.vue` — slider + feedback (مستخرج) | `web/src/components/teacher/` | ⬜ |
| 5.3 | إنشاء `ReportCommentThread.vue` | `web/src/components/teacher/` | ⬜ |

### المرحلة 6: Layout + Dashboard (الأسبوع 6)

| # | المهمة | الملف | الحالة |
|---|--------|-------|--------|
| 6.1 | تعديل `AppNavbar.vue` — NotificationBell + badge | `web/src/components/layout/` | ⬜ |
| 6.2 | تعديل `dashboard.vue` — تبويبات + role-based | `web/src/pages/` | ⬜ |

### المرحلة 7: Advanced (الأسابيع 7-10)

| # | المهمة | الملف | الحالة |
|---|--------|-------|--------|
| 7.1 | قوالب التقييم (Grading Rubric) | `api/src/modules/reports/` + `web/src/components/teacher/` | ⬜ |
| 7.2 | تصحيح آلي جزئي | `web/src/composables/` | ⬜ |
| 7.3 | مقارنة الطلاب (Class Performance) | `web/src/components/teacher/` | ⬜ |
| 7.4 | تصدير PDF/Excel | `web/src/components/shared/` | ⬜ |
| 7.5 | مواعيد نهائية + تذكيرات | `api/src/modules/classes/` + `web/src/components/student/` | ⬜ |

---

## 4.3 الاختبار End-to-End

| # | الخطوة | النتيجة المتوقعة |
|---|--------|-----------------|
| 1 | سجّل دخول كمدرس → أنشئ فصل → انسخ الكود | الفصل يظهر في "فصولي" |
| 2 | سجّل دخول كطالب → انضم بالكود | الطالب يظهر في expand الفصل |
| 3 | الطالب → تجربة النابض → تحليل النتائج | AnalysisCalcExperiment يفتح مع البيانات |
| 4 | الطالب → يملأ معلوماته + خاتمة | البيانات مكتملة |
| 5 | الطالب → يضغط "إرسال للمعلم" → يختار الفصل | Modal يغلق + "تم الإرسال" |
| 6 | المدرس → Navbar يظهر 🔴 | Badge يظهر عدد التقارير الجديدة |
| 7 | المدرس → يفتح "تصحيح" | قائمة التقارير تظهر |
| 8 | المدرس → يضغط على تقرير أحمد | ReportViewer يفتح مع التقرير الكامل |
| 9 | المدرس → يرى جدول + رسم + خاتمة + معلومات الطالب | كل البيانات مُنسقة |
| 10 | المدرس → يضغط "تصحيح" → يدخل 85 + ملاحظات | Modal يغلق + التقرير مُحدث |
| 11 | الطالب → Navbar يظهر 🔔 | إشعار "تم تصحيح تقريرك" |
| 12 | الطالب → يفتح "تقاريري" | الدرجة 85/100 + الملاحظة |
| 13 | الطالب → يضغط التقرير | ReportViewer + banner الدرجة |

---

## 4.4 الأخطاء المتوقعة والحلول

| # | المشكلة المتوقعة | الحل |
|---|-----------------|------|
| 1 | `chart_snapshot` base64 كبير جداً | limit 500KB، أو تخزين كـ Blob URL |
| 2 | التعليقات كثيرة → modal طويل | max-height + scroll |
| 3 | إشعارات كثيرة → dropdown طويل | LIMIT 50 + pagination |
| 4 | الطالب يُعدل تقرير مُصحح → نسخة جديدة | `version` + `parent_id` |
| 5 | المدرس يُصحح تقرير غير موجود | 404 check في handler |
| 6 | Two users edit same report concurrently | SQLite row-level lock |

---

## 4.5 القرارات المعمارية

| # | القرار | السبب |
|---|--------|-------|
| 1 | `chart_snapshot` base64 في DB | بسيط — لا يحتاج file storage |
| 2 | Polling كل 30 ثانية للإشعارات | WebSocket معقد — polling كافٍ |
| 3 | `AnalysisReportPreview.vue` لا يُعدل | قواعد "كما هو" |
| 4 | `ReportViewer.vue` wrapper فقط | إعادة استReuse بدون تعديل |
| 5 | `GradeModal.vue` منفصل | TeacherGrading > 300 سطر |
| 6 | Comments في DB وليس real-time | SQLite + polling كافٍ |

---

## 4.6 ملخص كل الملفات (25 ملف)

| # | الملف | النوع | المسار |
|---|-------|-------|--------|
| 1 | `003_enrich_reports.sql` | NEW | `api/src/db/migrations/` |
| 2 | `reports/schemas.ts` | EDIT | `api/src/modules/reports/` |
| 3 | `reports/services.ts` | EDIT | `api/src/modules/reports/` |
| 4 | `reports/handlers.ts` | EDIT | `api/src/modules/reports/` |
| 5 | `notifications/schemas.ts` | NEW | `api/src/modules/notifications/` |
| 6 | `notifications/services.ts` | NEW | `api/src/modules/notifications/` |
| 7 | `notifications/handlers.ts` | NEW | `api/src/modules/notifications/` |
| 8 | `api/src/index.ts` | EDIT | `api/src/` |
| 9 | `report.service.ts` | EDIT | `web/src/services/` |
| 10 | `notification.service.ts` | NEW | `web/src/services/` |
| 11 | `useNotifications.ts` | NEW | `web/src/composables/` |
| 12 | `useReportSubmission.ts` | NEW | `web/src/composables/` |
| 13 | `useReportGrading.ts` | NEW | `web/src/composables/` |
| 14 | `ReportViewer.vue` | NEW | `web/src/components/shared/` |
| 15 | `NotificationBell.vue` | NEW | `web/src/components/shared/` |
| 16 | `NotificationToast.vue` | NEW | `web/src/components/shared/` |
| 17 | `SubmitReportModal.vue` | EDIT | `web/src/components/student/` |
| 18 | `ReportResubmitModal.vue` | NEW | `web/src/components/student/` |
| 19 | `StudentReports.vue` | EDIT | `web/src/components/student/` |
| 20 | `TeacherGrading.vue` | EDIT | `web/src/components/teacher/` |
| 21 | `GradeModal.vue` | NEW | `web/src/components/teacher/` |
| 22 | `ReportCommentThread.vue` | NEW | `web/src/components/teacher/` |
| 23 | `AppNavbar.vue` | EDIT | `web/src/components/layout/` |
| 24 | `dashboard.vue` | EDIT | `web/src/pages/` |
| 25 | `AnalysisCalcExperiment.vue` | EDIT | `web/src/modules/physics/experiments/analysis-calc/` |
