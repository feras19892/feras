<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { getMyClasses, getPendingCount } from '../../services/class.service'
import { getReports, getGradeHistory, deleteReport, markReportSeen } from '../../services/report.service'
import type { ClassItem } from '../../services/class.service'
import type { Report, GradeHistoryEntry } from '../../services/report.service'
import { useAuthStore } from '../../modules/auth/stores/auth'
import { useI18n } from '../../composables/useI18n'
import ReportViewer from '../shared/ReportViewer.vue'
import ReportCommentThread from '../shared/ReportCommentThread.vue'
import ReportAIAnalyzer from './ReportAIAnalyzer.vue'
import GradeModal from './GradeModal.vue'

const auth = useAuthStore()
const { t } = useI18n()

const classes = ref<ClassItem[]>([])
const selectedClassId = ref('')
const reports = ref<Report[]>([])
const loading = ref(false)
const pendingCount = ref(0)

const stats = computed(() => {
  const total = reports.value.length
  const graded = reports.value.filter(r => r.status === 'graded').length
  const avg = total > 0
    ? Math.round(reports.value.filter(r => r.grade !== undefined).reduce((s, r) => s + (r.grade || 0), 0) / graded)
    : 0
  return { total, graded, pending: total - graded, avg }
})

const gradeOpen = ref(false)
const viewOpen = ref(false)
const viewReport = ref<Report | null>(null)
const gradeTarget = ref<Report | null>(null)
const gradeHistory = ref<GradeHistoryEntry[]>([])

async function openView(r: Report) {
  viewReport.value = r
  viewOpen.value = true
  if (!r.teacher_seen) {
    try { await markReportSeen(r.id) } catch { /* ignore */ }
    r.teacher_seen = true
  }
  loadHistory(r.id)
}

async function loadHistory(reportId: number) {
  try {
    const res = await getGradeHistory(reportId)
    if (res.success) gradeHistory.value = res.history
  } catch (err) {
    console.error('load history failed:', err)
  }
}

function openGrade(r: Report) {
  gradeTarget.value = r
  gradeOpen.value = true
}

function onGraded() {
  loadReports()
  if (viewReport.value) loadHistory(viewReport.value.id)
}

async function confirmDelete(r: Report) {
  if (!confirm(t('teacher.deleteConfirm') + ` "${r.experiment_name}" — ${r.student_name}?`)) return
  try {
    const res = await deleteReport(r.id)
    if (res.success) loadReports()
  } catch (err) {
    console.error('delete failed:', err)
  }
}

async function loadClasses() {
  try {
    const res = await getMyClasses()
    if (res.success) {
      classes.value = res.classes
      if (res.classes.length > 0) {
        selectedClassId.value = res.classes[0].id
        await loadReports()
      }
    }
    const p = await getPendingCount()
    if (p.success) pendingCount.value = p.pendingCount
  } catch (err) {
    console.error('load classes failed:', err)
  }
}

async function loadReports() {
  if (!selectedClassId.value) return
  loading.value = true
  try {
    const res = await getReports({ class_id: selectedClassId.value })
    if (res.success) reports.value = res.reports
  } catch (err) {
    console.error('load reports failed:', err)
  } finally {
    loading.value = false
  }
}

let refreshInterval: ReturnType<typeof setInterval> | null = null

function startAutoRefresh(intervalMs = 30000) {
  stopAutoRefresh()
  refreshInterval = setInterval(async () => {
    if (selectedClassId.value) await loadReports()
    try {
      const p = await getPendingCount()
      if (p.success) pendingCount.value = p.pendingCount
    } catch { /* ignore */ }
  }, intervalMs)
}

function stopAutoRefresh() {
  if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null }
}

onMounted(() => {
  loadClasses()
  startAutoRefresh()
})

onUnmounted(() => stopAutoRefresh())

watch(() => auth.user, (u) => {
  if (u) loadClasses()
}, { immediate: false })
</script>

<template>
  <div class="grading-panel">
    <div class="grading-header">
      <div>
        <h2>{{ t('teacher.gradingTitle') }}</h2>
        <span v-if="pendingCount > 0" class="pending-badge">{{ pendingCount }} {{ t('teacher.newReports') }}</span>
      </div>
      <select v-model="selectedClassId" @change="loadReports">
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
    </div>

    <div class="stats-bar">
      <div class="stat">
        <span class="stat-val">{{ stats.total }}</span>
        <span class="stat-label">{{ t('teacher.reportsStat') }}</span>
      </div>
      <div class="stat">
        <span class="stat-val">{{ stats.graded }}</span>
        <span class="stat-label">{{ t('teacher.graded') }}</span>
      </div>
      <div class="stat">
        <span class="stat-val">{{ stats.pending }}</span>
        <span class="stat-label">{{ t('teacher.pendingStat') }}</span>
      </div>
      <div class="stat">
        <span class="stat-val">{{ stats.avg }}%</span>
        <span class="stat-label">{{ t('teacher.avgStat') }}</span>
      </div>
    </div>

    <div v-if="loading" class="empty">...</div>
    <div v-else-if="reports.length === 0" class="empty">
      <p>{{ t('teacher.noReports') }}</p>
    </div>
    <div v-else class="report-list">
      <div v-for="r in reports" :key="r.id" class="report-row" :class="{ graded: r.status === 'graded' }" @click="openView(r)">
        <div class="report-info">
          <span class="report-student">{{ r.student_name }}</span>
          <span class="report-exp">{{ r.experiment_name }}</span>
          <span class="report-date">{{ r.submitted_at?.slice(0, 10) }}</span>
        </div>
        <div class="report-status">
          <span v-if="r.status === 'graded'" class="badge graded">{{ r.grade }}/100</span>
          <span v-else class="badge pending">{{ t('teacher.pendingStatus') }}</span>
          <button class="grade-btn" @click.stop="openGrade(r)">
            {{ r.status === 'graded' ? t('teacher.editBtn') : t('teacher.gradeBtn') }}
          </button>
          <button class="delete-btn" @click.stop="confirmDelete(r)" :title="t('teacher.deleteBtn')">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- View Report Modal -->
    <div v-if="viewOpen && viewReport" class="modal-overlay" @click.self="viewOpen = false">
      <div class="view-modal">
        <ReportViewer :report="viewReport" />

        <ReportAIAnalyzer :report="viewReport" />

        <!-- Grade History -->
        <div v-if="gradeHistory.length > 0" class="history-section">
          <h4 class="section-title">{{ t('teacher.historyTitle') }}</h4>
          <div class="history-list">
            <div v-for="h in gradeHistory" :key="h.id" class="history-item">
              <span class="history-teacher">{{ h.teacher_name }}</span>
              <span class="history-grade" :class="{ changed: h.old_grade !== undefined }">
                {{ h.old_grade !== undefined ? `${h.old_grade} → ` : '' }}{{ h.new_grade }}/100
              </span>
              <span class="history-date">{{ h.created_at?.slice(0, 10) }}</span>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <ReportCommentThread
          v-if="viewReport"
          :report-id="viewReport.id"
          :user-role="auth.user?.role || ''"
          :user-name="auth.user?.name || ''"
        />

        <div class="actions">
          <button class="btn-cancel" @click="viewOpen = false">{{ t('teacher.closeBtn') }}</button>
          <button class="btn-submit" @click="viewOpen = false; openGrade(viewReport)">{{ t('teacher.gradeNow') }}</button>
        </div>
      </div>
    </div>

    <GradeModal
      :open="gradeOpen"
      :report="gradeTarget"
      @close="gradeOpen = false"
      @graded="onGraded"
    />
  </div>
</template>

<style scoped>
.grading-panel { width: 100%; padding: 1rem 1.5rem; }
.grading-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.grading-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.grading-header select { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; }
.pending-badge { display: inline-block; margin-top: 0.3rem; background: rgba(239,68,68,0.15); color: #f87171; font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px; }
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.5rem; }
.stat { text-align: center; padding: 0.6rem; border-radius: 0.5rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); }
.stat-val { display: block; font-size: 1.3rem; font-weight: 800; color: #67e8f9; }
.stat-label { font-size: 0.75rem; color: #94a3b8; }
.empty { text-align: center; padding: 3rem 1rem; color: #64748b; }
.report-list { display: flex; flex-direction: column; gap: 0.5rem; }
.report-row { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; border-radius: 0.6rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); transition: all 0.2s; }
.report-row:hover { border-color: rgba(99,102,241,0.25); }
.report-row.graded { border-color: rgba(34,197,94,0.2); }
.report-info { display: flex; align-items: center; gap: 1rem; }
.report-student { font-weight: 700; color: #f1f5f9; }
.report-exp { color: #94a3b8; font-size: 0.85rem; }
.report-date { color: #64748b; font-size: 0.8rem; }
.report-status { display: flex; align-items: center; gap: 0.6rem; }
.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge.graded { background: rgba(34,197,94,0.15); color: #22c55e; }
.badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; }
.grade-btn { padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.grade-btn:hover { opacity: 0.9; }
.delete-btn { padding: 0.3rem 0.5rem; border-radius: 0.4rem; border: none; background: rgba(239,68,68,0.15); color: #f87171; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
.delete-btn:hover { background: rgba(239,68,68,0.25); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.view-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.history-section { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.75rem 1rem; }
.section-title { margin: 0 0 0.5rem; font-size: 0.85rem; color: #fbbf24; }
.history-list { display: flex; flex-direction: column; gap: 0.35rem; }
.history-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.history-item:last-child { border-bottom: none; }
.history-teacher { color: #94a3b8; min-width: 80px; }
.history-grade { color: #67e8f9; font-weight: 700; font-family: monospace; }
.history-grade.changed { color: #fbbf24; }
.history-date { color: #475569; margin-right: auto; font-size: 0.75rem; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.btn-cancel, .btn-submit { flex: 1; padding: 0.55rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
</style>
