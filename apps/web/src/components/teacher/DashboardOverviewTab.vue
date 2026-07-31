<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import type { Report } from '../../services/report.service'
import type { ClassRow } from '../../composables/teacher/useTeacherDashboard'

const props = defineProps<{
  pendingCount: number
  unopened: Report[]
  overdue: Report[]
  classRows: ClassRow[]
  unreadChatCounts?: Record<string, number>
  locale?: string
}>()

const emit = defineEmits<{
  (e: 'open-report', id: number): void
  (e: 'open-tab', tab: 'overview' | 'daily' | 'classes' | 'students'): void
  (e: 'navigate', tab: string): void
  (e: 'open-chat', cls: { id: string; name: string }): void
}>()

const { t } = useI18n()

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function timeShort(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const loc = props.locale || 'ar'
  const localeStr = loc === 'ar' ? 'ar-SA' : loc === 'es' ? 'es-ES' : 'en-US'
  return d.toLocaleDateString(localeStr) + ' ' + d.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="tab-panel">
    <!-- Pending alert -->
    <div v-if="pendingCount > 0" class="alert-banner" @click="emit('navigate', 'grading')">
      <span>⏳</span>
      <span>{{ pendingCount }} {{ t('dashboard.dash.pendingAlertMsg') }}</span>
      <span class="alert-arrow">←</span>
    </div>

    <!-- Two columns: unopened + overdue -->
    <div class="dual-col">
      <div class="panel-card">
        <div class="pc-header">
          <h3>📬 {{ t('dashboard.dash.unopenedReports') }}</h3>
          <span v-if="unopened.length > 0" class="pc-badge warn">{{ unopened.length }}</span>
        </div>
        <div v-if="unopened.length === 0" class="pc-empty">✅ {{ t('dashboard.dash.allOpened') }}</div>
        <div v-else class="pc-list">
          <div v-for="r in unopened.slice(0, 5)" :key="r.id" class="pc-row" @click="emit('open-report', r.id)">
            <span class="pc-dot warn"></span>
            <div class="pc-info"><span class="pc-name">{{ r.student_name }}</span><span class="pc-sub">{{ r.experiment_name }}</span></div>
            <span class="pc-time">{{ timeShort(r.submitted_at) }}</span>
          </div>
          <button v-if="unopened.length > 5" class="pc-more" @click="emit('open-tab', 'daily')">{{ t('dashboard.seeAll') }}</button>
        </div>
      </div>

      <div class="panel-card">
        <div class="pc-header">
          <h3>🚨 {{ t('dashboard.dash.overdueUngraded') }}</h3>
          <span v-if="overdue.length > 0" class="pc-badge danger">{{ overdue.length }}</span>
        </div>
        <div v-if="overdue.length === 0" class="pc-empty">✅ {{ t('dashboard.dash.allGraded') }}</div>
        <div v-else class="pc-list">
          <div v-for="r in overdue.slice(0, 5)" :key="r.id" class="pc-row" @click="emit('open-report', r.id)">
            <span class="pc-dot danger"></span>
            <div class="pc-info"><span class="pc-name">{{ r.student_name }}</span><span class="pc-sub">{{ r.experiment_name }}</span></div>
            <span class="pc-days">{{ daysSince(r.submitted_at) }} {{ t('dashboard.daysAgo') }}</span>
          </div>
          <button v-if="overdue.length > 5" class="pc-more" @click="emit('open-tab', 'daily')">{{ t('dashboard.seeAll') }}</button>
        </div>
      </div>
    </div>

    <!-- Classes mini-table -->
    <div class="panel-card">
      <div class="pc-header"><h3>🏫 {{ t('dashboard.dash.classesReport') }}</h3></div>
      <div class="mini-table">
        <div class="mt-head">
          <span>{{ t('dashboard.dash.className') }}</span><span>🎓</span><span>📄</span><span>⏳</span><span>📊</span><span>💬</span>
        </div>
        <div v-for="c in classRows.slice(0, 5)" :key="c.id" class="mt-row" @click="emit('navigate', 'classes')">
          <span class="mt-name">{{ c.name }} <code>{{ c.code }}</code></span>
          <span>{{ c.studentCount }}</span>
          <span>{{ c.totalReports }}</span>
          <span :class="{ 'mt-warn': c.pendingCount > 0 }">{{ c.pendingCount }}</span>
          <span :class="{ 'mt-avg': c.classAverage > 0 }">{{ c.classAverage > 0 ? c.classAverage + '%' : '—' }}</span>
          <span class="mt-chat-cell" @click.stop="emit('open-chat', { id: c.id, name: c.name })">
            <button class="mt-chat-btn">
              💬
              <span v-if="unreadChatCounts && unreadChatCounts[c.id] > 0" class="mt-chat-badge">{{ unreadChatCounts[c.id] }}</span>
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel { }
.alert-banner { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: 0.6rem; margin-bottom: 1rem; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #fbbf24; transition: all 0.15s; }
.alert-banner:hover { border-color: rgba(251,191,36,0.35); }
.alert-arrow { margin-inline-start: auto; }
.dual-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.8rem; }
@media (max-width: 768px) { .dual-col { grid-template-columns: 1fr; } }
.panel-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1rem; margin-bottom: 0.8rem; }
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }
.pc-badge { padding: 0.1rem 0.45rem; border-radius: 999px; font-size: 0.68rem; font-weight: 800; }
.pc-badge.warn { background: rgba(251,191,36,0.15); color: #fbbf24; }
.pc-badge.danger { background: rgba(239,68,68,0.15); color: #f87171; }
.pc-empty { text-align: center; color: #4ade80; padding: 1.2rem; font-size: 0.82rem; }
.pc-list { display: flex; flex-direction: column; gap: 0.3rem; }
.pc-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.6rem; border-radius: 0.4rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: all 0.12s; }
.pc-row:hover { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.12); }
.pc-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.pc-dot.warn { background: #fbbf24; } .pc-dot.danger { background: #f87171; }
.pc-info { display: flex; flex-direction: column; flex: 1; }
.pc-name { font-size: 0.8rem; font-weight: 700; color: #f1f5f9; }
.pc-sub { font-size: 0.7rem; color: #94a3b8; }
.pc-time { font-size: 0.68rem; color: #475569; }
.pc-days { font-size: 0.7rem; font-weight: 700; color: #f87171; }
.pc-more { margin-top: 0.3rem; padding: 0.3rem; border: 1px solid rgba(99,102,241,0.15); border-radius: 0.35rem; background: rgba(99,102,241,0.04); color: #c7d2fe; font-size: 0.72rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.pc-more:hover { background: rgba(99,102,241,0.1); }
.mini-table { display: flex; flex-direction: column; }
.mt-head { display: grid; grid-template-columns: 2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr; gap: 0.3rem; padding: 0.3rem 0.5rem; font-size: 0.68rem; color: #475569; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mt-head span:not(:first-child) { text-align: center; }
.mt-row { display: grid; grid-template-columns: 2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr; gap: 0.3rem; padding: 0.4rem 0.5rem; font-size: 0.78rem; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.12s; }
.mt-row:hover { background: rgba(99,102,241,0.04); }
.mt-row span:not(:first-child) { text-align: center; }
.mt-name { font-weight: 600; } .mt-name code { font-size: 0.68rem; color: #67e8f9; background: none; }
.mt-warn { color: #fbbf24; font-weight: 700; } .mt-avg { color: #a5b4fc; font-weight: 700; }
.mt-chat-cell { display: flex; align-items: center; justify-content: center; }
.mt-chat-btn { position: relative; border: none; background: none; cursor: pointer; font-size: 0.9rem; padding: 0; line-height: 1; }
.mt-chat-btn:hover { opacity: 0.8; }
.mt-chat-badge { position: absolute; top: -6px; inset-inline-end: -6px; min-width: 15px; height: 15px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.58rem; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
</style>
