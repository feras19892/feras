<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue'
import type { Quiz, QuizQuestion } from '../../services/quiz.service'

const props = defineProps<{
  quiz: Quiz
  questions: QuizQuestion[]
  answers: Record<number, string>
  currentQ: number
  timeLeft: number
  timeUpWarning: boolean
  result: { score: number; total: number } | null
  quizError: string
  quizLoading: boolean
  showConfirm: boolean
}>()

const emit = defineEmits<{
  'update:answers': [Record<number, string>]
  'update:currentQ': [number]
  'update:showConfirm': [boolean]
  next: []
  prev: []
  goTo: [number]
  submit: []
  close: []
}>()

const answeredCount = computed(() => Object.keys(props.answers).length)
const totalQuestions = computed(() => props.questions.length)
const timeDisplay = computed(() => {
  const m = Math.floor(props.timeLeft / 60)
  const s = props.timeLeft % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})
const progressPercent = computed(() => totalQuestions.value > 0 ? Math.round((answeredCount.value / totalQuestions.value) * 100) : 0)
const totalTime = computed(() => (props.quiz.time_limit_minutes ?? 0) * 60)
const timerPercent = computed(() => totalTime.value > 0 ? Math.round((props.timeLeft / totalTime.value) * 100) : 0)
const isLastQuestion = computed(() => props.currentQ === props.questions.length - 1)
const currentQuestion = computed(() => props.questions[props.currentQ] || null)
const resultPercent = computed(() => props.result && props.result.total > 0 ? Math.round((props.result.score / props.result.total) * 100) : 0)
const resultGrade = computed(() => {
  const p = resultPercent.value
  if (p >= 90) return { label: 'ممتاز', color: '#16a34a', icon: '🏆' }
  if (p >= 75) return { label: 'جيد جداً', color: '#3b82f6', icon: '✅' }
  if (p >= 60) return { label: 'جيد', color: '#f59e0b', icon: '👍' }
  if (p >= 50) return { label: 'مقبول', color: '#f97316', icon: '⚠️' }
  return { label: 'ضعيف', color: '#dc2626', icon: '❌' }
})

function selectAnswer(qId: number, val: string) {
  emit('update:answers', { ...props.answers, [qId]: val })
}
</script>

<template>
  <div class="active-quiz">
    <div class="quiz-topbar">
      <h2>{{ quiz.title }}</h2>
      <div class="timer" :class="{ urgent: timeLeft < 60 }">⏱️ {{ timeDisplay }}</div>
    </div>
    <div v-if="!result" class="timer-bar-wrap">
      <div class="timer-bar-fill" :class="{ urgent: timeLeft < 60 }" :style="{ width: timerPercent + '%' }"></div>
    </div>

    <!-- Result Screen -->
    <div v-if="result" class="result-box">
      <div class="result-icon" :style="{ color: resultGrade.color }">{{ resultGrade.icon }}</div>
      <h3>{{ t('dashboard.dash.quizResult') }}</h3>
      <div class="score-display">
        <span class="score-num" :style="{ color: resultGrade.color }">{{ result.score }}</span>
        <span class="score-sep">/</span>
        <span class="score-total">{{ result.total }}</span>
      </div>
      <p class="score-percent" :style="{ color: resultGrade.color }">{{ resultPercent }}%</p>
      <div class="result-grade-badge" :style="{ background: resultGrade.color + '20', color: resultGrade.color, borderColor: resultGrade.color }">{{ resultGrade.label }}</div>
      <div class="result-stats">
        <div class="rs-item"><span class="rs-val">{{ answeredCount }}</span><span class="rs-lbl">أجبت عليها</span></div>
        <div class="rs-item"><span class="rs-val">{{ totalQuestions - answeredCount }}</span><span class="rs-lbl">لم تُجب</span></div>
        <div class="rs-item"><span class="rs-val">{{ totalQuestions }}</span><span class="rs-lbl">إجمالي الأسئلة</span></div>
      </div>
      <div class="result-actions">
        <button class="btn-back" @click="emit('close')">{{ t('dashboard.dash.quizBackToList') }}</button>
      </div>
    </div>

    <!-- Quiz Taking -->
    <div v-else>
      <div v-if="quizError" class="error-box">❌ {{ quizError }}</div>
      <div v-if="timeUpWarning && timeLeft <= 30 && timeLeft > 0" class="time-warning">⚠️ {{ t('dashboard.dash.quizTimeWarning', 'تبقى أقل من 30 ثانية! سيتم الإرسال تلقائياً.') }}</div>

      <div class="quiz-progress-wrap">
        <div class="quiz-progress-info"><span>السؤال {{ currentQ + 1 }} من {{ totalQuestions }}</span><span>{{ answeredCount }} / {{ totalQuestions }} مجاب</span></div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" :style="{ width: progressPercent + '%' }"></div></div>
      </div>

      <div class="q-nav-dots">
        <button v-for="(q, i) in questions" :key="q.id" class="q-dot" :class="{ active: i === currentQ, answered: answers[q.id] }" @click="emit('goTo', i)">{{ i + 1 }}</button>
      </div>

      <div v-if="currentQuestion" class="question-card single-q">
        <div class="question-header"><span class="question-num">{{ t('dashboard.dash.quizQuestion') }} {{ currentQ + 1 }}</span><span class="question-points">{{ currentQuestion.points }} {{ t('dashboard.dash.quizPoints') }}</span></div>
        <p class="question-text">{{ currentQuestion.question_text }}</p>
        <div class="options">
          <label v-if="currentQuestion.option_a" :class="{ selected: answers[currentQuestion.id] === 'a' }"><input type="radio" :name="'q' + currentQuestion.id" value="a" :checked="answers[currentQuestion.id] === 'a'" @change="selectAnswer(currentQuestion.id, 'a')" /><span class="option-letter">A</span><span>{{ currentQuestion.option_a }}</span></label>
          <label v-if="currentQuestion.option_b" :class="{ selected: answers[currentQuestion.id] === 'b' }"><input type="radio" :name="'q' + currentQuestion.id" value="b" :checked="answers[currentQuestion.id] === 'b'" @change="selectAnswer(currentQuestion.id, 'b')" /><span class="option-letter">B</span><span>{{ currentQuestion.option_b }}</span></label>
          <label v-if="currentQuestion.option_c" :class="{ selected: answers[currentQuestion.id] === 'c' }"><input type="radio" :name="'q' + currentQuestion.id" value="c" :checked="answers[currentQuestion.id] === 'c'" @change="selectAnswer(currentQuestion.id, 'c')" /><span class="option-letter">C</span><span>{{ currentQuestion.option_c }}</span></label>
          <label v-if="currentQuestion.option_d" :class="{ selected: answers[currentQuestion.id] === 'd' }"><input type="radio" :name="'q' + currentQuestion.id" value="d" :checked="answers[currentQuestion.id] === 'd'" @change="selectAnswer(currentQuestion.id, 'd')" /><span class="option-letter">D</span><span>{{ currentQuestion.option_d }}</span></label>
        </div>
      </div>

      <div class="quiz-nav-actions">
        <button class="btn-prev" @click="emit('prev')" :disabled="currentQ === 0">← السابق</button>
        <button v-if="!isLastQuestion" class="btn-next" @click="emit('next')" :disabled="!answers[currentQuestion?.id ?? '']">التالي →</button>
        <button v-else class="btn-submit-final" @click="emit('update:showConfirm', true)" :disabled="answeredCount === 0">✓ تأكيد الإرسال</button>
      </div>

      <Transition name="confirm-fade">
        <div v-if="showConfirm" class="confirm-overlay" @click.self="emit('update:showConfirm', false)">
          <div class="confirm-card">
            <h3>تأكيد الإرسال</h3>
            <p>أجبت على <strong>{{ answeredCount }}</strong> من <strong>{{ totalQuestions }}</strong> سؤال.</p>
            <p v-if="answeredCount < totalQuestions" class="confirm-warn">⚠️ هناك {{ totalQuestions - answeredCount }} سؤال لم تُجب عليه!</p>
            <p class="confirm-hint">لا يمكن التراجع بعد الإرسال</p>
            <div class="confirm-actions">
              <button class="btn-cancel-confirm" @click="emit('update:showConfirm', false)">إلغاء</button>
              <button class="btn-confirm-submit" @click="emit('update:showConfirm', false); emit('submit')" :disabled="quizLoading">{{ quizLoading ? 'جاري الإرسال...' : 'تأكيد وإرسال' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped src="./student-quizzes-tab.css"></style>
