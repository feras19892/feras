# قواعد صارمة لنقل المشروع القديم إلى الجديد

## 1. الهدف الأساسي
- **النقل "كما هو"** — لا إعادة تصميم، لا تبسيط، لا تغيير في UX/UI.
- الفصل الوحيد المسموح هو **تقسيم الملفات** حسب البنية الجديدة.

## 2. قواعد الفحص قبل النقل
- [ ] افحص الملف الأصلي **بعمق** (template + script + style) كاملاً.
- [ ] لا تكتفِ بقراءة جزء — اقرأ الملف بالكامل حتى لو كان +1000 سطر.
- [ ] راجع التبعيات (imports) التي يحتاجها الملف الأصلي.

## 3. قواعد الفصل (Modularization)
- [ ] أي ملف `.vue` > **300 سطر** يجب فصله إلى مكونات أصغر.
- [ ] أي ملف `.ts` > **200 سطر** يجب فصله إلى modules/composables/utils.
- [ ] `<template>` كبير → فصّل إلى `<component>` منفصلة.
- [ ] `<script>` كبير → فصّل إلى composables و stores و utilities.
- [ ] `<style>` كبير → ضعها داخل كل مكون منفصل (scoped).

## 4. هيكل المسارات في المشروع الجديد
```
├── components/
│   ├── layout/          ← navbar, footer, sidebar
│   ├── ui/               ← cards, buttons, inputs (قابلة لإعادة الاستخدام)
│   ├── home/             ← مكونات خاصة بالصفحة الرئيسية
│   ├── teacher/          ← مكونات خاصة بالمعلم
│   └── experiment/       ← panels, charts, controls
├── composables/          ← useXxx.ts
├── stores/               ← Pinia stores
├── services/             ← http.ts, home.service.ts
├── types/                ← interfaces & types
└── pages/                ← صفحات قليلة السطور (تركيب فقط)
```

## 5. قواعد تحديث المسارات
- [ ] `services/http.ts` يجب أن يحتوي على `apiUrl()` و `API_BASE_URL` مطابق للأصلي.
- [ ] `auth store` يستخدم `/api/auth/*` كما في المشروع القديم.
- [ ] `router.ts` يحافظ على المسارات الأصلية (`/home` وليس `/dashboard` فقط).
- [ ] أي API endpoint يجب أن يطابق المشروع القديم.

## 6. قواعد i18n
- [ ] إنشاء `i18n.store.ts` مبسط (ar/en/es) مع RTL للعربية.
- [ ] إنشاء `useI18n.ts` composable لاستخدام الترجمة.
- [ ] لا حذف للترجمات الموجودة في الملف الأصلي.

## 7. قواعد التجارب الفيزيائية
- [ ] منطق الفيزياء → `composables/useXxxPhysics.ts` (منفصل تماماً عن UI).
- [ ] Canvas drawing → داخل المكون أو `composables/useXxxCanvas.ts`.
- [ ] لا تخلط بين الفيزياء والـ UI في نفس الملف.

## 8. ممنوعات
- [ ] ❌ لا تكتب كود من عندك — انقل فقط.
- [ ] ❌ لا تبسط UI "لأنه أجمل".
- [ ] ❌ لا تحذف ميزة لأنك "تعتقدها غير مهمة".
- [ ] ❌ لا تترك ملفاً > 300 سطر دون فصل.

## 9. خطوات العمل المعتمدة
1. افحص الملف الأصلي بالكامل.
2. حدد التبعيات والـ imports المطلوبة.
3. أنشئ الملفات المفقودة (types, services, stores, composables).
4. انقل الـ template كما هو مع تعديل imports فقط.
5. افصل الملف إذا كان > 300 سطر.
6. اختبر التشغيل.
7. أبلغ المستخدم بالملفات التي فُصلت والمكونات الجديدة.

## 10. قائمة المهام الحالية
- LandingView.vue → `pages/index.vue` ✅
- HomeView.vue → `pages/dashboard.vue` ✅
- SpringAdvancedView.vue → `SpringExperiment.vue` (جارٍ)
- صفحة فروع الفيزياء (Branches)
- صفحة Branch التفصيلية

