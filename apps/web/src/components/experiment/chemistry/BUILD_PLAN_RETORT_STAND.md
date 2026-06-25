# خطة بناء حامل المختبر المتكامل (Retort Stand Assembly)

## التوافق مع قواعد المشروع (MIGRATION_RULES.md)

- `.vue` > 300 سطر → فصل — كل مكون ≤ 300 سطر
- `.ts` > 200 سطر → فصل — كل composable ≤ 200 سطر
- `<template>` كبير → مكونات منفصلة
- `<script>` كبير → composables
- `<style>` → scoped في كل مكون

---

## 1. بنية المكونات (Component Architecture)

### المكون الرئيسي: `LabRetortStand.vue` (~250 سطر)
- يُعرض البنية المتكاملة: قاعدة + عمود + مشبك علوي + مشبك سفلي + فتحة سخان
- يستقبل props من `getRetortStandState()`
- يُصدر events: `clampDrag`, `snapRequest`
- **لا يتجاوز 300 سطر** — كل جزء فرعي SVG يُستورد كـ sub-component

### المكونات الفرعية (Sub-components):

| الملف | الوظيفة | الحجم المُقدر |
|-------|---------|---------------|
| `LabRetortStandBase.vue` | رسم القاعدة + فتحة السخان SVG | ~80 سطر |
| `LabRetortStandRod.vue` | رسم العمود الرأسي SVG | ~60 سطر |
| `LabRetortStandTopClamp.vue` | المشبك المزدوج العلوي + فكّان | ~120 سطر |
| `LabRetortStandBottomClamp.vue` | مشبك الحاوية السفلي | ~100 سطر |
| `LabRetortStandAssembly.vue` | تجميعة تربط كل الأجزاء | ~200 سطر |

---

## 2. البنية التحتية للحالة (State Architecture)

### أ. حالة الحامل (Retort Stand State)

```ts
// في useChemistryLab.ts — موجود بالفعل
interface RetortStandState {
  leftBuretteUid: string | null;    // مرجع للسحاحة اليسرى
  rightBuretteUid: string | null;   // مرجع للسحاحة اليمنى
  heldContainerUid: string | null;    // مرجع للبيكر/الدورق
  heatingDeviceUid: string | null;  // مرجع للسخان الملتصق
  topClampY: number;                // ارتفاع المشبك العلوي (px على العمود)
  bottomClampY: number;             // ارتفاع المشبك السفلي (px على العمود)
}
```

**المنطق:**
- الحامل هو `LabItem` واحد في `items.value`
- السحاحات والحاويات والسخان هي `LabItem` منفصلة لها uids خاصة
- الحامل يحفظ **مراجع (uids)** فقط — لا يحتوي على نسخ من البيانات
- عند تحريك الحامل (drag) → جميع الأدوات المُرفقة تتحرك معه (derived positions)

### ب. حساب المواضع المشتقة (Derived Positions)

```ts
// composable جديد: useRetortStandLayout.ts
function getBuretteWorldPos(standItem: LabItem, side: 'left' | 'right', clampY: number): { x: number; y: number }
function getContainerWorldPos(standItem: LabItem, clampY: number): { x: number; y: number }
function getHeatingDeviceWorldPos(standItem: LabItem): { x: number; y: number }
```

- الموضع العالمي (world x, y) يُحسب: `stand.x + offsetX`، `stand.y + offsetY`
- `LabItemRenderer.vue` يتحقق: هل هذه السحاحة مُرفقة بحامل؟ → إذا نعم، استخدم الموضع المشتقة
- إذا لم تُرفق → تستخدم `item.x` و `item.y` العاديين

---

## 3. آلية التلصيق التلقائي (Auto-Snap)

### أ. السحاحة ← المشبك العلوي

**الشرط:**
- مسافة مركز السحاحة من فك المشبك < 40 بكسل
- السحاحة في وضع عمودي (tilt ≈ 0°)

**السلوك:**
- عند mouse-up (drop): إذا تحقق الشرط → `retortStandMap[standUid].leftBuretteUid = buretteUid`
- السحاحة تُخفي نفسها من `items` أو تُثبت موضعها مشتقًا
- عند سحب السحاحة للخارج → يمسح المرجع: `leftBuretteUid = null`

### ب. الحاوية ← المشبك السفلي

**الشرط:**
- مسافة مركز الحاوية من المشبك السفلي < 50 بكسل
- الحاوية من نوع container (beaker, erlenmeyer)

**السلوك:**
- snap تلقائي عند drop
- `heldContainerUid = containerUid`
- الحاوية تتحرك مع المشبك (vertical + horizontal)

### ج. السخان ← فتحة القاعدة

**الشرط:**
- مسافة السخان من مركز الفتحة < 60 بكسل
- الأداة من نوع `bunsen-burner` أو `hot-plate`

**السلوك:**
- snap تلقائي
- `heatingDeviceUid = deviceUid`
- السخان يتحرك مع القاعدة

---

## 4. حركة المشبك على العمود (Vertical Clamp Movement)

### التفاعل:
- mouse-down على منطقة المشبك (not on the attached item)
- drag عمودي → `clampY` يتغير (محدود بـ [0, rodHeight])
- mouse-up → تثبيت الموضع الجديد

### التأثير المترتب:
- السحاحة المُرفقة أو الحاوية المُرفقة تتحرك مع المشبك
- الموضع المُشتق (derived) يُعاد حسابه فورًا

### composable جديد: `useClampDrag.ts`

```ts
export function useClampDrag(
  standUid: string,
  clampType: 'top' | 'bottom',
  minY: number,
  maxY: number
) {
  const isDragging = ref(false);
  const startY = ref(0);
  const startClampY = ref(0);

  function onMouseDown(e: MouseEvent) { /* ... */ }
  function onMouseMove(e: MouseEvent) { /* update clampY within bounds */ }
  function onMouseUp() { isDragging.value = false; }

  return { isDragging, onMouseDown, clampY: computed(() => retortStandMap[standUid][clampType === 'top' ? 'topClampY' : 'bottomClampY']) };
}
```

---

## 5. السحاحة الذكية (Smart Burette)

### المشكلة:
- السحاحة الحالية تتنقّط دائمًا إذا كان الصمام مفتوحًا
- نريد: لا تنقّط إذا لم يوجد حاوية أسفلها

### الحل:

```ts
// في useLabSimulation.ts — تعديل على دالة التنقيط
function shouldBuretteDrip(buretteUid: string): boolean {
  // 1. هل الصمام مفتوح؟
  const b = getBurette(buretteUid);
  if (!b.valveOpen) return false;

  // 2. هل السحاحة مُرفقة بحامل؟
  const stand = findStandHoldingBurette(buretteUid);
  if (!stand) return true; // لا حامل → تنقّط بحرية (backward compat)

  // 3. هل يوجد حاوية في المشبك السفلي؟
  const containerUid = retortStandMap[stand.uid].heldContainerUid;
  if (!containerUid) return false; // لا حاوية → لا تنقّط

  // 4. هل الحاوية تحت فتحة السحاحة فعليًا؟
  const burettePos = getBuretteTipPos(buretteUid, stand);
  const containerPos = getContainerPos(containerUid, stand);
  const horizontalDistance = Math.abs(burettePos.x - containerPos.x);
  return horizontalDistance < 30; // فتحة السحاحة فوق الحاوية
}
```

### التعديل المطلوب:
- `useLabSimulation.ts`: `startSimulation` loop تتحقق من `shouldBuretteDrip()` قبل إنشاء قطرة

---

## 6. الملفات التي ستُعدّل/تُنشأ

### مكونات Vue جديدة:

| # | الملف | الغرض |
|---|-------|-------|
| 1 | `LabRetortStandAssembly.vue` | المكون الجذر (root) |
| 2 | `LabRetortStandBase.vue` | رسم القاعدة + فتحة السخان |
| 3 | `LabRetortStandRod.vue` | رسم العمود الرأسي |
| 4 | `LabRetortStandTopClamp.vue` | المشبك المزدوج + فكّان |
| 5 | `LabRetortStandBottomClamp.vue` | مشبك الحاوية |

### Composables جديدة:

| # | الملف | الغرض |
|---|-------|-------|
| 6 | `useRetortStandLayout.ts` | حساب المواضع المشتقة |
| 7 | `useClampDrag.ts` | حركة المشبك عموديًا |
| 8 | `useAutoSnap.ts` | التلصيق التلقائي للأدوات |

### تعديلات على ملفات موجودة:

| # | الملف | التعديل |
|---|-------|---------|
| 9 | `useChemistryLab.ts` | تحديث `RetortStandState` + `setupInitialLabLayout()` |
| 10 | `LabItemRenderer.vue` | ربط الأدوات المُرفقة بالحامل (derived positions) |
| 11 | `useLabSimulation.ts` | `shouldBuretteDrip()` + سحاحة ذكية |
| 12 | `WorkspaceCanvas.vue` | التخطيط التلقائي الجديد |

---

## 7. تدفق البيانات (Data Flow)

```
┌─────────────────────────────────────────┐
│  Retort Stand (LabItem)                 │
│  - x, y: world position                 │
│  - retortStandMap[uid]:                  │
│    ├─ leftBuretteUid  → Burette 1       │
│    ├─ rightBuretteUid → Burette 2       │
│    ├─ heldContainerUid → Beaker/Flask   │
│    ├─ heatingDeviceUid → Burner/HotPlate│
│    ├─ topClampY: 60px                    │
│    └─ bottomClampY: 140px               │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  useRetortStandLayout.ts               │
│  ├─ getBuretteWorldPos() → {x, y}      │
│  ├─ getContainerWorldPos() → {x, y}    │
│  └─ getHeatingDeviceWorldPos() → {x, y} │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  LabItemRenderer.vue                    │
│  ├─ Burette 1: item.x = derived        │
│  ├─ Burette 2: item.x = derived        │
│  ├─ Beaker: item.x = derived           │
│  └─ HotPlate: item.x = derived         │
└─────────────────────────────────────────┘
```

---

## 8. التخطيط التلقائي الجديد (Updated Initial Layout)

```ts
function setupInitialLabLayout() {
  if (items.value.length > 0) return;

  const cx = 500, cy = 400;

  // 1. الحامل المتكامل
  const stand = createLabItem({
    id: 'retort-stand-assembly',
    name: 'حامل المختبر',
    icon: '🏗️',
    type: 'helper'
  }, cx, cy);

  retortStandMap[stand.uid] = {
    leftBuretteUid: null,
    rightBuretteUid: null,
    heldContainerUid: null,
    heatingDeviceUid: null,
    topClampY: 60,
    bottomClampY: 160,
  };

  // 2. سحاحة 1 (يمين)
  const burette1 = createLabItem(buretteDef, cx + 35, cy + 60);
  retortStandMap[stand.uid].rightBuretteUid = burette1.uid;

  // 3. سحاحة 2 (يسار)
  const burette2 = createLabItem(buretteDef, cx - 35, cy + 60);
  retortStandMap[stand.uid].leftBuretteUid = burette2.uid;

  // 4. بيكر 250ml في المشبك السفلي
  const beaker = createLabItem(beaker250Def, cx, cy + 160);
  retortStandMap[stand.uid].heldContainerUid = beaker.uid;

  // 5. حامل أنابيب (test tube rack) + 3 أنابيب
  const rack = createLabItem(testTubeRackDef, cx + 220, cy + 160);
  rackSlotsMap[rack.uid] = [];

  const tubeDefs = [
    { id: 'test-tube-sm', name: 'أنبوب صغير', offset: 0 },
    { id: 'test-tube-md', name: 'أنبوب متوسط', offset: 25 },
    { id: 'test-tube-lg', name: 'أنبوب كبير', offset: 50 },
  ];

  for (const tDef of tubeDefs) {
    const tube = createLabItem(tDef as ToolDef, cx + 220 + tDef.offset, cy + 140);
    rackSlotsMap[rack.uid].push(tube.uid);
  }
}
```

---

## 9. المميزات التفاعلية التفصيلية

| التفاعل | الطريقة |
|---------|---------|
| **سحب السحاحة من المشبك** | click on burette → drag away → release → فك الارتباط |
| **إعادة السحاحة للمشبك** | drag burette near clamp → release → snap تلقائي |
| **رفع/خفض المشبك العلوي** | drag the clamp handle vertically |
| **رفع/خفض المشبك السفلي** | drag the clamp handle vertically |
| **إزالة الحاوية من المشبك** | click on container → drag away → فك الارتباط |
| **وضع حاوية في المشبك** | drag container near clamp → snap |
| **وضع سخان في القاعدة** | drag burner/hot-plate near base → snap |
| **تحريك الحامل كله** | drag the base → كل الأجزاء والأدوات المُرفقة تتحرك |
| **فتح/إغلاق صمام السحاحة** | click على صمام السحاحة → يتنقّط فقط إذا وجدت حاوية |
| **سحب أنبوب من الحامل** | click on tube → drag → tube exits rack |
| **إعادة أنبوب للحامل** | drag tube near rack slot → snap |
| **أنبوب إلى مشبك الحاوية** | drag tube near bottom clamp → snap → held as container |

---

**الحالة:** خطة مفصلة جاهزة للموافقة. لا يتم بناء أي كود حتى الموافقة.
