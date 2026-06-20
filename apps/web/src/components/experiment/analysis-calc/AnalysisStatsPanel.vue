<script setup lang="ts">
import { computed } from 'vue';
import type { AnalysisColumnMeta } from '../../../types/physics';

const props = defineProps<{
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
}>();

const stats = computed(() => {
  const result: Record<string, { mean: number; std: number; min: number; max: number }> = {};
  for (const col of props.columns) {
    const vals = props.readings.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (vals.length === 0) { result[col.key] = { mean: 0, std: 0, min: 0, max: 0 }; continue; }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    result[col.key] = { mean, std, min: Math.min(...vals), max: Math.max(...vals) };
  }
  return result;
});
</script>

<template>
  <div class="stats-panel">
    <div class="panel-header">📊 إحصائيات</div>
    <div class="stats-body">
      <div v-for="col in columns" :key="col.key" class="stat-col">
        <div class="stat-name">{{ col.label }} <span v-if="col.unit" class="unit">({{ col.unit }})</span></div>
        <div class="stat-grid">
          <div class="stat-item"><span class="label">μ</span><span class="val">{{ stats[col.key]?.mean.toFixed(3) ?? '-' }}</span></div>
          <div class="stat-item"><span class="label">σ</span><span class="val">{{ stats[col.key]?.std.toFixed(3) ?? '-' }}</span></div>
          <div class="stat-item"><span class="label">min</span><span class="val">{{ stats[col.key]?.min.toFixed(3) ?? '-' }}</span></div>
          <div class="stat-item"><span class="label">max</span><span class="val">{{ stats[col.key]?.max.toFixed(3) ?? '-' }}</span></div>
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
  flex-shrink: 0;
}
.panel-header {
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.95rem;
  color: #67e8f9;
  font-weight: 600;
}
.stats-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(85px, 1fr));
  gap: 0.25rem;
  padding: 0.3rem;
  overflow-y: auto;
}
.stat-col {
  background: rgba(0,0,0,0.15);
  border-radius: 0.25rem;
  padding: 0.2rem 0.25rem;
  min-width: 0;
}
.stat-name {
  font-size: 0.68rem;
  color: #e2e8f0;
  font-weight: 700;
  margin-bottom: 0.1rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.unit { color: #64748b; font-size: 0.55rem; }
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.1rem;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  padding: 0.1rem 0.2rem;
  border-radius: 0.15rem;
  background: rgba(255,255,255,0.03);
  gap: 0.2rem;
}
.label { color: #94a3b8; font-weight: 700; flex-shrink: 0; }
.val { color: #e2e8f0; font-family: 'Courier New', monospace; font-weight: 700; font-size: 0.65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
