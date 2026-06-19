# خطة تطوير "إصابة الهدف" — Target Hit Feature

## الهدف
إضافة هدف على المحور X يمكن إصابته بتعديل v₀ والزاوية. تسجيل المسافة عن الهدف في جدول القراءات.

---

## القواعد المطبقة
- أي ملف .vue > 300 سطر → يُفصل
- أي ملف .ts > 200 سطر → يُفصل
- لا تكتب كود من عندك — انقل/عدّل فقط
- vue-tsc بعد كل مرحلة

---

## المرحلة 1: تعديل الفيزياء
**الملف:** `src/modules/physics/experiments/projectile/useProjectilePhysics.ts`

### التعديلات
1. إضافة إلى `ProjectileParams`:
   ```ts
   targetX: number
   targetY: number
   targetRadius: number
   targetVisible: boolean
   ```
2. إضافة إلى `ProjectileState`:
   ```ts
   targetHit: boolean
   distanceToTarget: number | null
   ```
3. في `step()` بعد تحديث الموضع:
   ```ts
   if (params.targetVisible) {
     const dx = state.x - params.targetX
     const dy = state.y - params.targetY
     state.distanceToTarget = Math.sqrt(dx*dx + dy*dy)
     state.targetHit = state.distanceToTarget <= params.targetRadius
     if (state.targetHit) state.landed = true // stop on hit
   }
   ```
4. في `reset()`: `targetHit = false, distanceToTarget = null`

### التحقق
- [ ] الحجم ≤ 200 سطر
- [ ] vue-tsc --noEmit = 0 errors

---

## المرحلة 2: رسم الهدف في Canvas
**الملف:** `src/composables/projectile/useProjectileDraw.ts`

### التعديلات
1. `drawTarget(ctx, w, h, _ts)`:
   - دائرة خضراء شفافة عند (targetX, targetY)
   - إذا targetHit → دائرة حمراء + علامة ✓
   - crosshair داخل الدائرة
2. في `draw()`: استدعاء `drawTarget()` بعد `drawGround()`
3. `toScreen()` يحسب موقع الهدف

### التحقق
- [ ] الحجم ≤ 200 سطر (الحالي 179)
- [ ] vue-tsc = 0

---

## المرحلة 3: زر Toggle الهدف
**الملف الجديد:** `src/components/experiment/projectile/ProjectileTargetToggle.vue`

### المحتوى
```vue
<button class="target-btn" @click="emit('toggle')" :class="{active: visible}">
  {{ visible ? '🎯' : '◯' }}
</button>
```

**الملف المعدّل:** `ProjectileCanvas.vue`
- إضافة `<ProjectileTargetToggle>` فوق الـ canvas
- emit toggleTarget

### التحقق
- [ ] الملف الجديد ≤ 300 سطر
- [ ] vue-tsc = 0

---

## المرحلة 4: شرائح الهدف
**الملف:** `src/components/experiment/projectile/ProjectilePanelBody.vue`

### التعديلات (في params panel)
إضافة 4 أسطر:
```html
<div class="param-row">
  <label>هدف X (m)</label>
  <div class="param-inputs">
    <input type="range" min="10" max="500" step="1" :value="params.targetX" @input="...">
    <input type="number" step="1" :value="params.targetX" @input="...">
  </div>
</div>
<div class="param-row">
  <label>نصف قطر الهدف (m)</label>
  <div class="param-inputs">
    <input type="range" min="0.5" max="10" step="0.5" :value="params.targetRadius" @input="...">
    <input type="number" step="0.5" :value="params.targetRadius" @input="...">
  </div>
</div>
<div class="param-row">
  <label><input type="checkbox" :checked="params.targetVisible" @change="emit('update:params', {...params, targetVisible: $event.target.checked})"> إظهار الهدف</label>
</div>
```

### التحقق
- [ ] الحجم ≤ 300 سطر (الحالي 206)
- [ ] إذا تجاوز → فصل إلى ProjectileParamsPanel.vue

---

## المرحلة 5: حالة الإصابة
**الملف:** `src/composables/projectile/useProjectileExperiment.ts`

### التعديلات
1. إضافة `targetHit` إلى الـ params الافتراضية
2. تعديل `tutorMessage`:
   ```ts
   if (lab.sim.targetHit) return '🎯 إصابة! اضغط تسجيل'
   ```
3. تعديل `tutorType`: `success` عند إصابة

**الملف:** `src/components/experiment/projectile/ProjectileExperiment.vue`

### التعديلات
تعديل hint-bar:
```html
<div class="hint-bar success" v-if="ex.lab.sim.targetHit"><span>🎯 إصابة!</span></div>
```

### التحقق
- [ ] vue-tsc = 0

---

## المرحلة 6: جدول القراءات
**الملف:** `src/composables/projectile/useProjectileTrials.ts`

### التعديلات
1. إضافة إلى `ProjectileTrial`:
   ```ts
   targetX: number
   targetHit: boolean
   distanceToTarget: number | null
   ```
2. في `recordTrial()`:
   ```ts
   targetX: params.targetX,
   targetHit: measured.targetHit ?? false,
   distanceToTarget: measured.distanceToTarget ?? null,
   ```

**الملف:** `src/components/experiment/projectile/ProjectilePanelBody.vue` (table)

### التعديلات
إضافة عمودين:
```html
<th>الهدف</th>
<th>المسافة</th>
```
```html
<td>{{ t.targetHit ? '✅' : '❌' }}</td>
<td>{{ t.distanceToTarget?.toFixed(2) ?? '--' }}</td>
```

### التحقق
- [ ] vue-tsc = 0
- [ ] الحجم ≤ 300

---

## المرحلة 7: اختبار نهائي

### سيناريو الاختبار
1. v₀ = 20, θ = 45°, targetX = 40, targetRadius = 2
2. اضغط بدء → الكرة تطير
3. عند الإصابة → المحاكاة تتوقف
4. hint-bar يظهر "🎯 إصابة!"
5. اضغط تسجيل → القراءة في الجدول مع ✅

### قائمة التحقق النهائية
- [ ] vue-tsc --noEmit = 0 errors
- [ ] كل ملف vue ≤ 300 سطر
- [ ] كل ملف ts ≤ 200 سطر
- [ ] الهدف يظهر/يختفي بالزر
- [ ] الإصابة توقف المحاكاة
- [ ] الجدول يعرض المسافة والإصابة
- [ ] الشرائح تعمل (slider + number)

---

## الملفات المتأثرة (7 ملفات)

| # | الملف | نوع التعديل | الحجم الحالي | الحد |
|---|-------|------------|-------------|------|
| 1 | useProjectilePhysics.ts | تعديل | 180 | 200 |
| 2 | useProjectileDraw.ts | تعديل | 179 | 200 |
| 3 | ProjectileCanvas.vue | تعديل | 70 | 300 |
| 4 | ProjectilePanelBody.vue | تعديل | 206 | 300 |
| 5 | useProjectileExperiment.ts | تعديل | 85 | 200 |
| 6 | ProjectileExperiment.vue | تعديل | 138 | 300 |
| 7 | useProjectileTrials.ts | تعديل | 180 | 200 |
| 8 | ProjectileTargetToggle.vue | جديد | — | 300 |

---

## ملاحظات هامة

1. **ProjectilePanelBody.vue = 206** → بعد إضافة 3 أسطر params + 2 عمود جدول ≈ 220. لا يزال تحت 300.
2. **useProjectilePhysics.ts = 180** → بعد إضافة target logic ≈ 195. لا يزال تحت 200.
3. **useProjectileDraw.ts = 179** → بعد إضافة drawTarget ≈ 195. لا يزال تحت 200.
4. إذا تجاوز أي ملف الحد → نفصل فوراً.

---

## ترتيب التنفيذ
1. → المرحلة 1 (فيزياء)
2. → المرحلة 2 (رسم)
3. → المرحلة 3 (زر)
4. → المرحلة 4 (شرائح)
5. → المرحلة 5 (حالة)
6. → المرحلة 6 (جدول)
7. → المرحلة 7 (اختبار)
