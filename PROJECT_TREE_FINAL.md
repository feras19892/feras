# 🌳 الشجرة الشاملة للمشروع — قسم الورشة الكهربائية

> آخر تحديث: 2026-07-18 | vue-tsc: ✅ 0 errors

---

## 1. الهيكل العام للمشروع

```
feras/                          ← جذر المشروع
├── apps/
│   ├── api/                    ← خادم API (Node.js/Express)
│   ├── web/                    ← تطبيق الويب (Vue 3 + TypeScript + Vite)
│   └── worker/                 ← معالج خلفي
├── packages/                   ← حزم مشتركة
├── pnpm-workspace.yaml         ← إعدادات monorepo
├── turbo.json                  ← إعدادات Turborepo
└── package.json                ← جذر المشروع
```

---

## 2. هيكل تطبيق الويب `apps/web/`

```
apps/web/src/
├── App.vue                     ← المكوّن الجذري
├── main.ts                     ← نقطة الدخول
├── router.ts                   ← موجه المسارات
├── env.d.ts                    ← تعريفات البيئة
├── vite-env.d.ts               ← تعريفات Vite
│
├── assets/                     ← الأصول الثابتة
├── components/                 ← مكوّنات Vue المشتركة (586 عنصر)
├── composables/                ← دوال Vue Composable (290 عنصر)
├── locales/                    ← الترجمات (44 عنصر)
│   ├── index.ts                ← نقطة تجميع الترجمات
│   ├── types.ts                ← أنواع الترجمة
│   ├── ar.ts                   ← إعدادات العربية
│   ├── en.ts                   ← إعدادات الإنجليزية
│   ├── es.ts                   ← إعدادات الإسبانية
│   ├── electricWorkshop.ts     ← ترجمات الورشة الكهربائية (100KB — 3 لغات)
│   ├── chemistry.ts            ← ترجمات الكيمياء
│   ├── biology.ts              ← ترجمات الأحياء
│   ├── math.ts                 ← ترجمات الرياضيات
│   ├── auth.ts                 ← ترجمات المصادقة
│   ├── dashboard.ts            ← ترجمات لوحة التحكم
│   ├── teacher.ts              ← ترجمات المعلم
│   ├── common.ts               ← ترجمات مشتركة
│   └── ...                     ← ترجمات أخرى
│
├── modules/                    ← وحدات التطبيق (183 عنصر)
│   ├── auth/                   ← وحدة المصادقة
│   ├── biology/                ← وحدة الأحياء
│   ├── chemistry/              ← وحدة الكيمياء
│   ├── dashboard/              ← وحدة لوحة التحكم
│   ├── physics/                ← وحدة الفيزياء
│   │   ├── branch-page.vue     ← صفحة الفرع
│   │   ├── branches-page.vue   ← صفحة الفروع
│   │   ├── catalog.ts          ← كتالوج التجارب
│   │   ├── experiment-loader.ts← محمّل التجارب
│   │   ├── experiment-page.vue ← صفحة التجربة
│   │   ├── experiment-template/← قالب التجربة
│   │   └── experiments/        ← مجلد التجارب (136 عنصر)
│   │       ├── analysis-calc/
│   │       ├── biot-savart/
│   │       ├── boyles-law/
│   │       ├── calorimetry/
│   │       ├── circular-coil/
│   │       ├── collision/
│   │       ├── diffraction/
│   │       ├── electric-workshop/  ← ★ الورشة الكهربائية
│   │       ├── faraday/
│   │       ├── faraday-law/
│   │       ├── freefall/
│   │       ├── generator/
│   │       ├── grating/
│   │       ├── ideal-gas/
│   │       ├── inclined/
│   │       ├── interference/
│   │       ├── latent-heat/
│   │       ├── lenz-law/
│   │       ├── lever/
│   │       ├── lightray/
│   │       ├── lorentz-force/
│   │       ├── magnetic-flux/
│   │       ├── mirror/
│   │       ├── pendulum/
│   │       ├── polarization/
│   │       ├── prism/
│   │       ├── projectile/
│   │       ├── resonance/
│   │       ├── solenoid/
│   │       ├── specific-heat/
│   │       ├── speed-of-sound/
│   │       ├── spring/
│   │       ├── straight-wire/
│   │       ├── thermal-expansion/
│   │       ├── thinlens/
│   │       ├── torque-coil/
│   │       ├── wave-interference/
│   │       └── wire-force/
│   └── settings/               ← وحدة الإعدادات
│
├── pages/                      ← الصفحات (22 عنصر)
├── services/                   ← الخدمات (21 عنصر)
├── shared/                     ← مشترك (7 عناصر)
├── stores/                     ← مخازن Pinia (4 عناصر)
├── tools/                      ← أدوات
├── types/                      ← أنواع TypeScript (5 عناصر)
└── utils/                      ← أدوات مساعدة (4 عناصر)
```

---

## 3. الورشة الكهربائية — الهيكل التفصيلي

```
electric-workshop/
│
├── ElectricWorkshop.vue        ← المكوّن الجذري للورشة (4.3KB)
│                                  يدير التبديل بين DC/AC، الحالة العامة
│
├── shared/                     ← المشترك بين DC و AC (55 عنصر)
│   │
│   ├── ── الأنواع والتعريفات ──
│   │   ├── types.ts            ← جميع الأنواع (ComponentType, WorkshopComponent,
│   │   │                          WorkshopWire, Terminal, FaultInfo, SolveResult,
│   │   │                          TransientResult, Complex, ComponentDef)
│   │   │                          المكونات: 20 نوع (battery, resistor, capacitor,
│   │   │                          inductor, diode, switch, lamp, ammeter, voltmeter,
│   │   │                          relay, breaker, fuse, ground, multimeter, acsource,
│   │   │                          transformer, oscilloscope, led, potentiometer, motor)
│   │   │
│   │   ├── componentDefs.ts    ← تعريفات المكونات (القيم الافتراضية، الأيقونات،
│   │   │                          الأبعاد، عدد الأطراف، التصنيف، المجموعة)
│   │   │                          getDef(), getComponentsByCategory()
│   │   │
│   │   └── componentSpecs.ts   ← مواصفات المكونات للعرض (نصوص توضيحية لكل مكون)
│   │
│   ├── ── الحلّال (Solvers) ──
│   │   ├── solver.ts           ← نقطة تجميع الصادرات (solveCircuit, solveCircuitAC,
│   │   │                          solveCircuitTransient, solveCircuitTransientDC,
│   │   │                          updateRelayStates)
│   │   │
│   │   ├── solver-dc.ts        ← حلّال DC (MNA — Modified Nodal Analysis)
│   │   │                          • Newton-Raphson تكراري (20 تكرار)
│   │   │                          • يدعم: battery, resistor, capacitor, inductor,
│   │   │                            diode, switch, lamp, ammeter, voltmeter, relay,
│   │   │                            breaker, fuse, multimeter, LED, potentiometer, motor
│   │   │                          • LED: نموذج قطعة (Vf threshold + 100Ω)
│   │   │                          • Potentiometer: 3 أطراف + wiper + مقاومة عائمة
│   │   │
│   │   ├── solver-ac.ts        ← حلّال AC (Phasor — تحليل الطور)
│   │   │                          • مصفوفة مركبة (Complex G)
│   │   │                          • يدعم: acsource, resistor, capacitor, inductor,
│   │   │                            lamp, switch, relay, transformer, LED, potentiometer,
│   │   │                            motor, ammeter, voltmeter, multimeter
│   │   │                          • Transformer: نموذج مصدر جهد محكوم
│   │   │
│   │   ├── solver-transient.ts ← حلّال AC Transient (تكامل عددي)
│   │   │                          • Transformer + Relay + Capacitor + Inductor
│   │   │                          • 3 دورات، 50 خطوة
│   │   │
│   │   ├── solver-transient-dc.ts ← حلّال DC Transient (RC/RL شحن/تفريغ)
│   │   │                          • تكامل trapezoidal + LU decomposition
│   │   │                          • حساب تلقائي للثابت الزمني τ = RC, L/R
│   │   │                          • totalTime = 5τ (تلقائي)
│   │   │                          • 200 خطوة زمنية
│   │   │                          • يدعم: battery, resistor, capacitor, inductor,
│   │   │                            switch, ammeter, voltmeter, relay, diode, breaker,
│   │   │                            fuse, LED, motor, potentiometer
│   │   │
│   │   ├── solver-linear.ts    ← حل الأنظمة الخطية (Gauss-Jordan + Complex)
│   │   │                          solveLinear(), solveComplexLinear(), cAdd, cSub,
│   │   │                          cMul, cDiv, cAbs
│   │   │
│   │   ├── solver-multimeter.ts← قياسات المولتيميتر (DC + AC)
│   │   │                          • وضع الجهد: probes حمراء/سوداء
│   │   │                          • وضع التيار: clamp على سلك
│   │   │                          • وضع المقاومة: V/I
│   │   │
│   │   └── solver-faults.ts    ← كشف الأعطال (DC + AC)
│   │                              DC: short-circuit, overheating, breaker, fuse,
│   │                                  lamp overvoltage, diode overvoltage, LED overvoltage,
│   │                                  motor overcurrent, open-circuit, voltage-mismatch,
│   │                                  polarity-mismatch, direct-short
│   │                              AC: short-circuit, overheating, lamp overvoltage,
│   │                                  capacitor overvoltage, inductor overcurrent,
│   │                                  open-circuit
│   │
│   ├── ── الرسم (Drawing) ──
│   │   ├── drawComponent.ts    ← رسم المكونات (3D + 2D)
│   │   │                          drawComponent() — التوجيه حسب النوع
│   │   │                          drawComponentIcon() — أيقونات للـ Palette
│   │   │                          drawLED() — دايود ضوئي (تدرج أحمر + لمعان)
│   │   │                          drawPotentiometer() — مقاومة متغيرة (مستطيل + knob)
│   │   │                          drawMotor() — محرك (قرص دوار 3 شفرات)
│   │   │
│   │   ├── drawWire.ts         ← رسم الأسلاك
│   │   │                          • تدرج لوني + ظل + تحديد
│   │   │                          • نقاط اتصال + تقاطعات (hop-over arcs)
│   │   │                          • Current flow animation (نقاط صفراء متحركة)
│   │   │                          • pointAlongPath() — حساب موضع النقطة
│   │   │                          • getTerminalWorldPos() — موضع الطرف العالمي
│   │   │
│   │   ├── drawHelpers.ts      ← دوال رسم مساعدة
│   │   │                          roundRect(), drawTerminals(), DrawCtx, RenderMode
│   │   │
│   │   ├── draw3d-passive.ts   ← رسم 3D: battery, resistor, capacitor, inductor, lamp
│   │   ├── draw3d-switches.ts  ← رسم 3D: relay, breaker, fuse
│   │   ├── draw3d-multimeter.ts← رسم 3D: multimeter
│   │   ├── draw3d-advanced.ts  ← رسم 3D: acsource, transformer, oscilloscope
│   │   ├── draw2d-basic.ts     ← رسم 2D: battery, resistor, capacitor, inductor, diode,
│   │   │                          switch, lamp, ammeter, voltmeter
│   │   ├── draw2d-advanced.ts  ← رسم 2D: relay, breaker, fuse, ground, multimeter,
│   │   │                          acsource, transformer, oscilloscope
│   │   ├── resistorColors.ts   ← ألوان المقاومات (4 bands)
│   │   │                          RESISTOR_COLORS, valueToResistorBands(), getResistorBandColors()
│   │   │
│   │   ├── smartWire.ts        ← التوجيه الذكي للأسلاك
│   │   ├── smartWireHelpers.ts ← دوال مساعدة للتوجيه
│   │   └── wireCrossings.ts    ← كشف ورسم تقاطعات الأسلاك
│   │
│   ├── ── إدارة الورشة (State) ──
│   │   ├── useWorkshop.ts      ← المكوّن الرئيسي لإدارة الحالة
│   │   │                          • components, wires, running, selectedComponentId
│   │   │                          • addComponent, moveComponent, rotateComponent
│   │   │                          • addWire, removeWire, updateWireColor
│   │   │                          • loadExperiment() — تحميل تجربة
│   │   │                          • run(), stop(), solve(), solveAC()
│   │   │                          • solveTransient(), solveTransientDC()
│   │   │                          • totalPower, totalCurrent, totalVoltage
│   │   │                          • undo, redo (history)
│   │   │                          • saveCircuit, loadCircuit, deleteCircuit
│   │   │                          • isACMode (computed)
│   │   │
│   │   ├── useWorkshopCanvas.ts← إدارة Canvas (رسم + hit-test + pan/zoom)
│   │   │                          • drawAll() — رسم كل المكونات والأسلاك
│   │   │                          • hitTestComponent(), hitTestWire()
│   │   │                          • hitTestWireJunction(), hitTestWireSegment()
│   │   │                          • worldToScreen(), screenToWorld()
│   │   │                          • WorkshopCanvasProps (مع animTime, wireCurrents)
│   │   │
│   │   ├── useAnimationLoop.ts ← حلقة الرسوم المتحركة
│   │   │                          • requestAnimationFrame
│   │   │                          • تحديث animTime للـ current flow
│   │   │                          • حساب elapsedSeconds, energyKWh
│   │   │
│   │   ├── useComponentEditor.ts  ← محرر قيم المكونات
│   │   ├── useEditActions.ts      ← إجراءات التحرير (copy, paste, delete)
│   │   ├── useSelectionSync.ts    ← مزامنة التحديد
│   │   ├── useTouchEvents.ts      ← أحداث اللمس
│   │   ├── useCircuitDialogs.ts   ← حوارات (save, load, help)
│   │   ├── useResistorData.ts     ← بيانات المقاومات
│   │   │
│   │   ├── workshopComponents.ts  ← عمليات المكونات
│   │   │                          • createTerminals() — إنشاء أطراف (2, 3, 4, 5)
│   │   │                          • addComponent(), removeComponent()
│   │   │                          • moveComponent(), rotateComponent()
│   │   │                          • insertAmmeterIntoWire()
│   │   │                          • updateComponentValue()
│   │   │
│   │   ├── workshopWires.ts      ← عمليات الأسلاك
│   │   │                          • addWire(), addWireFromJunction()
│   │   │                          • removeWire(), updateWireColor()
│   │   │                          • moveWirePoint(), rerouteAllWires()
│   │   │
│   │   ├── workshopSolver.ts     ← منسق الحلّال
│   │   │                          • solve() — DC مع relay iteration
│   │   │                          • solveAC() — AC phasor
│   │   │                          • solveTransient() — AC transient + oscilloscope
│   │   │                          • solveTransientDC() — DC transient + oscilloscope
│   │   │                          • getPower() — حساب الاستطاعة
│   │   │
│   │   ├── workshopHistory.ts    ← التاريخ (undo/redo)
│   │   ├── workshopStorage.ts    ← حفظ/تحميل من localStorage
│   │   ├── workshopExport.ts     ← تصدير PNG + طباعة
│   │   ├── workshopRedraw.ts     ← إعادة الرسم
│   │   │
│   │   ├── nodeGraph.ts          ← بناء الرسم البياني للعقد (Union-Find)
│   │   │                          • buildNodeGraph() — تجميع الأطراف المتصلة
│   │   │                          • auto-ground (battery negative أو acsource)
│   │   │
│   │   ├── workshopExperimentsDC.ts  ← تجارب DC (القديمة)
│   │   │                                  ohm, series, parallel, mixed, kvl, kcl,
│   │   │                                  vdivider, cdivider, bseries, bparallel, relay
│   │   │
│   │   ├── workshopExperimentsDC2.ts  ← تجارب DC (الجديدة)
│   │   │                                  rc_charge, rl_transient, wheatstone,
│   │   │                                  thevenin, superposition, maxpower
│   │   │
│   │   └── workshopExperimentsAC.ts   ← تجارب AC
│   │                                      ac_rl, ac_rc, ac_rlc, ac_transformer,
│   │                                      ac_filter, ac_powerfactor, ac_resonance
│   │
│   ├── ── CSS ──
│   │   ├── workshopCanvas.css      ← أنماط Canvas
│   │   ├── workshopTopBar.css      ← أنماط الشريط العلوي
│   │   ├── workshopBottomBar.css   ← أنماط الشريط السفلي
│   │   ├── workshopFaults.css      ← أنماط الأعطال + لمبات التحذير
│   │   ├── workshopOverlays.css    ← أنماط الطبقات
│   │   ├── workshopPalette.css     ← أنماط لوحة المكونات
│   │   ├── workshopReadings.css    ← أنماط لوحة القراءات
│   │   ├── workshopResistor.css    ← أنماط مدرج الألوان
│   │   ├── workshopDialogs.css     ← أنماط الحوارات
│   │   └── workshopFullscreen.css  ← أنماط ملء الشاشة
│   │
│   └── ac-meters.test.ts           ← اختبارات AC meters
│
├── dc/                             ← مختبر DC (16 عنصر)
│   ├── DCLab.vue                   ← المكوّن الرئيسي لمختبر DC
│   │                                  • canvasProps مع animTime, wireCurrents
│   │                                  • loadExp() — تحميل تجربة
│   │                                  • explainCalcs() — شرح الحسابات
│   │                                  • إدارة الحوارات (save, load, help, fault)
│   │
│   ├── DCTopBar.vue                ← الشريط العلوي (أدوات، عرض، مساعدة)
│   ├── DCBottomBar.vue             ← الشريط السفلي (run, experiments, undo/redo)
│   │                                  • قائمة التجارب (17 تجربة)
│   │                                  • لمبات التحذير (🔴🟡🟢)
│   │                                  • قائمة الأعطال
│   │
│   ├── DCPalette.vue               ← لوحة المكونات (مصدر، passive, active, قياس، حماية)
│   ├── DCReadingsPanel.vue         ← لوحة القراءات (V, I, P, energy)
│   ├── DCDialogs.vue               ← حوارات (save, load, help, fault details, resistor)
│   ├── ComponentIconCanvas.vue     ← رسم أيقونة مكون في الـ Palette
│   │
│   ├── dcCanvasState.ts            ← حالة Canvas (pan, zoom, drag)
│   ├── dcMouseEvents.ts            ← أحداث الفأرة (drag, click, connect)
│   ├── dcOtherEvents.ts            ← أحداث أخرى (wheel, dblclick, keyboard)
│   │
│   ├── dcExplainCalcs.ts           ← منسق شرح الحسابات
│   ├── dcExplainCalcs1.ts          ← شرح: ohm, series, parallel, mixed, kvl, kcl
│   ├── dcExplainCalcs2.ts          ← شرح: vdivider, cdivider, bseries, bparallel, relay
│   ├── dcExplainCalcs3.ts          ← شرح: rc_charge, rl_transient, wheatstone,
│   │                                  thevenin, superposition, maxpower
│   │
│   ├── dcLabLayout.css             ← تخطيط المختبر
│   └── dcLabScoped.css             ← أنماط خاصة
│
└── ac/                             ← مختبر AC (15 عنصر)
    ├── ACLab.vue                   ← المكوّن الرئيسي لمختبر AC
    │                                  • canvasProps مع animTime, wireCurrents
    │                                  • loadExp() — تحميل تجربة
    │                                  • explainCalcs() — شرح الحسابات
    │
    ├── ACTopBar.vue                ← الشريط العلوي
    ├── ACBottomBar.vue             ← الشريط السفلي
    │                                  • قائمة التجارب (7 تجارب)
    │                                  • لمبات التحذير (🔴🟡🟢)
    │                                  • قائمة الأعطال
    │
    ├── ACPalette.vue               ← لوحة المكونات AC
    ├── ACReadingsPanel.vue         ← لوحة القراءات AC
    ├── ACDialogs.vue               ← حوارات AC
    ├── ComponentIconCanvas.vue     ← رسم أيقونة مكون
    │
    ├── acCanvasState.ts            ← حالة Canvas AC
    ├── acMouseEvents.ts            ← أحداث الفأرة AC
    ├── acOtherEvents.ts            ← أحداث أخرى AC
    │
    ├── acExplainCalcs.ts           ← منسق شرح الحسابات AC
    ├── acExplainCalcs1.ts          ← شرح: ac_rl, ac_rc
    ├── acExplainCalcs2.ts          ← شرح: ac_rlc, ac_transformer, ac_filter
    │                                  (ac_powerfactor, ac_resonance في acExplainCalcs.ts)
    │
    ├── acLabLayout.css             ← تخطيط المختبر AC
    └── acLabScoped.css             ← أنماط خاصة AC
```

---

## 4. الإحصائيات

| القسم | العدد |
|-------|-------|
| **ملفات الورشة الكهربائية** | 87 ملف |
| **ملفات shared** | 55 ملف |
| **ملفات dc/** | 16 ملف |
| **ملفات ac/** | 15 ملف |
| **المكونات المدعومة** | 20 مكون |
| **تجارب DC** | 17 تجربة |
| **تجارب AC** | 7 تجارب |
| **إجمالي التجارب** | 24 تجربة |
| **اللغات المدعومة** | 3 (عربي/إنجليزي/إسباني) |
| **حلّالات (Solvers)** | 4 (DC, AC, AC-transient, DC-transient) |
| **أنواع الأعطال المكتشفة** | 12 (DC) + 6 (AC) |
| **vue-tsc** | ✅ 0 errors |

---

## 5. المكونات المدعومة

| المكون | النوع | الأطراف | DC | AC | Transient | الرسم |
|--------|------|---------|----|----|-----------|-------|
| battery | مصدر | 2 | ✅ | — | ✅ | 3D+2D |
| resistor | passive | 2 | ✅ | ✅ | ✅ | 3D+2D |
| capacitor | passive | 2 | ✅ | ✅ | ✅ | 3D+2D |
| inductor | passive | 2 | ✅ | ✅ | ✅ | 3D+2D |
| diode | active | 2 | ✅ | — | ✅ | 3D+2D |
| switch | active | 2 | ✅ | ✅ | ✅ | 3D+2D |
| lamp | misc | 2 | ✅ | ✅ | ✅ | 3D+2D |
| ammeter | قياس | 2 | ✅ | ✅ | ✅ | 3D+2D |
| voltmeter | قياس | 2 | ✅ | ✅ | ✅ | 3D+2D |
| relay | active | 5 | ✅ | — | ✅ | 3D+2D |
| breaker | حماية | 2 | ✅ | — | ✅ | 3D+2D |
| fuse | حماية | 2 | ✅ | — | ✅ | 3D+2D |
| ground | misc | 2 | ✅ | ✅ | ✅ | 3D+2D |
| multimeter | قياس | 2 | ✅ | ✅ | — | 3D+2D |
| acsource | مصدر | 2 | — | ✅ | ✅ | 3D+2D |
| transformer | passive | 4 | — | ✅ | ✅ | 3D+2D |
| oscilloscope | قياس | 2 | — | ✅ | ✅ | 3D+2D |
| **led** | active | 2 | ✅ | ✅ | ✅ | custom |
| **potentiometer** | passive | 3 | ✅ | ✅ | ✅ | custom |
| **motor** | active | 2 | ✅ | ✅ | ✅ | custom |

---

## 6. التجارب

### DC (17 تجربة)
| التجربة | الوصف |
|---------|-------|
| ohm | قانون أوم |
| series | توصيل على التوالي |
| parallel | توصيل على التفرع |
| mixed | توصيل مختلط |
| kvl | قانون كيرشوف للجهد |
| kcl | قانون كيرشوف للتيار |
| vdivider | مقسم الجهد |
| cdivider | مقسم التيار |
| bseries | بطاريات على التوالي |
| bparallel | بطاريات على التفرع |
| relay | ريليه (مرحّل) |
| rc_charge | شحن مكثف RC |
| rl_transient | استجابة ملف RL |
| wheatstone | جسر وتستون |
| thevenin | نظرية ثيفينين |
| superposition | مبدأ التراكب |
| maxpower | نقل القدرة العظمى |

### AC (7 تجارب)
| التجربة | الوصف |
|---------|-------|
| ac_rl | دائرة RL |
| ac_rc | دائرة RC |
| ac_rlc | دائرة RLC |
| ac_transformer | محول |
| ac_filter | مرشح تمرير منخفض |
| ac_powerfactor | معامل القدرة |
| ac_resonance | الرنين الكهربائي |

---

## 7. بنية البيانات

```
WorkshopComponent
├── id: number
├── type: ComponentType (20 نوع)
├── x, y: number (الموضع)
├── rotation: number (0/90/180/270)
├── value: number (القيمة)
├── unit: string
├── label: string
├── closed: boolean (للمفتاح)
├── terminals: Terminal[]
├── voltage: number (الجهد المحسوب)
├── current: number (التيار المحسوب)
├── relayCoilTerminals?: [Terminal, Terminal]
├── relayState?: boolean
├── breakerTripped?: boolean
├── breakerRating?: number
├── fuseBlown?: boolean
├── multimeterMode?: 'voltage' | 'current' | 'resistance'
├── probeBlack/probeRed?: {x, y}
├── clampPos?: {x, y}
├── clampWireId?: number
├── scale?: number
├── acFrequency?: number
├── acPhase?: number
├── acAmplitude?: number
├── transformerRatio?: number
├── oscilloscopeTrace?: {t, v}[]
├── voltageRe/voltageIm?: number (AC phasor)
└── currentRe/currentIm?: number (AC phasor)

WorkshopWire
├── id: number
├── fromCompId: number
├── fromTerminalIndex: number
├── toCompId: number
├── toTerminalIndex: number
├── color: string
├── thickness: number
├── points: {x, y}[]
├── fromWireId?: number (junction)
├── fromWirePointIndex?: number
├── toWireId?: number
├── toWirePointIndex?: number
└── manual?: boolean

Terminal
├── id: number
├── compId: number
├── index: number (0..4)
├── dx, dy: number (إزاحة نسبية)
└── nodeId: number | null (العقدة المخصصة)
```
