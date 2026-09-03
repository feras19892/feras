<template>
  <div class="dash-page">
    <h2>تصحيح التقارير</h2>
    <FilterBar :filters="filterConfigs" search @change="onFilterChange" />
    <div class="sort-bar">
      <select v-model="sortBy" class="sort-select">
        <option value="date">📅 الأحدث</option>
        <option value="name">🔤 اسم الطالب</option>
        <option value="grade">📊 الدرجة</option>
        <option value="status">📌 الحالة</option>
      </select>
    </div>
    <SkeletonLoader v-if="store.loading" type="list" :count="4" />
    <ErrorState v-else-if="store.error" :error="store.error" show-retry @retry="load" />
    <div v-else-if="filteredReports.length" class="compact-list">
      <div
        v-for="report in pagedReports"
        :key="report.id"
        class="compact-row clickable"
        @click="openGrading(report)"
      >
        <span class="cr-icon">📄</span>
        <span class="cr-name">{{ report.experiment_name }}</span>
        <span class="cr-meta">
          <span>{{ report.student_name || 'طالب' }}</span>
          <span>{{ classNameFor(report.class_id) }}</span>
          <span :class="['status-pill', report.status]">{{ statusLabel(report.status) }}</span>
          <span v-if="report.submitted_at">{{ new Date(report.submitted_at).toLocaleDateString('ar') }}</span>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="📄" title="لا توجد تقارير للتصحيح" />
    <Pagination
      v-if="filteredReports.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredReports.length"
      @change="onPageChange"
    />

    <DetailDrawer
      :open="!!selectedReport"
      :title="selectedReport ? `تصحيح: ${selectedReport.experiment_name}` : ''"
      @close="closeGrading"
    >
      <template v-if="selectedReport">
        <ReportContent :report="selectedReport" />

        <div v-if="autoGradeResult?.notes?.length" class="auto-grade-box">
          <div class="ag-header">🤖 التقييم التلقائي الذكي</div>
          <div class="ag-scores">
            <span>الدقة: <strong>{{ autoGradeResult?.accuracy ?? 0 }}</strong>/25</span>
            <span>العرض: <strong>{{ autoGradeResult?.presentation ?? 0 }}</strong>/25</span>
            <span>الاستنتاج: <strong>{{ autoGradeResult?.conclusion ?? 0 }}</strong>/25</span>
            <span>الابتكار: <strong>{{ autoGradeResult?.innovation ?? 0 }}</strong>/25</span>
            <span class="ag-total">الإجمالي: <strong>{{ autoGradeResult?.total ?? 0 }}</strong>/100</span>
          </div>
          <ul class="ag-notes">
            <li v-for="note in autoGradeResult?.notes || []" :key="note">{{ note }}</li>
          </ul>
          <button class="btn-apply-auto" @click="applyAutoGrade">تطبيق التقييم التلقائي</button>
        </div>

        <div class="form-group">
          <label>الدقة (0-25)</label>
          <input v-model.number="gradeAccuracy" type="number" min="0" max="25" class="form-input" />
        </div>
        <div class="form-group">
          <label>العرض (0-25)</label>
          <input v-model.number="gradePresentation" type="number" min="0" max="25" class="form-input" />
        </div>
        <div class="form-group">
          <label>الاستنتاج (0-25)</label>
          <input v-model.number="gradeConclusion" type="number" min="0" max="25" class="form-input" />
        </div>
        <div class="form-group">
          <label>الابتكار (0-25)</label>
          <input v-model.number="gradeInnovation" type="number" min="0" max="25" class="form-input" />
        </div>
        <div class="form-group">
          <label>الدرجة الإجمالية: {{ totalGrade }}/100</label>
        </div>
        <div class="form-group">
          <label>ملاحظات المدرس</label>
          <div class="feedback-templates">
            <button v-for="tpl in feedbackTemplates" :key="tpl" class="tpl-chip" @click="applyTemplate(tpl)">{{ tpl }}</button>
          </div>
          <textarea v-model="feedback" class="form-input" rows="4" placeholder="اكتب ملاحظاتك هنا..." @keydown.ctrl.enter="submitGrade" @keydown.meta.enter="submitGrade"></textarea>
          <small class="shortcut-hint">💡 Ctrl+Enter للحفظ السريع</small>
        </div>
      </template>
      <template #footer>
        <button v-if="hasPrev" @click="prevReport" class="btn-sm btn-ghost" title="التقرير السابق">‹ السابق</button>
        <button @click="submitGrade" class="btn-sm btn-success" :disabled="submitting">
          {{ submitting ? 'جاري الحفظ...' : 'حفظ التصحيح' }}
        </button>
        <button v-if="hasNext" @click="nextReport" class="btn-sm btn-ghost" title="التقرير التالي">التالي ›</button>
        <button @click="closeGrading" class="btn-sm btn-warn">إلغاء</button>
      </template>
    </DetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTeacherStore } from '@/stores/teacher.store'
import * as teacherApi from '@/services/core/teacher.api'
import FilterBar, { type FilterConfig } from '@/components/shared/FilterBar.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import DetailDrawer from '@/components/shared/DetailDrawer.vue'
import ReportContent from '@/components/shared/ReportContent.vue'
import { autoGradeReport, type AutoGradeResult } from '@/composables/useAutoGrade'
import { useToast } from '@/composables/useToast'
import { eventBus } from '@/composables/shared/useEventBus'
import type { Report } from '@/services/report.service'
import type { TeacherClass } from '@/services/core/teacher.api'

const store = useTeacherStore()
const toast = useToast()
const selectedReport = ref<Report | null>(null)
const gradeAccuracy = ref<number | string>(0)
const gradePresentation = ref<number | string>(0)
const gradeConclusion = ref<number | string>(0)
const gradeInnovation = ref<number | string>(0)
const feedback = ref('')
const submitting = ref(false)
const autoGradeResult = ref<AutoGradeResult | null>(null)
const totalGrade = computed(() =>
  (Number(gradeAccuracy.value) || 0) +
  (Number(gradePresentation.value) || 0) +
  (Number(gradeConclusion.value) || 0) +
  (Number(gradeInnovation.value) || 0)
)
const classFilter = ref('')
const statusFilter = ref('')
const searchQuery = ref('')
const sortBy = ref<'date' | 'name' | 'grade' | 'status'>('date')
const currentPage = ref(1)
const pageLimit = ref(10)
const feedbackTemplates = ['عمل ممتاز، استمر على هذا الأداء!','تقرير جيد لكن يحتاج مزيد من التفاصيل في الاستنتاج.','القراءات غير دقيقة، يرجى إعادة القياس.','العرض منظم والمعادلات صحيحة. استنتاج يحتاج تطوير.','تقرير ضعيف، راجع خطوات التجربة وأعد المحاولة.']

const filterConfigs = computed<FilterConfig[]>(() => [
  {
    key: 'class', label: 'الفصل',
    options: store.classes.map((c: TeacherClass) => ({ value: String(c.id), label: c.name })),
  },
  {
    key: 'status', label: 'الحالة',
    options: [
      { value: 'submitted', label: 'مُرسل' },
      { value: 'graded', label: 'مصحّح' },
      { value: 'resubmitted', label: 'إعادة تسليم' },
    ],
  },
])

function onFilterChange(values: Record<string, string>, search: string) {
  classFilter.value = values.class || ''
  statusFilter.value = values.status || ''
  searchQuery.value = search || ''
  currentPage.value = 1
}

const filteredReports = computed(() => {
  let list = store.reports
  if (classFilter.value) list = list.filter((r: Report) => r.class_id != null && String(r.class_id) === classFilter.value)
  if (statusFilter.value) list = list.filter((r: Report) => r.status === statusFilter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((r: Report) =>
      (r.experiment_name || '').toLowerCase().includes(q) ||
      (r.student_name || '').toLowerCase().includes(q)
    )
  }
  const sorted = [...list]
  if (sortBy.value === 'name') sorted.sort((a, b) => (a.student_name || '').localeCompare(b.student_name || '', 'ar'))
  else if (sortBy.value === 'grade') sorted.sort((a, b) => (b.grade ?? 0) - (a.grade ?? 0))
  else if (sortBy.value === 'status') sorted.sort((a, b) => a.status.localeCompare(b.status))
  else sorted.sort((a, b) => new Date(b.submitted_at || b.created_at || 0).getTime() - new Date(a.submitted_at || a.created_at || 0).getTime())
  return sorted
})

const currentReportIndex = computed(() =>
  selectedReport.value ? filteredReports.value.findIndex(r => r.id === selectedReport.value!.id) : -1
)
const hasPrev = computed(() => currentReportIndex.value > 0)
const hasNext = computed(() => currentReportIndex.value >= 0 && currentReportIndex.value < filteredReports.value.length - 1)

function prevReport() {
  if (!hasPrev.value) return
  const prev = filteredReports.value[currentReportIndex.value - 1]
  if (prev) openGrading(prev)
}
function nextReport() {
  if (!hasNext.value) return
  const next = filteredReports.value[currentReportIndex.value + 1]
  if (next) openGrading(next)
}

function applyTemplate(tpl: string) {
  feedback.value = tpl
}

const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredReports.value.slice(start, start + pageLimit.value)
})

function onPageChange(p: number) { currentPage.value = p }

const classNameFor = (classId: string) => store.classes.find((c: TeacherClass) => String(c.id) === String(classId))?.name || '—'

const statusLabel = (status: string) => ({ draft: 'مسودة', submitted: 'مُرسل', graded: 'مصحّح', resubmitted: 'إعادة تسليم' } as Record<string, string>)[status] || status

function openGrading(report: Report) {
  if (report.status !== 'submitted' && report.status !== 'resubmitted' && report.status !== 'graded') return
  if (report.status === 'graded') {
    if (!confirm('هذا التقرير مصحّح مسبقاً. هل تريد إعادة التصحيح؟')) return
  }
  selectedReport.value = report
  const result = autoGradeReport(report)
  autoGradeResult.value = result
  if (report.status === 'submitted' || report.status === 'resubmitted') {
    gradeAccuracy.value = result.accuracy
    gradePresentation.value = result.presentation
    gradeConclusion.value = result.conclusion
    gradeInnovation.value = result.innovation
  } else {
    gradeAccuracy.value = report.grade_accuracy ?? 0
    gradePresentation.value = report.grade_presentation ?? 0
    gradeConclusion.value = report.grade_conclusion ?? 0
    gradeInnovation.value = report.grade_innovation ?? 0
  }
  feedback.value = report.feedback ?? ''
}

function applyAutoGrade() {
  if (!autoGradeResult.value) return
  gradeAccuracy.value = autoGradeResult.value.accuracy
  gradePresentation.value = autoGradeResult.value.presentation
  gradeConclusion.value = autoGradeResult.value.conclusion
  gradeInnovation.value = autoGradeResult.value.innovation
  toast.success('تم تطبيق التقييم التلقائي')
}

function closeGrading() {
  selectedReport.value = null
  autoGradeResult.value = null
  gradeAccuracy.value = 0
  gradePresentation.value = 0
  gradeConclusion.value = 0
  gradeInnovation.value = 0
  feedback.value = ''
}

async function submitGrade() {
  if (!selectedReport.value) return
  const nums = [gradeAccuracy, gradePresentation, gradeConclusion, gradeInnovation]
    .map(v => typeof v.value === 'number' ? v.value : Number(v.value))
  if (nums.some(n => Number.isNaN(n) || n < 0 || n > 25)) {
    toast.error('الدرجات يجب أن تكون بين 0 و 25')
    return
  }
  const grade = nums.reduce((s, n) => s + n, 0)
  submitting.value = true
  try {
    await teacherApi.gradeReport(selectedReport.value.id, {
      grade, feedback: feedback.value,
      grade_accuracy: nums[0], grade_presentation: nums[1],
      grade_conclusion: nums[2], grade_innovation: nums[3],
    })
    eventBus.emit('report:graded', { reportId: selectedReport.value.id, studentId: selectedReport.value.student_id ?? 0 })
    await store.fetchReports(true)
    toast.success('تم حفظ التصحيح')
    closeGrading()
  } catch (e: any) {
    toast.error(e?.message || 'فشل حفظ التصحيح')
  } finally {
    submitting.value = false
  }
}

async function load() { await store.fetchReports(true) }

onMounted(load)
</script>

<style scoped src="./Grading.css"></style>
