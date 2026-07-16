# خطة تطوير "إصابة الهدف" — المرحلة الثانية

## الهدف
تحويل الهدف من دائرة بسيطة إلى شكل حقيقي (شجرة/مبنى) + إضافة زر تلميحات + جعل الهدف قابل للسحب.

---

## المرحلة 1: تغيير شكل الهدف

**الملف:** `src/composables/projectile/useProjectileTargetDraw.ts`

### التعديلات
- `drawTree(ctx, x, y, scale)` — شجرة: جذع بني + ورق أخضر (دائرتين)
- `drawBuilding(ctx, x, y, scale)` — مبنى: مستطيل + نوافذ + باب
- اختيار الشكل عبر `params.targetShape: 'tree' | 'building'`

**الملف:** `src/components/experiment/projectile/ProjectilePanelBody.vue` (params)
- إضافة شريط اختيار الشكل: `select` مع خيارات "شجرة" و"مبنى"

---

## المرحلة 2: جعل الهدف قابل للسحب

**الملف:** `src/components/experiment/projectile/ProjectileCanvas.vue`

### التعديلات
- `@mousedown` على الـ canvas → التحقق هل النقرة داخل الهدف
- إذا نعم → تفعيل `draggingTarget = true`
- `@mousemove` → إذا dragging → تحديث `params.targetX` و `params.targetY`
- `@mouseup` → `draggingTarget = false`

**الملف:** `src/composables/projectile/useProjectileGrid.ts`
- إضافة `screenToWorld(sx, sy)` — تحويل من شاشة إلى عالم

---

## المرحلة 3: زر التلميحات داخل Canvas

**الملف الجديد:** `src/components/experiment/projectile/ProjectileHintOverlay.vue`

### المحتوى
- زر "💡 تلميح" في أعلى اليسار (داخل Canvas)
- عند الضغط: يظهر overlay يحتوي على:
  - المعادلة: `R = (v₀² sin(2θ)) / g`
  - المدى النظري الحالي
  - المسافة للهدف
  - **التلميح الذكي:** "للوصول للهدف عند 50m، جرب v₀=22 m/s وزاوية 45°"
  - حقل إدخال: الطالب يكتب `v₀` والزاوية → يحسب المدى → يقول "أبعد" أو "أقرب"

**الملف:** `src/composables/projectile/useProjectileHints.ts`

### المحتوى
```ts
function getHint(params, targetX) {
  const neededV0 = Math.sqrt(targetX * params.g / Math.sin(2 * 45° * π/180))
  return {
    equation: 'R = v₀² sin(2θ) / g',
    neededV0: neededV0.toFixed(1),
    hint: `للوصول لـ ${targetX}m، جرب v₀ ≈ ${neededV0.toFixed(1)} m/s مع زاوية 45°`
  }
}

function checkStudentAnswer(v0, angleDeg, targetX, g) {
  const R = (v0² * sin(2θ * π/180)) / g
  const diff = R - targetX
  if (Math.abs(diff) < 2) return '✅ قريب جداً!'
  if (diff > 0) return '⚠️ أبعد قليلاً، قلل v₀ أو الزاوية'
  return '⚠️ أقرب قليلاً، زد v₀ أو الزاوية'
}
```

---

## المرحلة 4: الربط

**الملف:** `src/components/experiment/projectile/ProjectileCanvas.vue`
- إضافة `<ProjectileHintOverlay>` فوق الـ canvas
- تمرير `params` + `simState`

**الملف:** `src/modules/physics/experiments/projectile/ProjectileExperiment.vue`
- إضافة `targetShape` للـ params
- إضافة handleTargetMove

---

## قائمة الملفات

| # | الملف | نوع | الحجم المتوقع |
|---|-------|-----|--------------|
| 1 | `useProjectileTargetDraw.ts` | تعديل | ~60 سطر |
| 2 | `ProjectileCanvas.vue` | تعديل | ~100 سطر |
| 3 | `useProjectileGrid.ts` | تعديل | +15 سطر |
| 4 | `ProjectileHintOverlay.vue` | **جديد** | ~80 سطر |
| 5 | `useProjectileHints.ts` | **جديد** | ~40 سطر |
| 6 | `ProjectilePanelBody.vue` | تعديل | +10 سطر |
| 7 | `useProjectileExperiment.ts` | تعديل | +5 سطر |
| 8 | `ProjectileExperiment.vue` | تعديل | +5 سطر |

---

## خطوات التنفيذ

1. → تغيير شكل الهدف (شجرة/مبنى)
2. → جعل الهدف قابل للسحب
3. → إضافة زر التلميحات
4. → ربط كل شيء
5. → اختبار

---

## ملاحظة: الحدود

- `ProjectileCanvas.vue` حالياً 74 سطر → بعد التعديل ~100 (تحت 300) ✅
- `useProjectileTargetDraw.ts` حالياً 38 سطر → بعد التعديل ~60 (تحت 200) ✅
- الملفات الجديدة كلها صغيرة ✅
