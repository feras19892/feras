# دليل التنفيذ الرئيسي
## Master Execution Roadmap

**تاريخ الإعداد:** 2026-07-04  
**إجمالي المدة المُقدرة:** 4-5 أيام عمل فردية  
**عدد المحاور:** 4  
**عدد المراحل الفرعية:** 26 مرحلة

---

## خريطة الملفات

| المحور | الملف | المدة | الأولوية |
|--------|-------|-------|----------|
| 1. أمان الخلفية | [`PLAN-01-BACKEND-SECURITY.md`](PLAN-01-BACKEND-SECURITY.md) | 2-3 ساعات | **حرج** |
| 2. تقسيم الكود الواجهة | [`PLAN-02-FRONTEND-PERFORMANCE.md`](PLAN-02-FRONTEND-PERFORMANCE.md) | 4-6 ساعات | **عالٍ** |
| 3. توحيد أنواع التجارب | [`PLAN-03-EXPERIMENT-SCHEMA.md`](PLAN-03-EXPERIMENT-SCHEMA.md) | 3-4 ساعات | **عالٍ** |
| 4. بيئة الاختبارات | [`PLAN-04-UNIT-TESTS.md`](PLAN-04-UNIT-TESTS.md) | 2-3 ساعات | **متوسط** |

---

## جدول التنفيذ المُقترح

### اليوم الأول

| المرحلة | المهمة | الملف المستهدف | الوقت |
|---------|--------|----------------|-------|
| **1.1** | تحليل الوضع الراهن | `apps/api/src/index.ts` | 15 دقيقة |
| **1.2** | إنشاء middleware الأمان | `apps/api/src/shared/middleware/security.ts` | 30 دقيقة |
| **1.3** | إنشاء middleware CORS | `apps/api/src/shared/middleware/cors.ts` | 30 دقيقة |
| **1.4** | دمج في index.ts | `apps/api/src/index.ts` | 20 دقيقة |
| **1.5** | اختبار شامل | Terminal (curl) | 30 دقيقة |
| **1.6** | تحديث Docker & Docs | `.env.example`, `docker-compose.yml` | 15 دقيقة |
| **3.1** | تصميم BaseExperiment | `packages/shared-types/src/experiment.ts` | 45 دقيقة |
| **3.2** | تصميم ExperimentResult | `packages/shared-types/src/experiment-result.ts` | 30 دقيقة |
| **3.3** | تحديث shared-types index | `packages/shared-types/src/index.ts` | 15 دقيقة |

### اليوم الثاني

| المرحلة | المهمة | الملف المستهدف | الوقت |
|---------|--------|----------------|-------|
| **3.4** | تحديث DB Schema | `apps/api/src/db/migrations/006_experiments_schema.sql` | 30 دقيقة |
| **3.5** | تحديث API routes | `apps/api/src/modules/reports/services.ts` | 45 دقيقة |
| **3.6** | تحديث Web composables | `apps/web/src/composables/experiment/` | 60 دقيقة |
| **3.7** | اختبار Type Safety | `pnpm typecheck` (API + Web) | 30 دقيقة |

### اليوم الثالث

| المرحلة | المهمة | الملف المستهدف | الوقت |
|---------|--------|----------------|-------|
| **2.1** | تحليل Router | `apps/web/src/router.ts` | 30 دقيقة |
| **2.2** | Lazy Loading للتجارب | `apps/web/src/router.ts` | 45 دقيقة |
| **2.3** | Lazy Loading للـ Admin | `apps/web/src/router.ts` | 30 دقيقة |
| **2.4** | Suspense + Fallback | `apps/web/src/App.vue` | 45 دقيقة |
| **2.5** | Async Components كيمياء | `apps/web/src/components/experiment/chemistry/` | 60 دقيقة |
| **2.6** | Split Chunks في Vite | `apps/web/vite.config.ts` | 30 دقيقة |
| **2.7** | قياس وتحسين | Lighthouse, build analysis | 45 دقيقة |

### اليوم الرابع (نصف يوم)

| المرحلة | المهمة | الملف المستهدف | الوقت |
|---------|--------|----------------|-------|
| **4.1** | تثبيت أدوات الاختبار | `apps/web/package.json` | 15 دقيقة |
| **4.2** | إعداد Vitest | `apps/web/vitest.config.ts` | 30 دقيقة |
| **4.3** | اختبار أولي | `apps/web/src/composables/useAuthActions.spec.ts` | 30 دقيقة |
| **4.4** | اختبار الكيمياء | `packages/chemistry-engine/src/equations.spec.ts` | 45 دقيقة |
| **4.5** | اختبار حسابي | `apps/web/src/composables/chemistry/useChemCalculations.spec.ts` | 30 دقيقة |
| **4.6** | Git Hook (اختياري) | `.husky/pre-commit` | 15 دقيقة |
| **4.7** | توثيق | `apps/web/tests/README.md` | 15 دقيقة |

---

## شروط ما قبل البدء (Pre-conditions)

- [ ] `pnpm typecheck` ناجح ← **مُنجز** ✅
- [ ] `pnpm lint` نظيف ← **مُنجز** ✅
- [ ] Dependencies الدائرية مفكوكة ← **مُنجز** ✅

## شروط النجاح (Definition of Done)

| المحور | المعيار |
|--------|---------|
| **1. أمان** | `curl -I` يظهر 4+ ترويسات أمان + CORS يرفض Origins غير معروفة |
| **2. أداء** | Lighthouse Performance ≥ 70 + تقليل bundle أولي ≥ 40% |
| **3. أنواع** | `BaseExperiment` مستخدم في 5+ composables + migration ناجح |
| **4. اختبارات** | 10+ test cases ناجحة + `pnpm test:unit` يمر في < 10 ثوانٍ |

---

## نقاط الاتصال بين الملفات (Cross-plan Dependencies)

```
PLAN-01 (أمان)
   │
   ▼
PLAN-03 (أنواع) ← يجب أن تكون ExperimentResult جاهزة قبل
   │               تحديث Reports services (المحور 1 والـ 3 يتقاطعان)
   ▼
PLAN-02 (أداء) ← يحتاج أنواع التجارب المُوحدة لتبسيط imports
   │
   ▼
PLAN-04 (اختبارات) ← يستفيد من تقسيم الكود لتبسيط mock
```

---

## ملاحظات تنفيذية

1. **لا تُعدّل كوداً خارج نطاق المرحلة** — إذا وجدت bug في ملف آخر، سجّله وتابع.
2. **شغّل `pnpm typecheck` بعد كل مرحلة** — لا تنتظر نهاية اليوم.
3. **احفظ commit بعد كل محور** — `git commit -m "feat: security headers + CORS"`.
4. **إذا تعطلت مرحلة** ← ارجع للـ checkpoint الأخير (commit) ولا تستمر.
