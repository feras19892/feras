<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { getAvailableQuizzes, getQuiz, startQuiz, submitQuiz, type Quiz, type QuizQuestion } from '../../services/quiz.service';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const quizzes = ref<Quiz[]>([]);
const loading = ref(false);
const error = ref('');

const activeQuiz = ref<Quiz | null>(null);
const questions = ref<QuizQuestion[]>([]);
const answers = ref<Record<number, string>>({});
const quizLoading = ref(false);
const quizError = ref('');
const result = ref<{ score: number; total: number } | null>(null);
const timeLeft = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

async function loadQuizzes() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAvailableQuizzes();
    if (res.success) quizzes.value = res.quizzes;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('dashboard.dash.quizFailed');
  }
  loading.value = false;
}

async function openQuiz(quiz: Quiz) {
  if (quiz.submitted) return;
  quizLoading.value = true;
  quizError.value = '';
  result.value = null;
  answers.value = {};
  try {
    const res = await getQuiz(quiz.id);
    if (res.success) {
      activeQuiz.value = res.quiz;
      questions.value = res.questions;
      if (res.submission?.submitted_at) {
        result.value = { score: res.submission.score, total: quiz.max_score };
      } else {
        await startQuiz(quiz.id);
        timeLeft.value = res.quiz.time_limit_minutes * 60;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          timeLeft.value--;
          if (timeLeft.value <= 0) {
            handleSubmit();
          }
        }, 1000);
      }
    } else {
      quizError.value = res.message || t('dashboard.dash.quizLoadFailed');
    }
  } catch (err) {
    quizError.value = t('dashboard.dash.quizLoadFailed');
    if (import.meta.env.DEV) console.error('openQuiz failed:', err);
  }
  quizLoading.value = false;
}

function closeQuiz() {
  activeQuiz.value = null;
  questions.value = [];
  answers.value = {};
  result.value = null;
  if (timer) { clearInterval(timer); timer = null; }
}

async function handleSubmit() {
  if (!activeQuiz.value) return;
  if (timer) { clearInterval(timer); timer = null; }
  quizLoading.value = true;
  try {
    const res = await submitQuiz(activeQuiz.value.id, answers.value);
    if (res.success && res.score !== undefined && res.total !== undefined) {
      result.value = { score: res.score, total: res.total };
    } else {
      quizError.value = res.message || t('dashboard.dash.quizSubmitFailed');
    }
  } catch (err) {
    quizError.value = t('dashboard.dash.quizSubmitFailed');
    if (import.meta.env.DEV) console.error('quiz submit failed:', err);
  }
  quizLoading.value = false;
}

const answeredCount = computed(() => Object.keys(answers.value).length);
const totalQuestions = computed(() => questions.value.length);
const timeDisplay = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

onMounted(loadQuizzes);
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

<template>
  <div class="quizzes-tab">
    <!-- Quiz List -->
    <div v-if="!activeQuiz">
      <div v-if="loading" class="loading">{{ t('dashboard.dash.quizLoading') }}</div>
      <div v-else-if="error" class="error-box">❌ {{ error }}</div>
      <div v-else-if="quizzes.length === 0" class="empty">{{ t('dashboard.dash.quizNoAvailable') }}</div>
      <div v-else class="quiz-list">
        <div v-for="q in quizzes" :key="q.id" :class="['quiz-card', { submitted: q.submitted }]">
          <div class="quiz-header">
            <h3>{{ q.title }}</h3>
            <span :class="['quiz-status', q.status]">{{ q.status === 'published' ? t('dashboard.dash.quizAvailable') : q.status === 'closed' ? t('dashboard.dash.quizClosed') : q.status }}</span>
          </div>
          <p v-if="q.description" class="quiz-desc">{{ q.description }}</p>
          <div class="quiz-meta">
            <span>⏱️ {{ q.time_limit_minutes }} {{ t('dashboard.dash.quizMinutes') }}</span>
            <span>📊 {{ q.max_score }} {{ t('dashboard.dash.quizPoints') }}</span>
            <span v-if="q.submitted" class="score-badge">✅ {{ q.score }}/{{ q.max_score }}</span>
          </div>
          <button v-if="!q.submitted && q.status === 'published'" class="btn-start" @click="openQuiz(q)" :disabled="quizLoading">
            {{ t('dashboard.dash.quizStart') }}
          </button>
          <span v-else-if="q.submitted" class="done-badge">{{ t('dashboard.dash.quizSubmitted') }}</span>
        </div>
      </div>
    </div>

    <!-- Active Quiz -->
    <div v-else class="active-quiz">
      <div class="quiz-topbar">
        <h2>{{ activeQuiz.title }}</h2>
        <div class="timer" :class="{ urgent: timeLeft < 60 }">⏱️ {{ timeDisplay }}</div>
      </div>

      <div v-if="result" class="result-box">
        <h3>{{ t('dashboard.dash.quizResult') }}</h3>
        <div class="score-display">
          <span class="score-num">{{ result.score }}</span>
          <span class="score-sep">/</span>
          <span class="score-total">{{ result.total }}</span>
        </div>
        <p class="score-percent">{{ Math.round((result.score / result.total) * 100) }}%</p>
        <button class="btn-back" @click="closeQuiz(); loadQuizzes()">{{ t('dashboard.dash.quizBackToList') }}</button>
      </div>

      <div v-else>
        <div v-if="quizError" class="error-box">❌ {{ quizError }}</div>
        <div class="progress-bar">
          <span>{{ answeredCount }} / {{ totalQuestions }} {{ t('dashboard.dash.quizAnswered') }}</span>
        </div>

        <div v-for="(q, i) in questions" :key="q.id" class="question-card">
          <div class="question-header">
            <span class="question-num">{{ t('dashboard.dash.quizQuestion') }} {{ i + 1 }}</span>
            <span class="question-points">{{ q.points }} {{ t('dashboard.dash.quizPoints') }}</span>
          </div>
          <p class="question-text">{{ q.question_text }}</p>
          <div class="options">
            <label v-if="q.option_a" :class="{ selected: answers[q.id] === 'a' }">
              <input type="radio" :name="'q' + q.id" value="a" v-model="answers[q.id]" />
              <span class="option-letter">A</span>
              <span>{{ q.option_a }}</span>
            </label>
            <label v-if="q.option_b" :class="{ selected: answers[q.id] === 'b' }">
              <input type="radio" :name="'q' + q.id" value="b" v-model="answers[q.id]" />
              <span class="option-letter">B</span>
              <span>{{ q.option_b }}</span>
            </label>
            <label v-if="q.option_c" :class="{ selected: answers[q.id] === 'c' }">
              <input type="radio" :name="'q' + q.id" value="c" v-model="answers[q.id]" />
              <span class="option-letter">C</span>
              <span>{{ q.option_c }}</span>
            </label>
            <label v-if="q.option_d" :class="{ selected: answers[q.id] === 'd' }">
              <input type="radio" :name="'q' + q.id" value="d" v-model="answers[q.id]" />
              <span class="option-letter">D</span>
              <span>{{ q.option_d }}</span>
            </label>
          </div>
        </div>

        <div class="quiz-actions">
          <button class="btn-cancel" @click="closeQuiz">{{ t('dashboard.dash.quizCancel') }}</button>
          <button class="btn-submit" @click="handleSubmit" :disabled="quizLoading || answeredCount === 0">
            {{ quizLoading ? t('dashboard.dash.quizSubmitting') : t('dashboard.dash.quizSubmit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quizzes-tab { color: #e2e8f0; }
.loading, .empty { text-align: center; color: #64748b; padding: 2rem; }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }

.quiz-list { display: flex; flex-direction: column; gap: 0.8rem; }
.quiz-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; }
.quiz-card.submitted { opacity: 0.7; }
.quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
.quiz-header h3 { margin: 0; font-size: 1rem; color: #f1f5f9; }
.quiz-status { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.7rem; font-weight: 700; }
.quiz-status.published { background: rgba(34,197,94,0.15); color: #4ade80; }
.quiz-status.closed { background: rgba(100,116,139,0.15); color: #94a3b8; }
.quiz-desc { font-size: 0.85rem; color: #94a3b8; margin: 0.3rem 0 0.5rem; }
.quiz-meta { display: flex; gap: 1rem; font-size: 0.78rem; color: #64748b; margin-bottom: 0.6rem; }
.score-badge { color: #4ade80; font-weight: 700; }
.btn-start { padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 0.85rem; }
.btn-start:disabled { opacity: 0.5; }
.done-badge { color: #64748b; font-size: 0.8rem; }

.active-quiz { }
.quiz-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.quiz-topbar h2 { margin: 0; font-size: 1.2rem; color: #f1f5f9; }
.timer { font-size: 1.1rem; font-weight: 800; color: #67e8f9; padding: 0.3rem 0.8rem; border-radius: 0.4rem; background: rgba(6,182,212,0.1); }
.timer.urgent { color: #fca5a5; background: rgba(239,68,68,0.1); animation: pulse 1s infinite; }
@keyframes pulse { 50% { opacity: 0.6; } }

.progress-bar { font-size: 0.8rem; color: #94a3b8; margin-bottom: 1rem; padding: 0.4rem 0.6rem; background: rgba(15,23,42,0.5); border-radius: 0.4rem; }

.question-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; margin-bottom: 0.8rem; }
.question-header { display: flex; justify-content: space-between; margin-bottom: 0.4rem; }
.question-num { font-size: 0.75rem; color: #a5b4fc; font-weight: 700; }
.question-points { font-size: 0.7rem; color: #64748b; }
.question-text { font-size: 0.9rem; color: #e2e8f0; margin: 0 0 0.6rem; }
.options { display: flex; flex-direction: column; gap: 0.4rem; }
.options label { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.7rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; font-size: 0.85rem; color: #cbd5e1; transition: all 0.15s; }
.options label:hover { background: rgba(255,255,255,0.03); }
.options label.selected { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #c7d2fe; }
.options input { display: none; }
.option-letter { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
.options label.selected .option-letter { background: #6366f1; color: #fff; }

.quiz-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
.btn-cancel { padding: 0.5rem 1rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
.btn-submit { padding: 0.5rem 1.2rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 0.85rem; }
.btn-submit:disabled { opacity: 0.5; }

.result-box { text-align: center; padding: 2rem; background: rgba(15,23,42,0.6); border-radius: 0.8rem; }
.result-box h3 { margin: 0 0 1rem; color: #f1f5f9; }
.score-display { display: flex; align-items: center; justify-content: center; gap: 0.3rem; margin-bottom: 0.3rem; }
.score-num { font-size: 3rem; font-weight: 800; color: #4ade80; }
.score-sep { font-size: 2rem; color: #64748b; }
.score-total { font-size: 2rem; color: #94a3b8; }
.score-percent { font-size: 1.2rem; color: #67e8f9; margin: 0.5rem 0 1rem; }
.btn-back { padding: 0.5rem 1.2rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
</style>
