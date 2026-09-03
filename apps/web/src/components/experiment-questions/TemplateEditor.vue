<template>
  <div class="expq-editor">
    <div class="editor-header">
      <button class="btn-back" @click="emit('close')">← رجوع</button>
      <h3 v-if="template">{{ template.title }}</h3>
      <span v-if="template" class="status">{{ statusLabel }}</span>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="!template" class="empty">لم يتم العثور على النموذج</div>
    <div v-else>
      <div class="form-row">
        <input v-model="title" class="form-input" placeholder="عنوان النموذج" />
        <button class="btn-primary" :disabled="saving" @click="saveTitle">حفظ العنوان</button>
      </div>

      <div class="form-row">
        <select v-model="selectedClass" class="form-input">
          <option value="">اختر فصل للإرسال</option>
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
        <button class="btn-primary" :disabled="assigning" @click="assign">إرسال للفصل</button>
        <button class="btn-primary" :disabled="publishing" @click="publish">نشر</button>
      </div>

      <div class="question-form">
        <h4>إضافة سؤال</h4>
        <select v-model="newQuestion.question_type" class="form-input">
          <option value="multiple_choice">اختيار من متعدد</option>
          <option value="true_false">صح/خطأ</option>
          <option value="short_answer">إجابة قصيرة</option>
          <option value="fill_blank">ملء فراغ</option>
        </select>
        <input v-model="newQuestion.question_text" class="form-input" placeholder="نص السؤال" />
        <input v-if="newQuestion.question_type === 'fill_blank'" v-model="newQuestion.correct_answer" class="form-input" placeholder="الإجابة الصحيحة" />
        <input v-if="newQuestion.question_type === 'multiple_choice'" v-model="optionsText" class="form-input" placeholder="الخيارات (مفصولة بفاصلة)" />
        <input v-if="newQuestion.question_type === 'multiple_choice'" v-model="newQuestion.correct_answer" class="form-input" placeholder="الخيار الصحيح (من النص أعلاه)" />
        <div v-if="newQuestion.question_type === 'true_false'" class="inline-row">
          <label><input v-model="newQuestion.correct_answer" type="radio" value="true" /> صحيح</label>
          <label><input v-model="newQuestion.correct_answer" type="radio" value="false" /> خطأ</label>
        </div>
        <input v-model.number="newQuestion.points" type="number" class="form-input narrow" placeholder="الدرجة" />
        <button class="btn-primary" :disabled="adding" @click="addQuestion">إضافة سؤال</button>
      </div>

      <div class="questions-list">
        <h4>الأسئلة</h4>
        <div v-for="q in questions" :key="q.id" class="question-card">
          <div class="q-meta">
            <span class="q-type">{{ q.question_type }}</span>
            <span class="q-points">{{ q.points }} درجة</span>
            <button class="btn-danger" @click="removeQuestion(q.id)">حذف</button>
          </div>
          <p class="q-text">{{ q.question_text }}</p>
          <p v-if="q.options" class="q-options">{{ formatOptions(q.options) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed, watch, onMounted } from 'vue'
import { useTeacherStore } from '@/stores/teacher.store'
import { useToast } from '@/composables/useToast'
import * as api from '@/services/experiment-questions.service'
import type { ExperimentQuestion, ExperimentQuestionTemplate, QuestionInput } from '@/services/experiment-questions.service'


const props = defineProps<{ templateId: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>()

const store = useTeacherStore()
const toast = useToast()
const classes = computed(() => store.classes)

const template = ref<ExperimentQuestionTemplate | null>(null)
const questions = ref<ExperimentQuestion[]>([])
const loading = ref(false)
const saving = ref(false)
const assigning = ref(false)
const publishing = ref(false)
const adding = ref(false)
const title = ref('')
const selectedClass = ref('')
const optionsText = ref('')

const newQuestion = ref<QuestionInput>({
  order_index: 0,
  question_type: 'multiple_choice',
  question_text: '',
  options: null,
  correct_answer: '',
  points: 1,
  is_required: true,
})

const statusLabel = computed(() => {
  const map: Record<string, string> = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' }
  return map[template.value?.status ?? ''] ?? template.value?.status
})

watch(() => props.templateId, load, { immediate: true })
onMounted(() => { if (!store.classes.length) store.fetchClasses() })

async function load() {
  loading.value = true
  try {
    const res = await api.getTemplate(props.templateId)
    if (res.success && res.template) {
      template.value = res.template
      title.value = res.template.title
      questions.value = res.questions ?? []
    } else {
      toast.error(res.message || 'فشل تحميل النموذج')
    }
  } catch (e: any) { toast.error(e.message || 'فشل تحميل النموذج') }
  finally { loading.value = false }
}

async function saveTitle() {
  if (!template.value) return
  saving.value = true
  try {
    const res = await api.updateTemplate(template.value.id, { title: title.value })
    if (res.success) { toast.success('تم حفظ العنوان'); emit('updated') }
    else toast.error(res.message || 'فشل الحفظ')
  } catch (e: any) { toast.error(e.message || 'فشل الحفظ') }
  finally { saving.value = false }
}

async function publish() {
  if (!template.value) return
  publishing.value = true
  try {
    const res = await api.publishTemplate(template.value.id)
    if (res.success) { toast.success('تم نشر النموذج'); await load() }
    else toast.error(res.message || 'فشل النشر')
  } catch (e: any) { toast.error(e.message || 'فشل النشر') }
  finally { publishing.value = false }
}

async function assign() {
  if (!template.value || !selectedClass.value) return
  assigning.value = true
  try {
    const res = await api.assignTemplate(template.value.id, selectedClass.value)
    if (res.success) { toast.success('تم الإرسال للفصل'); emit('updated') }
    else toast.error(res.message || 'فشل الإرسال')
  } catch (e: any) { toast.error(e.message || 'فشل الإرسال') }
  finally { assigning.value = false }
}

async function addQuestion() {
  if (!template.value) return
  adding.value = true
  const payload: QuestionInput = { ...newQuestion.value }
  if (payload.question_type === 'multiple_choice' && optionsText.value) {
    payload.options = optionsText.value.split(',').map(s => s.trim()).filter(Boolean)
  }
  if (['short_answer', 'fill_blank'].includes(payload.question_type ?? '')) {
    payload.correct_answer = payload.correct_answer || null
  }
  try {
    const res = await api.addQuestion(template.value.id, payload)
    if (res.success) {
      toast.success('تم إضافة السؤال')
      newQuestion.value.question_text = ''
      newQuestion.value.correct_answer = ''
      optionsText.value = ''
      await load()
    } else toast.error(res.message || 'فشل إضافة السؤال')
  } catch (e: any) { toast.error(e.message || 'فشل إضافة السؤال') }
  finally { adding.value = false }
}

async function removeQuestion(id: number) {
  if (!template.value) return
  try {
    const res = await api.deleteQuestion(template.value.id, id)
    if (res.success) { toast.success('تم حذف السؤال'); await load() }
    else toast.error(res.message || 'فشل الحذف')
  } catch (e: any) { toast.error(e.message || 'فشل الحذف') }
}

function formatOptions(opts: string | null) {
  if (!opts) return ''
  try { return JSON.parse(opts).join(' | ') } catch { return opts }
}
</script>

<style scoped>
.expq-editor { padding: 16px; }
.editor-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.btn-back { background: rgba(37, 99, 235, 0.15); border: 1px solid rgba(37, 99, 235, 0.3); color: #2563eb; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 700; cursor: pointer; }
.status { background: #e2e8f0; padding: 2px 10px; border-radius: 12px; font-size: 13px; }
.form-row { display: flex; gap: 8px; margin-bottom: 12px; }
.form-input { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.form-input.narrow { flex: 0 0 80px; }
.btn-primary { padding: 8px 16px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.btn-danger { padding: 4px 10px; background: #dc2626; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.question-form { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
.question-form > * { margin-bottom: 8px; }
.questions-list { display: flex; flex-direction: column; gap: 10px; }
.question-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
.q-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.q-type { background: #f1f5f9; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
.q-text { margin: 0 0 4px; }
.q-options { color: #64748b; font-size: 14px; }
.inline-row { display: flex; gap: 16px; }
.loading, .empty { padding: 20px; text-align: center; color: #64748b; }
</style>
