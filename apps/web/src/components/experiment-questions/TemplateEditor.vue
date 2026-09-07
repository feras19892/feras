<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTeacherStore } from '@/stores/teacher.store'
import { useToast } from '@/composables/useToast'
import * as api from '@/services/experiment-questions.service'
import type { ExperimentQuestion, ExperimentQuestionTemplate, QuestionInput } from '@/services/experiment-questions.service'

const props = defineProps<{ templateId: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>()

const toast = useToast()
const teacherStore = useTeacherStore()

const template = ref<ExperimentQuestionTemplate | null>(null)
const questions = ref<ExperimentQuestion[]>([])
const loading = ref(true)
const title = ref('')
const savingTitle = ref(false)
const publishing = ref(false)
const assigning = ref(false)
const selectedClass = ref('')
const adding = ref(false)
const savingEdit = ref(false)

type QType = 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank'

const questionType = ref<QType>('multiple_choice')
const questionText = ref('')
const mcOptions = ref<string[]>(['', ''])
const mcCorrectIndex = ref(0)
const correctAnswerText = ref('')
const questionPoints = ref(1)
const isRequired = ref(true)
const editingId = ref<number | null>(null)

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'اختيار من متعدد',
  true_false: 'صح / خطأ',
  short_answer: 'إجابة قصيرة',
  fill_blank: 'ملء فراغ',
}

function typeLabel(t: string): string {
  return TYPE_LABELS[t] ?? t
}

function statusText(status: string): string {
  const map: Record<string, string> = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' }
  return map[status] ?? status
}

async function load() {
  loading.value = true
  try {
    const res = await api.getTemplate(props.templateId)
    if (res.success && res.template) {
      template.value = res.template
      title.value = res.template.title
      questions.value = res.questions ?? []
    } else toast.error(res.message || 'فشل تحميل النموذج')
  } catch (e: any) { toast.error(e.message || 'فشل تحميل النموذج') }
  finally { loading.value = false }
}

async function saveTitle() {
  if (!template.value || !title.value.trim()) return
  savingTitle.value = true
  try {
    const res = await api.updateTemplate(template.value.id, { title: title.value.trim() })
    if (res.success) { toast.success('تم حفظ العنوان'); emit('updated') }
    else toast.error(res.message || 'فشل الحفظ')
  } catch (e: any) { toast.error(e.message || 'فشل الحفظ') }
  finally { savingTitle.value = false }
}

async function publish() {
  if (!template.value) return
  if (!questions.value.length) { toast.error('أضف سؤالاً واحداً على الأقل قبل النشر'); return }
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
    // النشر تلقائياً قبل التعيين — مسودة لا يراها الطالب أبداً
    if (template.value.status !== 'published') {
      const pub = await api.publishTemplate(template.value.id)
      if (!pub.success) { toast.error(pub.message || 'فشل النشر'); assigning.value = false; return }
    }
    const res = await api.assignTemplate(template.value.id, selectedClass.value)
    if (res.success) { toast.success('تم إرسال الأسئلة للفصل'); emit('updated'); await load() }
    else toast.error(res.message || 'فشل الإرسال')
  } catch (e: any) { toast.error(e.message || 'فشل الإرسال') }
  finally { assigning.value = false }
}
  function resetForm(): void {
    editingId.value = null
    questionType.value = 'multiple_choice'
    questionText.value = ''
    mcOptions.value = ['', '']
    mcCorrectIndex.value = 0
    correctAnswerText.value = ''
    questionPoints.value = 1
    isRequired.value = true
  }

  function startEdit(q: ExperimentQuestion): void {
    editingId.value = q.id
    questionType.value = (q.question_type as QType) ?? 'multiple_choice'
    questionText.value = q.question_text
    questionPoints.value = q.points
    isRequired.value = q.is_required === 1
    correctAnswerText.value = q.correct_answer ?? ''
    let opts: string[] = []
    if (q.options) {
      try { opts = JSON.parse(q.options) as string[] } catch { opts = [] }
    }
    if (questionType.value === 'multiple_choice') {
      mcOptions.value = opts.length >= 2 ? [...opts] : ['', '']
      mcCorrectIndex.value = Math.max(0, opts.indexOf(q.correct_answer ?? ''))
    }
  }

  function addMcOption(): void {
    if (mcOptions.value.length < 10) mcOptions.value.push('')
  }

  function removeMcOption(index: number): void {
    if (mcOptions.value.length <= 2) return
    mcOptions.value.splice(index, 1)
    if (mcCorrectIndex.value >= mcOptions.value.length) mcCorrectIndex.value = mcOptions.value.length - 1
    else if (mcCorrectIndex.value > index) mcCorrectIndex.value -= 1
  }

  function buildPayload(): QuestionInput | null {
    const text = questionText.value.trim()
    if (!text) { toast.error('اكتب نص السؤال'); return null }
    const payload: QuestionInput = {
      order_index: editingId.value != null
        ? (questions.value.find(q => q.id === editingId.value)?.order_index ?? questions.value.length)
        : questions.value.length,
      question_type: questionType.value,
      question_text: text,
      points: Math.max(1, Math.min(100, questionPoints.value || 1)),
      is_required: isRequired.value,
    }
    if (questionType.value === 'multiple_choice') {
      const opts = mcOptions.value.map(o => o.trim()).filter(Boolean)
      if (opts.length < 2) { toast.error('أدخل خيارين على الأقل'); return null }
      if (mcCorrectIndex.value >= opts.length) { toast.error('حدد الإجابة الصحيحة'); return null }
      payload.options = opts
      payload.correct_answer = opts[mcCorrectIndex.value]
    } else if (questionType.value === 'true_false') {
      if (!correctAnswerText.value) { toast.error('حدد الإجابة الصحيحة (صح أو خطأ)'); return null }
      payload.correct_answer = correctAnswerText.value
    } else if (questionType.value === 'fill_blank') {
      if (!correctAnswerText.value.trim()) { toast.error('اكتب الإجابة الصحيحة للفراغ'); return null }
      payload.correct_answer = correctAnswerText.value.trim()
    }
    return payload
  }

  async function addQuestion() {
    if (!template.value) return
    const payload = buildPayload()
    if (!payload) return
    adding.value = true
    try {
      const res = await api.addQuestion(template.value.id, payload)
      if (res.success) {
        toast.success('تم إضافة السؤال')
        resetForm()
        await load()
      } else toast.error(res.message || 'فشل إضافة السؤال')
    } catch (e: any) { toast.error(e.message || 'فشل إضافة السؤال') }
    finally { adding.value = false }
  }

  async function saveEdit() {
    if (!template.value || editingId.value == null) return
    const payload = buildPayload()
    if (!payload) return
    savingEdit.value = true
    try {
      const res = await api.updateQuestion(template.value.id, editingId.value, payload)
      if (res.success) {
        toast.success('تم حفظ التعديل')
        resetForm()
        await load()
      } else toast.error(res.message || 'فشل حفظ التعديل')
    } catch (e: any) { toast.error(e.message || 'فشل حفظ التعديل') }
    finally { savingEdit.value = false }
  }

  async function removeQuestion(id: number) {
    if (!template.value) return
    try {
      const res = await api.deleteQuestion(template.value.id, id)
      if (res.success) {
        toast.success('تم حذف السؤال')
        if (editingId.value === id) resetForm()
        await load()
      } else toast.error(res.message || 'فشل الحذف')
    } catch (e: any) { toast.error(e.message || 'فشل الحذف') }
  }

  function formatOptions(opts: string | null) {
    if (!opts) return ''
    try { return (JSON.parse(opts) as string[]).join(' | ') } catch { return opts }
  }

  onMounted(async () => {
    await load()
    teacherStore.fetchClasses()
  })
</script>

<template>
  <div class="expq-editor">
    <div class="editor-header">
      <button class="btn-back" @click="emit('close')">← رجوع</button>
      <h3 v-if="template">{{ template.title }}</h3>
      <span v-if="template" class="status" :class="template.status">{{ statusText(template.status) }}</span>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="!template" class="empty">لم يتم العثور على النموذج</div>
    <div v-else>
      <div class="form-row">
        <input v-model="title" class="form-input" placeholder="عنوان النموذج" />
        <button class="btn-primary" :disabled="savingTitle" @click="saveTitle">حفظ العنوان</button>
      </div>

      <div class="form-row">
        <select v-model="selectedClass" class="form-input">
          <option value="">اختر فصل لإرسال الأسئلة</option>
          <option v-for="cls in teacherStore.classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
        <button
          class="btn-primary"
          :class="{ green: template.status !== 'published' }"
          :disabled="assigning || !selectedClass"
          @click="assign"
        >
          {{ template.status !== 'published' ? '📤 نشر وإرسال للفصل' : '📤 إرسال للفصل' }}
        </button>
        <button
          class="btn-publish"
          :disabled="publishing || template.status === 'published' || !questions.length"
          @click="publish"
        >
          {{ template.status === 'published' ? 'منشور ✓' : 'نشر فقط' }}
        </button>
      </div>

      <div class="question-form">
        <h4>{{ editingId != null ? '✏️ تعديل السؤال' : '➕ إضافة سؤال' }}</h4>
        <select v-model="questionType" class="form-input">
          <option value="multiple_choice">اختيار من متعدد</option>
          <option value="true_false">صح / خطأ</option>
          <option value="short_answer">إجابة قصيرة (تصحيح يدوي)</option>
          <option value="fill_blank">ملء فراغ</option>
        </select>
        <input v-model="questionText" class="form-input" placeholder="نص السؤال" />

        <div v-if="questionType === 'multiple_choice'" class="mc-options">
          <div v-for="(opt, i) in mcOptions" :key="i" class="mc-row">
            <label class="mc-radio" :title="'حدد كإجابة صحيحة'">
              <input
                type="radio"
                name="mcCorrect"
                :checked="mcCorrectIndex === i"
                @change="mcCorrectIndex = i"
              />
            </label>
            <input
              v-model="mcOptions[i]"
              class="form-input"
              :class="{ correct: mcCorrectIndex === i }"
              :placeholder="`الخيار ${i + 1}${mcCorrectIndex === i ? ' (الصحيح)' : ''}`"
            />
            <button v-if="mcOptions.length > 2" class="mc-remove" @click="removeMcOption(i)">✕</button>
          </div>
          <button class="mc-add" @click="addMcOption">+ خيار إضافي</button>
        </div>

        <div v-if="questionType === 'true_false'" class="inline-row">
          <label><input v-model="correctAnswerText" type="radio" value="true" /> صح</label>
          <label><input v-model="correctAnswerText" type="radio" value="false" /> خطأ</label>
        </div>
        <input v-if="questionType === 'fill_blank'" v-model="correctAnswerText" class="form-input" placeholder="الإجابة الصحيحة" />
        <p v-if="questionType === 'short_answer'" class="hint">💡 هذا السؤال يُصحح يدوياً من نافذة تصحيح التقرير</p>

        <div class="form-row">
          <input v-model.number="questionPoints" type="number" min="1" max="100" class="form-input narrow" placeholder="الدرجة" />
          <label class="required-row"><input v-model="isRequired" type="checkbox" /> إجابة مطلوبة</label>
        </div>

        <div class="form-actions">
          <button v-if="editingId != null" class="btn-cancel-edit" @click="resetForm">إلغاء التعديل</button>
          <button
            class="btn-primary"
            :disabled="adding || savingEdit"
            @click="editingId != null ? saveEdit() : addQuestion()"
          >
            {{ editingId != null ? (savingEdit ? '...' : 'حفظ التعديل') : (adding ? '...' : 'إضافة سؤال') }}
          </button>
        </div>
      </div>

      <div class="questions-list">
        <h4>الأسئلة ({{ questions.length }})</h4>
        <div v-for="(q, i) in questions" :key="q.id" class="question-card" :class="{ editing: editingId === q.id }">
          <div class="q-meta">
            <span class="q-num">{{ i + 1 }}</span>
            <span class="q-type">{{ typeLabel(q.question_type) }}</span>
            <span class="q-points">{{ q.points }} درجة</span>
            <span v-if="q.is_required" class="q-required">مطلوب</span>
            <div class="q-actions">
              <button class="btn-edit" @click="startEdit(q)">تعديل</button>
              <button class="btn-danger" @click="removeQuestion(q.id)">حذف</button>
            </div>
          </div>
          <p class="q-text">{{ q.question_text }}</p>
          <p v-if="q.options" class="q-options">{{ formatOptions(q.options) }}</p>
          <p v-if="q.correct_answer" class="q-correct">✔ الصحيحة: {{ q.correct_answer }}</p>
          <p v-else class="q-manual">✍️ يُصحح يدوياً</p>
        </div>
        <p v-if="!questions.length" class="empty-list">لا توجد أسئلة بعد — أضف أول سؤال من النموذج أعلاه</p>
      </div>
    </div>
  </div>
</template>


<style scoped>
.expq-editor { padding: 16px; max-width: 780px; margin: 0 auto; }
.editor-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.btn-back { background: rgba(74, 222, 128, 0.12); border: 1px solid rgba(74, 222, 128, 0.35); color: #4ade80; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 700; cursor: pointer; }
.editor-header h3 { margin: 0; color: #e2e8f0; flex: 1; }
.status { padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.status.draft { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.status.published { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
.status.archived { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }
.form-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
.form-input { flex: 1; min-width: 120px; padding: 8px 10px; border: 1px solid #334155; border-radius: 6px; background: rgba(30, 41, 59, 0.8); color: #e2e8f0; }
.form-input:focus { outline: none; border-color: #4ade80; }
.form-input.correct { border-color: rgba(74, 222, 128, 0.6); background: rgba(74, 222, 128, 0.06); }
.form-input.narrow { flex: 0 0 90px; }
.btn-primary { padding: 8px 16px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary.green { background: #0e7490; }
.btn-publish { padding: 8px 16px; background: rgba(74, 222, 128, 0.12); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { padding: 4px 10px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; cursor: pointer; font-size: 12px; }
.btn-edit { padding: 4px 10px; background: rgba(96, 165, 250, 0.15); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.35); border-radius: 6px; cursor: pointer; font-size: 12px; }
.question-form { border: 1px solid #334155; padding: 14px; border-radius: 10px; margin-bottom: 16px; background: rgba(30, 41, 59, 0.4); }
.question-form h4 { margin: 0 0 10px; color: #e2e8f0; }
.question-form > * { margin-bottom: 8px; }
.mc-options { display: flex; flex-direction: column; gap: 6px; }
.mc-row { display: flex; align-items: center; gap: 8px; }
.mc-radio { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; }
.mc-radio input { accent-color: #4ade80; width: 16px; height: 16px; cursor: pointer; }
.mc-remove { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 5px; width: 26px; height: 26px; cursor: pointer; flex-shrink: 0; font-size: 11px; }
.mc-add { background: rgba(74, 222, 128, 0.1); color: #4ade80; border: 1px dashed rgba(74, 222, 128, 0.4); border-radius: 6px; padding: 5px 14px; cursor: pointer; align-self: flex-start; font-size: 13px; }
.mc-add:hover { background: rgba(74, 222, 128, 0.18); }
.inline-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.inline-row label { color: #e2e8f0; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.inline-row input[type='radio'] { accent-color: #4ade80; }
.required-row { font-size: 0.85rem; color: #e2e8f0; display: flex; align-items: center; gap: 5px; cursor: pointer; }
.required-row input { accent-color: #4ade80; }
.form-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-cancel-edit { padding: 8px 16px; background: rgba(148, 163, 184, 0.12); color: #94a3b8; border: 1px solid #475569; border-radius: 6px; cursor: pointer; }
.questions-list { display: flex; flex-direction: column; gap: 10px; }
.questions-list h4 { margin: 0 0 4px; color: #e2e8f0; }
.question-card { border: 1px solid #334155; border-radius: 8px; padding: 12px; background: rgba(30, 41, 59, 0.5); }
.question-card.editing { border-color: rgba(96, 165, 250, 0.6); }
.q-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.q-num { background: rgba(74, 222, 128, 0.15); color: #4ade80; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.q-type { background: rgba(51, 65, 85, 0.8); padding: 2px 8px; border-radius: 12px; font-size: 12px; color: #94a3b8; }
.q-points { color: #fbbf24; font-size: 12px; font-weight: 700; }
.q-required { color: #f87171; font-size: 11px; }
.q-actions { margin-inline-start: auto; display: flex; gap: 6px; }
.q-text { margin: 0 0 4px; color: #e2e8f0; }
.q-options { color: #94a3b8; font-size: 13px; margin: 0 0 4px; }
.q-correct { color: #4ade80; font-size: 13px; margin: 0; font-weight: 600; }
.q-manual { color: #fbbf24; font-size: 12px; margin: 0; }
.empty-list { color: #64748b; text-align: center; padding: 16px; }
.hint { color: #94a3b8; font-size: 0.8rem; margin: 0; }
.loading, .empty { padding: 20px; text-align: center; color: #64748b; }
</style>