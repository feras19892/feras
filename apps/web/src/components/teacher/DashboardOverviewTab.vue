<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref } from 'vue'

import type { Report } from '../../services/report.service'
import type { ClassRow, DashboardKPI } from '../../composables/teacher/useTeacherDashboard'
import TeacherOverviewKPIs from './TeacherOverviewKPIs.vue'
import TeacherOverviewAnalytics from './TeacherOverviewAnalytics.vue'
import TeacherOverviewAlerts from './TeacherOverviewAlerts.vue'





const props = defineProps<{
  kpi: DashboardKPI
  allReports: Report[]
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

type TabKey = 'overview' | 'analytics' | 'alerts'
const activeTab = ref<TabKey>('overview')

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
    <div class="tabs-nav">
      <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
        <span class="tab-icon">📊</span>
        <span class="tab-label">{{ t('shared.navOverview') }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'analytics' }" @click="activeTab = 'analytics'">
        <span class="tab-icon">📈</span>
        <span class="tab-label">تحليلات</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'alerts' }" @click="activeTab = 'alerts'">
        <span class="tab-icon">🚨</span>
        <span class="tab-label">تنبيهات</span>
        <span v-if="kpi.unopenedCount + kpi.overdueCount + (kpi.pendingCount) > 0" class="tab-count">{{ kpi.unopenedCount + kpi.overdueCount + kpi.pendingCount }}</span>
      </button>
    </div>

    <div v-show="activeTab === 'overview'">
      <TeacherOverviewKPIs :kpi="kpi" />
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

      <div class="panel-card">
        <div class="pc-header"><h3>🏫 {{ t('dashboard.dash.classesReport') }}</h3></div>
        <div class="mini-table">
          <div class="mt-head">
            <span>{{ t('dashboard.dash.className') }}</span><span>🎓</span><span>📄</span><span>⏳</span><span>📊</span><span>💬</span>
          </div>
          <div v-for="c in classRows.slice(0, 5)" :key="c.id" class="mt-row" @click="emit('navigate', 'classes')">
            <span class="mt-name">{{ c.name }} <code>{{ c.code }}</code><span v-if="c.isFrozen" class="mt-freeze">🧊</span></span>
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

    <div v-show="activeTab === 'analytics'">
      <TeacherOverviewAnalytics :all-reports="allReports" :class-rows="classRows" />
    </div>

    <div v-show="activeTab === 'alerts'">
      <TeacherOverviewAlerts :unopened="unopened" :overdue="overdue" :class-rows="classRows" :unread-chat-counts="unreadChatCounts" @open-report="emit('open-report', $event)" @open-tab="emit('open-tab', $event)" @open-chat="emit('open-chat', $event)" />
    </div>
  </div>
</template>

<style scoped>
.tab-panel { color: #e2e8f0; }
.tabs-nav { display: flex; gap: 0.3rem; margin-bottom: 1rem; padding: 0.3rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; overflow-x: auto; }
.tab-btn { flex: 1; min-width: 120px; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.6rem 0.8rem; background: transparent; border: 1px solid transparent; border-radius: 4px; color: #64748b; cursor: pointer; transition: background 0.12s, color 0.12s; position: relative; }
.tab-btn:hover { background: rgba(255,255,255,0.03); color: #e2e8f0; }
.tab-btn.active { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.15); color: #e2e8f0; }
.tab-icon { font-size: 1.1rem; }
.tab-label { font-size: 0.78rem; font-weight: 600; }
.tab-count { position: absolute; top: 0.25rem; right: 0.25rem; font-size: 0.65rem; padding: 0.05rem 0.35rem; background: rgba(239,68,68,0.15); border-radius: 999px; color: #f87171; font-weight: 800; }
.dual-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.8rem; }
@media (max-width: 768px) { .dual-col { grid-template-columns: 1fr; } }
.panel-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 1rem; margin-bottom: 0.8rem; }
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.pc-header h3 { margin: 0; font-size: 0.85rem; font-weight: 700; color: #e5e7eb; }
.pc-badge { padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.65rem; font-weight: 700; }
.pc-badge.warn { background: rgba(251,191,36,0.1); color: #fbbf24; }
.pc-badge.danger { background: rgba(239,68,68,0.1); color: #f87171; }
.pc-empty { text-align: center; color: #4ade80; padding: 1rem; font-size: 0.78rem; }
.pc-list { display: flex; flex-direction: column; gap: 0.25rem; }
.pc-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 3px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.12s; }
.pc-row:hover { background: rgba(99,102,241,0.04); }
.pc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.pc-dot.warn { background: #fbbf24; } .pc-dot.danger { background: #f87171; }
.pc-info { display: flex; flex-direction: column; flex: 1; }
.pc-name { font-size: 0.78rem; font-weight: 600; color: #f1f5f9; }
.pc-sub { font-size: 0.68rem; color: #64748b; }
.pc-time { font-size: 0.65rem; color: #475569; }
.pc-days { font-size: 0.68rem; font-weight: 600; color: #f87171; }
.pc-more { margin-top: 0.25rem; padding: 0.25rem; border: 1px solid rgba(99,102,241,0.12); border-radius: 3px; background: transparent; color: #a5b4fc; font-size: 0.7rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.pc-more:hover { background: rgba(99,102,241,0.06); }
.mini-table { display: flex; flex-direction: column; }
.mt-head { display: grid; grid-template-columns: 2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr; gap: 0.3rem; padding: 0.25rem 0.5rem; font-size: 0.65rem; color: #475569; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
.mt-head span:not(:first-child) { text-align: center; }
.mt-row { display: grid; grid-template-columns: 2fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr; gap: 0.3rem; padding: 0.35rem 0.5rem; font-size: 0.76rem; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.12s; }
.mt-row:hover { background: rgba(99,102,241,0.03); }
.mt-row span:not(:first-child) { text-align: center; }
.mt-name { font-weight: 600; } .mt-name code { font-size: 0.65rem; color: #67e8f9; background: none; }
.mt-freeze { font-size: 0.7rem; margin-inline-start: 0.3rem; }
.mt-warn { color: #fbbf24; font-weight: 600; } .mt-avg { color: #a5b4fc; font-weight: 600; }
.mt-chat-cell { display: flex; align-items: center; justify-content: center; }
.mt-chat-btn { position: relative; border: none; background: none; cursor: pointer; font-size: 0.85rem; padding: 0; line-height: 1; }
.mt-chat-btn:hover { opacity: 0.7; }
.mt-chat-badge { position: absolute; top: -5px; inset-inline-end: -5px; min-width: 14px; height: 14px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.55rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
</style>
