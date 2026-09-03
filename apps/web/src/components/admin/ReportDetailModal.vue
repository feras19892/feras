<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content detail-modal">
      <div class="detail-header">
        <h3>{{ report?.experiment_name || t('dashboard.dashNew.reports') }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <SkeletonLoader v-if="loading" type="table" :count="3" />
      <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />

      <template v-else-if="report">
        <div class="detail-grid">
          <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.studentLabel') }}</span><span class="value">{{ report.student_name }}</span></div>
          <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.id') }}</span><span class="value">{{ report.id }}</span></div>
          <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.statusLabel') }}</span><span :class="['status-badge', report.status]">{{ statusLabel(report.status) }}</span></div>
          <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.gradeLabel') }}</span><span class="value">{{ report.grade ?? '-' }}</span></div>
          <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.submittedAt') }}</span><span class="value">{{ formatDate(report.submitted_at) }}</span></div>
          <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.gradedAt') }}</span><span class="value">{{ formatDate(report.graded_at) }}</span></div>
        </div>

        <div v-if="hasGradeDetails" class="detail-section">
          <h4>{{ t('dashboard.dashNew.gradingCriteria') }}</h4>
          <div class="detail-grid small">
            <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.accuracy') }}</span><span class="value">{{ report.grade_accuracy ?? '-' }}</span></div>
            <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.presentation') }}</span><span class="value">{{ report.grade_presentation ?? '-' }}</span></div>
            <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.conclusionLabel') }}</span><span class="value">{{ report.grade_conclusion ?? '-' }}</span></div>
            <div class="detail-field"><span class="label">{{ t('dashboard.dashNew.innovation') }}</span><span class="value">{{ report.grade_innovation ?? '-' }}</span></div>
          </div>
        </div>

        <div v-if="report.feedback" class="detail-section">
          <h4>{{ t('dashboard.dashNew.feedback') }}</h4>
          <p class="text-block">{{ report.feedback }}</p>
        </div>

        <div v-if="report.readings" class="detail-section"><h4>{{ t('dashboard.dashNew.readings') }}</h4><pre class="pre-block">{{ report.readings }}</pre></div>
        <div v-if="report.params" class="detail-section"><h4>{{ t('dashboard.dashNew.params') }}</h4><pre class="pre-block">{{ report.params }}</pre></div>
        <div v-if="report.student_info" class="detail-section"><h4>{{ t('dashboard.dashNew.studentInfo') }}</h4><pre class="pre-block">{{ report.student_info }}</pre></div>
        <div v-if="report.conclusion" class="detail-section"><h4>{{ t('dashboard.dashNew.conclusionHeading') }}</h4><pre class="pre-block">{{ report.conclusion }}</pre></div>
        <div v-if="report.conclusion_errors" class="detail-section"><h4>{{ t('dashboard.dashNew.errors') }}</h4><pre class="pre-block">{{ report.conclusion_errors }}</pre></div>
        <div v-if="report.conclusion_improvements" class="detail-section"><h4>{{ t('dashboard.dashNew.improvements') }}</h4><pre class="pre-block">{{ report.conclusion_improvements }}</pre></div>
        <div v-if="report.columns" class="detail-section"><h4>{{ t('dashboard.dashNew.columns') }}</h4><pre class="pre-block">{{ report.columns }}</pre></div>
        <div v-if="report.equations" class="detail-section"><h4>{{ t('dashboard.dashNew.equations') }}</h4><pre class="pre-block">{{ report.equations }}</pre></div>
        <div v-if="report.plots" class="detail-section"><h4>{{ t('dashboard.dashNew.plots') }}</h4><pre class="pre-block">{{ report.plots }}</pre></div>

        <div v-if="report.chart_snapshot" class="detail-section">
          <h4>{{ t('dashboard.dashNew.chartSnapshot') }}</h4>
          <img :src="report.chart_snapshot" alt="chart" class="chart-snapshot" />
        </div>

        <div v-if="comments.length" class="detail-section">
          <h4>{{ t('dashboard.dashNew.comments') }} ({{ comments.length }})</h4>
          <div v-for="c in comments" :key="c.id" class="comment-row">
            <div class="comment-meta"><span class="comment-author">{{ c.author_name }} ({{ c.author_role }})</span><span>{{ formatDate(c.created_at) }}</span></div>
            <p>{{ c.content }}</p>
          </div>
        </div>

        <div v-if="history.length" class="detail-section">
          <h4>{{ t('dashboard.dashNew.gradeHistory') }} ({{ history.length }})</h4>
          <div v-for="h in history" :key="h.id" class="history-row">
            <span>{{ h.teacher_name }}</span>
            <span class="grade-change">{{ h.old_grade ?? '-' }} → {{ h.new_grade }}</span>
            <span>{{ formatDate(h.created_at) }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-sm btn-success" @click="emit('grade')">✏️ {{ t('dashboard.dashNew.correct') }}</button>
          <button class="btn-sm btn-warn" @click="emit('reassign')">🔄 {{ t('dashboard.dashNew.reassign') }}</button>
          <button class="btn-sm btn-danger" @click="emit('delete')">🗑️ {{ t('dashboard.dashNew.delete') }}</button>
          <button class="btn-sm" style="background:#64748b;" @click="close">{{ t('dashboard.dashNew.cancel') }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import { ref, computed, watch } from 'vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import { getReport, getComments, getGradeHistory, type Report, type ReportComment, type GradeHistoryEntry } from '@/services/report.service'

const { t, direction } = useI18n();

const props = defineProps<{ reportId: number }>()
const emit = defineEmits<{ close: []; grade: []; reassign: []; delete: [] }>()

const report = ref<Report | null>(null)
const comments = ref<ReportComment[]>([])
const history = ref<GradeHistoryEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const hasGradeDetails = computed(() =>
  report.value && (report.value.grade_accuracy !== undefined || report.value.grade_presentation !== undefined || report.value.grade_conclusion !== undefined || report.value.grade_innovation !== undefined)
)

function statusLabel(s: string) {
  const labels: Record<string, string> = { draft: t('dashboard.dashNew.statusDraft'), submitted: t('dashboard.dashNew.statusSubmitted'), graded: t('dashboard.dashNew.statusGraded'), resubmitted: t('dashboard.dashNew.statusResubmitted') }
  return labels[s] || s
}

function formatDate(d?: string | null) { return d ? new Date(d).toLocaleString('ar') : '-' }

async function load() {
  loading.value = true
  error.value = null
  try {
    const [rRes, cRes, hRes] = await Promise.all([
      getReport(props.reportId),
      getComments(props.reportId).catch(() => ({ success: true, comments: [] })),
      getGradeHistory(props.reportId).catch(() => ({ success: true, history: [] })),
    ])
    if (rRes.success) report.value = rRes.report
    else throw new Error(t('dashboard.dashNew.reportsLoadFailed'))
    comments.value = cRes.comments || []
    history.value = hRes.history || []
  } catch (e: any) {
    error.value = e?.message || t('dashboard.dashNew.reportsLoadFailed')
  } finally { loading.value = false }
}

watch(() => props.reportId, load, { immediate: true })

function close() { emit('close') }
</script>

<script lang="ts">
export default { name: 'ReportDetailModal' }
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 24px; border-radius: 16px; max-width: 760px; width: 90%; max-height: 90vh; overflow-y: auto; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.detail-header h3 { margin: 0; font-size: 20px; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #6b7280; }
.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
.detail-grid.small { grid-template-columns: repeat(4, 1fr); }
.detail-field { background: #f8fafc; padding: 10px 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; }
.detail-field .label { font-size: 12px; color: #6b7280; }
.detail-field .value { font-weight: 500; color: #111827; }
.detail-section { margin-bottom: 20px; }
.detail-section h4 { margin: 0 0 10px; font-size: 15px; color: #374151; }
.text-block { background: #f8fafc; padding: 12px; border-radius: 8px; margin: 0; line-height: 1.6; }
.pre-block { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; font-family: monospace; font-size: 13px; line-height: 1.5; }
.chart-snapshot { max-width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; }
.comment-row, .history-row { background: #f8fafc; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; }
.comment-meta { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.comment-author { font-weight: 600; }
.grade-change { font-weight: 700; color: #3b82f6; }
.btn-sm { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; color: white; }
.btn-success { background: #22c55e; }
.btn-warn { background: #f59e0b; }
.btn-danger { background: #dc2626; }
.modal-actions { display: flex; gap: 8px; margin-top: 20px; }
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; display: inline-block; }
.status-badge.graded { background: #dcfce7; color: #16a34a; }
.status-badge.submitted { background: #fef3c7; color: #d97706; }
.status-badge.draft { background: #f1f5f9; color: #64748b; }
.status-badge.resubmitted { background: #e0e7ff; color: #4f46e5; }
</style>
