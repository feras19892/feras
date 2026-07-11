# كتالوج أدوات المختبر الافتراضي (Tools Catalog)

## الحاويات (Containers) — 6 أدوات

### 1. بيكر (Beaker) — beaker-100 / beaker-250 / beaker-500
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `volume` | حجم السائل الحالي | number | 0–500 mL |
| `maxVolume` | السعة القصوى | number | 100 / 250 / 500 |
| `liquidColor` | لون المحلول | string | hex (e.g., '#3b82f6') |
| `liquidOpacity` | شفافية السائل | number | 0–1 |
| `label` | اسم المحلول | string | "ماء", "HCl", "NaOH" |
| `stirred` | وقت آخر تحريك | number | timestamp (0 = لم يُحرك) |
| `temperature` | درجة حرارة المحلول | number | °C (الإفتراضي: 25°C) |
| `ph` | قيمة pH المحسوبة | number | 0–14 (null إذا لم يُقاس) |
| `heated` | هل مُسخن حالياً؟ | boolean | true/false |
| `isHovered` | هل المؤشر فوقها؟ | boolean | true/false |

**التفاعلات:**
- 💧 ملء (fill50/fill100)
- 🗑️ تفريغ (empty)
- 🌀 تحريك (stir)
- 🫗 سكب في حاوية أخرى (pour)
- 🔥 تسخين إذا كان الموقد قريب
- ⚖️ وزن إذا كان فوق الميزان
- 📟 قياس pH إذا كان القطب مغطس

---

### 2. أنبوب اختبار (Test Tube) — test-tube-sm / md / lg
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `volume` | حجم السائل الحالي | number | 0–50 mL |
| `maxVolume` | السعة القصوى | number | 15 / 25 / 50 |
| `liquidColor` | لون المحلول | string | hex |
| `liquidOpacity` | شفافية السائل | number | 0–1 |
| `label` | اسم المحلول | string | "" |
| `size` | الحجم | string | 'sm' / 'md' / 'lg' |
| `capped` | هل مغلق بسدادة؟ | boolean | false |
| `temperature` | درجة الحرارة | number | °C |
| `ph` | قيمة pH | number | 0–14 |
| `heated` | هل مُسخن؟ | boolean | false |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 💧 ملء
- 🗑️ تفريغ
- 🌀 تحريك
- 🫗 سكب
- 🔥 تسخين
- 🧪 وضع في حامل الأنابيب

---

### 3. دورق مخروطي (Erlenmeyer Flask) — erlenmeyer
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `volume` | حجم السائل الحالي | number | 0–300 mL |
| `maxVolume` | السعة القصوى | number | 300 |
| `liquidColor` | لون المحلول | string | hex |
| `liquidOpacity` | شفافية السائل | number | 0–1 |
| `label` | اسم المحلول | string | "" |
| `stirred` | وقت آخر تحريك | number | timestamp |
| `temperature` | درجة الحرارة | number | °C |
| `ph` | قيمة pH | number | 0–14 |
| `heated` | هل مُسخن؟ | boolean | false |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- نفس تفاعلات البيكر بالكامل
- ✅ مثالي للمعايرة (titration)

---

### 4. مخبار مدرج (Graduated Cylinder) — grad-cylinder
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `volume` | حجم السائل الحالي | number | 0–100 mL |
| `maxVolume` | السعة القصوى | number | 100 |
| `liquidColor` | لون المحلول | string | hex |
| `liquidOpacity` | شفافية السائل | number | 0–1 |
| `label` | اسم المحلول | string | "" |
| `temperature` | درجة الحرارة | number | °C |
| `ph` | قيمة pH | number | 0–14 |
| `precision` | دقة القراءة | number | 1 mL |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 💧 ملء دقيق
- 🗑️ تفريغ
- 🫗 سكب
- ⚠️ أداة قياس — لا تُستخدم للتفاعل

---

## أدوات القياس والنقل (Transfer & Measurement) — 2 أدوات

### 5. سحاحة (Burette) — burette
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `volume` | المحلول المتبقي | number | 0–50 mL |
| `maxVolume` | السعة القصوى | number | 50 |
| `liquidColor` | لون المحلول | string | hex |
| `liquidOpacity` | شفافية السائل | number | 0–1 |
| `valveOpen` | حالة الصنبور | boolean | false |
| `flowRate` | معدل التدفق | number | mL/sec |
| `dripTarget` | الحاوية الهدف (UID) | string | "" |
| `lastDropTime` | وقت آخر قطرة | number | timestamp |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 🔓/🔒 فتح/إغلاق الصنبور
- ♻️ تعبئة (refill)
- 💧 تنقيط تلقائي في الحاوية تحتها
- 📏 قراءة الحجم المتبقي (بدقة 0.05 mL)

---

### 6. ماصة (Pipette) — pipette
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `volume` | المسحوب حالياً | number | 0–10 mL |
| `maxVolume` | السعة القصوى | number | 10 |
| `liquidColor` | لون السائل المسحوب | string | hex |
| `liquidOpacity` | شفافية السائل | number | 0–1 |
| `label` | اسم المحلول المسحوب | string | "" |
| `mode` | وضع الماصة | string | 'idle' / 'sucking' / 'expelling' |
| `isActive` | هل في وضع التحكم؟ | boolean | false |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 💉 دخول وضع التحكم (drag mode)
- 🧪 سحب من حاوية
- 🧫 إفراغ في حاوية
- ⏹️ خروج من وضع التحكم

---

## الأجهزة (Devices) — 3 أدوات

### 7. موقد بنسن (Bunsen Burner) — bunsen-burner
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `isOn` | هل مشتعل؟ | boolean | false |
| `intensity` | شدة اللهب | number | 0–1 (0.5 = ضعيف, 1.0 = قوي) |
| `flameColor` | لون اللهب | string | 'blue' / 'yellow' / 'orange' |
| `airRegulator` | منظم الهواء | number | 0–1 |
| `gasFlow` | تدفق الغاز | number | 0–1 |
| `temperature` | درجة الحرارة القصوى | number | °C (max ~1500°C) |
| `fuelRemaining` | الوقود المتبقي | number | % |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 🔥 إشعال / ⏹️ إطفاء
- ⬆️/⬇️ تعديل الشدة
- 🌀 تعديل منظم الهواء (يغير لون اللهب)
- 🔥🔥 يُسخن الحاويات القريبة

---

### 8. ميزان رقمي (Digital Balance) — digital-balance
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `reading` | القراءة الحالية (g) | number | 0–9999.99 |
| `tare` | قيمة التصفير | number | g |
| `netWeight` | الوزن الصافي | number | reading - tare |
| `precision` | الدقة | number | 0.01 g |
| `unit` | الوحدة | string | 'g' / 'mg' / 'kg' |
| `stable` | هل القراءة مستقرة؟ | boolean | false |
| `onScale` | قائمة الأدوات فوق الميزان | string[] | UIDs |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- ⚖️ تصفير الوزن (TARE)
- 🔄 تغيير الوحدة
- 🔒 قفل القراءة (HOLD)
- 📊 حساب وزن الحاوية + السائل

---

### 9. جهاز pH (pH Meter) — ph-meter
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `reading` | قراءة pH | number | 0–14 (null = لا يقيس) |
| `probeDipped` | هل القطب مغطس؟ | boolean | false |
| `targetContainer` | الحاوية التي يقيسها | string | UID |
| `calibrated` | هل مُعاير؟ | boolean | false |
| `temperature` | درجة حرارة القطب | number | °C |
| `batteryLevel` | مستوى البطارية | number | % |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 📟 قراءة pH من السائل المغطوس
- 🔧 معايرة (CAL)
- 🔒 تجميد القراءة (HOLD)
- 🔛 تشغيل/إطفاء

---

## الأدوات المساعدة (Helpers) — 4 أدوات

### 10. حامل أنابيب (Test Tube Rack) — test-tube-rack
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `capacity` | عدد الفتحات | number | 6 |
| `occupiedSlots` | الفتحات المشغولة | number[] | indices |
| `tubeUids` | UIDs الأنابيب في الحامل | string[] | 6 items |
| `material` | المادة | string | 'wood' / 'metal' / 'plastic' |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 🧪 وضع أنبوب في فتحة
- 🧪 إزالة أنبوب من فتحة
- 🔄 ترتيب الأنابيب

---

### 11. عصا تحريك (Stirring Rod) — stirring-rod
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `length` | الطول | number | mm |
| `diameter` | القطر | number | mm |
| `material` | المادة | string | 'glass' |
| `inUse` | هل تُستخدم حالياً؟ | boolean | false |
| `lastUsed` | وقت آخر استخدام | number | timestamp |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 🌀 تحريك محلول في بيكر
- ⚠️ كسر إذا ضُغط بقوة (easter egg)

---

### 12. قطّارة (Dropper) — dropper
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `volume` | الحجم الممتص | number | 0–3 mL |
| `liquidColor` | لون السائل | string | hex |
| `dropCount` | عدد القطرات | number | 0–60 |
| `dropSize` | حجم القطرة | number | µL |
| `bulbColor` | لون البصلة | string | 'red' / 'blue' / 'clear' |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 💧 امتصاص قطرة
- 💧 إسقاط قطرة
- 🧪 إضافة مؤشر (indicator)

---

### 13. ملعقة (Spatula) — spatula
| الخاصية | الوصف | النوع | القيمة |
|---------|-------|-------|--------|
| `material` | المادة | string | 'stainless' / 'plastic' |
| `capacity` | السعة | number | mg |
| `substance` | المادة الحالية | string | "" |
| `substanceColor` | لون المادة | string | hex |
| `amount` | الكمية الحالية | number | mg |
| `isHovered` | هل المؤشر فوقها؟ | boolean | false |

**التفاعلات:**
- 🥄 أخذ مادة صلبة
- 🥄 إضافة مادة إلى محلول
- ⚖️ وزن المادة

---

## الخواص المشتركة (Common Properties)

كل أداة لها هذه الخواص أيضاً:

| الخاصية | الوصف | النوع |
|---------|-------|-------|
| `uid` | المعرف الفريد | string |
| `id` | نوع الأداة | string |
| `name` | الاسم المعروض | string |
| `icon` | الأيقونة | string (emoji) |
| `type` | التصنيف | 'container' / 'transfer' / 'device' / 'helper' |
| `x` | الإحداثي الأفقي | number (px) |
| `y` | الإحداثي الرأسي | number (px) |
| `scale` | التكبير | number (0.6–2.2) |
| `rotation` | الدوران | number (deg) |
| `visible` | هل مرئية؟ | boolean |
| `locked` | هل مقفلة؟ | boolean |

---

## جدول الملخص

| # | الأداة | التصنيف | الخواص الرئيسية | التفاعلات |
|---|--------|---------|-----------------|-----------|
| 1 | بيكر | حاوية | volume, color, temp, pH, label | ملء، تفريغ، سكب، تحريك |
| 2 | أنبوب اختبار | حاوية | volume, color, temp, pH, capped, size | ملء، تفريغ، سكب، حامل |
| 3 | دورق مخروطي | حاوية | volume, color, temp, pH, label | ملء، تفريغ، سكب، تحريك |
| 4 | مخبار مدرج | حاوية | volume, color, temp, precision | ملء، تفريغ (قياس فقط) |
| 5 | سحاحة | نقل | volume, valveOpen, flowRate, dripTarget | فتح/إغلاق، تعبئة، تنقيط |
| 6 | ماصة | نقل | volume, color, label, mode | سحب، إفراغ |
| 7 | موقد بنسن | جهاز | isOn, intensity, flameColor, temp | إشعال، تعديل شدة |
| 8 | ميزان رقمي | جهاز | reading, tare, precision, stable | تصفير، تغيير وحدة |
| 9 | جهاز pH | جهاز | reading, probeDipped, calibrated | قياس، معايرة |
| 10 | حامل أنابيب | مساعد | capacity, occupiedSlots, tubeUids | وضع/إزالة أنبوب |
| 11 | عصا تحريك | مساعد | inUse, lastUsed | تحريك |
| 12 | قطّارة | مساعد | volume, dropCount, dropSize | امتصاص، إسقاط |
| 13 | ملعقة | مساعد | substance, amount, capacity | أخذ، إضافة |

---

## الخواص الجديدة المطلوب إضافتها

### للحاويات (جميعها):
- [ ] `temperature` — درجة الحرارة الحالية
- [ ] `ph` — قيمة pH (تحسب من اسم المحلول)
- [ ] `heated` — هل تُسخن حالياً
- [ ] `capped` — للأنابيب فقط (سدادة)

### للموقد:
- [ ] `flameColor` — لون اللهب (يغير بمنظم الهواء)
- [ ] `airRegulator` — منظم الهواء
- [ ] `fuelRemaining` — الوقود المتبقي

### للميزان:
- [ ] `stable` — استقرار القراءة
- [ ] `unit` — الوحدة (g/mg/kg)
- [ ] `onScale` — قائمة ما فوق الميزان

### لجهاز pH:
- [ ] `probeDipped` — هل القطب مغطس
- [ ] `calibrated` — حالة المعايرة
- [ ] `batteryLevel` — البطارية

### للقطّارة:
- [ ] `dropCount` — عدد القطرات المتبقية
- [ ] `dropSize` — حجم القطرة
- [ ] `bulbColor` — لون البصلة

### للملعقة:
- [ ] `substance` — اسم المادة الصلبة
- [ ] `substanceColor` — لون المادة
- [ ] `amount` — الكمية (mg)

### للحامل:
- [ ] `occupiedSlots` — الفتحات المشغولة
- [ ] `tubeUids` — الأنابيب في الحامل

### للجميع:
- [ ] `rotation` — دوران الأداة
- [ ] `locked` — قفل الأداة (لا تُحرك)
- [ ] `visible` — إخفاء/إظهار
