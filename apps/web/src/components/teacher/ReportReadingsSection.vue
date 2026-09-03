<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { ColumnStat, DataQuality } from '../../composables/teacher/useReportParser'

defineProps<{
  readings: Record<string, number>[]
  columns: ColumnStat[]
  columnStats: ColumnStat[]
  quality: DataQuality
}>()

function fmt(v: unknown): string {
  if (typeof v === 'number') return v.toFixed(4).replace(/\.?0+$/, '')
  return String(v ?? '-')
}
</script>

<template>
  <div class="section">
    <!-- Data Quality Banner -->
    <div :class="['quality-banner', quality.score >= 70 ? 'good' : quality.score >= 40 ? 'warn' : 'bad']">
      <div class="q-score">
        <span class="q-val">{{ quality.score }}%</span>
        <span class="q-lab">{{ t('report.qualityScore') }}</span>
      </div>
      <div class="q-checks">
        <span :class="['q-check', { ok: quality.totalReadings >= 3 }]">📊 {{ quality.totalReadings }} {{ t('report.readingsCount') }}</span>
        <span :class="['q-check', { ok: quality.hasConclusion }]">📝 {{ t('report.conclusion') }}</span>
        <span :class="['q-check', { ok: quality.hasChart }]">📈 {{ t('report.chart') }}</span>
        <span :class="['q-check', { ok: quality.hasEquations }]">🔢 {{ t('report.equations') }}</span>
        <span :class="['q-check', { ok: quality.hasSolvedEquations }]">✅ {{ t('report.solvedEq') }}</span>
        <span :class="['q-check', { ok: quality.hasRegression }]">📉 {{ t('report.regression') }}</span>
      </div>
      <div v-if="quality.issues.length" class="q-issues">
        <span v-for="iss in quality.issues" :key="iss" class="q-issue">⚠️ {{ t(`report.${iss}`) }}</span>
      </div>
    </div>

    <!-- Full Readings Table -->
    <h3 class="sec-title">📋 {{ t('report.fullDataTable') }}</h3>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th v-for="c in columns" :key="c.key">{{ c.label }}<span v-if="c.unit" class="unit"> ({{ c.unit }})</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in readings" :key="i">
            <td class="row-num">{{ i + 1 }}</td>
            <td v-for="c in columns" :key="c.key">{{ fmt(row[c.key]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Per-Column Statistics -->
    <h3 class="sec-title">📊 {{ t('report.detailedStats') }}</h3>
    <div class="stats-grid">
      <div v-for="cs in columnStats" :key="cs.key" class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ cs.label }}</span>
          <span v-if="cs.unit" class="stat-unit">{{ cs.unit }}</span>
        </div>
        <div class="stat-rows">
          <div class="stat-row"><span>μ ({{ t('report.mean') }})</span><b>{{ cs.mean.toFixed(4) }}</b></div>
          <div class="stat-row"><span>σ ({{ t('report.stdDev') }})</span><b>{{ cs.std.toFixed(4) }}</b></div>
          <div class="stat-row"><span>{{ t('report.median') }}</span><b>{{ cs.median.toFixed(4) }}</b></div>
          <div class="stat-row"><span>{{ t('report.min') }}</span><b class="val-min">{{ cs.min.toFixed(4) }}</b></div>
          <div class="stat-row"><span>{{ t('report.max') }}</span><b class="val-max">{{ cs.max.toFixed(4) }}</b></div>
          <div class="stat-row"><span>{{ t('report.range') }}</span><b>{{ cs.range.toFixed(4) }}</b></div>
          <div class="stat-row"><span>{{ t('report.count') }}</span><b>{{ cs.count }}</b></div>
        </div>
        <div class="consistency-bar">
          <div class="cb-label">{{ t('report.consistency') }}: {{ cs.consistency }}%</div>
          <div class="cb-track"><div class="cb-fill" :style="{ width: cs.consistency + '%' }" :class="{ good: cs.consistency >= 80, warn: cs.consistency >= 50 && cs.consistency < 80, bad: cs.consistency < 50 }"></div></div>
        </div>
        <div v-if="cs.outliers.length > 0" class="outlier-warn">
          ⚠️ {{ cs.outliers.length }} {{ t('report.outliers') }}: {{ cs.outliers.map(o => o.toFixed(2)).join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section { margin-bottom: 1.2rem; }
.sec-title { font-size: 0.95rem; font-weight: 700; color: #67e8f9; margin: 0 0 0.6rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(103, 232, 249, 0.15); }

.quality-banner { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; border-radius: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap; }
.quality-banner.good { background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); }
.quality-banner.warn { background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.2); }
.quality-banner.bad { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); }
.q-score { text-align: center; flex-shrink: 0; }
.q-val { display: block; font-size: 1.5rem; font-weight: 800; }
.q-lab { font-size: 0.7rem; color: #94a3b8; }
.q-checks { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.q-check { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem; background: rgba(255, 255, 255, 0.03); color: #64748b; }
.q-check.ok { color: #4ade80; }
.q-issues { width: 100%; display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.3rem; }
.q-issue { font-size: 0.72rem; color: #fbbf24; }

.table-wrap { overflow-x: auto; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.06); }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.data-table th { background: rgba(99, 102, 241, 0.12); color: #c7d2fe; padding: 0.4rem 0.5rem; text-align: center; font-weight: 700; white-space: nowrap; }
.data-table td { padding: 0.35rem 0.5rem; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.04); color: #e2e8f0; font-family: 'Courier New', monospace; }
.data-table tr:hover td { background: rgba(99, 102, 241, 0.04); }
.row-num { color: #475569; font-weight: 600; }
.unit { color: #64748b; font-weight: 400; font-size: 0.72rem; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.6rem; }
.stat-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.5rem; padding: 0.7rem; }
.stat-header { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.5rem; }
.stat-label { font-weight: 700; color: #e5e7eb; font-size: 0.85rem; }
.stat-unit { font-size: 0.7rem; color: #67e8f9; }
.stat-rows { display: flex; flex-direction: column; gap: 0.15rem; }
.stat-row { display: flex; justify-content: space-between; font-size: 0.76rem; }
.stat-row span { color: #64748b; }
.stat-row b { font-family: 'Courier New', monospace; color: #e2e8f0; }
.val-min { color: #60a5fa; }
.val-max { color: #f472b6; }
.consistency-bar { margin-top: 0.5rem; }
.cb-label { font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem; }
.cb-track { height: 4px; background: rgba(255, 255, 255, 0.06); border-radius: 2px; overflow: hidden; }
.cb-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.cb-fill.good { background: #22c55e; }
.cb-fill.warn { background: #fbbf24; }
.cb-fill.bad { background: #ef4444; }
.outlier-warn { margin-top: 0.4rem; font-size: 0.72rem; color: #fbbf24; background: rgba(251, 191, 36, 0.06); padding: 0.25rem 0.4rem; border-radius: 0.3rem; }
</style>
