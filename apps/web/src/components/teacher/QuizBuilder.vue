<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { createQuiz, addQuestion, publishQuiz, updateQuiz, updateQuestion, deleteQuestion, getQuiz, type Quiz, type QuizQuestion } from '@/services/quiz.service'
import { getMyClasses } from '@/services/class.service'
import type { ClassItem } from '@/services/class.service'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const props = defineProps<{ editId?: number | null }>()
const emit = defineEmits<{ saved: []; cancel: [] }>()

const classes = ref<ClassItem[]>([])
const title = ref('')
const description = ref('')
const classId = ref('')
const quizType = ref<'quiz' | 'midterm' | 'final'>('quiz')
const timeLimit = ref(30)
const weight = ref(10)
const scheduledAt = ref('')

interface LocalQuestion { id?: number; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; points: number }
const questions = ref<LocalQuestion[]>([])
const newQ = ref<LocalQuestion>({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', points: 10 })
const editingIndex = ref(-1)
const saving = ref(false)
const isEditMode = computed(() => props.editId != null && props.editId > 0)
const existingQuiz = ref<Quiz | null>(null)
const originalQuestionIds = ref<number[]>([])
const dirty = ref(false)

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (!dirty.value) return
  e.preventDefault()
  e.returnValue = ''
}

watch([title, description, classId, quizType, timeLimit, weight, scheduledAt, questions], () => {
  dirty.value = true
}, { deep: true })

async function loadClasses() {
  try {
    const res = await getMyClasses()
    if (res.success) classes.value = res.classes
  } catch { /* ignore */ }
}

async function loadForEdit() {
  if (!isEditMode.value || !props.editId) return
  try {
    const res = await getQuiz(props.editId)
    if (res.success && res.quiz) {
      existingQuiz.value = res.quiz
      title.value = res.quiz.title
      description.value = res.quiz.description || ''
      classId.value = res.quiz.class_id || ''
      quizType.value = (res.quiz.quiz_type as 'quiz' | 'midterm' | 'final') || 'quiz'
      timeLimit.value = res.quiz.time_limit_minutes
      weight.value = res.quiz.weight
      if (res.quiz.scheduled_at) {
        const d = new Date(res.quiz.scheduled_at)
        scheduledAt.value = d.toISOString().slice(0, 16)
      }
      if (res.questions) {
        originalQuestionIds.value = res.questions.map((q: QuizQuestion) => q.id)
        questions.value = res.questions.map((q: QuizQuestion) => ({
          id: q.id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          correct_answer: q.correct_answer || 'a',
          points: q.points,
        }))
      }
    }
  } catch { /* ignore */ }
}

const availableOptions = computed(() => {
  const opts: { value: string; label: string }[] = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ]
  if (newQ.value.option_c.trim()) opts.push({ value: 'c', label: 'C' })
  if (newQ.value.option_d.trim()) opts.push({ value: 'd', label: 'D' })
  return opts
})

function addQuestionLocal() {
  if (!newQ.value.question_text.trim() || !newQ.value.option_a.trim() || !newQ.value.option_b.trim()) {
    toast.error('السؤال والخياران A و B مطلوبة')
    return
  }
  const ca = newQ.value.correct_answer
  if ((ca === 'c' && !newQ.value.option_c.trim()) || (ca === 'd' && !newQ.value.option_d.trim())) {
    toast.error('الإجابة الصحيحة تشير لخيار فارغ')
    return
  }
  if (editingIndex.value >= 0) {
    questions.value[editingIndex.value] = { ...newQ.value }
    editingIndex.value = -1
  } else {
    questions.value.push({ ...newQ.value })
  }
  newQ.value = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', points: 10 }
}

function editQuestion(i: number) {
  editingIndex.value = i
  newQ.value = { ...questions.value[i] }
}

function removeQuestion(i: number) {
  questions.value.splice(i, 1)
  if (editingIndex.value === i) editingIndex.value = -1
}

async function save(publishNow: boolean) {
  if (!title.value.trim() || !classId.value || questions.value.length === 0) {
    toast.error('املأ جميع الحقول المطلوبة')
    return
  }
  if (isEditMode.value && existingQuiz.value && existingQuiz.value.status !== 'draft') {
    toast.error('يمكن تعديل المسودات فقط')
    return
  }
  saving.value = true
  try {
    const scheduled = scheduledAt.value ? new Date(scheduledAt.value).toISOString() : null
    let quizId: number

    if (isEditMode.value && existingQuiz.value) {
      quizId = existingQuiz.value.id
      await updateQuiz(quizId, {
        title: title.value, description: description.value,
        time_limit_minutes: timeLimit.value, quiz_type: quizType.value,
        scheduled_at: scheduled, weight: weight.value,
      })
      const currentIds = questions.value.filter(q => q.id).map(q => q.id!)
      const deletedIds = originalQuestionIds.value.filter(id => !currentIds.includes(id))
      const errors: string[] = []
      for (const did of deletedIds) {
        try { await deleteQuestion(quizId, did) }
        catch { errors.push(`فشل حذف سؤال #${did}`) }
      }
      for (const q of questions.value) {
        try {
          if (q.id) {
            await updateQuestion(quizId, q.id, {
              question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
              option_c: q.option_c || undefined, option_d: q.option_d || undefined,
              correct_answer: q.correct_answer, points: q.points,
            })
          } else {
            await addQuestion(quizId, {
              question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
              option_c: q.option_c || undefined, option_d: q.option_d || undefined,
              correct_answer: q.correct_answer, points: q.points,
            })
          }
        } catch { errors.push(`فشل حفظ سؤال: ${q.question_text.slice(0, 20)}...`) }
      }
      if (errors.length > 0) {
        toast.error(`تم الحفظ مع ${errors.length} خطأ. أعد المحاولة.`)
        saving.value = false
        return
      }
    } else {
      const res = await createQuiz(classId.value, title.value, description.value, timeLimit.value, quizType.value, scheduled, weight.value)
      if (!res.success || !res.quiz) {
        toast.error(res.message || 'فشل إنشاء الامتحان')
        saving.value = false
        return
      }
      quizId = res.quiz.id
      for (const q of questions.value) {
        await addQuestion(quizId, {
          question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
          option_c: q.option_c || undefined, option_d: q.option_d || undefined,
          correct_answer: q.correct_answer, points: q.points,
        })
      }
    }

    if (publishNow) {
      if (!confirm('سيتم نشر الامتحان فوراً للطلاب. هل أنت متأكد؟')) {
        saving.value = false
        return
      }
      await publishQuiz(quizId)
      toast.success('تم حفظ ونشر الامتحان')
    } else {
      toast.success('تم حفظ الامتحان')
    }
    emit('saved')
    dirty.value = false
  } catch (e: any) {
    toast.error(e?.message || 'فشل الحفظ')
  }
  saving.value = false
}

onMounted(async () => {
  window.addEventListener('beforeunload', onBeforeUnload)
  await loadClasses()
  if (isEditMode.value) await loadForEdit()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<template>
  <div class="qb-page">
    <div class="qb-header">
      <h3>{{ isEditMode ? 'تعديل الامتحان' : 'إنشاء امتحان جديد' }}</h3>
      <button class="btn-cancel" @click="emit('cancel')">← إلغاء</button>
    </div>

    <div class="qb-form-section">
      <div class="qb-form-row">
        <div class="qb-field">
          <label>عنوان الامتحان *</label>
          <input v-model="title" placeholder="مثال: امتحان الفصل الأول" />
        </div>
        <div class="qb-field">
          <label>الفصل *</label>
          <select v-model="classId" :disabled="isEditMode">
            <option value="" disabled>— اختر فصل —</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div class="qb-form-row">
        <div class="qb-field">
          <label>نوع الامتحان</label>
          <select v-model="quizType">
            <option value="quiz">اختبار قصير</option>
            <option value="midterm">امتحان فصلي</option>
            <option value="final">امتحان نهائي</option>
          </select>
        </div>
        <div class="qb-field">
          <label>المدة (دقائق)</label>
          <input v-model.number="timeLimit" type="number" min="1" max="180" />
        </div>
        <div class="qb-field">
          <label>الوزن في التقييم (%)</label>
          <input v-model.number="weight" type="number" min="1" max="100" />
        </div>
        <div class="qb-field">
          <label>موعد النشر (اختياري)</label>
          <input v-model="scheduledAt" type="datetime-local" />
        </div>
      </div>

      <div class="qb-field">
        <label>الوصف (اختياري)</label>
        <input v-model="description" placeholder="وصف مختصر للامتحان" />
      </div>
    </div>

    <div class="qb-questions-section">
      <h4>الأسئلة ({{ questions.length }})</h4>

      <div v-for="(q, i) in questions" :key="i" class="qb-saved-q">
        <span class="qb-q-num">{{ i + 1 }}.</span>
        <span class="qb-q-text">{{ q.question_text }}</span>
        <span class="qb-q-answer">✓ {{ q.correct_answer.toUpperCase() }}</span>
        <span class="qb-q-points">{{ q.points }} نقطة</span>
        <button class="qb-mini-btn" @click="editQuestion(i)">✏️</button>
        <button class="qb-mini-btn" @click="removeQuestion(i)">✕</button>
      </div>

      <div class="qb-new-q">
        <h4>{{ editingIndex >= 0 ? 'تعديل السؤال' : 'إضافة سؤال جديد' }}</h4>
        <div class="qb-field">
          <label>نص السؤال</label>
          <textarea v-model="newQ.question_text" rows="2" placeholder="اكتب السؤال هنا..."></textarea>
        </div>
        <div class="qb-form-row">
          <div class="qb-field"><label>الخيار A</label><input v-model="newQ.option_a" /></div>
          <div class="qb-field"><label>الخيار B</label><input v-model="newQ.option_b" /></div>
        </div>
        <div class="qb-form-row">
          <div class="qb-field"><label>الخيار C (اختياري)</label><input v-model="newQ.option_c" /></div>
          <div class="qb-field"><label>الخيار D (اختياري)</label><input v-model="newQ.option_d" /></div>
        </div>
        <div class="qb-form-row">
          <div class="qb-field">
            <label>الإجابة الصحيحة</label>
            <select v-model="newQ.correct_answer">
              <option v-for="opt in availableOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="qb-field">
            <label>النقاط</label>
            <input v-model.number="newQ.points" type="number" min="1" max="100" />
          </div>
        </div>
        <button class="qb-add-q-btn" @click="addQuestionLocal">{{ editingIndex >= 0 ? '✏️ تحديث' : '＋ إضافة سؤال' }}</button>
      </div>
    </div>

    <div class="qb-actions">
      <button class="qb-save-btn" @click="save(false)" :disabled="saving || !title.trim() || !classId || questions.length === 0">
        💾 حفظ
      </button>
      <button class="qb-publish-btn" @click="save(true)" :disabled="saving || !title.trim() || !classId || questions.length === 0">
        📤 حفظ ونشر
      </button>
    </div>
  </div>
</template>

<style scoped src="./quiz-builder.css"></style>
