<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, defineAsyncComponent } from 'vue'

import StudentHelpButton from './StudentHelpButton.vue'
import type { StudentReportRow, StudentKPI } from '../../composables/student/useStudentDashboard'
import type { ClassItem } from '../../services/class.service'
import StudentOverviewKPIs from './StudentOverviewKPIs.vue'
import StudentOverviewAnalytics from './StudentOverviewAnalytics.vue'
import StudentOverviewAlerts from './StudentOverviewAlerts.vue'





const DeadlinesPanel = defineAsyncComponent(() => import('./DeadlinesPanel.vue'))

const props = defineProps<{
  kpi: StudentKPI
  recent: StudentReportRow[]
  overdue: StudentReportRow[]
  classes: ClassItem[]
  locale?: string
  rows: StudentReportRow[]
}>()

const emit = defineEmits<{
  (e: 'open-report', id: number): void
  (e: 'open-tab', tab: string): void
  (e: 'navigate', tab: string): void
}>()

type TabKey = 'overview' | 'analytics' | 'alerts'
const activeTab = ref<TabKey>('overview')

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
    <div class="tabs-nav">
      <StudentHelpButton :tab-id="activeTab" />
      <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
        <span class="tab-icon">📊</span>
        <span class="tab-label">نظرة عامة</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'analytics' }" @click="activeTab = 'analytics'">
        <span class="tab-icon">📈</span>
        <span class="tab-label">تحليلات</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'alerts' }" @click="activeTab = 'alerts'">
        <span class="tab-icon">🚨</span>
        <span class="tab-label">تنبيهات</span>
        <span v-if="kpi.newFeedback + kpi.pendingCount + overdue.length > 0" class="tab-count">{{ kpi.newFeedback + kpi.pendingCount + overdue.length }}</span>
      </button>
    </div>

    <div v-show="activeTab === 'overview'">
      <StudentOverviewKPIs :kpi="kpi" />
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
          <div class="pc-header"><h3>⏰ {{ t('dashboard.dash.upcomingDeadlines') }}</h3></div>
          <DeadlinesPanel />
        </div>
      </div>
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

    <div v-show="activeTab === 'analytics'">
      <StudentOverviewAnalytics :rows="rows" :locale="locale" />
    </div>

    <div v-show="activeTab === 'alerts'">
      <StudentOverviewAlerts :kpi="kpi" :overdue="overdue" :recent="recent" @open-report="emit('open-report', $event)" />
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
.pc-empty { text-align: center; color: #475569; padding: 1rem; font-size: 0.78rem; }
.pc-list { display: flex; flex-direction: column; gap: 0.25rem; }
.pc-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 3px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.12s; }
.pc-row:hover { background: rgba(99,102,241,0.04); }
.pc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.pc-dot.graded { background: #22c55e; } .pc-dot.submitted { background: #fbbf24; } .pc-dot.resubmitted { background: #a5b4fc; } .pc-dot.draft { background: #64748b; }
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
</style>
