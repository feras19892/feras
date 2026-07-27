<script setup lang="ts">
import { ref, watch } from 'vue'
import { getGradeHistory, markReportSeen } from '../../services/report.service'
import type { Report, GradeHistoryEntry } from '../../services/report.service'
import { useAuthStore } from '../../modules/auth/stores/auth'
import { useI18n } from '../../composables/useI18n'
import TeacherReportViewer from './TeacherReportViewer.vue'
import ReportCommentThread from '../shared/ReportCommentThread.vue'
import ReportAIAnalyzer from './ReportAIAnalyzer.vue'

const props = defineProps<{ report: Report }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'grade'): void }>()

const auth = useAuthStore()
const { t } = useI18n()
const gradeHistory = ref<GradeHistoryEntry[]>([])

async function loadHistory(reportId: number) {
  try {
    const res = await getGradeHistory(reportId)
    if (res.success) gradeHistory.value = res.history
  } catch (err) { console.error('load history failed:', err) }
}

watch(() => props.report, (r) => {
  if (r && !r.teacher_seen) {
    markReportSeen(r.id).catch(() => {})
    r.teacher_seen = true
  }
  if (r) loadHistory(r.id)
}, { immediate: true })
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="view-modal">
      <TeacherReportViewer :report="report" />
      <ReportAIAnalyzer :report="report" />

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

      <ReportCommentThread
        :report-id="report.id"
        :user-role="auth.user?.role || ''"
        :user-name="auth.user?.name || ''"
      />

      <div class="actions">
        <button class="btn-cancel" @click="emit('close')">{{ t('teacher.closeBtn') }}</button>
        <button class="btn-submit" @click="emit('grade')">{{ t('teacher.gradeNow') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); display: flex; align-items: flex-start; justify-content: center; z-index: 300; padding: 2rem 1rem; overflow-y: auto; }
.view-modal { background: rgba(15, 23, 42, 0.97); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 1.5rem; width: 100%; max-width: 1100px; display: flex; flex-direction: column; gap: 1rem; margin: 0 auto; }
.history-section { background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.5rem; padding: 0.75rem 1rem; }
.section-title { margin: 0 0 0.5rem; font-size: 0.85rem; color: #fbbf24; }
.history-list { display: flex; flex-direction: column; gap: 0.35rem; }
.history-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; padding: 0.3rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
.history-item:last-child { border-bottom: none; }
.history-teacher { color: #94a3b8; min-width: 80px; }
.history-grade { color: #67e8f9; font-weight: 700; font-family: monospace; }
.history-grade.changed { color: #fbbf24; }
.history-date { color: #475569; margin-inline-start: auto; font-size: 0.75rem; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; position: sticky; bottom: -1.5rem; background: rgba(15, 23, 42, 0.97); padding: 0.75rem 0 0; }
.btn-cancel, .btn-submit { flex: 1; padding: 0.55rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-cancel { background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
</style>
