<script setup lang="ts">
import { ref, computed, watch, defineComponent, h, type VNode } from 'vue';
import { RouterLink } from 'vue-router';
import { branches, equations, type Branch, type Equation } from './data';
import type { ApplicationProblem } from './math-types';
import { normalizeNumerals } from './math-utils';
import FeedbackModal from '../../components/shared/FeedbackModal.vue';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();
const showFeedback = ref(false);

const MathText = defineComponent({
  props: { text: { type: String, required: true } },
  setup(props) {
    return () => {
      const normalized = props.text.replace(/\*\*/g, '^').replace(/\*/g, '×');
      const regex = /\^([a-zA-Z0-9]+|\([^)]+\))/g;
      const children: (string | VNode)[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(normalized)) !== null) {
        if (match.index > lastIndex) children.push(normalized.slice(lastIndex, match.index));
        children.push(h('sup', match[1].replace(/^\(|\)$/g, '')));
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < normalized.length) children.push(normalized.slice(lastIndex));
      return h('span', { class: 'math-text' }, children);
    };
  },
});

const selectedBranchId = ref<string>('');
const selectedEquationId = ref<string>('');
const searchQuery = ref<string>('');
const solverValues = ref<Record<string, string>>({});
const solverResult = ref<{ result: string; steps: string[] } | null>(null);
const solveForTarget = ref<string>('');
const noteText = ref('');
const practiceMode = ref(false);
const practiceValues = ref<Record<string, string>>({});
const practiceReveal = ref(false);
const revealedProblems = ref<Record<number, { hint: boolean; answer: boolean }>>({});
const problemAnswers = ref<Record<number, string>>({});
const problemChecks = ref<Record<number, 'correct' | 'incorrect' | null>>({});
const problemNoExpected = ref<Record<number, boolean>>({});
const problemAttempts = ref<Record<number, number>>({});
const MAX_ATTEMPTS = 3;

const noteKey = computed(() => `math-note-${selectedEquationId.value}`);

const branchOptions = computed(() => [
  { id: '', name: 'اختر فرعاً' },
  ...branches,
]);

const filteredEquations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  let list = equations;
  if (selectedBranchId.value) {
    list = list.filter((eq: Equation) => eq.branchId === selectedBranchId.value);
  }
  if (query) {
    list = list.filter(
      (eq: Equation) =>
        eq.name.toLowerCase().includes(query) ||
        eq.formula.toLowerCase().includes(query) ||
        eq.description.toLowerCase().includes(query)
    );
  }
  return list;
});

const equationOptions = computed(() => [
  { id: '', name: 'اختر معادلة' },
  ...filteredEquations.value,
]);

watch(selectedBranchId, () => {
  selectedEquationId.value = '';
});

watch(selectedEquationId, () => {
  solverValues.value = {};
  solverResult.value = null;
  solveForTarget.value = selectedEquation.value?.defaultSolveFor
    ?? selectedEquation.value?.variables[0]?.name
    ?? '';
  noteText.value = selectedEquationId.value ? localStorage.getItem(noteKey.value) ?? '' : '';
  practiceMode.value = false;
  practiceValues.value = {};
  practiceReveal.value = false;
  revealedProblems.value = {};
  problemAnswers.value = {};
  problemChecks.value = {};
  problemNoExpected.value = {};
  problemAttempts.value = {};
});

watch(solveForTarget, () => {
  solverResult.value = null;
  if (solveForTarget.value && solverValues.value[solveForTarget.value]) {
    delete solverValues.value[solveForTarget.value];
  }
});

watch(noteText, (val) => {
  if (selectedEquationId.value) {
    localStorage.setItem(noteKey.value, val);
  }
});

const graphParams = computed(() => {
  if (!selectedEquation.value?.graph) return null;
  const params = { ...selectedEquation.value.graph.params };
  selectedEquation.value.variables.forEach((v) => {
    const raw = solverValues.value[v.name];
    if (raw === undefined || raw === '') return;
    const n = Number(normalizeNumerals(raw));
    if (!Number.isNaN(n)) params[v.name] = n;
  });
  return params as Record<string, number>;
});

const graphAxes = computed(() => {
  if (!selectedEquation.value?.graph) return null;
  const cfg = selectedEquation.value.graph;
  const width = 300;
  const height = 180;
  const [xMin, xMax] = cfg.xRange;
  const yMin = cfg.yRange?.[0] ?? -10;
  const yMax = cfg.yRange?.[1] ?? 10;
  const xAxisY = yMin <= 0 && yMax >= 0 ? height - ((0 - yMin) / (yMax - yMin)) * height : null;
  const yAxisX = xMin <= 0 && xMax >= 0 ? ((0 - xMin) / (xMax - xMin)) * width : null;
  return { width, height, xAxisY, yAxisX };
});

const graphSegments = computed(() => {
  if (!selectedEquation.value?.graph || !graphParams.value) return [];
  const cfg = selectedEquation.value.graph;
  const width = 300;
  const height = 180;
  const [xMin, xMax] = cfg.xRange;
  const yMin = cfg.yRange?.[0] ?? -10;
  const yMax = cfg.yRange?.[1] ?? 10;
  const steps = 300;

  const lines = cfg.lines && cfg.lines.length > 0
    ? cfg.lines
    : [{ fn: cfg.fn, color: undefined }];

  const result: { points: string; color?: string }[] = [];

  lines.forEach((line) => {
    const lineParams = { ...graphParams.value, ...line.params };

    if (line.verticalX) {
      const vx = line.verticalX(lineParams);
      if (Number.isFinite(vx) && vx >= xMin && vx <= xMax) {
        const px = ((vx - xMin) / (xMax - xMin)) * width;
        const pyMin = height;
        const pyMax = 0;
        result.push({ points: `${px.toFixed(1)},${pyMin.toFixed(1)} ${px.toFixed(1)},${pyMax.toFixed(1)}`, color: line.color });
      }
      return;
    }

    if (!line.fn) return;

    const segments: string[] = [];
    let current: string[] = [];
    let lastPy: number | null = null;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      const y = line.fn(x, lineParams);
      if (!Number.isFinite(y) || y < yMin || y > yMax) {
        if (current.length) {
          segments.push(current.join(' '));
          current = [];
        }
        lastPy = null;
        continue;
      }
      const px = ((x - xMin) / (xMax - xMin)) * width;
      const py = height - ((y - yMin) / (yMax - yMin)) * height;
      if (lastPy !== null && Math.abs(py - lastPy) > height * 0.85) {
        if (current.length) {
          segments.push(current.join(' '));
          current = [];
        }
      }
      current.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      lastPy = py;
    }
    if (current.length) segments.push(current.join(' '));
    segments.forEach((seg) => result.push({ points: seg, color: line.color }));
  });

  return result;
});

function generatePractice() {
  if (!selectedEquation.value) return;
  const values: Record<string, string> = {};
  selectedEquation.value.variables.forEach((v) => {
    if (v.type === 'list') {
      const len = Math.floor(Math.random() * 4) + 3;
      const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 20) + 1);
      values[v.name] = arr.join(', ');
    } else {
      values[v.name] = String(Math.floor(Math.random() * 20) + 1);
    }
  });
  practiceValues.value = values;
  practiceMode.value = true;
  practiceReveal.value = false;
}

function loadProblemVariables(problem: ApplicationProblem) {
  solverValues.value = {};
  Object.entries(problem.variables).forEach(([key, value]) => {
    solverValues.value[key] = String(value);
  });
  solverResult.value = selectedEquation.value?.solve(normalizeValues(solverValues.value)) ?? null;
}

function checkProblemAnswer(idx: number, problem: ApplicationProblem) {
  if ((problemAttempts.value[idx] ?? 0) >= MAX_ATTEMPTS) return;
  const userAnswer = problemAnswers.value[idx]?.trim() ?? '';
  if (!userAnswer) return;

  const expected = problem.expectedValue;
  if (expected === undefined) {
    problemNoExpected.value[idx] = true;
    return;
  }
  problemAttempts.value[idx] = (problemAttempts.value[idx] ?? 0) + 1;
  const expectedStr = String(expected);
  const expectedParts = expectedStr.split(',').map((s) => s.trim());
  const userParts = normalizeNumerals(userAnswer).split(',').map((s) => s.trim());

  const allMatch = expectedParts.length === userParts.length && expectedParts.every((part) => {
    const expectedNum = Number(part);
    if (Number.isNaN(expectedNum)) {
      return userParts.includes(part);
    }
    return userParts.some((userPart) => {
      const userNum = Number(userPart);
      if (Number.isNaN(userNum)) return false;
      return Math.abs(userNum - expectedNum) < 1e-2;
    });
  });
  problemChecks.value[idx] = allMatch ? 'correct' : 'incorrect';
}

const solvedCount = computed(() =>
  Object.values(problemChecks.value).filter((c) => c === 'correct').length
);

const practiceResult = computed(() => {
  if (!selectedEquation.value || !practiceReveal.value) return null;
  return selectedEquation.value.solve(normalizeValues(practiceValues.value));
});

const selectedBranch = computed<Branch | undefined>(() =>
  branches.find((b) => b.id === selectedBranchId.value)
);

const selectedEquation = computed<Equation | undefined>(() =>
  equations.find((e: Equation) => e.id === selectedEquationId.value)
);

const variableInputs = computed(() => selectedEquation.value?.variables ?? []);

const inputVariables = computed(() =>
  variableInputs.value.filter((v) => v.name !== solveForTarget.value)
);

function parseMethod(method: string): { intro: string; steps: string[] } {
  const parts = method
    .split(/(?=\d+\)\s)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const intro = parts[0].match(/^\d+\)/) ? '' : parts[0];
  const steps = parts.filter((p) => p.match(/^\d+\)/));
  return { intro, steps };
}

const parsedMethod = computed(() => {
  if (!selectedEquation.value) return null;
  return parseMethod(selectedEquation.value.method);
});

function normalizeValues(values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key in values) out[key] = normalizeNumerals(values[key]);
  return out;
}

function runSolver() {
  if (!selectedEquation.value) return;
  solverResult.value = selectedEquation.value.solve(normalizeValues(solverValues.value), solveForTarget.value || undefined);
}
</script>

<template>
  <div class="math-page">
    <header class="selector-bar">
      <div class="selector-group">
        <label class="selector-label" for="branch-select">الفرع</label>
        <select
          id="branch-select"
          v-model="selectedBranchId"
          class="selector"
          :style="selectedBranch ? { borderColor: selectedBranch.color } : undefined"
        >
          <option
            v-for="branch in branchOptions"
            :key="branch.id"
            :value="branch.id"
          >
            {{ branch.name }}
          </option>
        </select>
      </div>

      <div class="selector-group">
        <label class="selector-label" for="equation-select">المعادلة</label>
        <select
          id="equation-select"
          v-model="selectedEquationId"
          class="selector"
          :disabled="!selectedBranchId"
        >
          <option
            v-for="equation in equationOptions"
            :key="equation.id"
            :value="equation.id"
          >
            {{ equation.name }}
          </option>
        </select>
      </div>

      <div class="selector-group search-group">
        <label class="selector-label" for="search-input">بحث</label>
        <input
          id="search-input"
          v-model="searchQuery"
          class="selector search-field"
          type="text"
          placeholder="ابحث عن معادلة أو صيغة..."
        />
      </div>
    </header>

    <main class="content-area">
      <div class="three-columns">
        <div class="column-right">
          <h2 class="section-title">الشرح</h2>
          <div class="content-scroll">
            <div class="section-block">
              <h3 class="block-title">المعادلة</h3>
              <div v-if="selectedEquation" class="formula">
                <MathText :text="selectedEquation.formula" />
              </div>
              <p v-else class="empty-text">اختر معادلة لعرض الصيغة</p>
            </div>
            <div class="section-block">
              <h3 class="block-title">الاستخدام</h3>
              <p v-if="selectedEquation" class="block-text">{{ selectedEquation.description }}</p>
              <p v-else class="empty-text">اختر معادلة لعرض الاستخدام</p>
            </div>
            <div class="section-block">
              <h3 class="block-title">طريقة الحل باستخدام الثوابت</h3>
              <template v-if="selectedEquation && parsedMethod">
                <p v-if="parsedMethod.intro" class="block-text">{{ parsedMethod.intro }}</p>
                <ol class="method-steps">
                  <li
                    v-for="(step, idx) in parsedMethod.steps"
                    :key="idx"
                    class="method-step"
                  >
                    <MathText :text="step.replace(/^\d+\)\s*/, '')" />
                  </li>
                </ol>
              </template>
              <p v-else class="empty-text">اختر معادلة لعرض طريقة الحل</p>
            </div>
          </div>
        </div>

        <div class="column-middle">
          <h2 class="section-title">تطبيق عملي</h2>
          <div class="content-scroll">
            <template v-if="selectedEquation">
              <div
                v-for="example in selectedEquation.examples"
                :key="example.title"
                class="example-card"
              >
                <h4 class="example-title">{{ example.title }}</h4>
                <ul class="steps">
                  <li
                    v-for="(step, idx) in example.steps"
                    :key="idx"
                    class="step"
                  >
                    <MathText :text="step" />
                  </li>
                </ul>
              </div>
            </template>
            <p v-else class="empty-text">اختر معادلة لعرض الأمثلة</p>

            <div v-if="selectedEquation?.applicationProblems?.length" class="solver-section">
              <h3 class="block-title">مسائل تطبيقية</h3>
              <div
                v-for="(problem, idx) in selectedEquation.applicationProblems"
                :key="idx"
                class="problem-card"
              >
                <p class="problem-text">{{ problem.question }}</p>
                <button
                  class="practice-btn"
                  @click="revealedProblems[idx] = { ...(revealedProblems[idx] || {}), hint: true }"
                >
                  تلميح
                </button>
                <p v-if="revealedProblems[idx]?.hint" class="hint-text">{{ problem.hint }}</p>
                <button
                  class="practice-btn reveal"
                  @click="revealedProblems[idx] = { ...(revealedProblems[idx] || {}), answer: true }"
                >
                  إظهار الحل
                </button>
                <div v-if="revealedProblems[idx]?.answer" class="practice-result">
                  {{ problem.answer }}
                </div>
                <button class="practice-btn" @click="loadProblemVariables(problem)">
                  حل باستخدام الآلة الحاسبة
                </button>
                <div class="problem-attempt">
                  <input
                    v-model="problemAnswers[idx]"
                    class="solver-field"
                    type="text"
                    placeholder="أدخل إجابتك"
                    :disabled="problemChecks[idx] === 'correct' || (problemAttempts[idx] ?? 0) >= MAX_ATTEMPTS"
                  />
                  <button
                    class="practice-btn"
                    :disabled="problemChecks[idx] === 'correct' || (problemAttempts[idx] ?? 0) >= MAX_ATTEMPTS"
                    @click="checkProblemAnswer(idx, problem)"
                  >
                    تحقق
                  </button>
                </div>
                <div class="attempts-text">
                  محاولات: {{ problemAttempts[idx] ?? 0 }} / {{ MAX_ATTEMPTS }}
                </div>
                <div v-if="problemChecks[idx] === 'correct'" class="problem-feedback correct">
                  إجابة صحيحة
                </div>
                <div v-if="problemChecks[idx] === 'incorrect'" class="problem-feedback incorrect">
                  إجابة خاطئة، حاول مرة أخرى.
                </div>
                <div v-if="problemNoExpected[idx]" class="problem-feedback no-expected">
                  لا يوجد تصحيح تلقائي. راجع الحل وأعلم المدرس.
                </div>
              </div>
            </div>

            <div v-if="selectedEquation" class="solver-section">
              <h3 class="block-title">جرب بنفسك</h3>
              <div class="solve-for-group">
                <label class="solver-label" for="solve-for-select">المتغير المطلوب حسابه</label>
                <select
                  id="solve-for-select"
                  v-model="solveForTarget"
                  class="solver-field solve-for-select"
                >
                  <option
                    v-for="variable in variableInputs"
                    :key="variable.name"
                    :value="variable.name"
                  >
                    {{ variable.label }}
                  </option>
                </select>
              </div>
              <p class="solve-for-hint">أدخل قيم باقي المتغيرات لحساب {{ solveForTarget }}</p>
              <div class="solver-inputs">
                <div
                  v-for="variable in inputVariables"
                  :key="variable.name"
                  class="solver-input"
                >
                  <label class="solver-label" :for="`var-${variable.name}`">
                    {{ variable.label }}
                  </label>
                  <input
                    :id="`var-${variable.name}`"
                    v-model="solverValues[variable.name]"
                    class="solver-field"
                    type="text"
                    :placeholder="variable.type === 'list' ? '2, 4, 6' : '0'"
                  />
                </div>
                <button class="solver-btn" @click="runSolver">حل</button>
              </div>
              <div v-if="solverResult" class="solver-result">
                <div class="result-value">
                  <MathText :text="solverResult.result" />
                </div>
                <ol class="result-steps">
                  <li v-for="(step, idx) in solverResult.steps" :key="idx">
                    <MathText :text="step" />
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div class="column-left">
          <h2 class="section-title">رسم وملاحظات</h2>
          <div class="content-scroll">
            <template v-if="selectedEquation">
              <div v-if="selectedEquation.graph" class="section-block">
                <h3 class="block-title">رسم تفاعلي</h3>
                <p class="graph-label">{{ selectedEquation.graph.label }}</p>
                <svg class="equation-graph" viewBox="0 0 300 180">
                  <line
                    v-if="graphAxes?.xAxisY != null"
                    :x1="0"
                    :y1="graphAxes.xAxisY"
                    :x2="graphAxes.width"
                    :y2="graphAxes.xAxisY"
                    class="axis-line"
                  />
                  <line
                    v-if="graphAxes?.yAxisX != null"
                    :x1="graphAxes.yAxisX"
                    :y1="0"
                    :x2="graphAxes.yAxisX"
                    :y2="graphAxes.height"
                    class="axis-line"
                  />
                  <polyline
                    v-for="(seg, idx) in graphSegments"
                    :key="idx"
                    :points="seg.points"
                    :stroke="seg.color || '#38bdf8'"
                    fill="none"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p class="hint-text">غيّر القيم في "جرب بنفسك" لتحديث الرسم.</p>
              </div>

              <div v-if="selectedEquation.constants?.length" class="section-block">
                <h3 class="block-title">ثوابت مهمة</h3>
                <div class="constants-list">
                  <div
                    v-for="constant in selectedEquation.constants"
                    :key="constant.label"
                    class="constant-item"
                  >
                    <span class="constant-label">{{ constant.label }}</span>
                    <span class="constant-value">{{ constant.value }}</span>
                    <span v-if="constant.description" class="constant-desc">{{ constant.description }}</span>
                  </div>
                </div>
              </div>

              <div class="section-block">
                <h3 class="block-title">تدريب عشوائي</h3>
                <button class="practice-btn" @click="generatePractice">
                  {{ practiceMode ? 'معادلة تدريب جديدة' : 'ابدأ التدريب' }}
                </button>
                <div v-if="practiceMode" class="practice-card">
                  <div
                    v-for="variable in selectedEquation.variables"
                    :key="variable.name"
                    class="practice-row"
                  >
                    <span class="practice-var">{{ variable.label }}</span>
                    <span class="practice-val">= {{ practiceValues[variable.name] }}</span>
                  </div>
                  <button class="practice-btn reveal" @click="practiceReveal = true">
                    إظهار الحل
                  </button>
                  <div v-if="practiceReveal && practiceResult" class="practice-result">
                    <div class="result-value">
                      <MathText :text="practiceResult.result" />
                    </div>
                    <ol class="result-steps">
                      <li v-for="(step, idx) in practiceResult.steps" :key="idx">
                        <MathText :text="step" />
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              <div class="section-block">
                <h3 class="block-title">لوحة النقاط</h3>
                <div class="score-board">
                  <div class="score-value">{{ solvedCount }}</div>
                  <div class="score-label">مسائل حُلّت</div>
                </div>
              </div>

              <div class="section-block">
                <h3 class="block-title">ملاحظاتي</h3>
                <textarea
                  v-model="noteText"
                  class="notes-area"
                  rows="4"
                  placeholder="اكتب ملاحظاتك الخاصة هنا..."
                />
              </div>

              <div
                v-if="selectedEquation.relatedExperiments?.length"
                class="section-block"
              >
                <h3 class="block-title">ارتباطات بفروع أخرى</h3>
                <div class="related-list">
                  <RouterLink
                    v-for="exp in selectedEquation.relatedExperiments"
                    :key="exp.id"
                    :to="exp.route"
                    class="related-link"
                  >
                    <span class="related-name">{{ exp.name }}</span>
                    <span v-if="exp.context" class="related-context">{{ exp.context }}</span>
                  </RouterLink>
                </div>
              </div>
            </template>
            <p v-else class="empty-text">اختر معادلة لعرض الرسم والملاحظات والتدريب.</p>
          </div>
        </div>
      </div>
    </main>

    <FeedbackModal v-model:show="showFeedback" experiment-id="math" experiment-name="Math" />
    <button class="feedback-fab" @click="showFeedback = true" :title="t('experiments.reportProblem')">🚩</button>
  </div>
</template>

<style scoped>
.math-page {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  --feedback-fab-bottom: 1rem;
  --feedback-fab-side: 1rem;
  background:
    radial-gradient(circle at 10% 20%, rgba(167, 139, 250, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 30%),
    linear-gradient(135deg, #080c15 0%, #0f172a 50%, #0b1220 100%);
  color: #e2e8f0;
  padding: 1rem;
}

.selector-bar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  max-width: 1200px;
  margin: 0 auto 1rem;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 180px;
  flex: 1;
}

.selector-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.selector {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.selector:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.selector:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selector option {
  background: #0f172a;
  color: #e2e8f0;
}

.search-group {
  flex: 1;
  min-width: 220px;
}

.search-field {
  cursor: text;
  width: 100%;
}

.content-area {
  margin: 0 auto;
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  overflow: auto;
}

.three-columns {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  min-height: 100%;
}

.column-right,
.column-middle,
.column-left {
  padding: 1rem;
  min-height: 100%;
  border-inline-end: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-left {
  border-inline-end: none;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.section-title {
  margin: 0 0 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.section-block {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.block-title {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.block-text {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #e2e8f0;
}

.method-steps {
  margin: 0;
  padding: 0 1.2rem 0 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #e2e8f0;
  direction: rtl;
}

.method-step {
  margin-bottom: 0.5rem;
  color: #cbd5e1;
}

.method-step:last-child {
  margin-bottom: 0;
}

.empty-text {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.example-card {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.solver-section {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.related-link {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  text-decoration: none;
  text-align: center;
  border: 1px solid rgba(56, 189, 248, 0.2);
  transition: background 0.2s ease;
}

.related-link:hover {
  background: rgba(56, 189, 248, 0.2);
}

.related-name {
  font-weight: 700;
}

.related-context {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
}

.field-card {
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 4px solid #38bdf8;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.field-title {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.formula {
  font-size: 1.15rem;
  font-weight: 600;
  color: #f1f5f9;
  direction: ltr;
  unicode-bidi: embed;
  text-align: start;
  background: rgba(15, 23, 42, 0.5);
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.formula :deep(sup),
.result-value :deep(sup),
.step :deep(sup),
.method-step :deep(sup) {
  font-size: 0.65em;
  vertical-align: super;
  line-height: 0;
}

.field-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #e2e8f0;
}

.example {
  margin-bottom: 1rem;
}

.example:last-child {
  margin-bottom: 0;
}

.example-title {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}

.steps {
  margin: 0;
  padding: 0 1.1rem 0 0;
  list-style: decimal;
  direction: rtl;
}

.step {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin-bottom: 0.35rem;
}

.solver-card {
  max-width: 1200px;
  margin: 1rem auto 0;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 4px solid #38bdf8;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.solver-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
}

.solve-for-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.solve-for-select {
  min-width: 120px;
  cursor: pointer;
  flex: 0 0 auto;
}

.solve-for-hint {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: #38bdf8;
  font-weight: 600;
}

.solver-input {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
  flex: 1;
}

.solver-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.solver-field {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
}

.solver-field:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.solver-btn {
  padding: 0.55rem 1.25rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: #0f172a;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.solver-btn:hover {
  opacity: 0.9;
}

.solver-result {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.result-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 0.75rem;
  direction: ltr;
  unicode-bidi: embed;
}

.result-steps {
  margin: 0;
  padding: 0 1.2rem 0 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #cbd5e1;
  direction: rtl;
}

.graph-label {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
  direction: ltr;
  text-align: start;
}

.equation-graph {
  width: 100%;
  height: auto;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.axis-line {
  stroke: #475569;
  stroke-width: 1;
}

.graph-curve {
  fill: none;
  stroke: #38bdf8;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: drawGraph 1.5s ease-out forwards;
}

@keyframes drawGraph {
  to {
    stroke-dashoffset: 0;
  }
}

.hint-text {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: #64748b;
}

.constants-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.constant-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.constant-label {
  font-weight: 700;
  color: #a78bfa;
  direction: ltr;
}

.constant-value {
  color: #e2e8f0;
  direction: ltr;
  unicode-bidi: embed;
}

.constant-desc {
  width: 100%;
  font-size: 0.75rem;
  color: #94a3b8;
}

.practice-btn {
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.practice-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.practice-btn.reveal {
  margin-top: 0.75rem;
  background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
}

.practice-card {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.practice-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  direction: ltr;
  justify-content: flex-start;
}

.practice-var {
  font-weight: 700;
  color: #38bdf8;
}

.practice-val {
  color: #e2e8f0;
}

.practice-result {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.problem-card {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.problem-card .practice-btn {
  margin-top: 0.5rem;
  margin-inline-end: 0.5rem;
}

.problem-text {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #f1f5f9;
}

.problem-attempt {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  align-items: stretch;
}

.problem-attempt .solver-field {
  flex: 1;
  min-width: 0;
}

.problem-feedback {
  margin-top: 0.6rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.problem-feedback.correct {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.problem-feedback.incorrect {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.problem-feedback.no-expected {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.attempts-text {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.score-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.score-value {
  font-size: 2rem;
  font-weight: 800;
  color: #38bdf8;
}

.score-label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.notes-area {
  width: 100%;
  padding: 0.65rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.4);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.85rem;
  resize: vertical;
  outline: none;
}

.notes-area:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

@media (max-width: 960px) {
  .three-columns {
    grid-template-columns: 1fr;
  }

  .column-right,
  .column-middle,
  .column-left {
    border-inline-end: none;
    border-block-end: 1px solid rgba(255, 255, 255, 0.25);
  }

  .column-left {
    border-block-end: none;
  }
}

@media (max-width: 640px) {
  .selector-bar {
    flex-direction: column;
    align-items: stretch;
  }
}

.feedback-fab {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.15);
  backdrop-filter: blur(8px);
  color: #fca5a5;
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.feedback-fab:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}
</style>
