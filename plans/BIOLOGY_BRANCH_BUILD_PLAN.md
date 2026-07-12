# خطة بناء فرع الأحياء التفاعلي ثلاثي الأبعاد (Biology Lab 3D)

## التاريخ والنسخة
- تاريخ التحديث: ١٢/٧/٢٠٢٦
- النسخة: 1.0 - خطة بناء مؤمنة بقواعد صارمة لحماية المشروع

## 1. القواعد الصارمة لبناء فرع الأحياء

> ⚠️ **تحذير:** فرع الأحياء جديد تماماً. لا يوجد له أي كود سابق بعد حذف قسم Electric Lab/Physics القديم. سُيبنى من الصفر وفق هذه القواعد دون المساس بالفروع الموجودة.

### 1.1 قواعد حماية المشروع الحالي

1. **لا تعديل في الفروع الموجودة**: لا تلمس `apps/web/src/pages/math/`، `apps/web/src/modules/chemistry/`، `apps/web/src/modules/physics/`، `apps/api/src/modules/math/`، `apps/api/src/modules/chemistry/` إلا إذا كان التعديل ضرورياً ومعتمداً.
2. **لا تغيير في التوجيه الحالي**: لا تُعدّل `router.ts` إلا بعد إنشاء صفحة البيولوجيا الجاهزة بالكامل.
3. **لا حذف ملفات**: لا تحذف أي ملف أو مكون موجود حالياً.
4. **لا إضافة تبعيات ثقيلة إلا بعد موافقة**: Three.js/Babylon يُضافان عبر `pnpm add` بعد التحقق من حجم الحزمة وتأثيرها على build.
5. **اختبار بعد كل مرحلة**: يجب أن يبقى `pnpm dev` يعمل بدون أخطاء في `apps/web` بعد كل خطوة.
6. **لا كود معلق أو تجريبي**: لا تُضاف `console.log` إلا مؤقتاً، ويُحذف قبل الانتقال للمرحلة التالية.

### 1.2 قواعد الهيكل المعماري

1. **اتباع نمط المونوريبو:**
   - `apps/web/src/pages/biology/` → صفحات الفرع فقط (تركيب، منطق قليل).
   - `apps/web/src/modules/biology/` → المكونات والتجارب.
   - `apps/web/src/composables/biology/` → المنطق المشترك (Three.js، Hotspots، التفاعل).
   - `apps/web/src/services/biology.service.ts` → جلب بيانات التجارب والنصوص.
   - `apps/web/src/types/biology.types.ts` → كل أنواع البيانات.
   - `apps/web/src/locales/biology.ts` → مفاتيح الترجمة (ar/en/es).
   - `packages/biology-engine/` → المحرك الحسابي/الفيزيائي المشترك للتجارب.

2. **حدود حجم الملفات (مستخرجة من MIGRATION_RULES.md):**
   - أي ملف `.vue` > **300 سطر** → فصّله.
   - أي ملف `.ts` > **200 سطر** → فصّله.
   - منطق Three.js يُفصل في `composables/biology/useBiology3D.ts`.
   - بيانات التجارب تُفصل في `services/biology-data.ts` أو `packages/biology-engine/data/`.

3. **التسميات الإلزامية:**
   - Composables: `useBiology*.ts`
   - Services: `biology.service.ts`
   - Stores: `biology.store.ts`
   - Pages: PascalCase مثل `BiologyPage.vue`
   - Components: PascalCase مثل `AnimalCellExperiment.vue`

4. **i18n:**
   - لا نصوص عربية/إنجليزية ثابتة داخل المكونات.
   - كل نص يمر عبر `useI18n()`.
   - ملف الترجمة الرئيسي: `apps/web/src/locales/biology.ts`.

### 1.3 قواعد تجربة الخلية (MVP)

1. **مجسم واحد فقط** في المرحلة الأولى: الخلية الحيوانية.
2. **بروcedural geometry أولاً**: استخدم `SphereGeometry` و `CylinderGeometry` و `TorusGeometry` بدلاً من GLTF حتى نثبت الأداء.
3. **3-4 Hotspots فقط**: النواة، الميتوكوندريا، الغشاء الخلوي، السيتوبلازم.
4. **لا حاجة للـ Toolbox الآن**: البيانات ثابتة في TS/JSON حتى نثبت العرض.
5. **لا حاجة للـ Backend الآن**: كل بيانات MVP في الواجهة الأمامية.

## 2. الهدف والميزات

### الهدف
بناء فرع أحياء تفاعلي ثلاثي الأبعاد يسمح للطالب بـ:
1. اختيار تجربة أحياء من قائمة منظمة.
2. فتح مجسم 3D تفاعلي.
3. تدوير المجسم وتكبيره.
4. الضغط على أجزاء لرؤية شرح.
5. تفكيك الأجزاء لرؤية البنية الداخلية.

### الميزات الرئيسية (لاحقاً)
- 4 أقسام: خلوي/جزيئي، تشريح الإنسان، نباتي، كائنات دقيقة/بيئة.
- Canvas 3D موحد.
- نظام Hotspots ديناميكي من ملفات JSON (لاحقاً من قاعدة البيانات).
- زر التفكيك (Explode).
- وضع التكبير داخل العضية.

## 3. الملفات والمجلدات الجديدة

```
apps/web/src/
├── pages/biology/
│   └── index.vue                    ← صفحة الفرع (قائمة التجارب)
├── modules/biology/
│   ├── BiologyLanding.vue           ← ترحيب + قائمة الأقسام
│   ├── components/
│   │   ├── Biology3DCanvas.vue      ← Canvas الموحد (Three.js)
│   │   ├── HotspotMarker.vue        ← نقطة تفاعلية فوق المجسم
│   │   ├── InfoPanel.vue            ← اللوحة الجانبية للشرح
│   │   └── experiments/
│   │       └── AnimalCellExperiment.vue
│   ├── composables/
│   │   ├── useBiology3D.ts          ← تهيئة Three.js + التحكم
│   │   ├── useBiologyHotspots.ts    ← إدارة Hotspots
│   │   └── useBiologyExplode.ts     ← منطق التفكيك
│   ├── services/
│   │   ├── biology.service.ts       ← جلب بيانات التجارب
│   │   └── biology-data.ts          ← بيانات MVP ثابتة
│   ├── types/
│   │   └── biology.types.ts         ← كل الأنواع
│   └── locales/
│       └── biology.ts               ← الترجمات

packages/biology-engine/
├── src/
│   ├── index.ts
│   ├── types.ts
│   └── cells/
│       └── animal-cell.ts           ← منطق الخلية الحيوانية
├── package.json
└── tsconfig.json
```

## 4. المكدس التقني

- **Three.js** أو **@tresjs/core** (Vue-friendly wrapper) للعرض 3D.
- **Vue 3** + **TypeScript** (موجودان بالفعل).
- **Pinia** للحالة (إذا لزم).
- **i18n store** الموجود (`useI18n`) للترجمة.

### قرار مبدئي
نبدأ بـ **Three.js نقي** (r128+) بدلاً من @tresjs لتقليل التبعيات والتحكم الكامل. إذا أصبح الكود معقداً ننتقل لـ @tresjs.

## 5. تدفق البيانات في MVP

1. `pages/biology/index.vue` تعرض قائمة التجارب من `biology-data.ts`.
2. عند اختيار "الخلية الحيوانية":
   - تُحمل `AnimalCellExperiment.vue`.
   - تُمرر بيانات المجسم (الأشكال، الألوان، المواقع) إلى `Biology3DCanvas.vue`.
   - `useBiology3D.ts` يبني المشهد.
   - `useBiologyHotspots.ts` يضيف النقاط بناءً على إحداثيات ثابتة في البيانات.
   - عند الضغط على Hotspot: `InfoPanel.vue` يعرض النص من الترجمة.

## 6. مراحل التنفيذ

### المرحلة 1: الهيكل والتوجيه (لا Three.js بعد)
- [ ] إنشاء `pages/biology/index.vue` بسيطة تعرض "قريباً".
- [ ] إضافة مسار `/biology` في `router.ts`.
- [ ] تعديل `pages/dashboard.vue` لربط بطاقة الأحياء بـ `/biology`.
- [ ] إنشاء `apps/web/src/locales/biology.ts` بمفاتيح أساسية.
- [ ] اختبار: الضغط على بطاقة الأحياء ينقل لـ `/biology`.

### المرحلة 2: إضافة Three.js + Canvas موحد
- [ ] تثبيت `three` و `@types/three` في `apps/web`.
- [ ] إنشاء `Biology3DCanvas.vue` مع مشهد فارغ وأضواء وتحكمات كاميرا.
- [ ] إنشاء `useBiology3D.ts`.
- [ ] اختبار: فتح صفحة تجربة تجريبية يظهر Cube دوار.

### المرحلة 3: مجسم الخلية الحيوانية MVP
- [ ] إنشاء `AnimalCellExperiment.vue`.
- [ ] بناء الخلية من أشكال هندسية بسيطة:
  - غشاء خلوي: كرة شفافة كبيرة.
  - نواة: كرة في المنتصف.
  - ميتوكوندريا: كبسولات صغيرة.
  - سيتوبلازم: خلفية ملونة خفيفة.
- [ ] إضافة 3-4 Hotspots.
- [ ] ربط `InfoPanel.vue` بكل Hotspot.
- [ ] اختبار: التدوير، الزووم، الضغط على العضيات، عرض الشرح.

### المرحلة 4: ميزة التفكيك
- [ ] إنشاء `useBiologyExplode.ts`.
- [ ] زر "تفكيك" يبعد العضيات عن المركز.
- [ ] اختبار التفكيك والعودة.

### المرحلة 5: الانتقال للمجسمات الخارجية (اختياري لاحقاً)
- [ ] تقييم أداء المجسمات البروcedural.
- [ ] البحث/شراء مجسمات GLTF/GLB للقلب والدماغ.
- [ ] إضافة loader للـ GLTF.
- [ ] تطبيق نظام Hotspots على المجسمات الخارجية.

### المرحلة 6: Backend & Toolbox (اختياري لاحقاً)
- [ ] إنشاء جداول/JSON للمجسمات والـ Hotspots.
- [ ] بناء أداة Toolbox لرفع المجسمات وتحديد Hotspots.

## 7. قواعد الاختبار والجودة

1. بعد كل مرحلة:
   - `pnpm install` نظيف (إذا أضفنا تبعيات).
   - `pnpm dev` في `apps/web` يعمل بدون أخطاء.
   - الانتقال بين `/home` و `/biology` و `/math` يعمل.
2. قبل دمج أي تجربة:
   - لا يوجد TypeScript errors.
   - لا يوجد أخطاء في Console.
3. قياس الأداء:
   - FPS لا يقل عن 30 على متصفح الكمبيوتر.
   - حجم bundle الجديد لا يزيد بشكل مبالغ فيه (نراقب `vite-bundle-analyzer`).

## 8. ملاحظات مهمة

- **لا نبدأ بـ Toolbox:** الأداة تُبنى بعد اكتمال 3-4 تجارب واثبات نظام Hotspots.
- **لا نبدأ بـ GLTF:** نستخدم أشكال هندسية بسيطة أولاً.
- **لا نغير branchId الآن:** يبقى `general` في `home.service.ts` حتى ننهي صفحة البيولوجيا، ثم نقرر تغييره إلى `biology`.
- **التزامن مع ai_rules.md:** نكتب ملفات كاملة في كل رد، ونفصل إذا تجاوزت الحدود.

## 9. القرار المطلوب منك

قبل البدء، أرجو تأكيد:
1. هل توافق على البدء بـ **الخلية الحيوانية فقط** كـ MVP؟
2. هل تفضل **Three.js نقي** أم **@tresjs/core**؟
3. هل لديك مجسمات GLTF جاهزة أم نبني بروcedural أولاً؟

بعد التأكيد، نبدأ المرحلة 1 فوراً.
