<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getReportAnswers, gradeReportAnswer } from '@/services/experiment-questions.service'
import type { ReportAnswer } from '@/services/experiment-questions.service'

const props = defineProps<{
  reportId: number
  score?: number | null
  maxScore?: number | null
  /** وضع المدرس: يسمح بتصحيح الإجابات القصيرة يدوياً */
  editable?: boolean
}>()

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'اختيار من متعدد',
  true_false: 'صح / خطأ',
  short_answer: 'إجابة قصيرة',
  fill_blank: 'ملء فراغ',
  ordering: 'ترتيب',
}

function typeLabel(t: string) {
  return TYPE_LABELS[t] ?? t
}

const answers = ref<ReportAnswer[]>([])
const loading = ref(false)
const error = ref('')
const grading = ref<Record<number, { teacher_score: number | string; feedback: string; saving: boolean }>>({})

onMounted(load)
watch(() => props.reportId, load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getReportAnswers(props.reportId)
    if (res.success && res.answers) {
      answers.value = res.answers
      grading.value = {}
      for (const a of res.answers) {
        if (needsManualGrading(a)) {
          grading.value[a.id] = {
            teacher_score: a.teacher_score ?? a.points,
            feedback: a.feedback ?? '',
            saving: false,
          }
        }
      }
    } else error.value = res.message || 'لا توجد إجابات'
  } catch (e: any) { error.value = e.message || 'فشل تحميل الإجابات' }
  finally { loading.value = false }
}

function needsManualGrading(a: ReportAnswer): boolean {
  return props.editable === true && a.is_correct == null && a.question_type === 'short_answer'
}

async function saveTeacherScore(a: ReportAnswer): Promise<void> {
  const g = grading.value[a.id]
  if (!g) return
  const score = Number(g.teacher_score)
  if (Number.isNaN(score) || score < 0 || score > a.points) {
    g.saving = false
    error.value = `الدرجة يجب أن تكون بين 0 و ${a.points}`
    return
  }
  g.saving = true
  try {
    const res = await gradeReportAnswer(props.reportId, a.id, {
      teacher_score: score,
      feedback: g.feedback.trim() || undefined,
    })
    if (res.success) {
      a.teacher_score = score
      a.feedback = g.feedback.trim() || null
      delete grading.value[a.id]
    } else error.value = res.message || 'فشل حفظ التقييم'
  } catch (e: any) { error.value = e.message || 'فشل حفظ التقييم' }
  finally { g.saving = false }
}

function correctText(c: number | null) {
  if (c === 1) return '✅ صحيح'
  if (c === 0) return '❌ خاطئ'
  return '📝 يُصحح يدوياً'
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
          <p class="q-meta">نوع السؤال: {{ typeLabel(a.question_type) }}</p>
          <p class="q-answer"><strong>إجابة الطالب:</strong> {{ a.answer_text || '—' }}</p>
          <p class="q-result">{{ correctText(a.is_correct) }} — <strong>{{ a.teacher_score ?? a.score ?? 0 }} / {{ a.points }}</strong> درجة</p>
          <p v-if="a.teacher_score != null && a.feedback" class="q-feedback">ملاحظة: {{ a.feedback }}</p>

          <div v-if="grading[a.id]" class="teacher-grading">
            <div class="tg-row">
              <label>تقييمك (0-{{ a.points }})</label>
              <input v-model.number="grading[a.id].teacher_score" type="number" :min="0" :max="a.points" class="tg-score" />
            </div>
            <div class="tg-row">
              <label>تعليق (اختياري)</label>
              <input v-model="grading[a.id].feedback" type="text" class="tg-feedback" placeholder="ملاحظة للطالب..." />
            </div>
            <button class="tg-save" :disabled="grading[a.id].saving" @click="saveTeacherScore(a)">
              {{ grading[a.id].saving ? '...' : 'حفظ التقييم' }}
            </button>
          </div>
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
.teacher-grading {
  margin-top: 0.6rem;
  padding: 0.6rem;
  border-radius: 0.5rem;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.tg-row { display: flex; align-items: center; gap: 0.5rem; }
.tg-row label { font-size: 0.78rem; color: #94a3b8; min-width: 110px; }
.tg-score { width: 70px; padding: 0.35rem 0.5rem; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.85rem; }
.tg-feedback { flex: 1; padding: 0.35rem 0.5rem; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.82rem; }
.tg-save {
  align-self: flex-start;
  padding: 0.4rem 0.9rem;
  border-radius: 0.45rem;
  border: none;
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #7dd3fc;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
.tg-save:hover { background: rgba(56, 189, 248, 0.3); }
.tg-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
