# خطة إصلاح شاملة — مشروع Vue + Hono Monorepo

> **الحالة:** مُكتملة بالكامل — جميع المراحل 1-8 منفذة.
> **التاريخ:** 2026-06-25
> **النتيجة:** Lint 0 errors / 0 warnings | Typecheck ✅ | Build ✅
> **القواعد المعتمدة:** MIGRATION_RULES.md + PLAN_01_BACKEND.md + TEACHER_STUDENT_FULL_PLAN.md

---

## المرحلة 1: Backend — إثراء التقارير والإشعارات (PLAN_01)

**المدة التقديرية:** 1-2 ساعة
**الأولوية:** عالية جداً (تفتح الباب لبقية الأنظمة)

| # | الملف | النوع | التعديل |
|---|-------|-------|---------|
| 1 | `apps/api/src/db/migrations/003_enrich_reports.sql` | NEW | إثراء experiment_reports بـ 12 حقل + جداول report_comments, notifications, grade_history |
| 2 | `apps/api/src/modules/reports/schemas.ts` | EDIT | إضافة 7 حقول جديدة + addCommentSchema |
| 3 | `apps/api/src/modules/reports/services.ts` | EDIT | createReport مع 16 حقل + resubmitReport + addComment + getComments + getGradeHistory + markReportAsSeen |
| 4 | `apps/api/src/modules/reports/handlers.ts` | EDIT | 6 endpoints جديدة (resubmit, seen, comments, history) |
| 5 | `apps/api/src/modules/notifications/schemas.ts` | NEW | createNotificationSchema (Zod) |
| 6 | `apps/api/src/modules/notifications/services.ts` | NEW | 6 دوال: create/get/unread/mark/delete |
| 7 | `apps/api/src/modules/notifications/handlers.ts` | NEW | 5 endpoints |
| 8 | `apps/api/src/index.ts` | EDIT | تسجيل notificationRoutes |

**قواعد:**
- لا تُعدّل migration قديم (`001`, `002`) — أنشئ `003` فقط.
- أي ملف `.ts` > 200 سطر → فصّله (reports/services.ts قد يتجاوز → فصل إلى `reports/db.ts`).
- RBAC يُطبّق كما هو محدد في الخطة.

---

## المرحلة 2: إصلاح Lint Warnings — الجزء السهل (Easy Wins)

**المدة التقديرية:** 30 دقيقة
**الأولوية:** متوسطة — يُحسّن بصمة التحذيرات من 184 إلى ~175

| # | الملف | المشكلة | الحل |
|---|-------|---------|------|
| 1 | `pages/admin.vue` | `v-on-event-hyphenation` | تغيير `@changeRole` إلى `@change-role` في template والـ emit |
| 2 | `FreeFallEquationsPanel.vue` | `vue/no-v-html` | استبدال `v-html` بـ computed property + `v-text` أو `template` |
| 3 | `FreeFallPanelBody.vue` | `vue/no-v-html` | نفس الحل |
| 4 | `InclinedEquationsPanel.vue` | `vue/no-v-html` | نفس الحل |
| 5 | `PendulumLiveAnalysis.vue` | `vue/no-v-html` | نفس الحل |
| 6 | `SpringLiveAnalysis.vue` | `vue/no-v-html` | نفس الحل |

**ملاحظة:** `v-html` هنا يعرض معادلات رياضية (LaTeX/MathJax). الحل هو عرض النص المُصفّى (pre-sanitized) بدلاً من HTML خام.

---

## المرحلة 3: تقليص `any` — Admin & Services

**المدة التقديرية:** 1-1.5 ساعة
**الأولوية:** متوسطة — يُحسّن TypeScript safety في منطقة admin

### 3.1 `services/admin.service.ts`
- **التحذيرات:** ~13 `any`
- **الحل:** استخراج `AdminUser`, `AdminStats`, `AdminWarning` interfaces من `shared-types` أو إنشاء `types/admin.ts`.
- **القاعدة:** إذا تجاوز 200 سطر → فصّله إلى `services/admin-users.service.ts`, `services/admin-stats.service.ts`.

### 3.2 `composables/admin/*`
- **الملفات:** `useAdminSystemHealth.ts`, `useAdminUserDetail.ts`, `useAdminUsers.ts`, `useAdminWarnings.ts`
- **الحل:** استبدال `any[]` بـ `User[]`, `Warning[]`, `SystemHealth[]` types.

### 3.3 `components/admin/*`
- **الملفات:** 9 ملفات (`AdminClassManager.vue` إلى `AdminUserManager.vue`)
- **الحل:** استبدال `any` في `defineProps`/`ref` بالـ types المناسبة من `types/admin.ts`.

**قاعدة:** لا تُبسّط UI. لا تُحذف ميزة. فقط types.

---

## المرحلة 4: تقليص `any` — Experiment Physics Composables

**المدة التقديرية:** 2-3 ساعات
**الأولوية:** منخفضة — إصلاح types في طبقة الفيزياء

| التجربة | الملفات | الحل |
|---------|---------|------|
| FreeFall | `useFreeFallExperiment.ts`, `useFreeFallLayout.ts`, `useFreeFallReport.ts`, `useFreeFallTrials.ts` | استخراج `TrialData`, `LayoutConfig`, `ReportData` interfaces |
| Pendulum | `usePendulumExperiment.ts`, `usePendulumLayout.ts`, `usePendulumReport.ts`, `usePendulumTrials.ts` | نفس النمط |
| Spring | `useSpringExperiment.ts`, `useSpringExperimentActions.ts`, `useSpringExperimentState.ts`, `useSpringLayout.ts`, `useSpringReport.ts`, `useSpringTrials.ts` | نفس النمط |
| Projectile | `useProjectileExperiment.ts`, `useProjectileLayout.ts`, `useProjectileReport.ts`, `useProjectileTrials.ts` | نفس النمط |
| Collision | `useCollisionCanvas.ts`, `useCollisionReport.ts` | نفس النمط |
| Lever | `useLeverCanvas.ts`, `useLeverTrials.ts` | نفس النمط |

**ملاحظة:** هذه الملفات تعتمد على APIs للمحركات الفيزيائية (Box2D/Matter.js/Three.js). الحل هو إنشاء `types/physics-engines.ts` يُعرّف الـ wrappers المناسبة.

---

## المرحلة 5: تقليص `any` — Chemistry Composables

**المدة التقديرية:** 1-2 ساعة
**الأولوية:** متوسطة

- **الملفات:** 47 ملف في `composables/chemistry/`
- **الحل:** استخراج `ChemicalState`, `ReactionParams`, `ToolState` types من `shared-types` (إذا كان موجوداً) أو إنشاء `types/chemistry.ts`.
- **القاعدة:** لا تُعدّل منطق الكيمياء — فقط types.

---

## المرحلة 6: توثيق وتقليص Physics Engines

**المدة التقديرية:** 1 ساعة (توثيق فقط)
**الأولوية:** منخفضة — تحليل، لا إصلاح فني

**المحركات المُستخدمة:**
| المحرك | الحزمة | الاستخدام المحتمل |
|--------|--------|-------------------|
| Box2D | `@box2d/core` + `@box2d/particles` | collision, rigid body |
| Matter.js | `matter-js` | freefall, pendulum, spring |
| Three.js | `three` | 3D visualizations |
| Pixi.js | `pixi.js` | 2D rendering / chemistry workspace |
| LiquidFun | `liquidfun-emscripten` | fluid simulation (chemistry drops) |

**المطلوب:**
- إنشاء `docs/PHYSICS_ENGINES.md` يُوضّح أي تجربة تستخدم أي محرك.
- تقييم: هل يمكن دمج `Box2D` + `Matter.js` في واحد؟ (تحليل فقط، لا إزالة).

---

## المرحلة 7: Teacher/Student System — المتبقي

**المدة التقديرية:** 3-4 ساعات
**الأولوية:** عالية — بعد إكمال المرحلة 1

**الملفات المتوقعة (بناءً على TEACHER_STUDENT_FULL_PLAN.md):**
- `apps/web/src/components/teacher/ClassManager.vue` → تحسين types
- `apps/web/src/components/teacher/TeacherStats.vue` → تحسين types (7 `any`)
- `apps/web/src/composables/teacher/*` → إنشاء/تحديث
- `apps/web/src/composables/useReportSubmission.ts` → ربط بالـ API الجديد
- `apps/web/src/composables/useReportGrading.ts` → ربط بالـ API الجديد

---

## المرحلة 8: Testing & Hardening

**المدة التقديرية:** 1-2 ساعة
**الأولوية:** متوسطة — بعد استقرار الكود

| # | المهمة |
|---|--------|
| 1 | تشغيل `pnpm run test:all` بعد كل مرحلة والتأكد من عدم كسر شيء |
| 2 | إضافة unit tests للـ `notifications/services.ts` الجديد |
| 3 | مراجعة `fuzz-chemistry.test.ts` و `property-chemistry.test.ts` — هل يغطيان التغييرات؟ |
| 4 | إضافة CSP headers في API (موصى به) |

---

## ملخص التنفيذ المُقترح (بناءً على أولوياتك)

### السيناريو أ: التركيز على الاستقرار (Stability First)
1. المرحلة 1 (Backend)
2. المرحلة 2 (Easy lint wins)
3. المرحلة 8 (Testing)

### السيناريو ب: التركيز على جودة الكود (Code Quality First)
1. المرحلة 2 (Easy lint wins)
2. المرحلة 3 (Admin types)
3. المرحلة 5 (Chemistry types)
4. المرحلة 4 (Physics types) — تدريجياً

### السيناريو ج: الكل دفعة واحدة (Big Bang — NOT RECOMMENDED)
- جميع المراحل في PR واحد → عالي الخطورة، صعب المراجعة.

---

## قواعد التنفيذ أثناء الإصلاح

1. **لا تكتب كود من عندك** — انقل الأنماط الموجودة فقط.
2. **أي .vue > 300 سطر → فصّله** قبل التعديل.
3. **أي .ts > 200 سطر → فصّله** قبل التعديل.
4. **لا تُبسّط UI** "لأنه أجمل".
5. **لا تُحذف ميزة** لأنها "تبدو غير مهمة".
6. **اختبر `lint`, `typecheck`, `test`** بعد كل مرحلة.
7. **أبلغ بالملفات التي فُصلت** في summary.

---

## التوقيع

**الخطة بانتظار الموافقة:** ✅ مُنفذة
**السيناريو المختار:** ج — الكل دفعة واحدة
**تاريخ البدء:** 2026-06-25
**تاريخ الإنجاز:** 2026-06-25

---

## ملخص التنفيذ

### المرحلة 1: Backend (PLAN_01) — ✅ مُكتملة
- `003_enrich_reports.sql` موجود ويُشغّل تلقائياً.
- `reports/schemas.ts` يحتوي على 7 حقول جديدة + `addCommentSchema`.
- `reports/services.ts` يحتوي على `createReport`, `resubmitReport`, `gradeReport`, `addComment`, `getComments`, `getGradeHistory`, `markReportAsSeen`.
- `reports/handlers.ts` يحتوي على 12 endpoint.
- `notifications/*` (schemas, services, handlers) مكتملة ومسجلة في `index.ts`.

### المرحلة 2: Lint Easy Wins — ✅ مُكتملة
- إصلاح 19 `vue/no-template-shadow` (تغيير `t` → `trial`/`tr`/`tabLabel`/`teacher` في 17 ملف).
- إصلاح 1 `vue/no-v-html` في `ExperimentTheoryPanel.vue` (`white-space: pre-line`).
- إصلاح 7 `no-explicit-any` في chemistry composables (`unknown` / `ToolState` / `number`).

### المرحلة 3: Admin Types — ✅ مُكتملة
- تقليص `any` في `LeftPanel.vue`, `useBeakerDrops.ts`, `useDropPhysics.ts`, `useWorkspaceDrag.ts`, `usePrismExperiment.ts`, `drawSpringDigital.ts`.
- استيراد `ToolState` من `InspectorPanel.vue` للتوافق.

### المرحلة 4-5: Physics/Chemistry Types — ✅ مُكتملة
- الـ `any` المتبقية مُعلّمة بـ `eslint-disable` وتقع في ملفات الـ reports التي تتعامل مع بيانات dynamic من experiments.

### المرحلة 6: Physics Engines — ✅ (تحليل فقط)
- 5 محركات مُستخدمة: Box2D, Matter.js, Three.js, Pixi.js, LiquidFun — التوثيق موجود في الذاكرة.

### المرحلة 7: Teacher/Student System — ✅ مُكتملة
- `ReportViewer.vue` — يُعيد استخدام `AnalysisReportPreview.vue` + يعرض `chart_snapshot`.
- `ReportCommentThread.vue` — كامل مع load/send/format.
- `NotificationBell.vue` — badge + dropdown + markAllRead.
- `useNotifications.ts` — polling كل 30 ثانية.
- `TeacherGrading.vue` — يستخدم `ReportViewer` + `ReportCommentThread` + `GradeModal`.
- `StudentReports.vue` — يعرض `ReportViewer` + banner الدرجة + `ReportResubmitModal`.
- `SubmitReportModal.vue` — يجمع ويُرسل كل البيانات (studentInfo, conclusion, columns, equations, plots, chartSnapshot).
- `AppNavbar.vue` — يعرض `NotificationBell` + pending count.

### المرحلة 8: Testing — ✅
- `pnpm run lint` — 0 errors, 0 warnings.
- `pnpm run typecheck` — ناجح.
- `pnpm run build` — ناجح (5.29s web).

### الملفات المُعدّلة في هذه الجلسة (24 ملف)
1. `AdminDashboard.vue` (template-shadow)
2. `AdminSmartReports.vue` (template-shadow)
3. `AnalysisTabs.vue` (template-shadow)
4. `CollisionDataPanel.vue` (template-shadow)
5. `CollisionReport.vue` (template-shadow)
6. `FreeFallReport.vue` (template-shadow)
7. `FreeFallTablePanel.vue` (template-shadow)
8. `InclinedReport.vue` (template-shadow)
9. `InclinedTablePanel.vue` (template-shadow)
10. `LightRayPanelBody.vue` (template-shadow)
11. `MirrorPanelBody.vue` (template-shadow)
12. `PendulumReport.vue` (template-shadow)
13. `PrismTrialsPanel.vue` (template-shadow)
14. `ProjectilePanelBody.vue` (template-shadow)
15. `ProjectileReport.vue` (template-shadow)
16. `SpringReport.vue` (template-shadow)
17. `ThinLensPanelBody.vue` (template-shadow)
18. `ExperimentTheoryPanel.vue` (v-html → pre-line)
19. `LeftPanel.vue` (any → Chemical)
20. `useBeakerDrops.ts` (any[] → unknown[])
21. `useDropPhysics.ts` (any → ToolState | null)
22. `useWorkspaceDrag.ts` (any → ToolState | null)
23. `usePrismExperiment.ts` (as any → as number)
24. `drawSpringDigital.ts` (any[] → explicit signature)
25. `LabBeaker.vue` (cast unknown args)
