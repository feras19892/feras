<template>
  <div class="dash-page">
    <h2>{{ t('dashboard.dashNew.reports') }}</h2>

    <div v-if="analytics" class="analytics-section">
      <h4>{{ t('dashboard.dashNew.analyticsTitle') }}</h4>
      <div class="stats-grid">
        <div class="stat-card"><span class="stat-label">{{ t('dashboard.dashNew.analyticsTotal') }}</span><span class="stat-value">{{ analytics.total }}</span></div>
        <div class="stat-card"><span class="stat-label">{{ t('dashboard.dashNew.analyticsGraded') }}</span><span class="stat-value">{{ analytics.graded }}</span></div>
        <div class="stat-card"><span class="stat-label">{{ t('dashboard.dashNew.analyticsAverage') }}</span><span class="stat-value">{{ analytics.average }}</span></div>
        <div class="stat-card"><span class="stat-label">{{ t('dashboard.dashNew.analyticsOverdue') }}</span><span class="stat-value">{{ analytics.overdue }}</span></div>
      </div>
      <div class="chart-row">
        <div class="chart-block">
          <h5>{{ t('dashboard.dashNew.analyticsStatus') }}</h5>
          <div v-for="s in statusEntries" :key="s.status" class="bar-row">
            <span class="bar-label">{{ statusLabel(s.status) }}</span>
            <div class="bar-bg"><div class="bar-fill" :style="{ width: statusPercent(s.count) + '%' }"></div></div>
            <span class="bar-value">{{ s.count }}</span>
          </div>
        </div>
        <div class="chart-block">
          <h5>{{ t('dashboard.dashNew.analyticsGrades') }}</h5>
          <div v-for="g in gradeEntries" :key="g.range" class="bar-row">
            <span class="bar-label">{{ g.range }}</span>
            <div class="bar-bg"><div class="bar-fill" :style="{ width: gradePercent(g.count) + '%' }"></div></div>
            <span class="bar-value">{{ g.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="overdueCount" class="alert-banner">
      ⚠️ {{ t('dashboard.dashNew.overdueAlert', { n: overdueCount }) }}
    </div>

    <FilterBar :filters="filterConfigs" :search="true" @change="onFilterChange" />

    <SkeletonLoader v-if="loading" type="table" :count="5" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />

    <div v-else>
      <div v-if="selectedCount" class="reports-actions">
        <label class="select-all"><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"> {{ t('dashboard.dashNew.selectAll') }}</label>
        <span class="selected-count">{{ selectedCount }} {{ t('dashboard.dashNew.selected') }}</span>
        <button v-if="selectedCount >= 1" class="btn-sm btn-success" @click="gradeSelected">✏️ {{ t('dashboard.dashNew.correct') }}</button>
        <button v-if="selectedCount >= 1" class="btn-sm btn-warn" @click="reassignSelected">🔄 {{ t('dashboard.dashNew.reassign') }}</button>
        <button class="btn-sm btn-danger" @click="deleteSelected">🗑️ {{ t('dashboard.dashNew.delete') }}</button>
        <button class="btn-sm btn-info" @click="exportSelected">📤 {{ t('dashboard.dashNew.export') }}</button>
        <button class="btn-sm" style="background: #64748b;" @click="selectedReports = []">{{ t('dashboard.dashNew.deselect') }}</button>
      </div>

      <div v-if="pagedReports.length" class="compact-list">
        <div v-for="r in pagedReports" :key="r.id" class="compact-row" :class="{ selected: selectedReports.includes(r.id) }" @click="openDetail(r)">
          <input type="checkbox" class="cr-checkbox" :checked="selectedReports.includes(r.id)" @click.stop="toggleReport(r.id, $event)" />
          <span class="cr-icon">📄</span>
          <span class="cr-name">{{ r.experiment_name }}</span>
          <span class="cr-meta">
            <span>{{ r.student_name }}</span>
            <span>{{ r.class_name }}</span>
            <span :class="['status-badge', r.status]">{{ statusLabel(r.status) }}</span>
            <span>{{ r.grade ?? '-' }}</span>
          </span>
          <span class="cr-actions" @click.stop>
            <button class="btn-icon" :title="t('dashboard.dashNew.goToStudent')" @click="goToStudent(r.student_id)">👤</button>
            <button class="btn-icon" :title="t('dashboard.dashNew.goToClass')" @click="goToClass(r.class_id)">📚</button>
            <button class="btn-icon" :title="t('dashboard.dashNew.goToTeacher')" @click="goToTeacher(r.teacher_id)">👨‍🏫</button>
            <button class="btn-icon" :title="t('dashboard.dashNew.goToSchool')" @click="goToSchool(r.school_id)">🏫</button>
            <button class="btn-icon" :title="t('dashboard.dashNew.view')" @click="openDetail(r)">👁️</button>
            <button class="btn-icon" :title="t('dashboard.dashNew.gradeTooltip')" @click="openGrading(r)">✏️</button>
            <button class="btn-icon" :title="t('dashboard.dashNew.reassignTooltip')" @click="openReassign(r)">🔄</button>
            <button class="btn-icon delete" :title="t('dashboard.dashNew.deleteTooltip')" @click="handleDelete([r.id])">🗑️</button>
          </span>
        </div>
      </div>
      <EmptyState v-else icon="📄" :title="t('dashboard.dashNew.noReports2')" />

      <Pagination v-if="totalReports" :page="currentPage" :limit="pageLimit" :total="totalReports" @change="onPageChange" />
    </div>

    <div v-if="selected" class="modal-overlay" @click.self="closeGrading">
      <div class="modal-content">
        <h3>{{ t('dashboard.dashNew.correct') }}: {{ selected.experiment_name }}</h3>
        <p v-if="selectedCount > 1" class="bulk-notice">{{ t('dashboard.dashNew.bulkGradeNotice', { n: selectedCount }) }}</p>
        <p v-else>{{ t('dashboard.dashNew.student') }}: {{ selected.student_name }}</p>
        <div class="form-group"><label>{{ t('dashboard.dashNew.gradeRange') }}</label><input v-model.number="grade" type="number" min="0" max="100" class="form-input" /></div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.notes') }}</label><textarea v-model="feedback" class="form-input" rows="3"></textarea></div>
        <div class="modal-actions">
          <button @click="submitGrade" class="btn-sm btn-success" :disabled="submitting">{{ submitting ? '...' : t('dashboard.dashNew.save') }}</button>
          <button @click="closeGrading" class="btn-sm btn-warn">{{ t('dashboard.dashNew.cancel') }}</button>
        </div>
      </div>
    </div>

    <div v-if="reassignTarget" class="modal-overlay" @click.self="closeReassign">
      <div class="modal-content">
        <h3>{{ t('dashboard.dashNew.reassignTitle') }}</h3>
        <p v-if="selectedCount > 1" class="bulk-notice">{{ t('dashboard.dashNew.bulkReassignNotice', { n: selectedCount }) }}</p>
        <template v-else>
          <p>{{ t('dashboard.dashNew.reports') }}: {{ reassignTarget.experiment_name }}</p>
          <p>{{ t('dashboard.dashNew.currentTeacher') }}: {{ reassignTarget.teacher_name }}</p>
        </template>
        <div class="form-group"><label>{{ t('dashboard.dashNew.newTeacher') }}</label>
          <select v-model="reassignTeacherId" class="form-input">
            <option value="" disabled selected>{{ t('dashboard.dashNew.selectTeacher') }}</option>
            <option v-for="te in teachers" :key="te.id" :value="te.id">{{ te.name }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="confirmReassign" class="btn-sm btn-success" :disabled="reassigning">{{ reassigning ? '...' : t('dashboard.dashNew.assign') }}</button>
          <button @click="closeReassign" class="btn-sm btn-warn">{{ t('dashboard.dashNew.cancel') }}</button>
        </div>
      </div>
    </div>

    <ConfirmModal :open="deleteTarget.length > 0" icon="🗑️" :title="t('dashboard.dashNew.deleteReportTitle')" :message="deleteMessage" :confirm-label="t('dashboard.dashNew.delete')" :cancel-label="t('dashboard.dashNew.cancel')" variant="danger" :loading="deleteLoading" @confirm="confirmDelete" @cancel="deleteTarget = []" />

    <ReportDetailModal v-if="detailId" :report-id="detailId" @close="closeDetail" @grade="openGradeFromDetail" @reassign="openReassignFromDetail" @delete="deleteFromDetail" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminReportsAnalytics } from '@/composables/admin/useAdminReportsAnalytics'
import FilterBar, { type FilterConfig } from '@/components/shared/FilterBar.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import ReportDetailModal from '@/components/admin/ReportDetailModal.vue'

const c = useAdminReportsAnalytics()

const {
  t, loading, error, currentPage, pageLimit, totalReports, selected, grade, feedback,
  submitting, deleteTarget, deleteLoading, reassignTarget, reassignTeacherId, reassigning, teachers,
  selectedReports, detailId, overdueCount, filteredReports, pagedReports, selectedCount,
  isAllSelected, deleteMessage, toggleReport, toggleSelectAll, openDetail, closeDetail,
  openGradeFromDetail, openReassignFromDetail, deleteFromDetail, onFilterChange, onPageChange, statusLabel,
  gradeSelected, reassignSelected, deleteSelected, exportSelected, openGrading, closeGrading, submitGrade,
  handleDelete, confirmDelete, openReassign, closeReassign, confirmReassign, load, filterOptions, analytics,
  goToStudent, goToTeacher, goToClass, goToSchool,
} = c

const statusEntries = computed(() => !analytics.value ? [] : ['draft', 'submitted', 'graded', 'resubmitted'].map(status => ({ status, count: analytics.value!.statusCounts[status] || 0 })))
const gradeEntries = computed(() => !analytics.value ? [] : analytics.value.gradeDistribution)
const statusPercent = (count: number) => analytics.value?.total ? Math.round((count / analytics.value.total) * 100) : 0
const gradePercent = (count: number) => analytics.value?.graded ? Math.round((count / analytics.value.graded) * 100) : 0

const filterConfigs = computed<FilterConfig[]>(() => [
  { key: 'schoolId', label: t('dashboard.dashNew.schoolFilter'), options: filterOptions.value.schools.map(s => ({ value: String(s.id), label: s.name })) },
  { key: 'classId', label: t('dashboard.dashNew.classFilter'), options: filterOptions.value.classes.map(c => ({ value: c.id, label: c.name })) },
  { key: 'teacherId', label: t('dashboard.dashNew.teacherFilter'), options: filterOptions.value.teachers.map(u => ({ value: String(u.id), label: u.name })) },
  { key: 'experiment', label: t('dashboard.dashNew.experimentFilter'), options: filterOptions.value.experiments.map(e => ({ value: e.name, label: e.name })) },
  { key: 'status', label: t('dashboard.dashNew.status'), options: [
    { value: 'draft', label: t('dashboard.dashNew.statusDraft') },
    { value: 'submitted', label: t('dashboard.dashNew.statusSubmitted') },
    { value: 'graded', label: t('dashboard.dashNew.statusGraded') },
    { value: 'resubmitted', label: t('dashboard.dashNew.statusResubmitted') },
  ] },
  { key: 'from', label: t('dashboard.dashNew.fromDate'), type: 'date' },
  { key: 'to', label: t('dashboard.dashNew.toDate'), type: 'date' },
  { key: 'gradeMin', label: t('dashboard.dashNew.gradeMin'), type: 'number' },
  { key: 'gradeMax', label: t('dashboard.dashNew.gradeMax'), type: 'number' },
])
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.alert-banner { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; }
.status-badge.graded { background: #dcfce7; color: #16a34a; }
.status-badge.submitted { background: #fef3c7; color: #d97706; }
.status-badge.draft { background: #f1f5f9; color: #64748b; }
.status-badge.resubmitted { background: #e0e7ff; color: #4f46e5; }
.btn-sm { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; color: white; }
.btn-success { background: #22c55e; }
.btn-warn { background: #f59e0b; }
.btn-danger { background: #dc2626; }
.btn-info { background: #3b82f6; }
.reports-actions { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.select-all, .selected-count { font-size: 13px; color: var(--text-secondary, #6b7280); display: flex; align-items: center; gap: 6px; }
.cr-checkbox { width: 18px; height: 18px; cursor: pointer; margin-inline-end: 4px; }
.compact-row { cursor: pointer; }
.compact-row.selected { background: var(--bg-hover, #f8fafc); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 24px; border-radius: 16px; max-width: 440px; width: 90%; }
.modal-content h3 { margin: 0 0 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
.form-input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 8px; }
.compact-row .cr-name { flex-shrink: 1; min-width: 0; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.compact-row .cr-meta { min-width: 0; }
.compact-row .cr-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px; }
.compact-row .cr-actions { display: flex; gap: 6px; flex-shrink: 0; margin-inline-start: auto; }
.compact-row .cr-actions .btn-icon { width: 28px; height: 28px; border: none; border-radius: 6px; cursor: pointer; background: #f1f5f9; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.compact-row .cr-actions .btn-icon:hover { background: #e2e8f0; }
.compact-row .cr-actions .btn-icon.delete:hover { background: #fee2e2; }
.analytics-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.analytics-section h4 { margin: 0 0 12px; font-size: 15px; color: #374151; }
.analytics-section h5 { margin: 0 0 10px; font-size: 13px; color: #4b5563; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-card { background: white; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: 12px; color: #6b7280; }
.stat-value { font-size: 20px; font-weight: 700; color: #111827; }
.chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-block { background: white; border-radius: 10px; padding: 12px; }
.bar-row { display: grid; grid-template-columns: 90px 1fr 36px; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; }
.bar-label { color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-bg { background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden; }
.bar-fill { background: #3b82f6; height: 100%; border-radius: 4px; }
.bar-value { color: #374151; text-align: end; }
.bulk-notice { font-size: 13px; color: #92400e; background: #fef3c7; padding: 8px 10px; border-radius: 6px; margin: 0 0 12px; }
</style>
