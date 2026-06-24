<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../../../composables/useI18n';
import type { ChemAnalysisColumnMeta } from '../../../types/chemistry';

const props = defineProps<{
  readings: Record<string, number>[];
  columns: ChemAnalysisColumnMeta[];
}>();

const { t } = useI18n();

const stats = computed(() => {
  const result: Record<string, { n: number; mean: number; std: number; min: number; max: number; median: number; relErr: number }> = {};
  for (const col of props.columns) {
    const vals = props.readings.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (vals.length === 0) { result[col.key] = { n: 0, mean: 0, std: 0, min: 0, max: 0, median: 0, relErr: 0 }; continue; }
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const relErr = Math.abs(mean) > 1e-9 ? (std / Math.abs(mean)) * 100 : 0;
    result[col.key] = { n, mean, std, min: Math.min(...vals), max: Math.max(...vals), median, relErr };
  }
  return result;
});
</script>

<template>
  <div class="stats-panel">
    <div class="panel-header">{{ t('analysis.statsTitle') }}</div>
    <div class="stats-body">
      <div v-for="col in columns" :key="col.key" class="stat-card">
        <div class="col-title">{{ col.label }} <span v-if="col.unit" class="unit">({{ col.unit }})</span></div>
        <div class="summary-row">
          <span class="badge">N = {{ stats[col.key]?.n ?? 0 }}</span>
          <span class="badge badge-err">σ/μ = {{ stats[col.key]?.relErr.toFixed(1) ?? '-' }}%</span>
        </div>
        <div class="metrics">
          <div class="m"><span class="ml">μ</span><span class="mv">{{ stats[col.key]?.mean.toFixed(4) ?? '-' }}</span></div>
          <div class="m"><span class="ml">σ</span><span class="mv">{{ stats[col.key]?.std.toFixed(4) ?? '-' }}</span></div>
          <div class="m"><span class="ml">{{ t('analysis.median') }}</span><span class="mv">{{ stats[col.key]?.median.toFixed(4) ?? '-' }}</span></div>
          <div class="m"><span class="ml">min</span><span class="mv">{{ stats[col.key]?.min.toFixed(4) ?? '-' }}</span></div>
          <div class="m"><span class="ml">max</span><span class="mv">{{ stats[col.key]?.max.toFixed(4) ?? '-' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.panel-header {
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.9rem;
  color: #67e8f9;
  font-weight: 600;
}
.stats-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  overflow-y: auto;
}
.stat-card {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.4rem;
  padding: 0.5rem 0.6rem;
}
.col-title {
  font-size: 0.82rem;
  color: #67e8f9;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-align: center;
}
.unit { color: #64748b; font-size: 0.65rem; }
.summary-row {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.3rem;
  justify-content: center;
}
.badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  background: rgba(6,182,212,0.15);
  color: #67e8f9;
  font-weight: 700;
}
.badge-err { background: rgba(251,191,36,0.12); color: #fbbf24; }
.metrics { display: flex; flex-direction: column; gap: 0.15rem; }
.m {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  padding: 0.1rem 0;
}
.ml { color: #94a3b8; font-weight: 700; min-width: 30px; }
.mv { color: #e2e8f0; font-family: 'Courier New', monospace; font-weight: 600; font-size: 0.78rem; }
</style>
