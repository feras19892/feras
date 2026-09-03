<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, watch } from 'vue'
import { getStudentQuestions } from '@/services/experiment-questions.service'
import type { StudentQuestion, AnswerInput } from '@/services/experiment-questions.service'
import EmptyState from '@/components/shared/EmptyState.vue'


const props = defineProps<{
  show: boolean
  experimentId?: string
  classId?: string
}>()

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void
  (e: 'done', payload: { templateId: number; answers: AnswerInput[] }): void
}>()

const loading = ref(false)
const error = ref('')
const title = ref('')
const templateId = ref(0)
const questions = ref<StudentQuestion[]>([])
const answers = ref<Record<number, string>>({})

watch(() => props.show, (val) => {
  if (val) loadQuestions()
  else reset()
})

async function loadQuestions() {
  if (!props.experimentId || !props.classId) return
  loading.value = true
  error.value = ''
  questions.value = []
  answers.value = {}
  try {
    const res = await getStudentQuestions(props.experimentId, props.classId)
    if (res.success && res.questions) {
      title.value = res.title || ''
      templateId.value = res.id ?? 0
      questions.value = res.questions
      for (const q of res.questions) {
        if (q.question_type === 'true_false') answers.value[q.id] = ''
        else if (q.question_type === 'multiple_choice') answers.value[q.id] = ''
        else answers.value[q.id] = ''
      }
    } else {
      error.value = res.message || 'لا توجد أسئلة لهذه التجربة'
    }
  } catch (e: any) { error.value = e.message || 'فشل تحميل الأسئلة' }
  finally { loading.value = false }
}

function formatOptions(opts: string | null) {
  if (!opts) return []
  try { return JSON.parse(opts) as string[] } catch { return [] }
}

function close() { emit('update:show', false) }

function reset() {
  title.value = ''
  templateId.value = 0
  questions.value = []
  answers.value = {}
}

function submit() {
  if (templateId.value === 0) return
  const list: AnswerInput[] = []
  for (const q of questions.value) {
    const text = (answers.value[q.id] || '').trim()
    if (q.is_required && !text) {
      error.value = 'يرجى الإجابة على جميع الأسئلة المطلوبة'
      return
    }
    list.push({ question_id: q.id, answer_text: text })
  }
  emit('done', { templateId: templateId.value, answers: list })
  emit('update:show', false)
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="question-modal">
      <h3>{{ title || 'أسئلة التجربة' }}</h3>
      <div v-if="loading" class="msg info">جاري تحميل الأسئلة...</div>
      <div v-else-if="error" class="msg error">{{ error }}</div>
      <div v-else-if="questions.length" class="questions">
        <div v-for="q in questions" :key="q.id" class="q-card">
          <p class="q-text"><strong>{{ q.question_text }}</strong> <span v-if="q.is_required" class="required">*</span></p>
          <div v-if="q.question_type === 'multiple_choice'" class="options">
            <label v-for="(opt, idx) in formatOptions(q.options)" :key="idx" class="option">
              <input v-model="answers[q.id]" type="radio" :value="opt" /> {{ opt }}
            </label>
          </div>
          <div v-else-if="q.question_type === 'true_false'" class="options inline">
            <label class="option"><input v-model="answers[q.id]" type="radio" value="true" /> صح</label>
            <label class="option"><input v-model="answers[q.id]" type="radio" value="false" /> خطأ</label>
          </div>
          <div v-else-if="q.question_type === 'fill_blank'">
            <input v-model="answers[q.id]" class="form-input" placeholder="اكتب الإجابة" />
          </div>
          <div v-else>
            <textarea v-model="answers[q.id]" class="form-textarea" rows="3" placeholder="اكتب إجابتك"></textarea>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="❓" title="لا توجد أسئلة" />

      <div class="actions">
        <button class="btn-cancel" @click="close">إغلاق</button>
        <button v-if="questions.length" class="btn-submit" @click="submit">حفظ الإجابات</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 300; }
.question-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; width: 90%; max-width: 480px; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; color: #e2e8f0; }
.question-modal h3 { margin: 0; font-size: 1.1rem; text-align: center; }
.q-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.75rem; }
.q-text { margin: 0 0 0.5rem; }
.required { color: #f87171; }
.options { display: flex; flex-direction: column; gap: 0.35rem; }
.options.inline { flex-direction: row; gap: 1rem; }
.option { cursor: pointer; font-size: 0.9rem; }
.form-input, .form-textarea { width: 100%; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.35rem; background: rgba(0,0,0,0.3); color: #e2e8f0; }
.actions { display: flex; gap: 0.5rem; }
.btn-cancel, .btn-submit { flex: 1; padding: 0.55rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: none; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; }
.msg { text-align: center; font-size: 0.85rem; }
.msg.error { color: #f87171; }
.msg.info { color: #94a3b8; }
</style>
