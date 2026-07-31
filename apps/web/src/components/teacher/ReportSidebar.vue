<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import type { Report, GradeHistoryEntry } from '../../services/report.service'
import { useAuthStore } from '../../modules/auth/stores/auth'
import ReportCommentThread from '../shared/ReportCommentThread.vue'

const props = defineProps<{
  report: Report
  history: GradeHistoryEntry[]
  activeSection: string
}>()

const emit = defineEmits<{
  (e: 'scroll-to', id: string): void
  (e: 'grade'): void
  (e: 'back'): void
}>()

const { t } = useI18n()
const auth = useAuthStore()

const sections = [
  { id: 'overview', icon: '📋', label: 'report.studentAndMeta' },
  { id: 'readings', icon: '📊', label: 'report.fullDataTable' },
  { id: 'stats', icon: '📈', label: 'report.detailedStats' },
  { id: 'calculations', icon: '🔢', label: 'report.equationsUsed' },
  { id: 'conclusion', icon: '📝', label: 'report.studentConclusion' },
  { id: 'ai', icon: '🎯', label: 'report.assessment' },
  { id: 'comments', icon: '💬', label: 'report.comments' },
]
</script>

<template>
  <aside class="sidebar">
    <button class="back-btn" @click="emit('back')">
      <span class="back-arrow">→</span>
      <span>{{ t('report.backToReports') }}</span>
    </button>

    <!-- Report Summary -->
    <div class="sb-summary">
      <div class="sb-avatar-row">
        <img v-if="report.student_avatar_url" :src="report.student_avatar_url" class="sb-avatar" alt="avatar" />
        <div v-else class="sb-avatar-placeholder">{{ (report.student_name || '?').charAt(0).toUpperCase() }}</div>
        <div class="sb-avatar-info">
          <div class="sb-exp">{{ report.experiment_name }}</div>
          <div class="sb-student">🎓 {{ report.student_name }}</div>
        </div>
      </div>
      <div class="sb-date">📅 {{ report.submitted_at?.slice(0, 10) }}</div>
      <div :class="['sb-status', 'st-' + report.status]">
        <span v-if="report.status === 'graded'">✅ {{ report.grade }}/100</span>
        <span v-else-if="report.status === 'resubmitted'">↩️ {{ t('report.status_resubmitted') }}</span>
        <span v-else>⏳ {{ t('report.status_submitted') }}</span>
      </div>
    </div>

    <!-- Grade Action (teacher/admin only) -->
    <button v-if="auth.isTeacher || auth.isAdmin" class="grade-btn" @click="emit('grade')">
      <span>✏️</span>
      <span>{{ report.status === 'graded' ? t('report.editGrade') : t('report.gradeNow') }}</span>
    </button>

    <!-- Navigation -->
    <nav class="sb-nav">
      <button
        v-for="s in sections"
        :key="s.id"
        :class="['nav-item', { active: activeSection === s.id }]"
        @click="emit('scroll-to', s.id)"
      >
        <span class="nav-icon">{{ s.icon }}</span>
        <span class="nav-label">{{ t(s.label) }}</span>
      </button>
    </nav>

    <!-- Grade History -->
    <div v-if="history.length > 0" class="sb-history">
      <div class="sb-hist-title">📜 {{ t('report.gradeHistory') }}</div>
      <div v-for="h in history" :key="h.id" class="hist-item">
        <span class="hist-teacher">{{ h.teacher_name }}</span>
        <span class="hist-grade">{{ h.old_grade !== undefined ? `${h.old_grade}→` : '' }}{{ h.new_grade }}</span>
        <span class="hist-date">{{ h.created_at?.slice(0, 10) }}</span>
      </div>
    </div>

    <!-- Comments -->
    <div class="sb-comments" id="comments">
      <div class="sb-comments-title">💬 {{ t('report.comments') }}</div>
      <ReportCommentThread
        :report-id="report.id"
        :user-role="auth.user?.role || ''"
        :user-name="auth.user?.name || ''"
      />
    </div>
  </aside>
</template>

<style scoped>
.sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.8rem; overflow-y: auto; max-height: 100vh; position: sticky; top: 0; padding: 1rem; background: rgba(15, 23, 42, 0.6); border-inline-end: 1px solid rgba(255, 255, 255, 0.06); }

.back-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.8rem; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 0.5rem; background: rgba(99, 102, 241, 0.08); color: #c7d2fe; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.back-btn:hover { background: rgba(99, 102, 241, 0.15); }

.sb-summary { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.6rem; padding: 0.8rem; }
.sb-avatar-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
.sb-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(99, 102, 241, 0.3); flex-shrink: 0; }
.sb-avatar-placeholder { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; flex-shrink: 0; }
.sb-avatar-info { flex: 1; min-width: 0; }
.sb-exp { font-size: 0.9rem; font-weight: 800; color: #e5e7eb; margin-bottom: 0.2rem; }
.sb-student { font-size: 0.8rem; color: #94a3b8; }
.sb-date { font-size: 0.75rem; color: #64748b; margin-bottom: 0.4rem; }
.sb-status { padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; text-align: center; }
.st-graded { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.st-submitted { background: rgba(251, 191, 36, 0.12); color: #fbbf24; }
.st-resubmitted { background: rgba(168, 85, 247, 0.12); color: #c084fc; }

.grade-btn { display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.6rem; border: none; border-radius: 0.6rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.grade-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3); }

.sb-nav { display: flex; flex-direction: column; gap: 0.2rem; }
.nav-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.7rem; border: none; border-radius: 0.4rem; background: transparent; color: #64748b; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; text-align: start; }
.nav-item:hover { background: rgba(255, 255, 255, 0.04); color: #e2e8f0; }
.nav-item.active { background: rgba(99, 102, 241, 0.12); color: #c7d2fe; }
.nav-icon { font-size: 1rem; }

.sb-history { background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 0.5rem; padding: 0.6rem; }
.sb-hist-title { font-size: 0.8rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.4rem; }
.hist-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; padding: 0.2rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
.hist-item:last-child { border-bottom: none; }
.hist-teacher { color: #94a3b8; }
.hist-grade { color: #67e8f9; font-family: monospace; font-weight: 700; }
.hist-date { color: #475569; margin-inline-start: auto; }

.sb-comments { margin-top: 0.5rem; }
.sb-comments-title { font-size: 0.8rem; font-weight: 700; color: #67e8f9; margin-bottom: 0.5rem; }

@media (max-width: 1024px) { .sidebar { width: 100%; max-height: none; position: relative; border-inline-end: none; border-bottom: 1px solid rgba(255,255,255,0.06); } }
</style>
