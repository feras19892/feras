# خطة بناء مختبر الكيمياء الافتراضي (Chemistry Virtual Lab)

## ملاحظة هامة
هذه الخطة تطابق **بالضبط** بنية المشروع الحالية:
- `apps/web/src/components/experiment/` — مكونات التجربة
- `apps/web/src/composables/` — منطق الفيزياء/الكيمياء
- `apps/web/src/modules/physics/experiments/` ← سنضيف `chemistry/experiments/`
- `apps/web/src/locales/experiments/` — ترجمات
- `apps/web/src/router.ts` — تسجيل المسارات

## قواعد صارمة من MIGRATION_RULES.md
| القاعدة | الحد | التطبيق على الكيمياء |
|---------|------|----------------------|
| `.vue` > 300 سطر | فصل | كل مكون > 300 يتجزأ |
| `.ts` > 200 سطر | فصل | كل composable > 200 يتجزأ |
| `pages/` | تركيب فقط | الصفحة الرئيسية ≤ 50 سطر |
| لا منطق في UI | منفصل | محرك الحالة في composables |

---

## 1. هيكل الملفات النهائي (Tree)

```
apps/web/src/
│
├── components/experiment/chemistry/
│   ├── panels/
│   │   ├── ChemInventoryPanel.vue      (~90 سطر) — رفوف المواد
│   │   ├── ChemToolsPanel.vue          (~85 سطر) — أدوات المختبر
│   │   ├── ChemReadingsPanel.vue       (~95 سطر) — قراءات pH & °C
│   │   ├── ChemInstructionsPanel.vue   (~110 سطر) — خطوات السيناريو
│   │   └── ChemReportPanel.vue         (~80 سطر) — لوحة التقرير
│   ├──
│   ├── ChemCanvas.vue                  (~180 سطر) — لوحة الرسم
│   ├── ChemControlBar.vue              (~75 سطر) — أزرار التحكم السفلية
│   ├── ChemHelpModal.vue               (~60 سطر) — مساعدة
│   ├── ChemMenuBar.vue                 (~100 سطر) — شريط القوائم العلوي
│   ├── ChemPanelBody.vue               (~70 سطر) — موجه اللوحات
│   ├── ChemStatusBar.vue               (~65 سطر) — شريط الحالة
│   └── ChemOverlayPanels.vue           (~90 سطر) — لوحات طافية
│
├── composables/chemistry/
│   ├── registries/
│   │   ├── substance-registry.ts       (~120 سطر) — سجل المواد
│   │   └── reaction-registry.ts        (~150 سطر) — سجل التفاعلات
│   ├──
│   ├── engine/
│   │   ├── container-state.ts          (~90 سطر) — حالة الأوعية
│   │   ├── mixing-algorithm.ts         (~80 سطر) — خوارزمية المزج
│   │   ├── reaction-resolver.ts        (~130 سطر) — معالج التفاعلات
│   │   └── thermal-logic.ts            (~70 سطر) — منطق الحرارة
│   ├──
│   ├── canvas/
│   │   ├── draw-lab-table.ts           (~60 سطر) — رسم الطاولة
│   │   ├── draw-glassware.ts           (~140 سطر) — رسم الأواني
│   │   ├── draw-liquid.ts              (~90 سطر) — رسم السوائل
│   │   └── particle-system.ts          (~110 سطر) — جسيمات النار/الفقاعات
│   ├──
│   ├── scenario/
│   │   ├── scenario-types.ts           (~60 سطر) — أنواع بيانات السيناريو
│   │   ├── scenario-loader.ts          (~70 سطر) — محمل السيناريو
│   │   └── success-checker.ts          (~80 سطر) — فاحص شروط النجاح
│   ├──
│   ├── useChemistryExperiment.ts       (~170 سطر) — حالة التجربة الرئيسية
│   ├── useChemistryLayout.ts           (~90 سطر) — تخطيط اللوحات
│   ├── useChemistryTrials.ts           (~100 سطر) — القراءات والتجارب
│   └── useChemistryRenderer.ts         (~140 سطر) — محرك الرسم
│
├── modules/physics/experiments/
│   └── chemistry/
│       └── ChemistryExperiment.vue     (~45 سطر) — صفحة التجربة (تركيب فقط)
│
├── locales/experiments/
│   ├── ar-chemistry.ts                 (~100 سطر)
│   ├── en-chemistry.ts                 (~100 سطر)
│   ├── es-chemistry.ts                 (~100 سطر)
│   └── index.ts                        (+3 imports)
│
└── router.ts                           (+1 route)
```

**إجمالي الملفات الجديدة:** 38 ملف
**أكبر ملف متوقع:** `draw-glassware.ts` ~140 سطر (< 200 ✓)
**أكبر مكون متوقع:** `ChemCanvas.vue` ~180 سطر (< 300 ✓)

---

## 2. تفاصيل الطبقات الأربع

### الطبقة 1: قاعدة البيانات الكيميائية (Registries)

#### A. `substance-registry.ts` (~120 سطر)
يصف كل المواد الكيميائية المتاحة في النظام.

```ts
export interface ChemicalSubstance {
  id: string;              // "hcl", "naoh", "phenolphthalein"
  nameAr: string;
  nameEn: string;
  formula: string;         // "HCl", "NaOH"
  state: 'solid' | 'liquid' | 'gas';
  defaultColor: string;     // hex color
  defaultPh: number;      // 0–14
  defaultTemp: number;      // °C
  density: number;          // g/ml
  boilingPoint?: number;    // °C
  hazardous: boolean;
}

export const SUBSTANCE_REGISTRY: Record<string, ChemicalSubstance> = {
  hcl: { id: 'hcl', nameAr: 'حمض كلور الماء', nameEn: 'Hydrochloric Acid', ... },
  naoh: { id: 'naoh', nameAr: 'هيدروكسيد الصوديوم', nameEn: 'Sodium Hydroxide', ... },
  water: { id: 'water', nameAr: 'ماء', nameEn: 'Water', ... },
  phenolphthalein: { id: 'phenolphthalein', nameAr: 'فينول فثالين', nameEn: 'Phenolphthalein', ... },
};
```

#### B. `reaction-registry.ts` (~150 سطر)
يصف "وصفات" التفاعلات الكيميائية.

```ts
export interface ReactionRecipe {
  id: string;
  nameAr: string;
  nameEn: string;
  reactants: Array<{ substanceId: string; minMoles: number }>;
  products: Array<{ substanceId: string; moleRatio: number }>;
  energyChange: 'exothermic' | 'endothermic' | 'neutral';
  deltaTemp: number;       // درجة التغير في الحرارة
  visualEffects: VisualEffect[];
  rateConstant: number;    // سرعة التفاعل
}

export type VisualEffect =
  | { type: 'colorChange'; from: string; to: string; durationMs: number }
  | { type: 'gasBubbles'; intensity: number }
  | { type: 'precipitate'; color: string };

export const REACTION_REGISTRY: ReactionRecipe[] = [
  {
    id: 'neutralization-hcl-naoh',
    reactants: [{ substanceId: 'hcl', minMoles: 0.001 }, { substanceId: 'naoh', minMoles: 0.001 }],
    products: [{ substanceId: 'water', moleRatio: 1 }, { substanceId: 'nacl', moleRatio: 1 }],
    energyChange: 'exothermic',
    deltaTemp: 5.5,
    visualEffects: [{ type: 'colorChange', from: 'clear', to: 'clear', durationMs: 0 }],
    rateConstant: 0.8,
  },
  // ...
];
```

---

### الطبقة 2: محرك الحالة الفيزيوكيميائية (Engine)

#### A. `container-state.ts` (~90 سطر)
يدير ما بداخل كل دورق/قنينة.

```ts
export interface ContainerContent {
  substances: Array<{
    substanceId: string;
    volumeMl: number;
    moles: number;
  }>;
  totalVolume: number;
  currentPh: number;
  currentTemp: number;
  currentColor: string;
  activeReactions: string[]; // IDs of running reactions
}

export function createEmptyContainer(): ContainerContent;
export function addSubstance(container: ContainerContent, substanceId: string, volumeMl: number): void;
export function getMixtureColor(container: ContainerContent): string;
```

#### B. `mixing-algorithm.ts` (~80 سطر)
عند صب مادة فوق أخرى.

```ts
export function mixContents(
  target: ContainerContent,
  source: ContainerContent,
  volumeToPour: number
): MixingResult;

export interface MixingResult {
  newVolume: number;
  newPh: number;
  newTemp: number;
  newColor: string;
  reactionsTriggered: string[];
}
```

#### C. `reaction-resolver.ts` (~130 سطر)
يفحص السجل بعد كل مزج/تسخين.

```ts
export function resolveReactions(container: ContainerContent): ReactionStep[];

export interface ReactionStep {
  reactionId: string;
  progress: number;          // 0.0 – 1.0
  timeRemainingMs: number;
  visualEffects: VisualEffect[];
}

export function tickReactions(
  container: ContainerContent,
  activeSteps: ReactionStep[],
  dtMs: number
): void;
```

#### D. `thermal-logic.ts` (~70 سطر)
موقد بنزن + تسخين/غليان.

```ts
export interface BurnerState {
  on: boolean;
  flameIntensity: number;  // 0–1
  fuelRemaining: number;     // seconds
}

export function tickThermal(
  container: ContainerContent,
  burner: BurnerState,
  ambientTemp: number,
  dtMs: number
): void;

export function getBoilingState(container: ContainerContent): 'calm' | 'bubbling' | 'boiling';
```

---

### الطبقة 3: محرك الرسم البصري (Canvas)

#### A. `draw-lab-table.ts` (~60 سطر)
رسم خلفية طاولة المختبر مع شبكة خفيفة.

#### B. `draw-glassware.ts` (~140 سطر)
رسم الأواني الزجاجية بأبعاد ديناميكية:
- **Beaker** (دورق) — جسم أسطواني + ساعد + فم عريض
- **Erlenmeyer** (مخبار) — قاعدة مستديرة + جسم مخروطي + ساعد
- **Burette** (سحاحة) — أنبوب رفيع + صنبور + مقياس ملي
- **TestTube** (أنبوب اختبار) — أنبوب صغير

#### C. `draw-liquid.ts` (~90 سطر)
رسم السائل داخل الوعاء:
- الارتفاع ∝ الحجم (volume)
- اللون ∝ الخليط ( mixture color )
- موجات سطحية خفيفة عند التحرك
- فقاعات داخلية إذا كان يغلي

#### D. `particle-system.ts` (~110 سطر)
حركات بصرية:
- **نار الموقد** — جسيمات برتقالية/صفراء تصعد وتتلاشي
- **فقاعات غاز** — دوائر صغيرة تصعد من قاع السائل
- **بخار غليان** — ضباب أبيض شفاف عند الفم
- **تدرج لون** — عند تغير لون التفاعل

---

### الطبقة 4: الواجهات والسيناريو (UI + Scenario)

#### A. `scenario-types.ts` (~60 سطر)

```ts
export interface ScenarioConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  description: string;
  allowedSubstances: string[];     // IDs من SubstanceRegistry
  allowedTools: ToolType[];         // ['beaker', 'burette', 'burner', 'phMeter']
  instructions: InstructionStep[];
  targetConditions: SuccessCondition[];
  hints: string[];
}

export interface InstructionStep {
  step: number;
  textAr: string;
  textEn: string;
  condition: 'always' | { toolUsed?: string; substanceAdded?: string };
}

export interface SuccessCondition {
  metric: 'ph' | 'volume' | 'temp' | 'color' | 'reactionCompleted';
  target: number | string;
  tolerance?: number;
  containerId?: string;           // أي وعاء يُفحص
}

export type ToolType = 'beaker' | 'erlenmeyer' | 'burette' | 'burner' | 'phMeter' | 'thermometer' | 'stirrer';
```

#### B. سيناريو تجريبي: `acid-base-titration.ts` (~80 سطر)

```ts
export const ACID_BASE_TITRATION: ScenarioConfig = {
  id: 'acid-base-titration',
  titleAr: 'معايرة حمض وقاعدة',
  titleEn: 'Acid-Base Titration',
  allowedSubstances: ['hcl', 'naoh', 'water', 'phenolphthalein'],
  allowedTools: ['erlenmeyer', 'burette', 'burner', 'phMeter'],
  instructions: [
    { step: 1, textAr: 'ضع 25 مل من HCl في المخبار', textEn: 'Place 25ml HCl in Erlenmeyer', condition: 'always' },
    { step: 2, textAr: 'أضف 3 قطرات من الفينول فثالين', textEn: 'Add 3 drops phenolphthalein', condition: 'always' },
    { step: 3, textAr: 'املأ السحاحة بـ NaOH', textEn: 'Fill burette with NaOH', condition: 'always' },
    { step: 4, textAr: 'أضف NaOH قطره بحذر حتى يتغير اللون إلى زهري', textEn: 'Add NaOH dropwise until pink', condition: 'always' },
  ],
  targetConditions: [
    { metric: 'ph', target: 7, tolerance: 0.5, containerId: 'erlenmeyer-1' },
    { metric: 'color', target: '#ff69b4', containerId: 'erlenmeyer-1' },
  ],
};
```

---

## 3. تدفق البيانات (Data Flow)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ScenarioConfig (ملف خارجي)                                              │
│  └─ allowedSubstances, allowedTools, instructions, targetConditions       │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │ inject
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  useChemistryExperiment.ts (الحالة الرئيسية)                             │
│  ├─ scenario: Ref<ScenarioConfig>                                        │
│  ├─ containers: Map<string, ContainerContent>                            │
│  ├─ burner: BurnerState                                                  │
│  ├─ currentInstruction: number                                           │
│  ├─ success: boolean                                                     │
│  └─ tick(dt) ──► يستدعي engine ┌─────────────────────┐                  │
│                                │ mixing-algorithm.ts   │                  │
│                                │ reaction-resolver.ts  │                  │
│                                │ thermal-logic.ts      │                  │
│                                └─────────────────────┘                  │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │ emit drawables
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  useChemistryRenderer.ts (محرك الرسم)                                      │
│  ├─ يستقبل ContainerContent[] + BurnerState + ParticleState[]           │
│  ├─ يستدعي ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐  │
│  │         │ draw-lab-table.ts  │ │ draw-glassware.ts│ │ draw-liquid.ts│  │
│  │         └──────────────────┘ └──────────────────┘ └──────────────┘  │
│  └─ يرسم على Canvas                                                    │
└──────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  ChemCanvas.vue ──► يعرض الصورة الحية                                    │
│  ChemInventoryPanel ──► يُفلتر المواد حسب scenario.allowedSubstances     │
│  ChemToolsPanel ──► يُفلتر الأدوات حسب scenario.allowedTools               │
│  ChemInstructionsPanel ──► يعرض instructions[currentInstruction]        │
│  ChemReadingsPanel ──► يعرض pH, °C من ContainerContent                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. خطة التنفيذ المجزأة (Phases)

### المرحلة 1: الأساس — Registries + Types
**الملفات:** 5 | **الوقت المقدر:** 1 جلسة

| # | الملف | السطور | الهدف |
|---|-------|--------|-------|
| 1.1 | `substance-registry.ts` | ~120 | تعريف 8–10 مواد كيميائية |
| 1.2 | `reaction-registry.ts` | ~150 | تعريف 3–4 تفاعلات |
| 1.3 | `scenario-types.ts` | ~60 | interfaces السيناريو |
| 1.4 | `acid-base-titration.ts` | ~80 | أول سيناريو تجريبي |
| 1.5 | `container-state.ts` | ~90 | حالة الوعاء + addSubstance |

**نتيجة المرحلة 1:** لدينا "العقل المعرفي" — نستطيع أن نصف مادة ونرى خصائصها.

---

### المرحلة 2: المحرك — Mixing + Reactions + Thermal
**الملفات:** 4 | **الوقت المقدر:** 1–2 جلسة

| # | الملف | السطور | الهدف |
|---|-------|--------|-------|
| 2.1 | `mixing-algorithm.ts` | ~80 | صب مادة → حجم + pH + لون جديد |
| 2.2 | `reaction-resolver.ts` | ~130 | فحص التفاعلات + تشغيلها تدريجياً |
| 2.3 | `thermal-logic.ts` | ~70 | تسخين + غليان + تبريد |
| 2.4 | `success-checker.ts` | ~80 | مقارنة الحالة بـ targetConditions |

**نتيجة المرحلة 2:** المحرك يستطيع محاكاة "صب HCl + NaOH → تغير pH + تغير لون".

---

### المرحلة 3: الرسم — Canvas Engine
**الملفات:** 5 | **الوقت المقدر:** 2–3 جلسات

| # | الملف | السطور | الهدف |
|---|-------|--------|-------|
| 3.1 | `draw-lab-table.ts` | ~60 | خلفية طاولة المختبر |
| 3.2 | `draw-glassware.ts` | ~140 | دورق، مخبار، سحاحة |
| 3.3 | `draw-liquid.ts` | ~90 | سائل ديناميكي داخل الوعاء |
| 3.4 | `particle-system.ts` | ~110 | نار + فقاعات + بخار |
| 3.5 | `useChemistryRenderer.ts` | ~140 | يربط المحرك بالـ Canvas |

**نتيجة المرحلة 3:** نرى وعاءً فيه سائل أزرق يتحول إلى زهري عند إضافة NaOH.

---

### المرحلة 4: الواجهات — UI Components
**الملفات:** 10 | **الوقت المقدر:** 2–3 جلسات

| # | الملف | السطور | الهدف |
|---|-------|--------|-------|
| 4.1 | `ChemCanvas.vue` | ~180 | اللوحة التفاعلية + pointer events |
| 4.2 | `ChemInventoryPanel.vue` | ~90 | رفوف مواد مُفلترة |
| 4.3 | `ChemToolsPanel.vue` | ~85 | أدوات مُفلترة |
| 4.4 | `ChemReadingsPanel.vue` | ~95 | pH + °C + حجم |
| 4.5 | `ChemInstructionsPanel.vue` | ~110 | خطوات السيناريو |
| 4.6 | `ChemControlBar.vue` | ~75 | start/pause/reset/record |
| 4.7 | `ChemMenuBar.vue` | ~100 | export CSV, toggle panels, help |
| 4.8 | `ChemStatusBar.vue` | ~65 | running/paused/success |
| 4.9 | `ChemPanelBody.vue` | ~70 | موجه اللوحات |
| 4.10 | `ChemOverlayPanels.vue` | ~90 | maximize/minimize |

**نتيجة المرحلة 4:** واجهة كاملة قابلة للتفاعل.

---

### المرحلة 5: التركيب — Shell + Router + i18n
**الملفات:** 5 | **الوقت المقدر:** 1 جلسة

| # | الملف | السطور | الهدف |
|---|-------|--------|-------|
| 5.1 | `useChemistryExperiment.ts` | ~170 | يربط كل شيء معاً |
| 5.2 | `useChemistryLayout.ts` | ~90 | تخطيط اللوحات |
| 5.3 | `useChemistryTrials.ts` | ~100 | تسجيل القراءات |
| 5.4 | `ChemistryExperiment.vue` | ~45 | الصفحة الرئيسية (تركيب فقط) |
| 5.5 | `ar-chemistry.ts` + `en-chemistry.ts` + `es-chemistry.ts` | ~100×3 | ترجمات |
| 5.6 | `router.ts` | +5 | مسار `/chemistry/acid-base` |
| 5.7 | `experiment-catalog.ts` | +3 | إضافة الكيمياء للكتالوج |

**نتيجة المرحلة 5:** التجربة شغّالة بالكامل، قابلة للوصول من القائمة.

---

### المرحلة 6: اختبار + تقرير
**الوقت المقدر:** 1 جلسة

- اختبار سيناريو المعايرة يدوياً
- التأكد من شروط النجاح تعمل
- تصدير CSV
- إرسال تقرير إلى API

---

## 5. ملخص الالتزام بالقواعد

| القاعدة | الوضع |
|---------|-------|
| `.vue` ≤ 300 سطر | ✓ أكبر مكون `ChemCanvas.vue` ~180 سطر |
| `.ts` ≤ 200 سطر | ✓ أكبر composable `reaction-resolver.ts` ~130 سطر |
| `pages/` = تركيب فقط | ✓ `ChemistryExperiment.vue` ~45 سطر |
| منطق منفصل عن UI | ✓ كل المحرك في `composables/chemistry/engine/` |
| i18n | ✓ `locales/experiments/*-chemistry.ts` |
| لا كتابة من عندي | ✓ نقل الأنماط من prism/spring/pendulum |

---

## 6. السيناريوهات المستقبلية (قابلة للإضافة بدون تعديل core)

بمجرد إنجاز المراحل 1–5، إضافة تجربة جديدة = ملف `.ts` واحد فقط:

```ts
// experiments/chemistry/scenarios/precipitation-reaction.ts
export const PRECIPITATION_REACTION: ScenarioConfig = { ... };
```

ثم:
```ts
// router.ts
{ path: '/chemistry/precipitation', component: () => import('...') }
```

لا حاجة لتعديل المحرك أو الواجهات — السيناريو يحقن نفسه.

---

## قرار المستخدم المطلوب

هل تُوافق على هذه الخطة؟

إذا **نعم** — ما هي **المرحلة الأولى** التي تريد البدء بها؟
(أنصح بالبدء بالمرحلة 1: Registries + Types)

إذا **لا** — ما التعديلات المطلوبة؟
