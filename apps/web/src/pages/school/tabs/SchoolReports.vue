<template>
  <div class="dash-page">
    <h2>تقارير المدرسة</h2>
    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث بتجربة أو طالب..." />
      <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الحالات</option>
        <option value="submitted">مُقدّم</option>
        <option value="graded">مصحّح</option>
        <option value="resubmitted">مُعاد</option>
        <option value="pending">معلق</option>
      </select>
      <select v-model="classFilter" class="form-input" style="min-width: 160px;">
        <option value="">كل الفصول</option>
        <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
      </select>
      <button @click="handleExport" class="btn-export">📊 تصدير CSV</button>
    </div>
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-if="pagedReports.length" class="compact-list">
      <div
        v-for="r in pagedReports" :key="r.id"
        class="compact-row"
        :class="{ 'row-selected': activeReport?.id === r.id }"
        @click="selectReport(r)"
      >
        <span class="cr-icon">📄</span>
        <span class="cr-name">{{ r.experiment_name }}</span>
        <span class="cr-meta">
          <span>{{ r.student_name }}</span>
          <span v-if="r.class_name">{{ r.class_name }}</span>
          <span :class="['st-rate', statusClass(r.status)]">{{ statusLabel(r.status) }}</span>
          <span>الدرجة: {{ r.grade ?? '—' }}</span>
          <span>{{ formatDate(r.submitted_at || r.created_at) }}</span>
        </span>
        <span class="cr-action" @click.stop>
          <button class="toolbar-btn" @click.stop="activeReport = r; showDetail = true">تفاصيل</button>
          <button class="toolbar-btn" style="margin-right:6px" @click.stop="openGrade(r)">تصحيح</button>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="📄" title="لا توجد تقارير" />
    <Pagination
      v-if="filteredReports.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredReports.length"
      @change="currentPage = $event"
    />

    <div v-if="showDetail && activeReport" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-content">
        <h3>{{ activeReport.experiment_name }}</h3>
        <div class="form-group"><strong>الطالب:</strong> {{ activeReport.student_name }}</div>
        <div class="form-group"><strong>الفصل:</strong> {{ activeReport.class_name || '—' }}</div>
        <div class="form-group"><strong>الحالة:</strong> {{ statusLabel(activeReport.status) }}</div>
        <div class="form-group"><strong>الدرجة:</strong> {{ activeReport.grade ?? '—' }}</div>
        <div class="form-group"><strong>تاريخ التقديم:</strong> {{ formatDate(activeReport.submitted_at || activeReport.created_at) }}</div>
        <div class="modal-actions">
          <button @click="showDetail = false" class="btn-sm btn-warn">إغلاق</button>
        </div>
      </div>
    </div>

    <div v-if="gradeTarget" class="modal-overlay" @click.self="closeGrade">
      <div class="modal-content">
        <h3>تصحيح: {{ gradeTarget.experiment_name }}</h3>
        <p><strong>الطالب:</strong> {{ gradeTarget.student_name }}</p>
        <div class="form-group"><label>الدرجة (0–100)</label><input v-model.number="gradeValue" type="number" min="0" max="100" class="form-input" /></div>
        <div class="form-group"><label>ملاحظة</label><textarea v-model="gradeFeedback" class="form-input" rows="3"></textarea></div>
        <div class="modal-actions">
          <button @click="submitGrade" class="btn-sm btn-success" :disabled="gradeLoading">{{ gradeLoading ? '...' : 'حفظ' }}</button>
          <button @click="closeGrade" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getSchoolReports, gradeSchoolReport, type SchoolReportItem } from '@/services/school.service'
import { exportToCSV } from '@/composables/shared/useExport'
import { useToast } from '@/composables/useToast'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'

const reports = ref<SchoolReportItem[]>([])
const loading = ref(false)
const error = ref('')
const activeReport = ref<SchoolReportItem | null>(null)
const showDetail = ref(false)
const search = ref('')
const statusFilter = ref('')
const classFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(15)
const toast = useToast()
const gradeTarget = ref<SchoolReportItem | null>(null)
const gradeValue = ref<number | ''>('')
const gradeFeedback = ref('')
const gradeLoading = ref(false)

const filteredReports = computed(() => {
  let result = reports.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r => r.student_name?.toLowerCase().includes(q) || r.experiment_name?.toLowerCase().includes(q))
  }
  if (statusFilter.value) result = result.filter(r => r.status === statusFilter.value)
  if (classFilter.value) result = result.filter(r => r.class_name === classFilter.value)
  return result
})

const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredReports.value.slice(start, start + pageLimit.value)
})

const classOptions = computed(() => [...new Set(reports.value.map(r => r.class_name).filter(Boolean))])

watch([search, statusFilter, classFilter], () => { currentPage.value = 1 })

function statusClass(s: string) {
  if (s === 'graded') return 'st-rate--good'
  if (s === 'submitted' || s === 'resubmitted') return 'st-rate--mid'
  return 'st-rate--bad'
}
function statusLabel(s: string) {
  const labels: Record<string, string> = { graded: 'مصحّح', submitted: 'مُقدّم', resubmitted: 'مُعاد', pending: 'معلق' }
  return labels[s] || s
}

function selectReport(r: SchoolReportItem) {
  activeReport.value = activeReport.value?.id === r.id ? null : r
}

function handleExport() {
  exportToCSV(filteredReports.value.map(r => ({
    id: r.id, student: r.student_name, experiment: r.experiment_name, class: r.class_name || '',
    status: statusLabel(r.status), grade: r.grade ?? '', submitted: formatDate(r.submitted_at || r.created_at),
  })), 'school-reports')
}

function formatDate(d: string | undefined | null) {
  return d ? new Date(d).toLocaleDateString('ar') : '—'
}

function openGrade(r: SchoolReportItem) {
  gradeTarget.value = r
  gradeValue.value = r.grade ?? ''
  gradeFeedback.value = ''
}

function closeGrade() {
  gradeTarget.value = null
  gradeValue.value = ''
  gradeFeedback.value = ''
  gradeLoading.value = false
}

async function submitGrade() {
  if (!gradeTarget.value || gradeValue.value === '' || Number(gradeValue.value) < 0 || Number(gradeValue.value) > 100) {
    toast.error('أدخل درجة صالحة بين 0 و 100')
    return
  }
  gradeLoading.value = true
  try {
    await gradeSchoolReport(gradeTarget.value.id, Number(gradeValue.value), gradeFeedback.value)
    toast.success('تم حفظ الدرجة')
    closeGrade()
    await load()
  } catch (e: any) { toast.error(e?.message || 'فشل التصحيح') }
  finally { gradeLoading.value = false }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    // جلب التقارير بالدفعات لتجنّب تحميل 1000 صف دفعة واحدة
    const collected: SchoolReportItem[] = []
    let page = 1
    let pages = 1
    do {
      const res = await getSchoolReports(page, 200)
      if (res.success) {
        collected.push(...(res.reports || []))
        pages = res.totalPages ?? page
      } else { error.value = 'فشل التحميل'; break }
      page += 1
    } while (page <= pages)
    reports.value = collected
  } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
  finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.search-input { max-width: 240px; }
.st-rate--good { color: var(--success-text); }
.st-rate--mid { color: var(--warning-text); }
.st-rate--bad { color: var(--danger-text); }
.toolbar-btn { padding: 6px 10px; border: 1px solid var(--as-border); border-radius: 8px; background: var(--as-raised); color: var(--as-text); cursor: pointer; font-size: 12px; }
.toolbar-btn:hover { background: var(--as-surface); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: var(--as-surface); border: 1px solid var(--as-border); padding: 24px; border-radius: 16px; max-width: 440px; width: 90%; }
.modal-content h3 { margin: 0 0 12px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; }
.form-input { width: 100%; padding: 10px; border: 1px solid var(--as-border); border-radius: 8px; background: var(--as-raised); color: var(--as-text); box-sizing: border-box; }
.modal-actions { display: flex; gap: 8px; }
.btn-sm { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; color: white; }
.btn-success { background: #22c55e; }
.btn-warn { background: #f59e0b; }
</style>
