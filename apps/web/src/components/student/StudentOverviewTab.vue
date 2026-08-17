<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { StudentReportRow, StudentKPI } from '../../composables/student/useStudentDashboard'
import type { ClassItem } from '../../services/class.service'
const DeadlinesPanel = defineAsyncComponent(() => import('./DeadlinesPanel.vue'))

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

const sparkData = computed(() => {
  const graded = props.recent
    .filter(r => r.status === 'graded' && r.grade !== null)
    .sort((a, b) => {
      const da = new Date(a.submittedAt || 0).getTime()
      const db = new Date(b.submittedAt || 0).getTime()
      return da - db
    })
    .slice(-8)
    .map(r => r.grade as number)
  return graded
})

const sparkPath = computed(() => {
  const data = sparkData.value
  if (data.length < 2) return ''
  const w = 120, h = 36, pad = 4
  const max = 100, min = 0
  const step = (w - pad * 2) / (data.length - 1)
  return data.map((v, i) => {
    const x = pad + i * step
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

const sparkTrend = computed(() => {
  const data = sparkData.value
  if (data.length < 2) return 0
  return data[data.length - 1] - data[0]
})

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

    <!-- Grade progression sparkline -->
    <div v-if="sparkData.length >= 2" class="sparkline-card">
      <div class="spark-info">
        <h4>{{ t('dashboard.dash.gradeProgress') }}</h4>
        <span class="spark-avg">{{ t('dashboard.dash.avgGrade') }}: {{ kpi.avgGrade ?? 0 }}</span>
        <span :class="['spark-trend', sparkTrend >= 0 ? 'up' : 'down']">
          {{ sparkTrend >= 0 ? '▲' : '▼' }} {{ Math.abs(sparkTrend) }}
        </span>
      </div>
      <svg class="sparkline" width="120" height="36" viewBox="0 0 120 36">
        <path :d="sparkPath" fill="none" :stroke="sparkTrend >= 0 ? '#22c55e' : '#f87171'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
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

    <!-- Announcements link + Deadlines -->
    <div class="dual-col">
      <div class="panel-card announcements-link" @click="emit('open-tab', 'announcements')">
        <div class="pc-header"><h3>📢 {{ t('shared.navAnnouncements') }}</h3></div>
        <div class="pc-empty">📋 {{ t('dashboard.dash.viewAnnouncements', 'اضغط لعرض الإعلانات والمواعيد النهائية') }}</div>
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
        <div v-for="c in classes.slice(0, 5)" :key="c.id" class="cls-row" :class="{ frozen: c.is_frozen }" @click="emit('open-tab', 'classes')">
          <span class="cls-icon">{{ c.is_frozen ? '🧊' : '📚' }}</span>
          <span class="cls-name">{{ c.name }}</span>
          <span v-if="c.is_frozen" class="frozen-badge">🧊 {{ t('dashboard.dash.frozen') }}</span>
          <code class="cls-code">{{ c.code }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-banner { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.8rem; border-radius: 4px; margin-bottom: 0.8rem; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: opacity 0.12s; }
.alert-banner.feedback { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); color: #a5b4fc; }
.alert-banner.pending { background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.15); color: #fbbf24; }
.alert-banner:hover { opacity: 0.8; }
.alert-arrow { margin-inline-start: auto; }
.sparkline-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.7rem 1rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; margin-bottom: 0.8rem; }
.spark-info { display: flex; align-items: center; gap: 0.8rem; }
.spark-info h4 { margin: 0; font-size: 0.8rem; font-weight: 700; color: #e5e7eb; }
.spark-avg { font-size: 0.75rem; color: #67e8f9; font-weight: 700; }
.spark-trend { font-size: 0.72rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 999px; }
.spark-trend.up { color: #22c55e; background: rgba(34,197,94,0.1); }
.spark-trend.down { color: #f87171; background: rgba(248,113,113,0.1); }
.sparkline { flex-shrink: 0; }
.dual-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.8rem; }
@media (max-width: 768px) { .dual-col { grid-template-columns: 1fr; } }
.panel-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 1rem; margin-bottom: 0.8rem; }
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.pc-header h3 { margin: 0; font-size: 0.85rem; font-weight: 700; color: #e5e7eb; }
.pc-badge { padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.65rem; font-weight: 700; }
.pc-badge.danger { background: rgba(239,68,68,0.1); color: #f87171; }
.pc-empty { text-align: center; color: #475569; padding: 1rem; font-size: 0.78rem; }
.pc-list { display: flex; flex-direction: column; gap: 0.25rem; }
.pc-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 3px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.12s; }
.pc-row:hover { background: rgba(99,102,241,0.04); }
.pc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.pc-dot.graded { background: #22c55e; } .pc-dot.submitted { background: #fbbf24; } .pc-dot.resubmitted { background: #a5b4fc; } .pc-dot.draft { background: #64748b; } .pc-dot.danger { background: #f87171; }
.pc-info { display: flex; flex-direction: column; flex: 1; }
.pc-name { font-size: 0.78rem; font-weight: 600; color: #f1f5f9; }
.pc-sub { font-size: 0.68rem; color: #64748b; }
.pc-grade { font-size: 0.75rem; font-weight: 700; color: #67e8f9; font-family: monospace; }
.pc-time { font-size: 0.65rem; color: #475569; }
.cls-list { display: flex; flex-direction: column; gap: 0.25rem; }
.cls-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.5rem; border-radius: 3px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.12s; }
.cls-row:hover { background: rgba(99,102,241,0.04); }
.cls-row.frozen { border-color: rgba(59,130,246,0.15); background: rgba(59,130,246,0.03); }
.frozen-badge { font-size: 0.6rem; font-weight: 700; color: #60a5fa; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.18); padding: 0.08rem 0.35rem; border-radius: 0.25rem; }
.cls-icon { font-size: 0.85rem; }
.cls-name { flex: 1; font-size: 0.78rem; font-weight: 600; color: #e2e8f0; }
.cls-code { font-size: 0.65rem; color: #67e8f9; }
.announcements-link { cursor: pointer; transition: background 0.12s; }
.announcements-link:hover { background: rgba(99,102,241,0.04); }
</style>
