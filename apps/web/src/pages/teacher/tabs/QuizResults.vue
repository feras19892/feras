<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { getMyQuizzes, getQuizSubmissions, type Quiz, type QuizSubmission } from '@/services/quiz.service'
import { getMyClasses } from '@/services/class.service'
import type { ClassItem } from '@/services/class.service'
import QuizDetailResults from './QuizDetailResults.vue'

const quizzes = ref<Quiz[]>([])
const classes = ref<ClassItem[]>([])
const loading = ref(false)
const error = ref('')
const filterClass = ref('')
const filterType = ref('')
const selectedQuiz = ref<Quiz | null>(null)
const submissions = ref<QuizSubmission[]>([])
const subsLoading = ref(false)

const quizzesWithResults = computed(() => quizzes.value.filter(q => (q.participant_count ?? 0) > 0))

const filteredQuizzes = computed(() => {
  let list = [...quizzesWithResults.value]
  if (filterClass.value) list = list.filter(q => q.class_id === filterClass.value)
  if (filterType.value) list = list.filter(q => q.quiz_type === filterType.value)
  return list
})

const overallStats = computed(() => {
  const list = quizzesWithResults.value
  if (list.length === 0) return null
  const totalParticipants = list.reduce((sum, q) => sum + (q.participant_count ?? 0), 0)
  const allAvgs = list.filter(q => q.avg_score !== null && q.avg_score !== undefined).map(q => q.avg_score as number)
  const overallAvg = allAvgs.length > 0 ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) : 0
  const totalQuestions = list.reduce((sum, q) => sum + (q.question_count ?? 0), 0)
  return { totalExams: list.length, totalParticipants, overallAvg, totalQuestions }
})

function performanceLevel(q: Quiz): string {
  const avg = q.avg_score
  if (avg === null || avg === undefined) return 'none'
  if (avg >= 85) return 'excellent'
  if (avg >= 70) return 'good'
  if (avg >= 50) return 'average'
  return 'weak'
}

function typeLabel(t: string): string {
  if (t === 'midterm') return 'فصلي'
  if (t === 'final') return 'نهائي'
  return 'اختبار قصير'
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [qRes, cRes] = await Promise.allSettled([getMyQuizzes(), getMyClasses()])
    if (qRes.status === 'fulfilled' && qRes.value.success) quizzes.value = qRes.value.quizzes
    if (cRes.status === 'fulfilled' && cRes.value.success) classes.value = cRes.value.classes
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'فشل التحميل'
  }
  loading.value = false
}

async function viewResults(q: Quiz) {
  selectedQuiz.value = q
  subsLoading.value = true
  try {
    const res = await getQuizSubmissions(q.id)
    if (res.success) submissions.value = res.submissions
  } catch { /* ignore */ }
  subsLoading.value = false
}

onMounted(load)

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <div class="quiz-results-page">
    <!-- Overview Stats -->
    <div v-if="!selectedQuiz">
      <div class="qr-header">
        <div class="qr-header-with-back">
          <button class="btn-back" @click="emit('back')">← رجوع</button>
          <h3>📊 نتائج الامتحانات</h3>
        </div>
      </div>
      <div v-if="loading" class="qr-loading">جاري التحميل...</div>
      <div v-else-if="error" class="qr-error">❌ {{ error }}</div>

      <template v-else>
        <div class="qr-overall" v-if="overallStats">
          <div class="qr-overall-card"><span class="qr-overall-icon">📝</span><span class="qr-overall-val">{{ overallStats.totalExams }}</span><span class="qr-overall-lbl">امتحانات</span></div>
          <div class="qr-overall-card"><span class="qr-overall-icon">👥</span><span class="qr-overall-val">{{ overallStats.totalParticipants }}</span><span class="qr-overall-lbl">مشاركات</span></div>
          <div class="qr-overall-card"><span class="qr-overall-icon">📈</span><span class="qr-overall-val">{{ overallStats.overallAvg }}%</span><span class="qr-overall-lbl">متوسط عام</span></div>
          <div class="qr-overall-card"><span class="qr-overall-icon">❓</span><span class="qr-overall-val">{{ overallStats.totalQuestions }}</span><span class="qr-overall-lbl">أسئلة</span></div>
        </div>

        <div v-if="quizzesWithResults.length === 0" class="qr-empty">لا توجد نتائج بعد</div>

        <template v-else>
          <div class="qr-filters">
            <select v-model="filterClass" class="qr-filter-select">
              <option value="">كل الفصول</option>
              <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="filterType" class="qr-filter-select">
              <option value="">كل الأنواع</option>
              <option value="quiz">اختبار قصير</option>
              <option value="midterm">فصلي</option>
              <option value="final">نهائي</option>
            </select>
          </div>

          <div class="qr-grid">
            <div v-for="q in filteredQuizzes" :key="q.id" class="qr-card" :class="performanceLevel(q)" @click="viewResults(q)">
              <div class="qr-card-header"><h4>{{ q.title }}</h4><span class="qr-type-badge">{{ typeLabel(q.quiz_type) }}</span></div>
              <div class="qr-card-class" v-if="q.class_name">📚 {{ q.class_name }}</div>
              <div class="qr-card-stats">
                <div class="qr-stat"><span class="qr-stat-val">{{ q.participant_count ?? 0 }}</span><span class="qr-stat-lbl">مشارك</span></div>
                <div class="qr-stat"><span class="qr-stat-val" :class="performanceLevel(q)">{{ q.avg_score !== null && q.avg_score !== undefined ? q.avg_score + '%' : '—' }}</span><span class="qr-stat-lbl">المتوسط</span></div>
                <div class="qr-stat"><span class="qr-stat-val">{{ q.highest_score ?? '—' }}</span><span class="qr-stat-lbl">الأعلى</span></div>
                <div class="qr-stat"><span class="qr-stat-val">{{ q.lowest_score ?? '—' }}</span><span class="qr-stat-lbl">الأدنى</span></div>
              </div>
              <div class="qr-card-footer"><span>📅 {{ formatDate(q.created_at) }}</span><span class="qr-view-btn">عرض التفاصيل ←</span></div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Detailed Results -->
    <QuizDetailResults v-else :quiz="selectedQuiz" :submissions="submissions" :loading="subsLoading" @back="selectedQuiz = null" />
  </div>
</template>

<style scoped src="./quiz-results.css"></style>
