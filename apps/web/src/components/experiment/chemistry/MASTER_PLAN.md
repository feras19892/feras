# خطة المختبر الافتراضي الشاملة (Master Plan)

## المرحلة الحالية: التفاعل البصري المباشر + تفكيك المكونات

---

## الجزء 1: تفكيك الملفات (Decomposition)

### المشكلة
`WorkspaceCanvas.vue` = 1275 سطر → يجب تفكيكه

### الملفات الجديدة

| # | الملف | الوظيفة | الأسطر التقديرية |
|---|-------|---------|----------------|
| 1 | `composables/chemistry/useChemistryLab.ts` | الحالة العامة (items, liquids, devices) | 180 |
| 2 | `composables/chemistry/usePouring.ts` | منطق السحب والسكب (drag-pour) | 150 |
| 3 | `composables/chemistry/usePipetteMode.ts` | وضع الماصة (cursor mode) | 120 |
| 4 | `composables/chemistry/useHeating.ts` | التسخين + درجة الحرارة | 100 |
| 5 | `composables/chemistry/usePhMeter.ts` | قياس pH | 80 |
| 6 | `components/experiment/chemistry/LiquidStream.vue` | خط السائل بين أداتين | 80 |
| 7 | `components/experiment/chemistry/MixingSwirl.vue` | دوامة الخلط | 60 |
| 8 | `components/experiment/chemistry/BubblesEffect.vue` | فقاعات السائل | 50 |
| 9 | `components/experiment/chemistry/SteamEffect.vue` | بخار/دخان | 50 |
| 10 | `components/experiment/chemistry/PourHint.vue` | تلميح وضع السكب | 40 |
| 11 | `components/experiment/chemistry/PipetteHint.vue` | تلميح وضع الماصة | 40 |

### `WorkspaceCanvas.vue` بعد التفكيك
- `<template>`: 80 سطر (تركيب فقط)
- `<script>`: 150 سطر (استيراد composables)
- `<style>`: 60 سطر
- **الإجمالي: ~290 سطر ✓**

---

## الجزء 2: التفاعل البصري المباشر (Direct Visual Interaction)

### 2.1 السكب بالسحب (Drag-to-Pour)

#### Long-press detection
```
mousedown on container (with liquid)
    ↓
timer starts (300ms threshold)
    ↓
if mouse moves > 10px before 300ms → cancel (it's a drag)
if mouse stays > 300ms → enter POUR mode
```

#### Tilt animation (CSS transform)
```css
.beaker.pouring-source {
  transform: rotate(15deg) translateY(-5px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
}
```

#### Liquid stream (SVG bezier)
```svg
<path
  d="M sourceX sourceY Q controlX controlY targetX targetY"
  fill="none"
  stroke="liquidColor"
  stroke-width="4"
  opacity="0.5"
  stroke-linecap="round"
>
  <animate attributeName="stroke-dasharray" values="0 20; 20 0" dur="0.5s" repeatCount="indefinite"/>
</path>
```

#### Droplets along stream
```svg
<circle cx="..." cy="..." r="2" fill="liquidColor" opacity="0.6">
  <animate attributeName="cy" values="sourceY; targetY" dur="0.3s" repeatCount="indefinite"/>
</circle>
```

#### Target glow
```css
.container.pour-target {
  filter: drop-shadow(0 0 12px rgba(16,185,129,0.5));
  animation: targetPulse 0.8s ease infinite;
}
@keyframes targetPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
```

### 2.2 خلط الألوان (Color Mixing)

#### Algorithm
```typescript
function mixColors(c1: string, c2: string, ratio: number): string {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const r = Math.round(rgb1.r * (1-ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1-ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1-ratio) + rgb2.b * ratio);
  return rgbToHex(r, g, b);
}
```

#### Visual transition
- عند السكب محلول مختلف: يظهر تدرج لوني (gradient) في الحاوية
- التدرج يتحرك من الأعلى للأسفل لمدة 1 ثانية
- ثم يستقر على اللون المختلط

### 2.3 الفقاعات (Bubbles)

#### Conditions for bubbles
- Burner is ON + container has liquid → small bubbles
- Boiling (heated > 100°C) → large bubbles, rapid
- Adding acid to carbonate → CO₂ bubbles

#### SVG animation
```svg
<g v-for="bubble in bubbles" :key="bubble.id">
  <circle
    :cx="bubble.x"
    :cy="bubble.y"
    :r="bubble.r"
    fill="rgba(255,255,255,0.4)"
    stroke="rgba(255,255,255,0.6)"
    stroke-width="0.5"
  >
    <animate attributeName="cy" :from="bubble.startY" :to="bubble.endY" :dur="bubble.duration"/>
    <animate attributeName="opacity" values="0.6;0" :dur="bubble.duration"/>
  </circle>
</g>
```

### 2.4 البخار (Steam)

#### Conditions
- Liquid heated for > 3 seconds
- Temperature > 80°C

#### Visual
- 3-5 خطوط رفيعة شبه شفافة
- ترتفع من سطح السائل
- تتعرج (wiggle) while rising
- تتلاشى عند الأعلى

---

## الجزء 3: تبسيط الماصة (Pipette Simplification)

### الحل: سحب مباشر (Drag-to-Pipette)

#### التدفق
```
User drags pipette over container
    ↓
Hover detected (container glows)
    ↓
Release mouse:
    - Pipette empty → SUCK (fill up to 10mL)
    - Pipette full → EXPPEL (release all)
    ↓
Pipette returns to original position (snap back)
```

#### بدون "وضع تحكم"
- لا `cursorPipette` ref معقد
- الماصة تُسحب مباشرة (like dragging any item)
- عند الإفلات فوق حاوية → العملية تتم تلقائياً
- عند الإفلات في مساحة فارغة → تعود لمكانها

---

## الجزء 4: تبسيط السحاحة (Burette Visual Drip)

### الحل: خط تنقيط مرئي

#### Valve open → drip line appears
```svg
<line
  x1="tipX" y1="tipY"
  x2="tipX" :y2="targetMouthY"
  :stroke="liquidColor"
  stroke-width="1.5"
  opacity="0.4"
  stroke-dasharray="4 2"
>
  <animate attributeName="stroke-dashoffset" values="0; 12" dur="0.5s" repeatCount="indefinite"/>
</line>
```

#### Auto-target nearest container
- السحاحة تكتشف أقرب حاوية تحتها تلقائياً
- الخط يربط القمة بفم الحاوية
- يمكن سحب السحاحة لتغيير الهدف

---

## الجزء 5: حامل الأنابيب التفاعلي (Interactive Rack)

### المشكلة الحالية
- حامل أنابيب زينة فقط
- لا يمكن وضع/إزالة أنابيب

### الحل
- عند سحب "أنبوب اختبار" فوق الحامل → يظهر فتحة فارغة تضيء
- عند الإفلات → الأنبوب "يُقفل" في الفتحة
- عند سحب أنبوب من الحامل → يخرج من الفتحة
- الحامل يحتفظ بـ 6 أنابيب (بيانات ديناميكية)

---

## الجزء 6: الميزان التفاعلي (Interactive Balance)

### التحسينات
- عند وضع حاوية فوق الميزان → المؤشر يتحرك تدريجياً (animation)
- عند إزالة الحاوية → المؤشر يعود للصفر تدريجياً
- عند الضغط على TARE → المؤشر يرتج لثانية (wiggle) ثم يصفر
- رقم LCD يتغير تدريجياً (counter animation)

---

## الجزء 7: دفتر الملاحظات (Lab Notebook)

### الميزات
- تسجيل كل خطوة تلقائياً (timestamped)
- "إضافة ملاحظة" زر في كل أداة
- جدول نتائج (results table)
- رسم بياني بسيط للنتائج
- تصدير PDF

---

## الجزء 8: معالج التجربة (Experiment Wizard)

### أمثلة

#### معالج المعايرة (Titration Wizard)
```
Step 1: أضف حمض HCl إلى البيكر
Step 2: أضف مؤشر الفينولفثالين
Step 3: عبئ السحاحة بـ NaOH
Step 4: ضع السحاحة فوق البيكر
Step 5: افتح الصنبور ببطء
Step 6: لاحظ تغير اللون (عدائي → وردي)
Step 7: سجل حجم NaOH المستهلك
```

#### معالج حرارة التفاعل (Enthalpy Wizard)
```
Step 1: وزن حجم معين من الماء
Step 2: سجل درجة الحرارة الأولية
Step 3: أضف حمض/قاعدة
Step 4: سجل أعلى درجة حرارة
Step 5: احسب ΔT
```

---

## الجزء 9: التفاعلات الكيميائية (Chemical Reactions)

### 9.1 تغير اللون
- حمض + مؤشر عادي → عدائي (بدون لون)
- حمض + مؤشر + قاعدة → تدرج لوني حسب pH

### 9.2 الترسيب (Precipitation)
- AgNO₃ + NaCl → AgCl (أبيض)
- BaCl₂ + Na₂SO₄ → BaSO₄ (أبيض)
- FeCl₃ + NaOH → Fe(OH)₃ (بني/أحمر)

### 9.3 غاز (Gas Evolution)
- حمض + كربونات → فقاعات CO₂
- MnO₂ + H₂O₂ → فقاعات O₂ (تجربة العود)

### 9.4 التفاعل الحراري
- حمض + قاعدة → ارتفاع درجة الحرارة (exothermic)
- NH₄Cl + الماء → انخفاض درجة الحرارة (endothermic)

---

## الجزء 10: التأثيرات الصوتية (Sound Effects)

### الأصوات المقترحة
- سكب السائل → صوت سقاط خفيف
- فتح/إغلاق صنبور → صوت معدني
- تشغيل الموقد → صوت شعلة
- تكسير زجاج → صوت تحذيري
- "تك" الميزان → صوت رقمي

---

## خطة التنفيذ (6 مراحل)

| المرحلة | المدة | المحتوى |
|---------|-------|---------|
| 1 | 1 يوم | تفكيك الملفات + إنشاء composables |
| 2 | 2 أيام | السحب والسكب (drag-pour) + tilt + stream |
| 3 | 2 أيام | خلط الألوان + فقاعات + بخار |
| 4 | 1 يوم | تبسيط الماصة والسحاحة |
| 5 | 2 أيام | تفاعلات كيميائية (precipitation, gas, pH) |
| 6 | 1 يوم | دفتر ملاحظات + معالج التجربة |

---

## التوافق مع MIGRATION_RULES.md

- ✅ `.vue` ≤ 300 سطر — كل المكونات الجديدة ≤ 300
- ✅ `.ts` ≤ 200 سطر — كل composables ≤ 200
- ✅ `<template>` كبير → مكونات منفصلة
- ✅ `<script>` كبير → composables
- ✅ `<style>` → scoped في كل مكون
- ✅ لا خلط بين كيمياء وUI

---

## الموافقة

هل توافق على هذه الخطة الشاملة؟
هل تريد البدء بالمرحلة 1 (تفكيك الملفات)؟
