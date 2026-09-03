<template>
  <div class="dash-page">
    <h2>تقاريري</h2>
    <div class="toolbar-right">
      <select v-model="statusFilter" class="filter-select">
        <option value="">كل الحالات</option>
        <option value="submitted">مُرسل</option>
        <option value="graded">مصحّح</option>
        <option value="resubmitted">إعادة تسليم</option>
      </select>
      <select v-model="classFilter" class="filter-select">
        <option value="">كل الفصول</option>
        <option v-for="c in store.classes" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <SkeletonLoader v-if="store.loadingReports" type="list" :count="5" />
    <ErrorState v-else-if="store.error" :error="store.error || ''" show-retry @retry="load" />
    <div v-else-if="filteredReports.length" class="compact-list">
      <div
        v-for="r in pagedReports"
        :key="r.id"
        class="compact-row clickable"
        @click="openReport(r)"
      >
        <span class="cr-icon">{{ statusIcon(r.status) }}</span>
        <span class="cr-name">{{ r.experiment_name }}</span>
        <span class="cr-meta">
          <span>{{ className(r.class_id) }}</span>
          <span>{{ r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('ar') : '—' }}</span>
          <span :class="['status-pill', r.status]">{{ statusLabel(r.status) }}</span>
        </span>
        <span class="cr-action">
          <span v-if="r.status === 'graded'" class="grade-badge">{{ r.grade ?? 0 }}/100</span>
          <span v-else-if="r.status === 'submitted'" class="pending-badge">بانتظار التصحيح</span>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="📄" title="لا توجد تقارير" />
    <Pagination
      v-if="filteredReports.length > reportLimit"
      :page="reportPage"
      :limit="reportLimit"
      :total="filteredReports.length"
      @change="reportPage = $event"
    />

    <DetailDrawer
      :open="!!selectedReport"
      :title="selectedReport ? selectedReport.experiment_name : ''"
      @close="closeReport"
    >
      <template v-if="selectedReport">
        <div class="report-detail">
          <div class="detail-row">
            <span class="detail-label">الفصل:</span>
            <span>{{ className(selectedReport.class_id) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">تاريخ الإرسال:</span>
            <span>{{ selectedReport.submitted_at ? new Date(selectedReport.submitted_at).toLocaleString('ar') : '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">الحالة:</span>
            <span :class="['status-pill', selectedReport.status]">{{ statusLabel(selectedReport.status) }}</span>
          </div>

          <div v-if="selectedReport.status === 'graded'" class="grade-section">
            <h4>الدرجة</h4>
            <div class="grade-grid">
              <div class="grade-item"><span>الدقة</span><strong>{{ selectedReport.grade_accuracy ?? 0 }}/25</strong></div>
              <div class="grade-item"><span>العرض</span><strong>{{ selectedReport.grade_presentation ?? 0 }}/25</strong></div>
              <div class="grade-item"><span>الاستنتاج</span><strong>{{ selectedReport.grade_conclusion ?? 0 }}/25</strong></div>
              <div class="grade-item"><span>الابتكار</span><strong>{{ selectedReport.grade_innovation ?? 0 }}/25</strong></div>
              <div class="grade-total"><span>الإجمالي</span><strong>{{ selectedReport.grade ?? 0 }}/100</strong></div>
            </div>
            <div v-if="selectedReport.feedback" class="feedback-box">
              <h4>تعليق المدرس</h4>
              <p>{{ selectedReport.feedback }}</p>
            </div>
            <div v-if="selectedReport.graded_by_name" class="detail-row">
              <span class="detail-label">صحّح بواسطة:</span>
              <span>{{ selectedReport.graded_by_name }}</span>
            </div>
          </div>

          <ReportContent :report="selectedReport" />
        </div>
      </template>
      <template #footer>
        <button @click="closeReport" class="btn-sm btn-warn">إغلاق</button>
      </template>
    </DetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStudentStore } from '@/stores/student.store'
import { markFeedbackSeen } from '@/services/report.service'
import type { Report } from '@/services/report.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import DetailDrawer from '@/components/shared/DetailDrawer.vue'
import ReportContent from '@/components/shared/ReportContent.vue'
import { eventBus } from '@/composables/shared/useEventBus'


const store = useStudentStore()
const selectedReport = ref<Report | null>(null)
const statusFilter = ref('')
const classFilter = ref('')
const reportPage = ref(1)
const reportLimit = ref(12)

const filteredReports = computed(() => {
  return store.reports.filter((r: Report) => {
    if (statusFilter.value && r.status !== statusFilter.value) return false
    if (classFilter.value && r.class_id !== classFilter.value) return false
    return true
  })
})
const pagedReports = computed(() => {
  const start = (reportPage.value - 1) * reportLimit.value
  return filteredReports.value.slice(start, start + reportLimit.value)
})

function statusIcon(status: string) {
  if (status === 'graded') return '✅'
  if (status === 'submitted') return '📝'
  if (status === 'resubmitted') return '🔄'
  return '📄'
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    submitted: 'مُرسل',
    graded: 'مصحّح',
    resubmitted: 'إعادة تسليم'
  }
  return labels[status] || status
}

function className(classId: string) {
  const c = store.classes.find(cls => cls.id === classId)
  return c?.name || '—'
}

function openReport(r: Report) {
  selectedReport.value = r
  if (r.status === 'graded' && !r.feedback_seen) {
    markFeedbackSeen(r.id)
      .then(res => { if (res.success) r.feedback_seen = true })
      .catch(() => {})
  }
}

function closeReport() {
  selectedReport.value = null
}

async function load() {
  await store.fetchReports(true)
}

onMounted(() => {
  store.fetchReports()
  store.fetchClasses()
  eventBus.on('report:graded', load)
})

onUnmounted(() => {
  eventBus.off('report:graded', load)
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.filter-select { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-surface, #1f2937); color: var(--as-text, #f8fafc); font-size: 13px; }
.toolbar-right { display: flex; gap: 8px; margin-bottom: 12px; }
.status-pill { padding: 2px 10px; border-radius: 16px; font-size: 12px; font-weight: 600; }
.status-pill.submitted { background: rgba(245,158,11,0.15); color: var(--as-warning, #f59e0b); }
.status-pill.graded { background: rgba(16,185,129,0.15); color: var(--as-success, #10b981); }
.status-pill.resubmitted { background: rgba(99,102,241,0.15); color: var(--as-accent, #6366f1); }
.status-pill.draft { background: var(--as-border, rgba(128,128,128,0.1)); color: var(--as-text-soft, #888); }
.grade-badge { color: var(--as-success, #10b981); font-weight: 700; font-size: 13px; }
.pending-badge { color: var(--as-warning, #f59e0b); font-size: 12px; }
.report-detail { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; gap: 8px; font-size: 14px; color: var(--as-text, #f8fafc); }
.detail-label { color: var(--as-text-muted, #94a3b8); min-width: 100px; }
.grade-section { border-top: 1px solid var(--as-border, rgba(255,255,255,0.08)); padding-top: 12px; }
.grade-section h4 { margin: 0 0 8px; font-size: 14px; color: var(--as-text, #f8fafc); }
.grade-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.grade-item { display: flex; justify-content: space-between; padding: 6px 10px; border-radius: 8px; background: var(--as-surface, #1f2937); font-size: 13px; }
.grade-total { display: flex; justify-content: space-between; padding: 8px 10px; border-radius: 8px; background: rgba(99,102,241,0.1); font-size: 14px; grid-column: span 2; }
.feedback-box { margin-top: 12px; padding: 12px; border-radius: 8px; background: var(--as-surface, #1f2937); border: 1px solid var(--as-border, rgba(255,255,255,0.08)); }
.feedback-box h4 { margin: 0 0 6px; font-size: 13px; color: var(--as-text-muted, #94a3b8); }
.feedback-box p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--as-text, #f8fafc); }
</style>
