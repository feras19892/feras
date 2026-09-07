<template>
  <div class="dash-page">
    <h2>أسئلة التجارب</h2>
    <TeacherHelpButton :tab-id="editorOpen ? 'exp-questions-editor' : 'exp-questions-list'" />

    <div v-if="!editorOpen" class="list-view">
      <ExpQuestionsStats />

      <!-- اختيار متدرج: القسم → الفرع → التجربة -->
      <div class="toolbar">
        <select v-model="selectedCategory" class="form-input">
          <option value="">الأقسام — الكل</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.label }} ({{ cat.count }})</option>
        </select>
        <select v-model="selectedSubject" class="form-input" :disabled="!selectedCategory">
          <option value="">كل الفروع</option>
          <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.label }} ({{ sub.count }})</option>
        </select>
        <select v-model="selectedExperiment" class="form-input" :disabled="!selectedCategory">
          <option value="">اختر تجربة</option>
          <option v-for="exp in filteredExperiments" :key="exp.id" :value="exp.id">{{ exp.title_ar }}</option>
        </select>
        <input v-model="newTitle" class="form-input" placeholder="عنوان النموذج الجديد" />
        <button class="btn-add" :disabled="creating || !selectedExperiment || !newTitle.trim()" @click="create">نموذج جديد</button>
      </div>

      <input v-model="searchQuery" class="form-input search" placeholder="🔍 بحث في نماذجي (عنوان أو تجربة)..." />

      <SkeletonLoader v-if="loading" type="cards" :count="3" />
      <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
      <div v-else-if="filteredTemplates.length" class="template-list">
        <div v-for="t in filteredTemplates" :key="t.id" class="template-card" @click="openEditor(t.id)">
          <div class="template-row">
            <div class="t-info">
              <span class="t-title">{{ t.title }}</span>
              <span class="t-meta">
                <span class="cat-chip" :class="t.category">{{ categoryIcon(t.category) }} {{ categoryLabel(t.category) }}</span>
                {{ subjectLabel(t.subject) }} · {{ t.experiment_title_ar }} — {{ statusText(t.status) }} — {{ t.question_count }} سؤال
              </span>
            </div>
            <div class="t-actions" @click.stop>
              <button class="t-action assign" @click.stop="openAssign(t.id)">تعيين للفصل</button>
              <button class="t-action" @click.stop="openEditor(t.id)">تعديل →</button>
              <button class="t-action delete" @click.stop="removeTemplate(t.id)">حذف</button>
            </div>
          </div>
          <div v-if="assigningTemplate === t.id" class="assign-row" @click.stop>
            <select v-model="selectedClass" class="form-input" :disabled="assigning">
              <option value="">اختر فصل</option>
              <option v-for="cls in teacherStore.classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
            <button class="btn-confirm" :disabled="!selectedClass || assigning" @click="confirmAssign(t.id)">تأكيد</button>
            <button class="btn-cancel" :disabled="assigning" @click="assigningTemplate = 0">إلغاء</button>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="🧪" title="لا توجد نماذج" message="أنشئ نموذج أسئلة لإحدى التجارب" />
    </div>

    <TemplateEditor
      v-else
      :template-id="editingId"
      @close="editorOpen = false"
      @updated="load"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useTeacherStore } from '@/stores/teacher.store'
import * as api from '@/services/experiment-questions.service'
import type { ExperimentOption, ExperimentQuestionTemplate } from '@/services/experiment-questions.service'
import EmptyState from '@/components/shared/EmptyState.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import TemplateEditor from '@/components/experiment-questions/TemplateEditor.vue'
import ExpQuestionsStats from '@/components/experiment-questions/ExpQuestionsStats.vue'
import TeacherHelpButton from '@/components/teacher/TeacherHelpButton.vue'


const toast = useToast()
const teacherStore = useTeacherStore()
const templates = ref<ExperimentQuestionTemplate[]>([])
const experiments = ref<ExperimentOption[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const creating = ref(false)
const editorOpen = ref(false)
const editingId = ref(0)
const selectedExperiment = ref('')
const newTitle = ref('')
const assigningTemplate = ref(0)
const selectedClass = ref('')
const assigning = ref(false)
const selectedCategory = ref('')
const selectedSubject = ref('')
const searchQuery = ref('')

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  biology: { label: 'أحياء', icon: '🧬' },
  physics: { label: 'فيزياء', icon: '⚛️' },
  chemistry: { label: 'كيمياء', icon: '🧪' },
}

const SUBJECT_LABELS: Record<string, string> = {
  anatomy: 'التشريح',
  cell: 'الخلية',
  plant: 'النبات',
  microbiology: 'الأحياء الدقيقة',
  genetics: 'الوراثة',
  mechanics: 'الميكانيكا',
  optics: 'البصريات',
  waves: 'الموجات والصوت',
  thermodynamics: 'الحرارة',
  electricity: 'الكهرباء',
  magnetism: 'المغناطيسية',
  analytical: 'تحليلية',
  organic: 'عضوية',
}

function categoryLabel(category?: string): string {
  return CATEGORY_META[category ?? '']?.label ?? (category || '')
}

function categoryIcon(category?: string): string {
  return CATEGORY_META[category ?? '']?.icon ?? '🔬'
}

function subjectLabel(subject?: string): string {
  return SUBJECT_LABELS[subject ?? ''] ?? (subject || '')
}

const categories = computed(() => {
  const set = new Map<string, { id: string; label: string; icon: string; count: number }>()
  for (const exp of experiments.value) {
    const meta = CATEGORY_META[exp.category] ?? { label: exp.category, icon: '🔬' }
    const existing = set.get(exp.category)
    if (existing) existing.count += 1
    else set.set(exp.category, { id: exp.category, label: meta.label, icon: meta.icon, count: 1 })
  }
  return [...set.values()]
})

const subjects = computed(() => {
  if (!selectedCategory.value) return []
  const set = new Map<string, { id: string; label: string; count: number }>()
  for (const exp of experiments.value) {
    if (exp.category !== selectedCategory.value) continue
    const label = SUBJECT_LABELS[exp.subject] ?? exp.subject
    const existing = set.get(exp.subject)
    if (existing) existing.count += 1
    else set.set(exp.subject, { id: exp.subject, label, count: 1 })
  }
  return [...set.values()]
})

const filteredExperiments = computed(() =>
  experiments.value.filter((exp) => exp.category === selectedCategory.value)
    .filter((exp) => !selectedSubject.value || exp.subject === selectedSubject.value)
)

const filteredTemplates = computed(() => {
  let list = templates.value
  if (selectedCategory.value) list = list.filter((t) => t.category === selectedCategory.value)
  if (selectedSubject.value) list = list.filter((t) => t.subject === selectedSubject.value)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((t) =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.experiment_title_ar || '').toLowerCase().includes(q)
    )
  }
  return list
})

// تصفير التبعيات عند تغيير المستوى الأعلى
watch(selectedCategory, () => {
  selectedSubject.value = ''
  selectedExperiment.value = ''
})
watch(selectedSubject, () => {
  selectedExperiment.value = ''
})

onMounted(() => { load(); loadExperiments(); teacherStore.fetchClasses() })

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await api.listTemplates()
    if (res.success && res.templates) templates.value = res.templates
    else error.value = res.message || 'فشل تحميل النماذج'
  } catch (e: any) { error.value = e.message || 'فشل تحميل النماذج' }
  finally { loading.value = false }
}

async function loadExperiments() {
  try {
    const res = await api.getExperiments()
    if (res.success && res.experiments) experiments.value = res.experiments
  } catch (e: any) { toast.error(e.message || 'فشل تحميل التجارب') }
}

async function create() {
  if (!selectedExperiment.value || !newTitle.value.trim()) return
  creating.value = true
  try {
    const res = await api.createTemplate(selectedExperiment.value, newTitle.value.trim())
    if (res.success && res.template) {
      toast.success('تم إنشاء النموذج')
      newTitle.value = ''
      selectedExperiment.value = ''
      await load()
      openEditor(res.template.id)
    } else {
      toast.error(res.message || 'فشل الإنشاء')
    }
  } catch (e: any) { toast.error(e.message || 'فشل الإنشاء') }
  finally { creating.value = false }
}

function openEditor(id: number) {
  editingId.value = id
  editorOpen.value = true
}

async function removeTemplate(id: number) {
  if (!confirm('هل تريد حذف هذا النموذج؟')) return
  try {
    const res = await api.deleteTemplate(id)
    if (res.success) {
      toast.success('تم حذف النموذج')
      await load()
    } else {
      toast.error(res.message || 'فشل الحذف')
    }
  } catch (e: any) { toast.error(e.message || 'فشل الحذف') }
}

function openAssign(id: number) {
  assigningTemplate.value = id
  selectedClass.value = ''
}

async function confirmAssign(id: number) {
  if (!selectedClass.value) return
  assigning.value = true
  try {
    const res = await api.assignTemplate(id, selectedClass.value)
    if (res.success) {
      toast.success('تم تعيين النموذج للفصل')
      assigningTemplate.value = 0
    } else {
      toast.error(res.message || 'فشل التعيين')
    }
  } catch (e: any) { toast.error(e.message || 'فشل التعيين') }
  finally { assigning.value = false }
}

function statusText(status: string) {
  const map: Record<string, string> = { draft: 'مسودة', published: 'منشور', archived: 'مؤرشف' }
  return map[status] ?? status
}
</script>

<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.toolbar .form-input { min-width: 150px; }
.form-input { flex: 1; padding: 8px; border: 1px solid #334155; border-radius: 6px; background: rgba(30, 41, 59, 0.8); color: #e2e8f0; }
.form-input option { background: #1e293b; color: #e2e8f0; }
.search { max-width: 420px; margin-bottom: 14px; }
.btn-add { padding: 8px 16px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
.template-list { display: flex; flex-direction: column; gap: 10px; }
.template-card { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 8px; padding: 12px; cursor: pointer; transition: background 0.15s ease; }
.template-card:hover { background: rgba(51, 65, 85, 0.85); }
.template-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.t-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.t-title { font-weight: 600; color: #4ade80; }
.t-meta { color: #94a3b8; font-size: 13px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.cat-chip { padding: 1px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.cat-chip.biology { background: rgba(74, 222, 128, 0.14); color: #4ade80; }
.cat-chip.physics { background: rgba(6, 182, 212, 0.14); color: #22d3ee; }
.cat-chip.chemistry { background: rgba(251, 146, 60, 0.14); color: #fb923c; }
.t-actions { display: flex; gap: 8px; flex-shrink: 0; }
.t-action { color: #60a5fa; font-size: 14px; background: none; border: none; cursor: pointer; }
.t-action.assign { color: #4ade80; }
.t-action.delete { color: #f87171; }
.assign-row { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
.btn-confirm { padding: 6px 12px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.btn-cancel { padding: 6px 12px; background: #334155; color: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; }
</style>
