<template>
  <div class="dash-page">
    <h2>أسئلة التجارب</h2>
    <TeacherHelpButton :tab-id="editorOpen ? 'exp-questions-editor' : 'exp-questions-list'" />

    <div v-if="!editorOpen" class="list-view">
      <ExpQuestionsStats />
      <div class="toolbar">
        <select v-model="selectedExperiment" class="form-input">
          <option value="">اختر تجربة</option>
          <option v-for="exp in experiments" :key="exp.id" :value="exp.id">{{ exp.title_ar }}</option>
        </select>
        <input v-model="newTitle" class="form-input" placeholder="عنوان النموذج الجديد" />
        <button class="btn-add" :disabled="creating" @click="create">نموذج جديد</button>
      </div>

      <SkeletonLoader v-if="loading" type="cards" :count="3" />
      <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
      <div v-else-if="templates.length" class="template-list">
        <div v-for="t in templates" :key="t.id" class="template-card" @click="openEditor(t.id)">
          <div class="template-row">
            <div class="t-info">
              <span class="t-title">{{ t.title }}</span>
              <span class="t-meta">{{ t.experiment_title_ar }} — {{ statusText(t.status) }} — {{ t.question_count }} سؤال</span>
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
const { direction } = useI18n();
import { ref, onMounted } from 'vue'
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
.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }
.form-input { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-add { padding: 8px 16px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.template-list { display: flex; flex-direction: column; gap: 10px; }
.template-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; cursor: pointer; }
.template-card:hover { background: #f8fafc; }
.template-row { display: flex; justify-content: space-between; align-items: center; }
.t-info { display: flex; flex-direction: column; }
.t-title { font-weight: 600; }
.t-meta { color: #64748b; font-size: 14px; }
.t-actions { display: flex; gap: 8px; }
.t-action { color: #2563eb; font-size: 14px; background: none; border: none; cursor: pointer; }
.t-action.assign { color: #16a34a; }
.t-action.delete { color: #dc2626; }
.assign-row { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
.btn-confirm { padding: 6px 12px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.btn-cancel { padding: 6px 12px; background: #e2e8f0; color: #0f172a; border: none; border-radius: 6px; cursor: pointer; }
</style>
