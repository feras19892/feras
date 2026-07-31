<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import type { StudentReportRow, StudentKPI } from '../../composables/student/useStudentDashboard'
import type { ClassItem } from '../../services/class.service'
import AnnouncementsPanel from '../shared/AnnouncementsPanel.vue'
import DeadlinesPanel from './DeadlinesPanel.vue'

const props = defineProps<{
  kpi: StudentKPI
  recent: StudentReportRow[]
  overdue: StudentReportRow[]
  classes: ClassItem[]
  locale?: string
}>()

const emit = defineEmits<{
  (e: 'open-report', id: number): void
  (e: 'open-tab', tab: string): void
  (e: 'navigate', tab: string): void
}>()

const { t } = useI18n()

function statusLabel(s: string): string {
  if (s === 'graded') return t('dashboard.statusGraded')
  if (s === 'submitted') return t('dashboard.statusSubmitted')
  if (s === 'resubmitted') return t('dashboard.statusResubmitted')
  return t('dashboard.statusDraft')
}

function timeShort(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const loc = props.locale || 'ar'
  const localeStr = loc === 'ar' ? 'ar-SA' : loc === 'es' ? 'es-ES' : 'en-US'
  return d.toLocaleDateString(localeStr) + ' ' + d.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="tab-panel">
    <!-- New feedback alert -->
    <div v-if="kpi.newFeedback > 0" class="alert-banner feedback" @click="emit('open-tab', 'reports')">
      <span>💬</span>
      <span>{{ kpi.newFeedback }} {{ t('dashboard.dash.newFeedbackMsg') }}</span>
      <span class="alert-arrow">←</span>
    </div>

    <!-- Pending alert -->
    <div v-if="kpi.pendingCount > 0" class="alert-banner pending" @click="emit('open-tab', 'reports')">
      <span>⏳</span>
      <span>{{ kpi.pendingCount }} {{ t('dashboard.dash.pendingReviewMsg') }}</span>
      <span class="alert-arrow">←</span>
    </div>

    <!-- Two columns: recent + overdue -->
    <div class="dual-col">
      <div class="panel-card">
        <div class="pc-header">
          <h3>📋 {{ t('dashboard.dash.recentReportsTitle') }}</h3>
        </div>
        <div v-if="recent.length === 0" class="pc-empty">📝 {{ t('dashboard.dash.noReportsYet') }}</div>
        <div v-else class="pc-list">
          <div v-for="r in recent" :key="r.id" class="pc-row" @click="emit('open-report', r.id)">
            <span :class="['pc-dot', r.status]"></span>
            <div class="pc-info">
              <span class="pc-name">{{ r.experimentName }}</span>
              <span class="pc-sub">{{ statusLabel(r.status) }}</span>
            </div>
            <span v-if="r.grade !== null" class="pc-grade">⭐ {{ r.grade }}</span>
            <span v-else class="pc-time">{{ timeShort(r.submittedAt) }}</span>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="pc-header">
          <h3>⏳ {{ t('dashboard.dash.pendingReviewTitle') }}</h3>
          <span v-if="overdue.length > 0" class="pc-badge danger">{{ overdue.length }}</span>
        </div>
        <div v-if="overdue.length === 0" class="pc-empty">✅ {{ t('dashboard.dash.noPending') }}</div>
        <div v-else class="pc-list">
          <div v-for="r in overdue.slice(0, 5)" :key="r.id" class="pc-row" @click="emit('open-report', r.id)">
            <span class="pc-dot danger"></span>
            <div class="pc-info">
              <span class="pc-name">{{ r.experimentName }}</span>
              <span class="pc-sub">{{ statusLabel(r.status) }}</span>
            </div>
            <span class="pc-time">{{ timeShort(r.submittedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Announcements + Deadlines -->
    <div class="dual-col">
      <div class="panel-card">
        <AnnouncementsPanel />
      </div>
      <div class="panel-card">
        <DeadlinesPanel />
      </div>
    </div>

    <!-- Classes mini-list -->
    <div class="panel-card">
      <div class="pc-header"><h3>🏫 {{ t('dashboard.myClassesTitle') }}</h3></div>
      <div v-if="classes.length === 0" class="pc-empty">📚 {{ t('dashboard.noClassesJoined') }}</div>
      <div v-else class="cls-list">
        <div v-for="c in classes.slice(0, 5)" :key="c.id" class="cls-row" @click="emit('open-tab', 'classes')">
          <span class="cls-icon">📚</span>
          <span class="cls-name">{{ c.name }}</span>
          <code class="cls-code">{{ c.code }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-banner { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: 0.6rem; margin-bottom: 0.8rem; cursor: pointer; font-size: 0.85rem; font-weight: 700; transition: all 0.15s; }
.alert-banner.feedback { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); color: #a5b4fc; }
.alert-banner.pending { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: #fbbf24; }
.alert-banner:hover { opacity: 0.85; }
.alert-arrow { margin-inline-start: auto; }
.dual-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.8rem; }
@media (max-width: 768px) { .dual-col { grid-template-columns: 1fr; } }
.panel-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1rem; margin-bottom: 0.8rem; }
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }
.pc-badge { padding: 0.1rem 0.45rem; border-radius: 999px; font-size: 0.68rem; font-weight: 800; }
.pc-badge.danger { background: rgba(239,68,68,0.15); color: #f87171; }
.pc-empty { text-align: center; color: #64748b; padding: 1.2rem; font-size: 0.82rem; }
.pc-list { display: flex; flex-direction: column; gap: 0.3rem; }
.pc-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.6rem; border-radius: 0.4rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: all 0.12s; }
.pc-row:hover { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.12); }
.pc-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.pc-dot.graded { background: #22c55e; } .pc-dot.submitted { background: #fbbf24; } .pc-dot.resubmitted { background: #a5b4fc; } .pc-dot.draft { background: #64748b; } .pc-dot.danger { background: #f87171; }
.pc-info { display: flex; flex-direction: column; flex: 1; }
.pc-name { font-size: 0.8rem; font-weight: 700; color: #f1f5f9; }
.pc-sub { font-size: 0.7rem; color: #94a3b8; }
.pc-grade { font-size: 0.78rem; font-weight: 800; color: #67e8f9; font-family: monospace; }
.pc-time { font-size: 0.68rem; color: #475569; }
.cls-list { display: flex; flex-direction: column; gap: 0.3rem; }
.cls-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border-radius: 0.4rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: all 0.12s; }
.cls-row:hover { background: rgba(99,102,241,0.06); }
.cls-icon { font-size: 0.9rem; }
.cls-name { flex: 1; font-size: 0.8rem; font-weight: 600; color: #e2e8f0; }
.cls-code { font-size: 0.68rem; color: #67e8f9; }
</style>
