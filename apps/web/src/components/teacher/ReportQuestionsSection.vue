<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, watch, onMounted } from 'vue'
import { getReportAnswers } from '@/services/experiment-questions.service'
import type { ReportAnswer } from '@/services/experiment-questions.service'


const props = defineProps<{
  reportId: number
  score?: number | null
  maxScore?: number | null
}>()

const answers = ref<ReportAnswer[]>([])
const loading = ref(false)
const error = ref('')

onMounted(load)
watch(() => props.reportId, load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getReportAnswers(props.reportId)
    if (res.success && res.answers) answers.value = res.answers
    else error.value = res.message || 'لا توجد إجابات'
  } catch (e: any) { error.value = e.message || 'فشل تحميل الإجابات' }
  finally { loading.value = false }
}

function correctText(c: number | null) {
  if (c === 1) return '✅ صحيح'
  if (c === 0) return '❌ خاطئ'
  return '📝 غير مصحح تلقائياً'
}
</script>

<template>
  <div class="questions-section">
    <h3 class="sec-title">❓ أسئلة التجربة</h3>

    <div v-if="loading" class="info">جاري تحميل الإجابات...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!answers.length" class="info">لا توجد إجابات مسجلة لهذا التقرير.</div>

    <template v-else>
      <div v-if="maxScore" class="score-bar">
        النتيجة: <strong>{{ score ?? 0 }} / {{ maxScore }}</strong> درجة
      </div>

      <div class="answers-list">
        <div v-for="a in answers" :key="a.id" class="answer-card">
          <p class="q-text">{{ a.question_text }}</p>
          <p class="q-meta">نوع السؤال: {{ a.question_type }}</p>
          <p class="q-answer"><strong>إجابة الطالب:</strong> {{ a.answer_text || '—' }}</p>
          <p class="q-result">{{ correctText(a.is_correct) }} — <strong>{{ a.score ?? 0 }} / {{ a.points }}</strong> درجة</p>
          <p v-if="a.teacher_score != null" class="q-teacher">تقييم المدرس: {{ a.teacher_score }} / {{ a.points }}</p>
          <p v-if="a.feedback" class="q-feedback">ملاحظة: {{ a.feedback }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.questions-section { padding: 1rem; }
.sec-title { margin-bottom: 1rem; }
.info { color: #94a3b8; }
.error { color: #f87171; }
.score-bar { background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 1rem; color: #e2e8f0; }
.answers-list { display: flex; flex-direction: column; gap: 0.75rem; }
.answer-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.75rem; color: #e2e8f0; }
.q-text { margin: 0 0 0.25rem; font-weight: 600; }
.q-meta { color: #94a3b8; font-size: 0.8rem; margin: 0 0 0.5rem; }
.q-answer, .q-result, .q-teacher, .q-feedback { margin: 0.25rem 0; }
.q-teacher { color: #38bdf8; }
.q-feedback { color: #fbbf24; }
</style>
