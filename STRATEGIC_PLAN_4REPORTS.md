# الخطة الاستراتيجية المُعاد صياغتها
## أربعة محاور لرفع جودة البنية التقنية

**تاريخ الإعداد:** 2026-07-04  
**حالة المشروع بعد التدقيق:** Typecheck ناجح، Lint نظيف، Dependencies دائرية مفكوكة

---

## مقدمة تنفيذية

بعد إتمام المرحلة الأولى من التدقيق والتنظيف (Lint + Architecture)، تبرز أربعة محاور استراتيجية تحتاج إلى خطط تشغيلية واضحة:

| # | المحور | الأولوية | نطاق التأثير | الجهد التقديري |
|---|--------|----------|--------------|----------------|
| 1 | أمان الخلفية | **حرج** | API كامل | 2-3 ساعات |
| 2 | تقسيم الكود الواجهة | **عالٍ** | 485 مكون + 30 تجربة | 4-6 ساعات |
| 3 | توحيد أنواع التجارب | **عالٍ** | API + Web + DB | 3-4 ساعات |
| 4 | بيئة الاختبارات | **متوسط** | 237 composable | 2-3 ساعات |

---

## المحور الأول: تدقيق وتحسين أمان الخلفية
### Backend Security Audit & Hardening

#### الهدف الاستراتيجي
حماية طبقة API المبنية على Hono من الهجمات الشائعة (MITM, XSS, Clickjacking, MIME sniffing) مع تقييد الوصول عبر سياسة CORS صارمة.

#### الوضع الراهن
- `apps/api/src/index.ts` يستورد `cors` و `logger` لكن بدون تهيئة صارمة
- غياب ترويسات الأمان القياسية (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`)
- `shared/middleware/` يحتوي على `logger.ts` و `rate-limit.ts` فقط — لا يوجد `security.ts`

#### الخطة التشغيلية

**أ) إنشاء `apps/api/src/shared/middleware/security.ts`**
```
مهام الملف:
  ├─ تطبيق ترويسات Helmet-equivalent بشكل يدوي (Hono لا يملك helmet natively)
  ├─ X-Frame-Options: DENY
  ├─ X-Content-Type-Options: nosniff
  ├─ X-XSS-Protection: 1; mode=block
  ├─ Strict-Transport-Security (HSTS) — في الإنتاج فقط
  └─ Referrer-Policy: strict-origin-when-cross-origin
```

**ب) إنشاء `apps/api/src/shared/middleware/cors.ts`**
```
مهام الملف:
  ├─ السماح فقط بالأصول (Origins):
  │   • http://localhost:5173  (التطوير)
  │   • https://<production-domain>  (الإنتاج — من env)
  ├─ الطرق المسموحة: GET, POST, PUT, DELETE, PATCH
  ├─ الترويسات المسموحة: Content-Type, Authorization
  ├─ إرسال Credentials (cookies) فقط مع Origins معروفة
  └─ رفض أي Origin غير معروف بـ 403
```

**ج) تعديل `apps/api/src/index.ts`**
```
ترتيب الـ Middlewares يجب أن يكون:
  1. CORS  ← أولاً (قبل أي منطق)
  2. Security Headers
  3. Rate Limit
  4. Logger
  5. Auth Middleware (للـ routes المحمية)
  6. Routes
```

#### المخرجات المتوقعة
- API محصن ضد XSS و Clickjacking
- عدم إمكانية embed التطبيق في iframe خارجي
- CORS صارمة تمنع استدعاء API من نطاقات غير مصرحة

---

## المحور الثاني: استراتيجية الأداء وتقسيم الكود
### Frontend Performance & Code Splitting

#### الهدف الاستراتيجي
تقليل الحمل الأولي (Initial Bundle) لواجهة Vue بحيث لا يُحمّل الطالب/المعلم إلا التجربة أو الصفحة التي يزورها فعلياً.

#### الوضع الراهن
- `apps/web/src/router.ts` يستخدم استيرادات ثابتة (`import` عادية) لجميع الصفحات
- 485 مكون Vue + 30 تجربة فيزياء/كيمياء تُحمل دفعة واحدة
- مكونات المختبر الكيميائي (57 ملف) مُستوردة ثابتة حتى لو لم يدخل الطالب إلى الكيمياء

#### الخطة التشغيلية

**أ) تحويل الـ Router إلى Lazy Loading**
```
الملف المستهدف: apps/web/src/router.ts

التغيير المطلوب:
  ├─ تحويل كل import ثابت لصفحة تجربة إلى:
  │   () => import('@/pages/ExperimentPage.vue')
  ├─ تحويل صفحات Admin/Teacher/Student إلى lazy imports
  ├─ الاحتفاظ بالـ imports الثابتة فقط لـ:
  │   • Landing Page
  │   • Login Page
  │   • Layout العام (Navbar + Sidebar)
  └─ تطبيق eager: false على التجارب الثقيلة
```

**ب) استخدام `defineAsyncComponent` للمكونات الفرعية الثقيلة**
```
الملفات المستهدفة:
  ├─ apps/web/src/components/experiment/chemistry/ ← 57 مكون
  ├─ أدوات المختبر (LabBurette, LabBeaker, LabPipette...)
  └─ ألوحة التحكم الكبيرة (AnalysisChartWorkspace, ExperimentReport)

التغيير المطلوب:
  ├─ استبدال import ثابت بـ:
  │   defineAsyncComponent(() => import('./LabBurette.vue'))
  ├─ إضافة Suspense + fallback (Skeleton أو Spinner)
  └─ تجميع المكونات المتعلقة بنفس التجربة في chunk واحد
```

**ج) تفعيل Split Chunks في Vite**
```
الملف المستهدف: apps/web/vite.config.ts

التغيير المطلوب:
  build.rollupOptions.output.manualChunks = {
    'experiments-physics': [/* experiments physics */],
    'experiments-chemistry': [/* experiments chemistry */],
    'admin-pages': [/* admin components */],
    'vendor': ['vue', 'vue-router', 'pinia']
  }
```

#### المخرجات المتوقعة
- تقليل الحجم الأولي بنسبة 40-60%
- تحميل التجربة الواحدة عند الطلب فقط
- Time-to-Interactive أقل بكثير على الأجهزة البطيئة

---

## المحور الثالث: توحيد بنية التجارب
### Experiment Schema & Type Unification

#### الهدف الاستراتيجي
إنشاء عقد (Contract) واحد بين قاعدة البيانات والـ API والواجهة بحيث تكون جميع التجارب (30 فيزياء + كيمياء) متناسقة في البنية.

#### الوضع الراهن
- كل تجربة لها هيكل بيانات منفصل في Vue (composables مختلفة)
- قاعدة البيانات لديها `experiment_reports` لكن لا يوجد جدول `experiments` موحد
- `packages/shared-types` لا يحتوي على types للتجارب

#### الخطة التشغيلية

**أ) إنشاء `packages/shared-types/src/experiment.ts`**
```typescript
// الهيكل الموحد للتجربة
export interface BaseExperiment {
  id: string;                    // المعرف الفريد (مثل: "physics-pendulum")
  category: 'physics' | 'chemistry';
  title: Record<string, string>; // { ar: "...", en: "..." }
  description: Record<string, string>;
  currentState: 'idle' | 'running' | 'paused' | 'completed';
  steps: ExperimentStep[];       // خطوات التجربة بالترتيب
  config: Record<string, unknown>; // معاملات خاصة بالتجربة
  maxDurationSeconds?: number;
}

export interface ExperimentStep {
  id: string;
  order: number;
  title: Record<string, string>;
  instruction: Record<string, string>;
  validation?: StepValidation;   // شروط اجتياز الخطوة
}

export interface StepValidation {
  type: 'range' | 'exact' | 'formula';
  expectedValue?: number;
  tolerance?: number;            // ±% للقبول
  formula?: string;              // مثل "g = 4π²L/T²"
}
```

**ب) إنشاء `packages/shared-types/src/experiment-result.ts`**
```typescript
export interface ExperimentResult {
  experimentId: string;
  studentId: number;
  reportId?: number;             // ربط بـ experiment_reports
  startedAt: string;             // ISO timestamp
  completedAt: string;
  totalDurationSeconds: number;
  stepsCompleted: number;
  totalSteps: number;
  accuracyScore: number;         // 0-100
  rawData: Record<string, number | string>[]; // قراءات الطالب
  calculatedValues?: Record<string, number>; // القيم المشتقة
  passed: boolean;
  teacherNotes?: string;
}
```

**ج) تحديث قاعدة البيانات**
```sql
-- migration 006_experiments_schema.sql
CREATE TABLE experiments (
  id TEXT PRIMARY KEY,
  category TEXT CHECK(category IN ('physics','chemistry')),
  title_ar TEXT,
  title_en TEXT,
  config_json TEXT,  -- JSON string للمعاملات
  max_duration_seconds INTEGER
);

ALTER TABLE experiment_reports ADD COLUMN experiment_id TEXT REFERENCES experiments(id);
```

#### المخرجات المتوقعة
- all التجارب تتبع نفس الهيكل
- تسهيل إضافة تجارب جديدة (نسخ + تعديل config)
- Type Safety بين API و Web و DB

---

## المحور الرابع: بناء بيئة اختبارات الوحدات
### Unit Testing Environment (Vitest + jsdom)

#### الهدف الاستراتيجي
إنشاء طبقة اختبارات سريعة (Fast Feedback Loop) للـ composables ومحرك الكيمياء قبل الوصول إلى اختبارات Playwright E2E.

#### الوضع الراهن
- `apps/web/tests/` يحتوي فقط على Playwright (E2E) — بطيء ويحتاج متصفح
- لا يوجد `vitest.config.ts` منفصل
- 237 composable بدون تغطية اختبارية

#### الخطة التشغيلية

**أ) إنشاء `apps/web/vitest.config.ts`**
```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    alias: {
      '@/': resolve(__dirname, './src/'),
    },
  },
});
```

**ب) تحديث `apps/web/package.json`**
```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^24.0.0"
  }
}
```

**ج) أمثلة على ملفات اختبار أولوية**
```
الملفات الأكثر أهمية للاختبار:
  ├─ src/composables/chemistry/useChemCalculations.test.ts
  ├─ src/composables/useExperimentMonitor.test.ts
  ├─ packages/chemistry-engine/src/equations.test.ts
  ├─ packages/chemistry-engine/src/color.test.ts
  └─ src/services/auth.service.test.ts
```

#### المخرجات المتوقعة
- اختبارات تُنفذ في < 10 ثوانٍ (مقابل دقائق لـ Playwright)
- كشف الانحدار (Regression) في منطق التجارب قبل الـ commit
- ثقة أعلى في refactoring المستمر

---

## مصفوفة التنفيذ المُقترحة

| المرحلة | المهام | المدة | التبعيات |
|---------|--------|--------|----------|
| **1** | أمان الخلفية (CORS + Headers) | يوم | لا شيء |
| **2** | توحيد أنواع التجارب | يوم | لا شيء |
| **3** | تقسيم الكود (Router Lazy + Async) | يومين | المرحلة 2 |
| **4** | بيئة الاختبارات | نصف يوم | المرحلة 3 |

**إجمالي المدة المُقدرة:** 4-5 أيام عمل فردية

---

## ملاحظات فنية إضافية

1. **الأمان:** لا يُنصح باستخدام `cors({ origin: '*' })` في الإنتاج حتى مع API عام
2. **الأداء:** `defineAsyncComponent` يتطلب `<Suspense>` في Vue 3 — يجب إضافته في Layout
3. **الأنواع:** يُفضل استخدام `zod` schemas بالتوازي مع TypeScript interfaces للتحقق في runtime
4. **الاختبارات:** jsdom لا يدعم Canvas — اختبارات الرسم تحتاج `vitest-canvas-mock`
