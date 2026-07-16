# خطة المحور الثاني: استراتيجية الأداء وتقسيم الكود
## Frontend Performance & Code Splitting

**المدة المُقدرة:** 4-6 ساعات  
**التبعيات:** المرحلة 3 (توحيد أنواع التجارب) ← يُفضل إنجازها أولاً  
**الأولوية:** عالٍ

---

## المرحلة 2.1: تحليل الـ Router وتصنيف الصفحات (30 دقيقة)

**الملف المستهدف:** `apps/web/src/router.ts`

**المهام:**
1. فتح `router.ts` وتسجيل كل الصفحات المستوردة.
2. تصنيفها إلى 3 فئات:
   - **أساسية (Eager):** Landing, Login, Layout ← تُحمل فوراً
   - **ثقيلة (Lazy):** جميع التجارب (30+), Admin, Dashboard
   - **متوسطة (Lazy):** Student, Teacher, Reports
3. تقدير حجم كل مجموعة (mental estimate).

**المخرج:** قائمة بالصفحات و تصنيفها (Lazy vs Eager).

---

## المرحلة 2.2: تحويل التجارب إلى Lazy Loading (45 دقيقة)

**الملف المستهدف:** `apps/web/src/router.ts`

**المهام:**
1. البحث عن كل import ثابت لصفحة تجربة:
   ```ts
   import PendulumPage from '@/pages/experiments/PendulumPage.vue'
   ```
2. تحويله إلى dynamic import:
   ```ts
   const PendulumPage = () => import('@/pages/experiments/PendulumPage.vue')
   ```
3. تطبيق نفس الشيء على الـ 30 تجربة فيزياء.
4. تطبيق نفس الشيء على تجارب الكيمياء.
5. إضافة `/* webpackChunkName: "experiments-physics" */` (أو `experiments-chemistry`) لتجميعهم.

**الاختبار:**
- `pnpm build` ← يجب رؤية chunks منفصلة (`experiments-physics.js`, `experiments-chemistry.js`).
- DevTools Network ← تحميل chunk فقط عند زيارة التجربة.

---

## المرحلة 2.3: تحويل صفحات Admin/Teacher/Student (30 دقيقة)

**الملف المستهدف:** `apps/web/src/router.ts`

**المهام:**
1. تحويل صفحات Admin إلى lazy:
   ```ts
   const AdminDashboard = () => import('@/pages/admin/AdminDashboard.vue')
   ```
2. تحويل صفحات Teacher إلى lazy.
3. تحويل صفحات Student إلى lazy.
4. تجميعهم في chunk `admin-pages`.

**الاستثناء:** Login Page ← تبقى eager لأن الجميع يمرون بها.

---

## المرحلة 2.4: إضافة Suspense + Fallback (45 دقيقة)

**الملف المستهدف:** `apps/web/src/App.vue` أو Layout الرئيسي

**المهام:**
1. تغليف `<router-view>` بـ `<Suspense>`:
   ```vue
   <Suspense>
     <template #default>
       <router-view />
     </template>
     <template #fallback>
       <AppSkeletonLoader />
     </template>
   </Suspense>
   ```
2. إنشاء مكون `AppSkeletonLoader.vue` بسيط (Spinner + نص "جاري التحميل...").
3. التأكد من أن Fallback يظهر فوراً عند الانتقال لتجربة ثقيلة.

**الاختبار:** Slow 3G ← يجب رؤية الـ Skeleton أثناء تحميل chunk.

---

## المرحلة 2.5: تحويل مكونات المختبر الكيميائي Async (60 دقيقة)

**الملفات المستهدفة:** `apps/web/src/components/experiment/chemistry/*.vue`

**المهام:**
1. البحث عن الـ imports الثابتة لأدوات المختبر في الصفحات الرئيسية.
2. تحويلها إلى `defineAsyncComponent`:
   ```ts
   const LabBurette = defineAsyncComponent(() => 
     import('./LabBurette.vue')
   )
   ```
3. تطبيق ذلك على:
   - LabBurette, LabBeaker, LabPipette
   - LabBalance, LabHotPlate, LabGradCylinder
   - FloatingInspector, ContainerRenderers
4. إضافة `<Suspense>` في الحاويات التي تستخدم هذه المكونات.

**الاختبار:** صفحة Chemistry ← DevTools Network ← لا يُحمّل LabBurette.js إلا عند فتح التجربة.

---

## المرحلة 2.6: تفعيل Split Chunks في Vite (30 دقيقة)

**الملف المستهدف:** `apps/web/vite.config.ts`

**المهام:**
1. إضافة `manualChunks` في `build.rollupOptions.output`:
   ```ts
   manualChunks: {
     'vendor': ['vue', 'vue-router', 'pinia'],
     'experiments-physics': [
       '@/pages/experiments/PendulumPage.vue',
       '@/pages/experiments/SpringPage.vue',
       // ... 30 تجربة
     ],
     'experiments-chemistry': [
       '@/pages/experiments/ChemistryLabPage.vue',
       // ... تجارب الكيمياء
     ],
     'admin-pages': [
       '@/pages/admin/AdminDashboard.vue',
       '@/pages/teacher/TeacherStats.vue',
     ],
   }
   ```
2. التأكد من أن الـ aliases (`@/`) تُحل بشكل صحيح في build.

**الاختبار:** `pnpm build` ← يجب رؤية `vendor-[hash].js`, `experiments-physics-[hash].js`, إلخ.

---

## المرحلة 2.7: قياس وتحسين (45 دقيقة)

**المهام:**
1. تشغيل `pnpm build` وتسجيل:
   - الحجم الكلي قبل وبعد
   - عدد الـ chunks
   - حجم `vendor.js` و `experiments-physics.js`
2. استخدام Lighthouse ← يجب أن يتحسن:
   - Performance Score
   - First Contentful Paint (FCP)
   - Time to Interactive (TTI)
3. إذا تجاوز أي chunk 500KB ← تقسيمه أكثر.

**المخرج:** تقرير Performance قبل/بعد.

---

## ملخص المخرجات

- `apps/web/src/router.ts` ← مُعدّل (Lazy imports)
- `apps/web/src/App.vue` ← مُعدّل (Suspense)
- `apps/web/src/components/AppSkeletonLoader.vue` ← جديد
- `apps/web/vite.config.ts` ← مُعدّل (manualChunks)
- تقرير Performance Before/After
