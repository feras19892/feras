<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getAvailableQuizzes, getQuiz, startQuiz, submitQuiz, getMySubmissionReview, type Quiz, type QuizQuestion, type SubmissionReview } from '../../services/quiz.service';

import { useConfirmDialog } from '../../composables/useConfirmDialog';
import QuizModals from './QuizModals.vue';
import QuizActiveScreen from './QuizActiveScreen.vue';





const { confirmDialog } = useConfirmDialog();

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
const timeUpWarning = ref(false);
const currentQ = ref(0);
const showConfirm = ref(false);
const reviewData = ref<SubmissionReview | null>(null);
const showReview = ref(false);
const reviewLoading = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

function quizStorageKey(quizId: number): string {
  return `quiz_answers_${quizId}`;
}

function saveAnswersToStorage() {
  if (!activeQuiz.value) return;
  localStorage.setItem(quizStorageKey(activeQuiz.value.id), JSON.stringify(answers.value));
}

function loadAnswersFromStorage(quizId: number): Record<number, string> | null {
  const raw = localStorage.getItem(quizStorageKey(quizId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function clearAnswersFromStorage(quizId: number) {
  localStorage.removeItem(quizStorageKey(quizId));
}

watch(answers, () => { if (activeQuiz.value && !result.value) saveAnswersToStorage(); }, { deep: true });

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
        result.value = { score: Number(res.submission.score), total: quiz.max_score };
      } else {
        const saved = loadAnswersFromStorage(quiz.id);
        if (saved) answers.value = saved;
        await startQuiz(quiz.id);
        timeLeft.value = res.quiz.time_limit_minutes * 60;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          timeLeft.value--;
          if (timeLeft.value === 30) {
            timeUpWarning.value = true;
          }
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
  if (Object.keys(answers.value).length > 0 && !result.value) {
    confirmDialog({ message: t('dashboard.dash.quizConfirmClose', 'هل تريد الخروج؟ سيتم حفظ إجاباتك.'), variant: 'danger' }).then(ok => {
      if (!ok) return;
      if (timer) { clearInterval(timer); timer = null; }
      if (activeQuiz.value) saveAnswersToStorage();
      quizLoading.value = false;
      activeQuiz.value = null;
      questions.value = [];
      answers.value = {};
      result.value = null;
      timeUpWarning.value = false;
      currentQ.value = 0;
    });
    return;
  }
  if (timer) { clearInterval(timer); timer = null; }
  quizLoading.value = false;
  activeQuiz.value = null;
  questions.value = [];
  answers.value = {};
  result.value = null;
  timeUpWarning.value = false;
  currentQ.value = 0;
}

async function handleSubmit() {
  if (!activeQuiz.value) return;
  if (timer) { clearInterval(timer); timer = null; }
  quizLoading.value = true;
  try {
    const res = await submitQuiz(activeQuiz.value.id, answers.value);
    if (res.success && res.score !== undefined && res.total !== undefined) {
      result.value = { score: res.score, total: res.total };
      timeUpWarning.value = false;
      clearAnswersFromStorage(activeQuiz.value.id);
    } else {
      quizError.value = res.message || t('dashboard.dash.quizSubmitFailed');
    }
  } catch (err) {
    quizError.value = t('dashboard.dash.quizSubmitFailed');
    if (import.meta.env.DEV) console.error('quiz submit failed:', err);
  }
  quizLoading.value = false;
}

function nextQuestion() {
  if (currentQ.value < questions.value.length - 1) currentQ.value++;
}
function prevQuestion() {
  if (currentQ.value > 0) currentQ.value--;
}
function goToQuestion(i: number) {
  currentQ.value = i;
}

async function loadReview(quizId: number) {
  reviewLoading.value = true;
  showReview.value = true;
  try {
    const res = await getMySubmissionReview(quizId);
    if (res.success) reviewData.value = res;
  } catch { /* ignore */ }
  reviewLoading.value = false;
}

function closeReview() {
  showReview.value = false;
  reviewData.value = null;
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (activeQuiz.value && !result.value) {
    e.preventDefault();
    e.returnValue = '';
  }
}

onMounted(() => {
  loadQuizzes();
  window.addEventListener('beforeunload', onBeforeUnload);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener('beforeunload', onBeforeUnload);
});
</script>

<template>
  <div class="quizzes-tab">
    <!-- Quiz List -->
    <div v-if="!activeQuiz">
      <div v-if="loading" class="loading">{{ t('dashboard.dash.quizLoading') }}</div>
      <div v-else-if="error" class="error-retry-box">
        <span>❌ {{ error }}</span>
        <button class="retry-btn" @click="loadQuizzes">🔄 {{ t('common.retry', 'إعادة') }}</button>
      </div>
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
          <button v-if="q.submitted" class="btn-review" @click="loadReview(q.id)">📝 مراجعة الإجابات</button>
        </div>
      </div>
    </div>

    <!-- Active Quiz -->
    <QuizActiveScreen v-else
      :quiz="activeQuiz"
      :questions="questions"
      :answers="answers"
      :currentQ="currentQ"
      :timeLeft="timeLeft"
      :timeUpWarning="timeUpWarning"
      :result="result"
      :quizError="quizError"
      :quizLoading="quizLoading"
      :showConfirm="showConfirm"
      @update:answers="answers = $event"
      @update:currentQ="currentQ = $event"
      @update:showConfirm="showConfirm = $event"
      @next="nextQuestion"
      @prev="prevQuestion"
      @goTo="goToQuestion"
      @submit="handleSubmit"
      @close="closeQuiz(); loadQuizzes()"
    />

    <!-- Review Modal -->
    <QuizModals
      :showReview="showReview"
      :reviewData="reviewData"
      :reviewLoading="reviewLoading"
      @closeReview="closeReview"
    />
  </div>
</template>

<style scoped src="./student-quizzes-tab.css"></style>
