# تقرير الفحص الشامل — محاكي مختبر الكيمياء

> **تاريخ:** 11 يوليو 2026  
> **النطاق:** `apps/web/src/composables/chemistry/` + `apps/web/src/components/experiment/chemistry/` + `packages/chemistry-engine/src/`  
> **إجمالي الأخطاء:** 42 خطأ  
> **الهدف:** ترقيم واضح ومنظم لإصلاح المشاكل خطوة بخطوة

---

## جدول المحتويات

- [القسم الأول: تعارضات الأنواع والبنية (1–9)](#القسم-الأول-تعارضات-الأنواع-والبنية-1–9)
- [القسم الثاني: منطق الحالة والجلسات (10–22)](#القسم-الثاني-منطق-الحالة-والجلسات-10–22)
- [القسم الثالث: محرك التفاعل الكيميائي (23–31)](#القسم-الثالث-محرك-التفاعل-الكيميائي-23–31)
- [القسم الرابع: الأداء والذاكرة (32–37)](#القسم-الرابع-الأداء-والذاكرة-32–37)
- [القسم الخامس: تجربة المستخدم والمساعد (38–42)](#القسم-الخامس-تجربة-المستخدم-والمساعد-38–42)
- [ملخص الأولويات](#ملخص-الأولويات)

---

## القسم الأول: تعارضات الأنواع والبنية (1–9)

### 1. نظام تجارب مزدوج (legacy + registry) مع تعارض IDs

**الملفات:**
- `composables/chemistry/useExperiments.ts` — النظام القديم
- `composables/chemistry/experiments/definitions/*.ts` — النظام الجديد
- `components/experiment/chemistry/ExperimentSelector.vue` — يدمج النظامين

**المشكلة:**  
التجارب `neutralization-hcl-naoh` و `neutralization-ch3cooh-naoh` موجودة في **كلا النظامين** بنفس `id`. `ExperimentSelector.vue` يزيل التكرار بـ:
```typescript
const mergedExperiments = [
  ...listRegistryExperiments(),
  ...legacyExperiments.filter((e) => !registryIds.has(e.id)),
];
```
لكن `ChemistryLanding.vue` يُمرر `activeExperiment` إلى `RightPanel.vue` كـ `Experiment` (legacy type) عبر `as any`:
```typescript
:active-experiment="activeExperiment as any"
```
هذا يكسر أمان الأنواع ويخفي أخطاء وقت التشغيل.

**الإصلاح المقترح:**  
توحيد النظام على الـ registry الجديد، حذف `useExperiments.ts` أو تحويله إلى compatibility layer فقط.

---

### 2. `RightPanel.vue` يستورد `Experiment` من النظام القديم فقط

**الملف:** `components/experiment/chemistry/RightPanel.vue:6`  
```typescript
import type { Experiment } from '../../../composables/chemistry/useExperiments';
```

**المشكلة:**  
`activeExperiment` في `ChemistryLanding.vue` هو `Experiment | ExperimentDefinition | null`، لكن `RightPanel.vue` يقبل فقط `Experiment`. التجارب الجديدة (registry) تُمرر عبر `as any` — لا يوجد تحقق من النوع.

**الإصلاح المقترح:**  
تغيير نوع الـ prop إلى `Experiment | ExperimentDefinition` أو إنشاء union type موحد.

---

### 3. `ExperimentStep` مُعرّف في مكانين بشكل مختلف

**التعريف 1** — `useExperiments.ts:4-8`:
```typescript
export interface ExperimentStep {
  id: number;
  text: string;       // ← نص مباشر (translation key)
  completed?: boolean;
}
```

**التعريف 2** — `experiments/types.ts:112-115`:
```typescript
export interface ExperimentStep {
  id: number;
  textKey: string;    // ← مفتاح ترجمة
}
```

**المشكلة:**  
حقلان مختلفان تمامًا: `text` vs `textKey`. الكود في `ChemistryLanding.vue:54-56` يحاول التوفيق:
```typescript
function stepTextKey(step: { text?: string; textKey?: string }): string {
  return step.textKey || step.text || '';
}
```
هذا يعمل لكنه هش — أي إضافة لحقل جديد في أحد النظامين ستكسر الآخر.

---

### 4. `ExperimentTheory` مُعرّف في مكانين بشكل مختلف

**التعريف 1** — `useExperiments.ts:10-16`:
```typescript
export interface ExperimentTheory {
  title: string;
  sections: { heading: string; content: string }[];
}
```

**التعريف 2** — `experiments/types.ts:46-49`:
```typescript
export interface ExperimentTheory {
  titleKey: string;
  sections: { headingKey: string; contentKey: string }[];
}
```

**المشكلة:**  
`ChemistryLanding.vue:57-66` يحاول التحويل:
```typescript
function expTheory(exp: Experiment | ExperimentDefinition) {
  if ('title' in exp.theory) return exp.theory as any;
  const t2 = exp.theory as any;
  return { title: t(t2.titleKey), sections: t2.sections.map(...) };
}
```
استخدام `as any` مرتين يخفي أخطاء الأنواع تمامًا.

---

### 5. `TitrationReading` مُعرّف بـ 3 تعريفات مختلفة

**التعريف 1** — `useExperiments.ts:27-32`:
```typescript
export interface TitrationReading {
  n: number; volume: number; ph: number | null; color: string;
}
```

**التعريف 2** — `experiments/types.ts:117-122`:
```typescript
export interface TitrationReading {
  n: number; volume: number; ph: number | null; color: string;
}
```

**التعريف 3** — `useTitrationRecorder.ts:5-9`:
```typescript
interface TitrationReading {
  vAdded: number; ph: number; temperature: number;
}
```

**المشكلة:**  
التعريف 3 مختلف تمامًا (لا `n`, لا `color`, يستخدم `vAdded` بدل `volume`, يضيف `temperature`). `ChemistryLanding.vue` يستورد من التعريف 1، بينما `useTitrationRecorder.ts` يستخدم التعريف 3 داخليًا. `TitrationDataTable.vue` يعرض بيانات بالتعريف 1، لكن `ChemAnalysisButton.vue` يبني payload من التعريف 3.

---

### 6. `ReportData` مُعرّف في مكانين بشكل مختلف

**التعريف 1** — `useExperiments.ts:34-43`:
```typescript
export interface ReportData {
  experimentName: string; consumedVolume: number; acidVolume: number;
  baseMolarity: number; calculatedAcidMolarity: number;
  phAtEquivalence: number | null; colorAtEquivalence: string; readingsCount: number;
}
```

**التعريف 2** — `experiments/types.ts:53-84`:
```typescript
export type ReportType = 'titration' | 'precipitation' | 'gas' | 'generic';
export interface ReportTemplate { type: ReportType; fields: ReportField[]; ... }
export interface ReportContext { consumedVolume: number; ... precipitateColor: string | null; gasType: string | null; ... }
```

**المشكلة:**  
نظامان مختلفان تمامًا لتوليد التقارير. `ChemistryLanding.vue:129-161` يتفرع بينهما:
```typescript
if ('nameKey' in exp && exp.reportTemplate) { /* نظام جديد */ }
else { /* نظام قديم */ }
```

---

### 7. `validateExperimentSteps` (legacy) مكرر ولا يُستخدم للتجارب الجديدة

**الملف:** `useExperiments.ts:88-144`  
**المشكلة:**  
الـ validators في النظام القديم hardcoded لـ `neutralization-hcl-naoh` و `neutralization-ch3cooh-naoh` فقط. باقي التجارب تُرجع `all false`. النظام الجديد يستخدم `validateSteps` الـ declarative. لكن `ChemistryLanding.vue:73-74` يتفرق:
```typescript
if ('nameKey' in exp) return validateRegistrySteps(exp);
return validateExperimentSteps(exp);
```
بما أن `ExperimentSelector` يزيل التكرار، الفرع legacy **unreachable** للتجارب المهاجرة — لكنه يبقى محمّلاً في الذاكرة.

---

### 8. `ChemistryLanding.vue` يستورد من النظامين معًا

**الملف:** `ChemistryLanding.vue:12-14`  
```typescript
import { type Experiment, type TitrationReading, type ReportData, validateExperimentSteps } from '../../composables/chemistry/useExperiments';
import { type ExperimentDefinition, validateSteps as validateRegistrySteps, getExperiment as getRegistryExperiment } from '../../composables/chemistry/experiments';
```

**المشكلة:**  
استيراد أنواع ودوال من كلا النظامين في نفس الملف. `getRegistryExperiment` مستورد لكن **غير مستخدم** (dead import). `validateExperimentSteps` مستورد لكن يُستدعى فقط في فرع unreachable.

---

### 9. `experiments` array في `useExperiments.ts` مُصدّر لكن مُكرر

**الملف:** `useExperiments.ts:146-203`  
**المشكلة:**  
`export const experiments: Experiment[]` يحتوي على تعريفات كاملة للتجارب القديمة (خطوات، نظرية، نصوص). هذه التعريفات مكررة بالكامل في `experiments/definitions/`. `ExperimentSelector.vue` يستوردها:
```typescript
import { experiments as legacyExperiments } from '../../../composables/chemistry/useExperiments';
```
لكنها تُرشّح دائمًا من القائمة المدمجة لأن IDs تتطابق مع الـ registry.

---

## القسم الثاني: منطق الحالة والجلسات (10–22)

### 10. `ToolState` مُعرّف في مكانين بشكل غير متوافق

**التعريف 1** — `chemLabTypes.ts:5-22`:
```typescript
export interface ToolState {
  uid: string; type: 'beaker' | 'burette' | 'pipette' | 'other';
  volume: number; maxVolume: number; valveOpen?: boolean;
  color: string; label?: string; temp?: number; ph?: number;
  buretteNumber?: number; gasEvolution?: boolean; gasType?: string;
  precipitate?: boolean; precipitateColor?: string; equation?: string;
  temperature?: number;
}
```

**التعريف 2** — `InspectorPanel.vue` يُصدّر `ToolState` ضمنيًا من `defineProps`، ويستورده `WorkspaceCanvas.vue` و `FloatingInspector.vue` و `RightPanel.vue`:
```typescript
import type { ToolState } from './InspectorPanel.vue';
```

**المشكلة:**  
`InspectorPanel.vue` يستورد `ToolState` من `chemLabTypes.ts` ثم يستخدمه في `defineProps`، مما يجعله مُصدّرًا ضمنيًا. باقي المكونات تستورده منه **كنوع**. تغيير `chemLabTypes.ts` قد يكسر المكونات بصمت.

---

### 11. `buildToolState` يُرجع حقولاً غير مُعرّفة في `ToolState`

**الملف:** `useToolStateBuilder.ts:7-27`  
**المشكلة:**  
`buildToolState` يُرجع كائنات تحتوي على: `opacity`, `stirred`, `heated`, `viscosity`, `density`, `surfaceTension`, `chemicalId`, `indicators`, `baseColor` — لكن `ToolState` في `chemLabTypes.ts` **لا يحتوي على هذه الحقول**.

`FloatingInspector.vue` يصل إلى `state.opacity` و `state.stirred` وغيرها — لكن `ToolState` لا يُعرّفها. TypeScript قد لا يشتكي بسبب التصدير الضمني من `InspectorPanel.vue`، لكن هذا **نوع ضعيف**.

---

### 12. منطق الكشف عن المؤشرات (Indicator Detection) مكرر في 4 أماكن

**الأماكن:**
1. `useDropPhysics.ts:50-51` — `Set` يدوي
2. `usePipetteActions.ts:84` — مصفوفة hardcoded
3. `usePipetteActions.ts:141` — نفس المصفوفة مكررة
4. `usePipetteActions.ts:200` — نفس المصفوفة مكررة ثالثة

**الكود المكرر:**
```typescript
const indicatorIds = new Set(['phenolphthalein', 'methyl-orange', 'bromothymol-blue', 'universal-indicator', 'starch']);
// أو
const isInd = pipChemicalId && ['phenolphthalein', 'methyl-orange', 'bromothymol-blue', 'universal-indicator', 'starch'].includes(pipChemicalId);
```

**المشكلة:**  
بينما `useReactionEngine.ts:2` يستورد `isIndicator` من `@my-modern-app/chemistry-engine`. إذا أُضيف مؤشر جديد في الـ engine، **لن يُكتشف في أي من هذه الأماكن الأربعة**.

**الإصلاح المقترح:**  
استبدال كل المرات بـ `import { isIndicator } from '@my-modern-app/chemistry-engine'`.

---

### 13. `pushHistory()` المُهملة تُستخدم في أماكن حرجة

**الملف:** `useChemistryHistory.ts:201-204`  
```typescript
/** @deprecated Use pushMacroHistory() or pushMicroHistory() explicitly */
export function pushHistory() { pushMacroHistory(); }
```

**أماكن الاستخدام:**
- `useDropPhysics.ts:42` — قطرة سائل منكب
- `usePipetteActions.ts:36, 51, 70, 108, 127, 166, 177, 187` — **كل إجراءات الماصة**

**المشكلة:**  
كل قطرة منكبة وكل سحب/صب بالماصة يُسجّل كـ macro step بدلاً من micro step. المستخدم لن يستطيع التراجع عن قطرة واحدة — بل يتراجع عن كل الإجراء دفعة واحدة.

---

### 14. `clearSession()` لا تُصفّر `spillParticles` أو `buretteWarning` أو `receivingMap`

**الملف:** `useChemistrySession.ts:88-114`  
**المشكلة:**  
`clearSession()` تُصفّر 21 خريطة لكنها **لا تُصفّر**:
- `spillParticles` (مُعرّف في `useChemistryLab.ts:90`)
- `buretteWarning` (مُعرّف في `useLabSimulation.ts:23`)
- `receivingMap` (تُصفّر فقط في حلقة المحاكاة)

بعد `resetLab()`، الجسيمات المنسكبة السابقة تظل مرئية، والتحذير يبقى معروضًا.

---

### 15. `restartExperiment()` يمسح كل الأدوات بدلاً من إعادة الترتيب

**الملف:** `ChemistryLanding.vue:192-199`  
```typescript
function restartExperiment() {
  showReport.value = false;
  reportData.value = null;
  reportFields.value = {};
  reportTemplate.value = null;
  titrationReadings.value = [];
  canvasRef.value?.resetLab();
}
```

**المشكلة:**  
`resetLab()` يستدعي `clearSession()` + `clearHistory()` + `setupInitialLabLayout()`. هذا يمسح **كل الأدوات من المساحة** بدلاً من إعادة الترتيب لتجربة جديدة. كما لا يُصفّر `buretteWarning` أو `clearTitrationReadings()`.

---

### 16. `InspectorPanel.vue` مكوّن ميت لكن مُستورد للنوع

**الملف:** `components/experiment/chemistry/InspectorPanel.vue` (334 سطر)  
**المشكلة:**  
- لا يُستخدم كـ HTML tag في أي مكان
- `FloatingInspector.vue` حلّ محله بالكامل
- باقي المكونات تستورده **فقط للنوع** `ToolState`

إذا حُذف هذا المكوّن، سيتكسر `WorkspaceCanvas.vue` و `RightPanel.vue` و `FloatingInspector.vue`.

**الإصلاح المقترح:**  
نقل `ToolState` إلى `chemLabTypes.ts` (مع تحديثه ليشمل كل الحقول)، ثم حذف `InspectorPanel.vue`.

---

### 17. منطق تحقق legacy مكرر بالكامل و unreachable

**الملف:** `useExperiments.ts:88-144`  
**المشكلة:**  
`validators` object يحتوي على منطق تحقق hardcoded لـ `neutralization-hcl-naoh` و `neutralization-ch3cooh-naoh`. هذا المنطق **مكرر بالكامل** في:
- `experiments/definitions/neutralization-hcl-naoh.ts` (بـ rules)
- `experiments/definitions/neutralization-ch3cooh-naoh.ts` (بـ rules)

بما أن `ExperimentSelector` يزيل التكرار، الفرع legacy **unreachable** — لكنه يبقى محمّلاً.

---

### 18. 3 تعريفات مختلفة لـ `TitrationReading` (تفاصيل في الخطأ 5)

**تأثير إضافي:**  
`useTitrationRecorder.ts` يُسجّل بيانات بحقول (`vAdded`, `temperature`) مختلفة عمّا يعرضه `TitrationDataTable.vue` (`n`, `volume`, `color`). نظاما التسجيل والعرض **غير متصلين**.

---

### 19. إعادة تصدير دوال تزيد bundle size

**الملف:** `useLabSimulation.ts:16-19`  
```typescript
export { phColor, getPhReading } from './usePhMeter';
export { computeBalanceWeight, getContainerWeight, getBalanceReading } from './useBalance';
export { getTemperatureReading } from './useThermometer';
export { stepUndo, stepRedo } from './useStepControl';
```

**المشكلة:**  
أي استيراد من `useLabSimulation` يحمل **كل هذه الدوال** حتى لو لم تكن مطلوبة. يعيق tree-shaking.

---

### 20. حذف `receivingMap` في كل إطار يسبب flicker

**الملف:** `useLabSimulation.ts:95`  
```typescript
Object.keys(receivingMap).forEach(k => delete receivingMap[k]);
```

**المشكلة:**  
هذا يحدث في كل إطار (requestAnimationFrame). بينما `receivingMap` تُستخدم فقط لـ visual feedback. حذف كل المفاتيح في كل إطار قد يسبب **flicker** إذا كان الـ timeout في `useDropPhysics.ts:86` (400ms) لا يزال نشطًا.

---

### 21. `expandedSections` يُستخدم قبل تعريفه

**الملف:** `ChemistryLanding.vue:218` (استخدام) vs `ChemistryLanding.vue:279` (تعريف)  
**المشكلة:**  
يعمل بسبب hoisting في `<script setup>`، لكنه **نمط خطر** — إذا حُوّل إلى composable خارجي سيتكسر.

---

### 22. `onChemicalClick` يكرّر منطق `execAction` للملء

**الملف:** `ChemistryLanding.vue:232-277`  
**المشكلة:**  
يكرّر نفس منطق الملء الموجود في `useExecActions.ts:48-78`. إذا تغيّر منطق الملء في مكان، قد لا يتغير في الآخر.

---

## القسم الثالث: محرك التفاعل الكيميائي (23–31)

### 23. `LabDropper` و `LabWoodenBase` و `LabBeakerClamp` — أدوات بلا تعريف في الرف

**الملفات:**
- `LabItemRenderer.vue:230-263` — يستورد ويرسم هذه المكوّنات
- `useChemistryTools.ts:25-81` — لا يحتوي على `'dropper'`, `'wooden-base'`, `'beaker-clamp'`
- `chemLabIds.ts:25-26` — يُعرّف `isBeakerClamp` و `isWoodenBase`
- `useChemistryLab.ts:79-84` — يُعرّف `beakerClampMap` و `woodenBaseMap`

**المشكلة:**  
مكوّات وخرائط ووظائف لا تُستخدم أبدًا — dead code.

---

### 24. `findEquation` يطابق بشكل جزئي — قد يُرجع معادلة خاطئة

**الملف:** `packages/chemistry-engine/src/equations.ts:315-319`  
```typescript
export function findEquation(reactantIds: string[]): ChemicalEquation | null {
  return equations.find((eq) =>
    eq.reactants.every((r) => reactantIds.includes(r))
  ) || null;
}
```

**المشكلة:**  
يتحقق فقط أن **كل متفاعل في المعادلة** موجود في `reactantIds`. لا يتحقق العكس. مثال: `['hcl', 'naoh', 'phenolphthalein']` سيتطابق مع `['hcl', 'naoh']`.

**الإصلاح المقترح:**  
```typescript
export function findEquation(reactantIds: string[]): ChemicalEquation | null {
  return equations.find((eq) =>
    eq.reactants.length === reactantIds.length &&
    eq.reactants.every((r) => reactantIds.includes(r))
  ) || null;
}
```
أو تطابق مجموعة كاملة (set equality).

---

### 25. `nh3` مُصنّف كـ `gas` لكن `isBase` تعامله كـ base

**الملفات:**
- `type-checks.ts:2` — `isBase = ['naoh', 'koh', 'nh4oh', 'nh3']`
- `chemDataExtended.ts:152` — `nh3` بـ `category: 'gas'`, `physicalState: 'gas'`
- `reactions.ts:11` — `basePKb` لا يحتوي على `nh3`

**المشكلة:**  
`calculateTitrationPh` ستعامل `nh3` كـ weak base لكن `basePKb['nh3']` غير مُعرّف → القيمة الافتراضية `-0.5` (strong base) بينما هو weak base.

---

### 26. `h2o2` حمضي (pH 4.5) لكن غير مُدرج في `isAcid`

**الملفات:**
- `type-checks.ts:1` — `isAcid = ['hcl', 'h2so4', 'hno3', 'ch3cooh']`
- `chemDataExtended.ts:94` — `h2o2` بـ `ph: 4.5`

**المشكلة:**  
لن يتفاعل `h2o2` مع أي قاعدة كتفاعل حمض-قاعدة في `handleDropMix`. يتفاعل فقط كـ redox. خلط `h2o2` مع `naoh` لن يحدث شيئًا.

---

### 27. `useSpillDrops.ts` — O(n²) لرسم خطوط القطرات

**الملف:** `useSpillDrops.ts:76-92`  
```typescript
for (let i = 0; i < drops.length; i++) {
  for (let j = i + 1; j < drops.length; j++) {
    // distance check + draw line
  }
}
```

**المشكلة:**  
حلقة مزدوجة على كل القطرات في كل إطار. مع 50+ قطرة → 2500 عملية لكل إطار. لا يوجد spatial partitioning.

---

### 28. حلقة المحاكاة — O(n²) للكشف عن التسخين

**الملف:** `useLabSimulation.ts:150-165`  
```typescript
for (const item of items.value) {
  if (!isContainer(item.id)) continue;
  const burner = items.value.find((o: LabItem) => { ... });
```

**المشكلة:**  
لكل وعاء، يبحث في كل العناصر للعثور على مصدر حرارة.

---

### 29. `useI18n()` يُستدعى على مستوى الملف خارج Vue context

**الملف:** `useLabAssistant.ts:2-4`  
```typescript
import { useI18n } from '../useI18n';
const { t } = useI18n();
```

**المشكلة:**  
`useI18n` يُستدعى عند استيراد الملف، خارج سياق Vue component. إذا كان يعتمد على `inject`/`provide`، سيفشل. `t` قد لا يتحدث عند تغيير اللغة.

---

### 30. الغازات غير قابلة للملء رغم أن `nh3` قاعدة

**الملف:** `ChemicalShelfPanel.vue:115`  
```typescript
:clickable="!!pendingChemicalFill && (chem.category === 'acid' || chem.category === 'base' || 
  chem.category === 'solvent' || chem.category === 'salt' || chem.category === 'indicator') || 
  (!!pendingSolidSelect && chem.category === 'solid')"
```

**المشكلة:**  
`gas` غير مدرج في الشرط. `nh3` (قاعدة) مُصنّف كـ `gas` → لا يمكن ملؤها في البيورت.

---

### 31. `pourFlowMap` — تدفق مستمر بدون تفاعل كيميائي

**الملف:** `useLabSimulation.ts:196-213`  
```typescript
for (const [srcUid, dstUid] of Object.entries(pourFlowMap)) {
  src.volume -= amount;
  dst.volume += amount;
  dst.color = src.color; dst.opacity = src.opacity;
  // لا يتم استدعاء handleDropMix
}
```

**المشكلة:**  
عند صب سائل من وعاء لآخر، يتم نقل الحجم واللون فقط — **لا يتم استدعاء `handleDropMix`**. التفاعلات الكيميائية لا تحدث أثناء الصب المستمر، فقط أثناء القطرات من البيورت.

---

## القسم الرابع: الأداء والذاكرة (32–37)

### 32. `clearTitrationReadings()` لا تُستدعى أبدًا

**الملف:** `useTitrationRecorder.ts:24-27`  
**المشكلة:**  
بحثت في كل الكود — لا يوجد أي استيراد أو استدعاء لـ `clearTitrationReadings()`. حتى `restartExperiment()` و `resetLab()` لا تستدعيها.

**النتيجة:**  
بيانات المعايرة المسجلة في `useTitrationRecorder` تتراكم عبر التجارب ولا تُصفّر أبدًا. `ChemAnalysisButton.vue` سيعرض بيانات من تجارب سابقة.

**الإصلاح المقترح:**  
إضافة `clearTitrationReadings()` إلى `restartExperiment()` و `resetLab()`.

---

### 33. `mergedExperiments` في `ExperimentSelector.vue` ليس reactive

**الملف:** `ExperimentSelector.vue:12-16`  
```typescript
const mergedExperiments = [
  ...listRegistryExperiments(),
  ...legacyExperiments.filter((e) => !registryIds.has(e.id)),
];
```

**المشكلة:**  
يُحسب مرة واحدة عند إنشاء المكوّن. ليس `computed`. إذا سُجّلت تجارب جديدة ديناميكيًا، لن تظهر.

---

### 34. استيراد `getRegistryExperiment` غير مستخدم

**الملف:** `ChemistryLanding.vue:13`  
```typescript
import { ..., getExperiment as getRegistryExperiment } from '../../composables/chemistry/experiments';
```

**المشكلة:**  
`getRegistryExperiment` لا يُستخدم في أي مكان بالملف.

---

### 35. `HistorySnapshot` لا يحفظ 4 خرائط حالة

**الملف:** `useChemistryHistory.ts:15-37`  
**الخرائط المفقودة:**
- `pourFlowMap` — حالة الصب المستمر
- `tiltAngleMap` — زوايا الإمالة
- `spillParticles` — الجسيمات المنسكبة
- `receivingMap` — حالة الاستقبال

**المشكلة:**  
عند التراجع (undo)، هذه الحالات لا تُستعادى. إذا كان وعاء مائل أثناء التراجع، سيعود للحالة السابقة لكن زاوية الإمالة تبقى — قد يبدأ الصب فورًا مرة أخرى.

---

### 36. استخراج معاملات المعادلة بـ regex هش

**الملف:** `useReactionEngine.ts:124-129`  
```typescript
const srcMatch = eqStr.match(new RegExp(`(\\d*)\\s*${src}`, 'i'));
const tgtMatch = eqStr.match(new RegExp(`(\\d*)\\s*${tgt}`, 'i'));
const srcCoeff = srcMatch && srcMatch[1] ? parseInt(srcMatch[1]) : 1;
const tgtCoeff = tgtMatch && tgtMatch[1] ? parseInt(tgtMatch[1]) : 1;
stoichRatio = srcCoeff / tgtCoeff;
```

**المشاكل:**
- `h2o` سيطابق `2` في `2H₂O` لكن أيضًا في `H₂SO₄` (لأن `h2` يطابق)
- المواد بأسماء تحتوي على أرقام (مثل `h2so4`, `h2o2`) سيتطابق جزء منها مع أرقام المعاملات
- لا يوجد escape لـ regex special characters

**مثال:** للمعادلة `2KMnO₄ + 3H₂O₂ → ...`، البحث عن `h2o2` قد يطابق `2H₂` بدلاً من `3H₂O₂`.

**الإصلاح المقترح:**  
إضافة `coefficients` field إلى `ChemicalEquation` في الـ engine بدلاً من استخراجها من النص.

---

### 37. `buretteWarning` لا تُصفّر عند pH < 7.5

**الملف:** `useLabSimulation.ts:130-140`  
```typescript
if (bLiquid.ph >= 9.0) buretteWarning.value = 'exceeded';
else if (bLiquid.ph >= 8.0) buretteWarning.value = 'equivalence';
else if (bLiquid.ph >= 7.5) buretteWarning.value = 'approaching';
// لا يوجد else لـ pH < 7.5
```

**المشكلة:**  
إذا عاد pH لأقل من 7.5 (مثلاً بعد تراجع)، التحذير يبقى معروضًا. يتم تصفيره فقط في `WorkspaceCanvas.vue` عند إغلاق الصمام (dynamic import).

---

## القسم الخامس: تجربة المستخدم والمساعد (38–42)

### 38. `buretteWarning` يُستورد بـ 3 طرق مختلفة

**الطرق:**
1. `WorkspaceCanvas.vue` — dynamic import
2. `useExecActions.ts:10` — static import
3. `ChemistryLanding.vue:18` — static import

**المشكلة:**  
الـ dynamic import قد يحصل على نسخة مختلفة من الـ module إذا كان هناك code splitting.

---

### 39. `SavedSession` نوع ميت غير مستخدم

**الملف:** `chemLabTypes.ts:24-36`  
**المشكلة:**  
`SavedSession` مُعرّف لكن `useChemistrySession.ts` لا يستخدمه — يبني كائن البيانات يدويًا.

---

### 40. `isTestTubeRack` مُصدّر من `useChemistryLab` لكن غير مستورد

**الملف:** `useChemistryLab.ts:16`  
```typescript
export { isBeaker, isTestTube, isTestTubeRack, ... } from './chemLabIds';
```

**المشكلة:**  
`isTestTubeRack` غير مستورد في الاستيراد العلوي (السطور 4-12)، لكنه مُصدّر. يعمل لأن `export ... from` يعيد التصدير بشكل مستقل، لكنه مُربك.

---

### 41. 6 تجارب جديدة بدون نصائح في المساعد

**الملف:** `useLabAssistant.ts:102-118`  
**المشكلة:**  
`tipForStep` يُعرّف نصائح فقط لـ:
- `neutralization-hcl-naoh`
- `neutralization-ch3cooh-naoh`

الـ 6 تجارب الجديدة (precipitation, gas, redox, acid-base identification) ستحصل على `'chemistryAssistant.defaultTip'` فقط.

---

### 42. 3 مواد فقط لها حقائق علمية في `quickFactAbout`

**الملف:** `useLabAssistant.ts:143-150`  
```typescript
const keyMap: Record<string, string> = {
  hcl: 'chemistryAssistant.factHCl',
  naoh: 'chemistryAssistant.factNaOH',
  phenolphthalein: 'chemistryAssistant.factPhenolphthalein',
};
```

**المشكلة:**  
من 30+ مادة كيميائية، فقط 3 لها حقائق. باقي المواد لا تُظهر أي شيء عند اختيارها.

---

## ملخص الأولويات

### أخطاء حرجة (يجب إصلاحها أولاً)

| الرقم | المشكلة | السبب |
|-------|---------|-------|
| **24** | `findEquation` يطابق جزئيًا | تفاعلات كيميائية خاطئة |
| **31** | `pourFlowMap` لا يُشغّل تفاعلات | تفاعلات مفقودة أثناء الصب |
| **32** | `clearTitrationReadings()` لا تُستدعى | بيانات متراكمة عبر التجارب |
| **36** | استخراج المعاملات بـ regex هش | نسب ستويكيومترية خاطئة |
| **35** | `HistorySnapshot` لا يحفظ 4 خرائط | undo يُنتج حالة غير متسقة |
| **29** | `useI18n()` خارج سياق Vue | قد يفشل أو لا يتحدث |
| **10** | `ToolState` مُعرّف في مكانين | نوع ضعيف، تصدير ضمني هش |
| **11** | `buildToolState` يُرجع حقولاً غير مُعرّفة | TypeScript لا يلتقط الأخطاء |
| **5** | 3 تعريفات مختلفة لـ `TitrationReading` | نظاما التسجيل والعرض غير متصلين |

### أخطاء متوسطة الخطورة

| الرقم | المشكلة |
|-------|---------|
| **1** | نظام تجارب مزدوج مع تعارض IDs |
| **2** | `RightPanel.vue` يستورد legacy type فقط |
| **3** | `ExperimentStep` مُعرّف في مكانين |
| **4** | `ExperimentTheory` مُعرّف في مكانين |
| **6** | `ReportData` مُعرّف في مكانين |
| **12** | الكشف عن المؤشرات مكرر في 4 أماكن |
| **13** | `pushHistory()` المُهملة في إجراءات حرجة |
| **14** | `clearSession()` لا تُصفّر 3 حالات |
| **15** | `restartExperiment()` يمسح كل الأدوات |
| **16** | `InspectorPanel.vue` ميت لكن مُستورد للنوع |
| **17** | منطق تحقق legacy مكرر و unreachable |
| **22** | `onChemicalClick` يكرّر منطق `execAction` |
| **25** | `nh3` مُصنّف كـ gas لكنه base |
| **26** | `h2o2` حمضي لكن غير مُدرج في `isAcid` |
| **30** | الغازات غير قابلة للملء |
| **37** | `buretteWarning` لا تُصفّر عند pH < 7.5 |
| **38** | `buretteWarning` يُستورد بـ 3 طرق |

### أخطاء منخفضة الخطورة

| الرقم | المشكلة |
|-------|---------|
| **7** | `validateExperimentSteps` مكرر ولا يُستخدم |
| **8** | استيراد `getRegistryExperiment` غير مستخدم |
| **9** | `experiments` array مُكرر |
| **18** | تأثير إضافي للخطأ 5 |
| **19** | إعادة تصدير تزيد bundle size |
| **20** | حذف `receivingMap` في كل إطار |
| **21** | `expandedSections` يُستخدم قبل تعريفه |
| **23** | أدوات بلا تعريف في الرف (dead code) |
| **27** | O(n²) لرسم خطوط القطرات |
| **28** | O(n²) للكشف عن التسخين |
| **33** | `mergedExperiments` ليس reactive |
| **34** | dead import |
| **39** | `SavedSession` نوع ميت |
| **40** | `isTestTubeRack` مُصدّر لكن غير مستورد |
| **41** | 6 تجارب بدون نصائح |
| **42** | 3 مواد فقط لها حقائق |

---

## ترتيب الإصلاح المقترح (خطوة بخطوة)

### المرحلة 1: توحيد الأنواع (الأخطاء 1–11)
1. إصلاح **10** + **11**: نقل `ToolState` إلى `chemLabTypes.ts` مع كل الحقول، تحديث `InspectorPanel.vue`
2. إصلاح **5** + **18**: توحيد `TitrationReading` في تعريف واحد
3. إصلاح **1**–**4** + **6**–**9**: توحيد نظام التجارب على الـ registry
4. حذف `InspectorPanel.vue` (**16**) و `useExperiments.ts` (**17**) بعد التوحيد

### المرحلة 2: محرك التفاعل (الأخطاء 24–31)
5. إصلاح **24**: `findEquation` — تطابق مجموعة كاملة
6. إصلاح **36**: إضافة `coefficients` field إلى `ChemicalEquation`
7. إصلاح **25** + **26** + **30**: تحديث `isAcid`/`isBase` وتصنيف `nh3`/`h2o2`
8. إصلاح **31**: استدعاء `handleDropMix` في `pourFlowMap`
9. إصلاح **12**: استبدال الكشف اليدوي عن المؤشرات بـ `isIndicator`

### المرحلة 3: الحالة والجلسات (الأخطاء 13–15, 32, 35, 37)
10. إصلاح **32**: استدعاء `clearTitrationReadings()` في `restartExperiment()` و `resetLab()`
11. إصلاح **14**: إضافة `spillParticles` و `buretteWarning` و `receivingMap` إلى `clearSession()`
12. إصلاح **35**: إضافة `pourFlowMap` و `tiltAngleMap` إلى `HistorySnapshot`
13. إصلاح **13**: استبدال `pushHistory()` بـ `pushMicroHistory()` في إجراءات الماصة
14. إصلاح **15**: فصل `restartExperiment()` عن `resetLab()`
15. إصلاح **37**: إضافة `else` لتصفير `buretteWarning` عند pH < 7.5

### المرحلة 4: الأداء (الأخطاء 20, 27, 28, 33)
16. إصلاح **27**: spatial partitioning في `useSpillDrops`
17. إصلاح **28**: pre-index لمصادر الحرارة
18. إصلاح **20**: عدم حذف `receivingMap` في كل إطار
19. إصلاح **33**: تحويل `mergedExperiments` إلى `computed`

### المرحلة 5: المساعد وتحسينات UX (الأخطاء 29, 38, 41, 42)
20. إصلاح **29**: نقل `useI18n()` داخل دوال `useLabAssistant`
21. إصلاح **38**: توحيد استيراد `buretteWarning`
22. إصلاح **41** + **42**: إضافة نصائح وحقائق للتجارب والمواد الجديدة

### المرحلة 6: تنظيف (الأخطاء 19, 21, 22, 23, 34, 39, 40)
23. حذف dead code و dead imports
24. إصلاح **22**: توحيد منطق الملء في `execAction`
25. إصلاح **21**: نقل `expandedSections` قبل استخدامه

---

> **ملاحظة:** هذا التقرير شامل لـ 42 خطأ. كل خطأ مرقم بشكل فريد ويمكن إصلاحه بشكل مستقل، مع مراعاة الترتيب المقترح أعلاه لتجنب التعارضات.
