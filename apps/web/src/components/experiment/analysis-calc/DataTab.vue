<script setup lang="ts">
import { computed } from 'vue';
import type { AnalysisColumnMeta } from '../../../types/physics';
import StudentInfoPanel from './StudentInfoPanel.vue';
import AnalysisDataTable from './AnalysisDataTable.vue';
import AnalysisStatsPanel from './AnalysisStatsPanel.vue';

const props = defineProps<{
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
}>();
const emit = defineEmits<{ (e: 'update-cell', row: number, key: string, value: number): void }>();

const checks = computed(() => {
  const c: string[] = [];
  if (!props.readings.length) { c.push('لا توجد بيانات'); return c; }
  for (const col of props.columns) {
    const vals = props.readings.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) { c.push(`عمود ${col.label} فارغ`); continue; }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    const outCount = vals.filter(v => Math.abs(v - mean) > 2 * std).length;
    if (outCount > 0) c.push(`${outCount} قيمة شاذة في ${col.label}`);
  }
  if (!c.length) c.push('✅ جميع البيانات تبدو سليمة');
  return c;
});
</script>

<template>
  <div class="data-tab">
    <div class="grid">
      <div class="left">
        <StudentInfoPanel />
        <div class="checks">
          <div class="checks-title">🔍 فحص البيانات</div>
          <div v-for="(ch, i) in checks" :key="i" :class="['check-item', ch.includes('✅') ? 'ok' : 'warn']">
            {{ ch }}
          </div>
        </div>
      </div>
      <div class="right">
        <AnalysisDataTable :readings="readings" :columns="columns" @update-cell="(r,k,v) => emit('update-cell', r,k,v)" />
        <AnalysisStatsPanel :readings="readings" :columns="columns" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-tab { flex: 1; overflow: hidden; display: flex; flex-direction: column; padding: 0.5rem; }
.grid { display: flex; gap: 0.5rem; height: 100%; }
.left { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; }
.right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden; }
.checks { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.5rem; }
.checks-title { font-size: 0.8rem; color: #67e8f9; font-weight: 600; margin-bottom: 0.3rem; }
.check-item { font-size: 0.75rem; padding: 0.2rem 0; }
.check-item.ok { color: #4ade80; }
.check-item.warn { color: #fbbf24; }
</style>
