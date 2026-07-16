---
description: خطة تحسين التفاعل البصري المباشر لأدوات الكيمياء
---

# خطة التفاعل البصري المباشر (Visual Direct Interaction)

## المشكلة الحالية
- السكب يتطلب 4 خطوات: اختيار بيكر → لوحة تحكم → زر "سكب" → اختيار هدف
- الماصة تتطلب "وضع تحكم" معقد
- لا يوجد خط سائل (stream) مرئي عند النقل
- لا يوجد تأثير بصري عند الخلط

## الحل المقترح: سحب وإفلات السائل (Drag & Drop Pouring)

### 1. السحب (Drag)
- المستخدم يضغط مطولاً (long-press/long-drag) على بيكر يحتوي محلول
- بعد 300ms من الضغط: البيكر يدور قليلاً (tilt 15°) + يظهر خط سائل (stream) يربط البيكر بمؤشر الماوس
- البيكر المصدر يُضيء بلون المحلول (glow)
- خط السائل: SVG bezier curve يتغير طوله مع حركة الماوس

### 2. الإفلات فوق هدف (Drop on Target)
- عند مرور الماوس فوق حاوية أخرى: الحاوية تُضيء بالأخضر
- عند الإفلات: المحلول ينتقل تلقائياً
- تأثيرات بصرية:
  - خط السائل يتقلص نحو الهدف (shrink animation)
  - دوامة (swirl) في الحاوية الهدف لمدة 1 ثانية
  - فقاعات (bubbles) إذا كان السائل ساخناً

### 3. الإفلات في مساحة فارغة (Cancel)
- خط السائل يتبخر (fade out)
- البيكر يعود لوضعه الطبيعي

---

## التأثيرات البصرية المطلوبة

### A. خط السائل (Liquid Stream SVG)
- `<path>` bezier curve بين فم البيكر ومؤشر الماوس
- لون = لون المحلول
- سماكة = 3-6px (تتناسب مع حجم المحلول)
- شفافية = 0.4-0.6
- تأثير: قطرات صغيرة تتساقط على طول الخط

### B. دوامة الخلط (Mixing Swirl)
- عند السكب في حاوية تحتوي محلول مختلف
- يظهر تدرج لوني (gradient) يتغير من لون المصدر إلى لون الهدف
- دوامة SVG تدور لمدة 2 ثانية
- بعدها: اللون النهائي = مزيج الألوان

### C. فقاعات (Bubbles)
- عند التسخين (burner on) + سكب → فقاعات في السائل
- SVG circles صغيرة تطفو من القاع إلى السطح
- opacity يتناقص مع الصعود

### D. بخار/دخان (Steam)
- عند التسخين المستمر (> 5 ثواني)
- خطوط رفيعة شبه شفافة ترتفع من السطح

---

## تبسيط الماصة (Pipette Simplification)

### الحل: سحب الماصة مباشرة
- لا "وضع تحكم" معقد
- المستخدم يضغط مطولاً على الماصة → تتحول إلى مؤشر
- يحركها فوق الحاوية → يسحب/يُفرغ تلقائياً
- يُفلت في أي مكان → تعود الماصة لوضعها

---

## تبسيط السحاحة (Burette Visual Drip)

### الحل: خط تنقيط مرئي
- عند فتح الصنبور: يظهر خط رفيع (drip line) من قمة السحاحة لأسفل
- الخط يمتد حتى أقرب حاوية تحتها
- يمكن سحب الخط لتوجيهه نحو حاوية أخرى

---

## ملفات التعديل

| # | الملف | التعديل |
|---|-------|---------|
| 1 | `WorkspaceCanvas.vue` | إضافة drag-pour logic + stream SVG + cancel logic |
| 2 | `LabBeaker.vue` | إضافة tilt animation + swirl + bubbles |
| 3 | `LabPipette.vue` | إضافة drag-mode (no cursor mode) |
| 4 | `LabBurette.vue` | إضافة drip line + drag-target |
| 5 | جديد: `LiquidStream.vue` | مكون منفصل: خط السائل بين أداتين |
| 6 | جديد: `BubblesEffect.vue` | مكون منفصل: فقاعات SVG |
| 7 | جديد: `SteamEffect.vue` | مكون منفصل: بخار SVG |

---

## مخطط الأحداث (Event Flow)

```
User long-presses on Beaker (with liquid)
    ↓
After 300ms: tilt animation + stream SVG appears
    ↓
User moves mouse:
    - Stream SVG updates (bezier to cursor)
    - Hovering over target → target glows green
    ↓
User releases:
    - Over target → execute pour + swirl animation
    - Over empty → cancel + fade out
```

---

## التوافق مع MIGRATION_RULES.md

- `WorkspaceCanvas.vue` > 300 سطر → يجب تفكيك
  - منطق السكب → `composables/chemistry/usePouring.ts`
  - خط السائل → `components/experiment/chemistry/LiquidStream.vue`
  - الفقاعات/البخار → مكونات منفصلة
- `.vue` ≤ 300 سطر → كل مكون جديد ≤ 300 سطر ✓
- `<style>` → scoped في كل مكون ✓

---

## خطة التنفيذ (4 مراحل)

### المرحلة 1: السحب والسكب (Drag & Drop)
- long-press detection
- tilt animation on beaker
- stream SVG (bezier)
- execute pour on drop

### المرحلة 2: التأثيرات البصرية
- swirl on pour
- color mixing gradient
- bubbles on hot liquid

### المرحلة 3: تبسيط الماصة والسحاحة
- pipette drag mode (no cursor mode)
- burette drip line

### المرحلة 4: التفكيك (Refactoring)
- extract composables
- separate components
- ensure ≤ 300 lines per file

---

## الموافقة المطلوبة

هل توافق على هذه الخطة؟
هل تريد تعديل أي جزء؟
هل تريد البدء بالمرحلة 1 مباشرة؟
