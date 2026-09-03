<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import type { Report } from '../../services/report.service'

const props = defineProps<{
  unopened: Report[]
  overdue: Report[]
  locale?: string
}>()

const emit = defineEmits<{ (e: 'open-report', id: number): void }>()

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
    <div class="dual-col">
      <div class="panel-card">
        <div class="pc-header">
          <h3>📬 {{ t('dashboard.dash.unopenedReports') }}</h3>
          <span v-if="unopened.length > 0" class="pc-badge warn">{{ unopened.length }}</span>
        </div>
        <div v-if="unopened.length === 0" class="pc-empty">✅ {{ t('dashboard.dash.allOpened') }}</div>
        <div v-else class="pc-list">
          <div v-for="r in unopened" :key="r.id" class="pc-row" @click="emit('open-report', r.id)">
            <span class="pc-dot warn"></span>
            <div class="pc-info"><span class="pc-name">{{ r.student_name }}</span><span class="pc-sub">{{ r.experiment_name }}</span></div>
            <span class="pc-time">{{ timeShort(r.submitted_at) }}</span>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="pc-header">
          <h3>🚨 {{ t('dashboard.dash.overdueUngraded') }}</h3>
          <span v-if="overdue.length > 0" class="pc-badge danger">{{ overdue.length }}</span>
        </div>
        <div v-if="overdue.length === 0" class="pc-empty">✅ {{ t('dashboard.dash.allGraded') }}</div>
        <div v-else class="pc-list">
          <div v-for="r in overdue" :key="r.id" class="pc-row" @click="emit('open-report', r.id)">
            <span class="pc-dot danger"></span>
            <div class="pc-info"><span class="pc-name">{{ r.student_name }}</span><span class="pc-sub">{{ r.experiment_name }}</span></div>
            <span class="pc-days">{{ daysSince(r.submitted_at) }} {{ t('dashboard.daysAgo') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
