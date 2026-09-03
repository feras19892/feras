<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { branches, equations, type Branch, type Equation } from './data';
import { normalizeNumerals } from './math-utils';
import FeedbackModal from '../../components/shared/FeedbackModal.vue';

import MathText from './MathText.vue';
import { useMathGraph } from './useMathGraph';
import { useMathPractice } from './useMathPractice';





const showFeedback = ref(false);

const selectedBranchId = ref<string>('');
const selectedEquationId = ref<string>('');
const searchQuery = ref<string>('');
const solverValues = ref<Record<string, string>>({});
const solverResult = ref<{ result: string; steps: string[] } | null>(null);
const solveForTarget = ref<string>('');
const noteText = ref('');

const noteKey = computed(() => `math-note-${selectedEquationId.value}`);

const branchOptions = computed(() => [
  { id: '', name: t('math.selectBranch', 'اختر فرعاً') },
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
  { id: '', name: t('math.selectEquation', 'اختر معادلة') },
  ...filteredEquations.value,
]);

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

const hasSolveFor = computed(() => !!selectedEquation.value?.defaultSolveFor);

const { graphAxes, graphSegments } = useMathGraph(selectedEquation, solverValues);

const {
  practiceMode, practiceValues, practiceReveal, revealedProblems,
  problemAnswers, problemChecks, problemNoExpected, problemAttempts,
  MAX_ATTEMPTS, solvedCount, practiceResult,
  generatePractice, loadProblemVariables, checkProblemAnswer, reset: resetPractice,
} = useMathPractice(selectedEquation, solverValues, solverResult);

watch(selectedBranchId, () => {
  selectedEquationId.value = '';
});

watch(selectedEquationId, () => {
  solverValues.value = {};
  solverResult.value = null;
  solveForTarget.value = selectedEquation.value?.defaultSolveFor ?? '';
  noteText.value = selectedEquationId.value ? localStorage.getItem(noteKey.value) ?? '' : '';
  resetPractice();
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
  for (const key in values) {
    const v = values[key];
    out[key] = v ? normalizeNumerals(v) : '';
  }
  return out;
}

function runSolver() {
  if (!selectedEquation.value) return;
  const normalized = normalizeValues(solverValues.value);
  for (const v of inputVariables.value) {
    const val = normalized[v.name];
    if (val === undefined || val === '') {
      solverResult.value = { result: `يرجى إدخال قيمة للحقل: ${v.label}`, steps: [] };
      return;
    }
  }
  solverResult.value = selectedEquation.value.solve(normalized, solveForTarget.value || undefined);
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
              <div v-if="hasSolveFor" class="solve-for-group">
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
              <p v-if="hasSolveFor" class="solve-for-hint">أدخل قيم باقي المتغيرات لحساب {{ solveForTarget }}</p>
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

<style scoped src='./index.css'></style>
