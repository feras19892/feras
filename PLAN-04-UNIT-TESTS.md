# خطة المحور الرابع: بناء بيئة اختبارات الوحدات
## Unit Testing Environment (Vitest + jsdom)

**المدة المُقدرة:** 2-3 ساعات  
**التبعيات:** المرحلة 2 (تقسيم الكود) ← يُفضل إنجازها أولاً لتجنب إعادة العمل  
**الأولوية:** متوسط

---

## المرحلة 4.1: تثبيت أدوات الاختبار (15 دقيقة)

**الملف المستهدف:** `apps/web/package.json`

**المهام:**
1. تشغيل `pnpm add -D vitest @vue/test-utils jsdom`.
2. التأكد من أن `vitest` لا يتعارض مع `vue-tsc`.
3. إضافة السكريبتات:
   ```json
   {
     "test:unit": "vitest run",
     "test:unit:watch": "vitest"
   }
   ```
4. تشغيل `pnpm install`.

**الاختبار:** `pnpm test:unit --version` ← يجب طباعة رقم الإصدار.

---

## المرحلة 4.2: إنشاء ملف إعداد Vitest (30 دقيقة)

**الملف المُنشأ:** `apps/web/vitest.config.ts`

**المهام:**
1. استيراد `defineConfig` من `vitest/config`.
2. استيراد `vue` plugin من `@vitejs/plugin-vue`.
3. إعداد الـ Aliases ليطابق `vite.config.ts`:
   ```ts
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
4. التأكد من أن `tsconfig.json` يتضمن types لـ `vitest/globals`.

**الاختبار:** `pnpm test:unit` ← يجب أن يمر بدون أخطاء (حتى لو 0 tests).

---

## المرحلة 4.3: اختبار أولي على composable بسيط (30 دقيقة)

**الملف المُنشأ:** `apps/web/src/composables/useAuthActions.spec.ts`

**المهام:**
1. اختيار composable بسيط (مثل `useAuthActions.ts`) لا يعتمد على Vue Router أو Pinia.
2. كتابة 3-4 test cases:
   - الحالة الأولية
   - login success
   - login failure
   - logout
3. التأكد من أن `describe`, `it`, `expect` يعملون بدون استيراد (globals: true).

**الاختبار:** `pnpm test:unit src/composables/useAuthActions.spec.ts` ← ناجح.

---

## المرحلة 4.4: اختبار محرك الكيمياء (45 دقيقة)

**الملف المُنشأ:** `packages/chemistry-engine/src/equations.spec.ts`

**المهام:**
1. إنشاء `vitest.config.ts` في `packages/chemistry-engine/` (أو استخدام root config).
2. كتابة اختبارات لـ:
   - `calculateTitrationPh` ← قيم pH معروفة
   - `mixColor` ← خلط ألوان معروف
   - `findEquation` ← معادلة NaOH + HCl
3. استخدام `toBeCloseTo` للأرقام العشرية.

**الاختبار:** `pnpm test:unit --filter chemistry-engine` ← ناجح.

---

## المرحلة 4.5: اختبار composable حسابي (30 دقيقة)

**الملف المُنشأ:** `apps/web/src/composables/chemistry/useChemCalculations.spec.ts`

**المهام:**
1. اختبار دوال حساب الكتلة المولية.
2. اختبار تحويل الوحدات (mL → L, g → mol).
3. اختبار حساب التركيز (M = n/V).
4. التأكد من أن النتائج تطابق الحساب اليدوي.

**الاختبار:** `pnpm test:unit src/composables/chemistry/` ← ناجح.

---

## المرحلة 4.6: إعداد Git Hook للاختبارات (اختياري) (15 دقيقة)

**الملف المُنشأ:** `.husky/pre-commit` (إذا كان husky مثبت)

**المهام:**
1. إضافة `pnpm test:unit` في pre-commit hook.
2. أو استخدام `lint-staged` لتشغيل اختبارات الملفات المُعدّلة فقط.

**الاختبار:** `git commit` ← يجب تشغيل الاختبارات تلقائياً.

---

## المرحلة 4.7: توثيق وتحسين (15 دقيقة)

**المهام:**
1. كتابة `apps/web/tests/README.md` يشرح:
   - كيفية تشغيل الاختبارات
   - كيفية كتابة test جديد
   - الفرق بين Unit (Vitest) و E2E (Playwright)
2. إضافة badge في README الرئيسي: `Tests Passing`.

---

## ملخص المخرجات

- `apps/web/vitest.config.ts` ← جديد
- `apps/web/package.json` ← مُحدّث (scripts + devDependencies)
- `apps/web/src/composables/**/*.spec.ts` ← 3-5 ملفات اختبار أولية
- `packages/chemistry-engine/src/*.spec.ts` ← 1-2 ملف اختبار
- `.husky/pre-commit` ← مُحدّث (اختياري)
- `apps/web/tests/README.md` ← توثيق
