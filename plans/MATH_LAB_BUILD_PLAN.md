# خطة بناء قسم الرياضيات التفاعلي (Math Lab)

## التاريخ والنسخة
- تاريخ التحديث: ١٢/٧/٢٠٢٦
- النسخة: 2.0 - خطة مبنية على قواعد البناء الصارمة للمشروع

## 1. قواعد البناء الصارمة المستخرجة من المشروع

### 1.1 قواعد التطوير السريع (`ai_rules.md`)

1. **السرعة والعمل الفوري** — اكتب الكود والميزات مباشرة وبأسرع طريقة ممكنة.
2. **لا انتظار للموافقات** — ابنِ الملفات كاملة في رد واحد لتسريع الإنجاز.
3. **العمل فوق الهيكلية المثالية** — ركّز على جعل الميزة تعمل برمجياً، والفحوصات الشاملة تُترك للمراحل النهائية.
4. **الملفات الكاملة** — عند كتابة كود جديد، اكتب الملف كاملاً مع كافة الواردات والتبعيات.
5. **عدم التقسيم الزائد** — لا تقسّم الكود إلى ملفات صغيرة إلا إذا تعدى 500 سطر فعلياً.

### 1.2 قواعد النقل والبناء الصارمة (`MIGRATION_RULES.md`)

1. **لا إعادة تصميم** — لا تغيير في UX/UI، لا تبسيط، لا إعادة هيكلة خارج المطلوب.
2. **حدود حجم الملفات:**
   - أي ملف `.vue` > **300 سطر** يجب فصله إلى مكونات أصغر.
   - أي ملف `.ts` > **200 سطر** يجب فصله إلى modules/composables/utils.
3. **فصل المسؤوليات:**
   - `<template>` كبير → فصّل إلى `<component>` منفصلة.
   - `<script>` كبير → فصّل إلى composables و stores و utilities.
   - `<style>` كبير → ضعها داخل كل مكون منفصل (scoped).
   - منطق الرياضيات → `composables/useMath*.ts` منفصل تماماً عن UI.
4. **هيكل الملفات المطلوب:**
   ```
   ├── components/
   │   ├── layout/
   │   ├── ui/
   │   ├── home/
   │   ├── teacher/
   │   ├── student/
   │   ├── experiment/
   │   └── math/                 ← مكونات قسم الرياضيات
   ├── composables/
   │   └── math/                 ← useMath*.ts
   ├── stores/
   │   └── math.store.ts         ← Pinia store
   ├── services/
   │   └── math.service.ts       ← http service
   ├── types/
   │   └── math.types.ts         ← interfaces & types
   └── pages/
       └── math/                 ← صفحات قليلة السطور (تركيب فقط)
   ```
5. **التسميات:**
   - Composables: `useXxx.ts`
   - Services: `xxx.service.ts`
   - Stores: `xxx.store.ts`
   - Pages: قليلة السطور فقط (تركيب المكونات).
6. **الخدمات والـ API:**
   - `services/http.ts` يحتوي على `apiUrl()` و `API_BASE_URL` مطابق للأصلي.
   - `auth store` يستخدم `/api/auth/*`.
   - أي API endpoint يجب أن يطابق الهيكل الحالي.
7. **i18n:**
   - إنشاء `i18n.store.ts` مبسط (ar/en/es) مع RTL للعربية.
   - إنشاء `useI18n.ts` composable لاستخدام الترجمة.
   - لا ترجمة ثابتة داخل المكونات.
8. **ممنوعات:**
   - ❌ لا تحذف ميزة موجودة.
   - ❌ لا تترك ملفاً يتجاوز الحدود دون فصل.
   - ❌ لا تخلط المنطق الحسابي مع UI.

### 1.3 التوفيق بين القاعدتين

- **السرعة:** سنكتب الملفات كاملة في كل مرحلة.
- **الحدود:** سنفحص كل ملف بعد كتابته؛ إذا تجاوز 300 سطر (Vue) أو 200 سطر (TS)، نفصله فوراً.
- **الهيكل:** نتبع `components/math/` و `composables/math/` و `services/math.service.ts`.
- **لا إعادة تصميم:** سنبني وفقاً للمكونات المطلوبة دون إضافة UI غير ضروري.

## 2. المقدمة والهدف

بناء قسم تعليمي تفاعلي داخل المشروع الحالي يسمح للطالب ب:
1. اختيار فرع رياضيات (جبر، هندسة، تفاضل).
2. اختيار معادلة من قائمة منظمة.
3. قراءة شرح نظري للمعادلة.
4. حل مسألة جاهزة أو كتابة مسألته الخاصة.
5. استخدام كيبورد رياضي لكتابة المعادلة.
6. الحصول على الحل خطوة بخطوة.
7. رسم الدالة بيانياً عند الحاجة.

## 2. الميزات الرئيسية

- بطاقات اختيار الفروع.
- قائمة المعادلات حسب الفرع.
- عرض الشرح باستخدام KaTeX.
- كيبورد رياضي باستخدام MathLive.
- محرك حسابي للحل الرمزي.
- رسم بياني تفاعلي باستخدام function-plot.
- مسائل تدريبية جاهزة.
- تتبع تقدم الطالب (اختياري للمرحلة الأولى).

## 3. الملفات والمجلدات الجديدة

### 3.1 الحزم الجديدة (packages)

```
packages/
└── math-engine/
    ├── src/
    │   ├── index.ts              # تصدير الواجهة الرئيسية
    │   ├── parser.ts             # تحليل LaTeX / MathJSON
    │   ├── solver.ts             # حل المعادلات (يفصل إذا تجاوز 200 سطر)
    │   ├── steps.ts              # تفكيك الخطوات
    │   ├── graph.ts              # توليد بيانات الرسم
    │   ├── practice.ts           # توليد مسائل تدريبية
    │   └── types.ts              # الأنواع والواجهات
    ├── package.json
    └── tsconfig.json
```

**حدود الملفات:**
- `solver.ts` إذا تجاوز 200 سطر → يُفصل إلى `linear.ts` و `quadratic.ts` و `polynomial.ts`.
- `parser.ts` إذا تجاوز 200 سطر → يُفصل إلى `latex.ts` و `mathjs.ts`.

### 3.2 الوحدة الجديدة في API

```
apps/api/src/modules/math/
├── index.ts                    # تسجيل المسارات
├── handlers.ts                 # معالجات الطلبات (يفصل إذا تجاوز 200 سطر)
├── schemas.ts                  # مخططات التحقق (zod)
├── services.ts                 # المنطق التطبيقي (يفصل إذا تجاوز 200 سطر)
├── repository.ts               # التواصل مع قاعدة البيانات
└── data/
    ├── branches.json           # الفروع الافتراضية
    └── equations.json          # المعادلات الافتراضية
```

**حدود الملفات:**
- `handlers.ts` إذا تجاوز 200 سطر → يُفصل إلى `branches.handlers.ts` و `equations.handlers.ts` و `solver.handlers.ts`.
- `services.ts` إذا تجاوز 200 سطر → يُفصل إلى `branch.service.ts` و `equation.service.ts` و `solver.service.ts`.

### 3.3 المكونات (components)

```
apps/web/src/components/
└── math/
    ├── MathBranchCard.vue          # بطاقة فرع
    ├── MathEquationCard.vue        # بطاقة معادلة
    ├── MathExplanation.vue         # عرض الشرح
    ├── MathSolver.vue              # الحل التفاعلي (يفصل إذا تجاوز 300 سطر)
    ├── MathKeyboard.vue            # كيبورد رياضي (اختياري)
    ├── MathLiveInput.vue           # مكون مشترك لإدخال المعادلات
    ├── MathGraph.vue               # الرسم البياني
    ├── MathGraphCanvas.vue         # Canvas منفصل إذا كبر الرسم
    ├── MathPracticePanel.vue       # مسائل تدريبية
    ├── MathStepView.vue            # عرض خطوات الحل
    ├── MathSolverInput.vue         # منطقة الإدخال (إذا فُصل MathSolver)
    └── MathSolverResult.vue        # منطقة النتيجة (إذا فُصل MathSolver)
```

**حدود الملفات:**
- أي مكون `.vue` > 300 سطر يجب فصله.
- `MathSolver.vue` إذا كبر → يُفصل إلى `MathSolverInput.vue` و `MathSolverResult.vue`.
- `MathGraph.vue` إذا كبر → يُفصل إلى `MathGraphCanvas.vue`.

### 3.4 Composables

```
apps/web/src/composables/
└── math/
    ├── useMathSolver.ts        # منطق إرسال وحل المعادلة
    ├── useMathGraph.ts         # منطق جلب بيانات الرسم
    ├── useMathKeyboard.ts      # إدارة حالة الكيبورد
    └── useMathPractice.ts      # منطق المسائل التدريبية
```

**حدود الملفات:**
- كل composable < 200 سطر.
- لا يحتوي على UI.

### 3.5 Services

```
apps/web/src/services/
└── math.service.ts             # كل طلبات API للرياضيات
```

**حدود الملفات:**
- يستخدم `apiUrl()` من `services/http.ts`.
- < 200 سطر؛ إذا كثر عدد الدوال → يُفصل إلى `math.service.ts` و `math-solver.service.ts`.

### 3.6 Stores

```
apps/web/src/stores/
└── math.store.ts               # حالة قسم الرياضيات
```

**حدود الملفات:**
- < 200 سطر.
- لا يحتوي على منطق حسابي معقد.

### 3.7 Types

```
apps/web/src/types/
└── math.types.ts               # أنواع قسم الرياضيات
```

**حدود الملفات:**
- < 200 سطر.
- أنواع فقط.

### 3.8 الصفحات (pages) — تركيب فقط

```
apps/web/src/pages/
├── math.vue                    # غلاف خارجي (اختياري)
└── math/
    ├── index.vue               # صفحة الفروع
    ├── [branch].vue            # صفحة المعادلات حسب الفرع
    └── [branch]/[equation].vue # صفحة المعادلة التفصيلية
```

**قاعدة:** كل صفحة لا تتجاوز 50 سطر. هي فقط تستدعي المكونات وتمرر `route.params`.

### 3.9 i18n

```
apps/web/src/stores/i18n.store.ts     # إذا لم يكن موجوداً
apps/web/src/composables/useI18n.ts   # إذا لم يكن موجوداً
apps/web/src/i18n/
├── ar/
│   └── math.json
├── en/
│   └── math.json
└── es/
    └── math.json
```

**قاعدة:**
- كل نص واجهة يجب أن يأتي من ملف الترجمة.
- RTL للعربية.

## 4. هيكل packages/math-engine

### 4.1 الواجهات الرئيسية

```typescript
export interface MathProblem {
  expression: string;      // LaTeX أو نص عادي
  variable?: string;       // المتغير الافتراضي x
  operation: 'solve' | 'factor' | 'expand' | 'differentiate' | 'simplify';
}

export interface SolutionResult {
  success: boolean;
  input: string;
  result: string;
  steps: SolutionStep[];
  error?: string;
}

export interface SolutionStep {
  title: string;
  expression: string;
  explanation: string;
}

export interface GraphData {
  function: string;
  points: { x: number; y: number }[];
  roots?: number[];
  vertex?: { x: number; y: number };
  xRange: [number, number];
  yRange: [number, number];
}
```

### 4.2 الدوال الرئيسية

```typescript
// parser.ts
export function parseExpression(input: string): MathExpression;
export function latexToMathjs(latex: string): string;
export function mathjsToLatex(expression: string): string;

// solver.ts
export function solveEquation(problem: MathProblem): SolutionResult;
export function solveLinear(equation: string, variable: string): SolutionResult;
export function solveQuadratic(equation: string, variable: string): SolutionResult;

// steps.ts
export function getSolutionSteps(expression: string, operation: string): SolutionStep[];

// graph.ts
export function generateGraphData(expression: string, options: GraphOptions): GraphData;

// practice.ts
export function generatePracticeProblem(branch: string, difficulty: string): PracticeProblem;
```

### 4.3 المكتبات المستخدمة

- `mathjs`: للحسابات الرقمية والبسيطة.
- `nerdamer`: للعمليات الرمزية.
- `algebrite`: كبديل للتفكيك الرمزي.

## 5. هيكل apps/api/src/modules/math

### 5.1 النقاط النهائية (Endpoints)

| Method | Path | الوصف |
|--------|------|-------|
| GET | /api/math/branches | قائمة الفروع |
| GET | /api/math/branches/:slug | تفاصيل فرع |
| GET | /api/math/branches/:slug/equations | المعادلات في فرع |
| GET | /api/math/equations/:id | تفاصيل معادلة |
| POST | /api/math/solve | حل معادلة |
| POST | /api/math/graph-data | بيانات الرسم |
| POST | /api/math/practice | مسألة تدريبية |

### 5.2 مخططات التحقق (Zod)

```typescript
export const SolveSchema = z.object({
  expression: z.string().min(1),
  operation: z.enum(['solve', 'factor', 'expand', 'differentiate', 'simplify']).default('solve'),
  variable: z.string().default('x'),
  branch: z.string().optional(),
});

export const GraphDataSchema = z.object({
  expression: z.string().min(1),
  xMin: z.number().default(-10),
  xMax: z.number().default(10),
  step: z.number().default(0.1),
});

export const PracticeSchema = z.object({
  equationId: z.string().optional(),
  branch: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});
```

### 5.3 البيانات الافتراضية

ملف `branches.json`:
```json
[
  { "slug": "algebra", "name_ar": "الجبر", "name_en": "Algebra", "icon": "📐" },
  { "slug": "geometry", "name_ar": "الهندسة", "name_en": "Geometry", "icon": "📏" },
  { "slug": "calculus", "name_ar": "التفاضل", "name_en": "Calculus", "icon": "∫" }
]
```

ملف `equations.json`:
```json
[
  {
    "id": "linear-equation",
    "branch_slug": "algebra",
    "title_ar": "المعادلة الخطية",
    "title_en": "Linear Equation",
    "latex": "ax + b = c",
    "difficulty": "easy"
  }
]
```

## 6. قاعدة البيانات

### 6.1 الجداول المقترحة

```sql
-- الفروع
CREATE TABLE math_branches (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- المعادلات
CREATE TABLE math_equations (
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  latex TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'easy',
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (branch_id) REFERENCES math_branches(id)
);

-- المسائل التدريبية
CREATE TABLE math_practice_problems (
  id TEXT PRIMARY KEY,
  equation_id TEXT NOT NULL,
  problem_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  difficulty TEXT DEFAULT 'medium',
  FOREIGN KEY (equation_id) REFERENCES math_equations(id)
);

-- تقدم الطالب (اختياري)
CREATE TABLE math_progress (
  user_id INTEGER NOT NULL,
  equation_id TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  score REAL,
  last_attempt INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, equation_id)
);
```

## 7. الواجهة الأمامية

### 7.1 المسارات

```typescript
const mathRoutes = [
  {
    path: '/math',
    name: 'MathHome',
    component: () => import('@/pages/math/index.vue')
  },
  {
    path: '/math/:branch',
    name: 'MathBranch',
    component: () => import('@/pages/math/[branch].vue')
  },
  {
    path: '/math/:branch/:equation',
    name: 'MathEquation',
    component: () => import('@/pages/math/[branch]/[equation].vue')
  }
];
```

### 7.2 المكونات بالتفصيل

#### MathBranchCard.vue
- يعرض أيقونة الفرع والاسم.
- ينقل المستخدم إلى `/math/:branch`.

#### MathEquationCard.vue
- يعرض اسم المعادلة وصعوبتها.
- ينقل المستخدم إلى `/math/:branch/:equation`.

#### MathExplanation.vue
- يعرض الشرح النظري باستخدام KaTeX.
- يعرض القوانين والأمثلة.

#### MathSolver.vue
- يحتوي على تبويبين:
  - مسألة جاهزة.
  - كتابة مسألتي.
- يستدعي `useMathSolver`.
- يعرض الحل والخطوات.

#### MathKeyboard.vue
- يمكن استبداله بـ `MathLiveInput.vue`.
- إذا أردت كيبورد مخصص: أزرار للرموز الشائعة.

#### MathGraph.vue
- يستخدم function-plot.
- يعرض الدالة بناءً على بيانات API.

#### MathPracticePanel.vue
- يولد مسألة عشوائية.
- يتحقق من إجابة الطالب.

### 7.3 الخدمات

```typescript
// apps/web/src/services/math.service.ts
export async function fetchBranches(): Promise<Branch[]>;
export async function fetchEquations(branchSlug: string): Promise<Equation[]>;
export async function fetchEquation(id: string): Promise<Equation>;
export async function solveProblem(payload: SolvePayload): Promise<SolutionResult>;
export async function fetchGraphData(payload: GraphPayload): Promise<GraphData>;
export async function fetchPracticeProblem(payload: PracticePayload): Promise<PracticeProblem>;
```

### 7.4 المتجر

```typescript
// apps/web/src/stores/math.store.ts
export const useMathStore = defineStore('math', () => {
  const branches = ref<Branch[]>([]);
  const equations = ref<Equation[]>([]);
  const currentEquation = ref<Equation | null>(null);
  const solution = ref<SolutionResult | null>(null);
  const graphData = ref<GraphData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadBranches = async () => { ... };
  const loadEquations = async (branch: string) => { ... };
  const solve = async (payload: SolvePayload) => { ... };

  return {
    branches, equations, currentEquation,
    solution, graphData, loading, error,
    loadBranches, loadEquations, solve
  };
});
```

## 8. المكتبات الخارجية

### 8.1 الواجهة الأمامية

```bash
pnpm -F @my-modern-app/web add katex mathlive function-plot
pnpm -F @my-modern-app/web add -D @types/katex
```

### 8.2 محرك الرياضيات

```bash
pnpm -F @my-modern-app/math-engine add mathjs nerdamer
```

### 8.3 API

لا يحتاج API إلى مكتبات جديدة إذا تم إنشاء `math-engine` كحزمة منفصلة.

## 9. خطوات التنفيذ بالترتيب

### المرحلة 0: التحقق من i18n
1. فحص وجود `apps/web/src/stores/i18n.store.ts`.
2. فحص وجود `apps/web/src/composables/useI18n.ts`.
3. إنشاؤهما إذا لم يكونا موجودين.
4. إنشاء ملفات `apps/web/src/i18n/ar/math.json` و `en/math.json` و `es/math.json`.

### المرحلة 1: البنية الأساسية
1. إنشاء `packages/math-engine/` مع `package.json` و `tsconfig.json`.
2. إنشاء `apps/api/src/modules/math/`.
3. إنشاء `apps/web/src/components/math/`.
4. إنشاء `apps/web/src/composables/math/`.
5. إنشاء `apps/web/src/services/math.service.ts` (فارغ).
6. إنشاء `apps/web/src/stores/math.store.ts` (فارغ).
7. إنشاء `apps/web/src/types/math.types.ts` (فارغ).
8. إنشاء `apps/web/src/pages/math/index.vue` و `[branch].vue` و `[branch]/[equation].vue`.
9. ربط الحزمة الجديدة في `pnpm-workspace.yaml`.
10. إضافة `math-engine` كاعتمادية في `apps/api/package.json` و `apps/web/package.json`.
11. إضافة مسارات `/math` إلى `apps/web/src/router.ts`.
12. **فحص الحدود:** التأكد من أن كل ملف جديد لا يتجاوز الحدود المسموحة.

### المرحلة 2: قاعدة البيانات والـ API
1. إنشاء migration جديدة `apps/api/src/db/migrations/007_math_schema.sql`.
2. إنشاء جداول `math_branches` و `math_equations` و `math_practice_problems`.
3. إضافة ملفات `branches.json` و `equations.json`.
4. تنفيذ `repository.ts`.
5. تنفيذ `GET /api/math/branches`.
6. تنفيذ `GET /api/math/branches/:slug/equations`.
7. تنفيذ `GET /api/math/equations/:id`.
8. اختبار نقاط API.
9. **فحص الحدود:** تقسيم `handlers.ts` و `services.ts` إذا تجاوزا 200 سطر.

### المرحلة 3: المحرك الحسابي
1. تنفيذ `types.ts`.
2. تنفيذ `parser.ts`.
3. تنفيذ `solver.ts` (خطية وتربيعية أولاً).
4. تنفيذ `steps.ts`.
5. كتابة اختبارات في `packages/math-engine/tests/`.
6. **فحص الحدود:** تقسيم `solver.ts` إذا تجاوز 200 سطر.

### المرحلة 4: الواجهة الأمامية - التنقل
1. تنفيذ `MathBranchCard.vue`.
2. تنفيذ `MathEquationCard.vue`.
3. تنفيذ `pages/math/index.vue`.
4. تنفيذ `pages/math/[branch].vue`.
5. تنفيذ `pages/math/[branch]/[equation].vue`.
6. تنفيذ `math.service.ts`.
7. تنفيذ `math.store.ts`.
8. ربط الصفحات بالمتجر.
9. **فحص الحدود:** تقسيم أي مكون > 300 سطر أو أي TS > 200 سطر.

### المرحلة 5: الشرح والحل
1. تنفيذ `MathExplanation.vue` مع KaTeX.
2. تنفيذ `MathLiveInput.vue` أو دمج MathLive.
3. تنفيذ `MathSolver.vue`.
4. تنفيذ `MathStepView.vue`.
5. تنفيذ `useMathSolver.ts`.
6. تنفيذ `POST /api/math/solve`.
7. ربط الواجهة بـ API.
8. **فحص الحدود:** فصل `MathSolver.vue` إلى `MathSolverInput.vue` و `MathSolverResult.vue` إذا لزم الأمر.

### المرحلة 6: الرسم البياني
1. تنفيذ `MathGraph.vue`.
2. تنفيذ `graph.ts` في `math-engine`.
3. تنفيذ `POST /api/math/graph-data`.
4. تنفيذ `useMathGraph.ts`.
5. ربط الرسم بصفحة المعادلة.
6. **فحص الحدود:** فصل `MathGraph.vue` إلى `MathGraphCanvas.vue` إذا لزم الأمر.

### المرحلة 7: المسائل التدريبية
1. تنفيذ `MathPracticePanel.vue`.
2. تنفيذ `practice.ts` في `math-engine`.
3. تنفيذ `POST /api/math/practice`.
4. تنفيذ `useMathPractice.ts`.
5. إضافة بيانات المسائل التدريبية.

### المرحلة 8: i18n والتحسينات النهائية
1. استبدال كل النصوص الثابتة بمفاتيح الترجمة.
2. التأكد من RTL للعربية.
3. إضافة حالات التحميل والأخطاء.
4. مراجعة حجم الملفات وتقسيم ما تجاوز الحدود.
5. تشغيل `typecheck` و `lint`.
6. اختبار شامل للتدفق الكامل.

## 10. ملاحظات تقنية مهمة

### 10.1 الأمان
- لا تعتمد على الحساب في الواجهة الأمامية فقط.
- تحقق دائماً من المدخلات في API باستخدام Zod.
- لا تنفذ `eval()` مباشرة على مدخلات المستخدم.
- استخدم `math-engine` كطبقة وسيطة.

### 10.2 الأداء
- استخدم `lazy loading` للصفحات والمكونات الثقيلة.
- لا تحمل function-plot إلا عند الحاجة.
- استخدم Pinia store للحالة المشتركة.

### 10.3 RTL والعربية
- جميع المسارات والنصوص تدعم العربية.
- KaTeX يدعم الاتجاه من اليمين إلى اليسار بشكل جيد.
- تأكد من اتجاه الأرقام والرموز الرياضية.

### 10.4 التوافق
- MathLive يعمل على الجوال والكمبيوتر.
- function-plot يحتاج SVG/Canvas متوافق.

### 10.5 فصل المسؤوليات (Concerns Separation)

| المسؤولية | الموقع |
|-----------|--------|
| المنطق الحسابي | `packages/math-engine/` |
| التواصل مع API | `apps/web/src/services/math.service.ts` |
| الحالة المشتركة | `apps/web/src/stores/math.store.ts` |
| المنطق الخاص بالواجهة | `apps/web/src/composables/math/*.ts` |
| المكونات | `apps/web/src/components/math/*.vue` |
| الصفحات | `apps/web/src/pages/math/*.vue` |
| الترجمة | `apps/web/src/i18n/*/math.json` |

### 10.6 فحوصات الحجم بعد كل مرحلة

بعد الانتهاء من كل ملف، يتم حساب عدد أسطره:
- `.vue` > 300 سطر → يُفصل فوراً.
- `.ts` > 200 سطر → يُفصل فوراً.
- صفحة > 50 سطر → تُبسط أو تُفصل.

## 11. الخلاصة

هذه الخطة تبني قسم رياضيات كامل من الصفر ضمن المشروع الحالي مع الالتزام بقواعد البناء الصارمة:
- `packages/math-engine/` → المحرك الحسابي.
- `apps/api/src/modules/math/` → API.
- `apps/web/src/components/math/`, `apps/web/src/composables/math/`, `apps/web/src/services/math.service.ts`, `apps/web/src/stores/math.store.ts`, `apps/web/src/types/math.types.ts`, `apps/web/src/pages/math/` → الواجهة الأمامية.

بعد الموافقة على هذه الخطة، يمكن البدء بتنفيذ المرحلة الأولى.
