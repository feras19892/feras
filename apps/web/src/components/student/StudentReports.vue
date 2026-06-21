<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getReports } from '../../services/report.service'
import type { Report } from '../../services/report.service'
import { useAuthStore } from '../../modules/auth/stores/auth'
import ReportViewer from '../shared/ReportViewer.vue'
import ReportCommentThread from '../shared/ReportCommentThread.vue'
import ReportResubmitModal from './ReportResubmitModal.vue'

const auth = useAuthStore()
const reports = ref<Report[]>([])
const loading = ref(false)
const viewOpen = ref(false)
const selectedReport = ref<Report | null>(null)
const resubmitOpen = ref(false)
const resubmitTarget = ref<Report | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await getReports()
    if (res.success) reports.value = res.reports
  } catch (err) {
    console.error('load reports failed:', err)
  } finally {
    loading.value = false
  }
}

function openReport(r: Report) {
  selectedReport.value = r
  viewOpen.value = true
}

function openResubmit(r: Report) {
  resubmitTarget.value = r
  resubmitOpen.value = true
}

function onResubmitted() {
  load()
  resubmitOpen.value = false
}

function statusLabel(s: string) {
  if (s === 'graded') return '✅ مصحح'
  if (s === 'submitted') return '⏳ قيد المراجعة'
  if (s === 'resubmitted') return '↩️ مُعاد'
  return '📝 مسودة'
}

function statusClass(s: string) {
  if (s === 'graded') return 'graded'
  if (s === 'submitted') return 'pending'
  if (s === 'resubmitted') return 'resubmitted'
  return 'draft'
}

onMounted(() => {
  load()
})
</script>

<template>
  <div class="reports-panel">
    <div class="reports-header">
      <h2>📋 تقاريري</h2>
      <span v-if="reports.length" class="count">{{ reports.length }} تقرير</span>
    </div>

    <div v-if="loading" class="empty">...</div>
    <div v-else-if="reports.length === 0" class="empty">
      <p>لم تُرسل أي تقرير بعد</p>
      <p class="sub">أجرِ تجربة ثم أرسلها للمدرس</p>
    </div>
    <div v-else class="report-list">
      <div v-for="r in reports" :key="r.id" class="report-row" :class="statusClass(r.status)" @click="openReport(r)">
        <div class="report-info">
          <span class="exp-name">{{ r.experiment_name }}</span>
          <span class="class-name">{{ r.class_id }}</span>
          <span class="date">{{ r.submitted_at?.slice(0, 10) || r.created_at?.slice(0, 10) }}</span>
        </div>
        <div class="report-result">
          <span class="badge" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
          <span v-if="r.grade !== undefined" class="grade">{{ r.grade }}%</span>
        </div>
      </div>
    </div>

    <!-- View Report Modal -->
    <div v-if="viewOpen && selectedReport" class="modal-overlay" @click.self="viewOpen = false">
      <div class="view-modal">
        <!-- Grade Banner -->
        <div v-if="selectedReport.status === 'graded'" class="grade-banner">
          <span class="grade-score">⭐ {{ selectedReport.grade }}/100</span>
          <span v-if="selectedReport.graded_by_name" class="grade-teacher">مصحح: {{ selectedReport.graded_by_name }}</span>
          <span v-if="selectedReport.feedback" class="grade-feedback">{{ selectedReport.feedback }}</span>
        </div>
        <div v-else-if="selectedReport.status === 'resubmitted'" class="status-banner resubmitted">
          ↩️ تم إعادة الإرسال — في انتظار التصحيح
        </div>
        <div v-else class="status-banner pending">
          ⏳ قيد المراجعة
        </div>

        <ReportViewer :report="selectedReport" />

        <ReportCommentThread
          v-if="selectedReport"
          :report-id="selectedReport.id"
          :user-role="auth.user?.role || ''"
          :user-name="auth.user?.name || ''"
        />

        <div class="actions">
          <button class="btn-close" @click="viewOpen = false">إغلاق</button>
          <button
            v-if="selectedReport.status === 'graded'"
            class="btn-resubmit"
            @click="viewOpen = false; openResubmit(selectedReport)"
          >
            ↩️ إعادة إرسال
          </button>
        </div>
      </div>
    </div>

    <ReportResubmitModal
      v-model:show="resubmitOpen"
      :original-report="resubmitTarget"
      @submitted="onResubmitted"
    />
  </div>
</template>

<style scoped>
.reports-panel { width: 100%; padding: 1rem 1.5rem; }
.reports-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.reports-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.count { font-size: 0.75rem; color: #64748b; background: rgba(255,255,255,0.05); padding: 0.2rem 0.6rem; border-radius: 999px; }
.empty { text-align: center; padding: 3rem 1rem; color: #64748b; }
.empty .sub { font-size: 0.85rem; color: #475569; margin-top: 0.3rem; }
.report-list { display: flex; flex-direction: column; gap: 0.5rem; }
.report-row { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; border-radius: 0.6rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); transition: all 0.2s; }
.report-row:hover { border-color: rgba(99,102,241,0.25); }
.report-row.graded { border-color: rgba(34,197,94,0.2); }
.report-info { display: flex; align-items: center; gap: 1rem; }
.exp-name { font-weight: 700; color: #f1f5f9; }
.class-name { color: #94a3b8; font-size: 0.85rem; }
.date { color: #64748b; font-size: 0.8rem; }
.report-result { display: flex; align-items: center; gap: 0.6rem; }
.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge.graded { background: rgba(34,197,94,0.15); color: #22c55e; }
.badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge.draft { background: rgba(148,163,184,0.15); color: #94a3b8; }
.badge.resubmitted { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.grade { font-size: 0.9rem; font-weight: 700; color: #67e8f9; font-family: monospace; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.view-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; width: 90%; max-width: 800px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.grade-banner { background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05)); border: 1px solid rgba(34,197,94,0.2); border-radius: 0.5rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
.grade-score { font-size: 1.3rem; font-weight: 800; color: #22c55e; }
.grade-teacher { font-size: 0.8rem; color: #94a3b8; }
.grade-feedback { font-size: 0.85rem; color: #e2e8f0; margin-top: 0.3rem; padding-top: 0.3rem; border-top: 1px solid rgba(255,255,255,0.06); }
.status-banner { border-radius: 0.5rem; padding: 0.75rem 1rem; text-align: center; font-size: 0.85rem; font-weight: 600; }
.status-banner.pending { background: rgba(245,158,11,0.1); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }
.status-banner.resubmitted { background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); }
.actions { display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem; }
.btn-close { padding: 0.55rem 1.5rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-resubmit { padding: 0.55rem 1.5rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
</style>
