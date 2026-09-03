<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue';

import type { ChemAnalysisColumnMeta } from '../../../types/chemistry';
import ChemStudentInfoPanel from './ChemStudentInfoPanel.vue';
import ChemAnalysisDataTable from './ChemAnalysisDataTable.vue';
import ChemAnalysisStatsPanel from './ChemAnalysisStatsPanel.vue';





const props = defineProps<{
  readings: Record<string, number>[];
  columns: ChemAnalysisColumnMeta[];
}>();
const emit = defineEmits<{
  (e: 'update-cell', row: number, key: string, value: number): void;
  (e: 'add-row'): void;
  (e: 'remove-row', index: number): void;
}>();

const checks = computed(() => {
  const c: string[] = [];
  if (!props.readings.length) { c.push(t('analysis.noDataCheck')); return c; }
  for (const col of props.columns) {
    const vals = props.readings.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) { c.push(t('analysis.emptyColumn', { col: col.label })); continue; }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    const outCount = vals.filter(v => Math.abs(v - mean) > 2 * std).length;
    if (outCount > 0) c.push(t('analysis.outliersInColumn', { count: outCount, col: col.label }));
  }
  if (!c.length) c.push(t('analysis.allDataOk'));
  return c;
});
</script>

<template>
  <div class="data-tab">
    <div class="top-panels">
      <div class="bp-col">
        <ChemStudentInfoPanel />
      </div>
      <div class="bp-col">
        <ChemAnalysisStatsPanel :readings="readings" :columns="columns" />
      </div>
      <div class="bp-col">
        <div class="checks">
          <div class="checks-title">{{ t('analysis.dataCheck') }}</div>
          <div v-for="(ch, i) in checks" :key="i" :class="['check-item', ch.includes('✅') ? 'ok' : 'warn']">
            {{ ch }}
          </div>
        </div>
      </div>
    </div>

    <div class="table-section">
      <ChemAnalysisDataTable
        :readings="readings"
        :columns="columns"
        @update-cell="(r,k,v) => emit('update-cell', r,k,v)"
        @add-row="emit('add-row')"
        @remove-row="(i) => emit('remove-row', i)"
      />
    </div>
  </div>
</template>

<style scoped>
.data-tab {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  gap: 0.6rem;
}
.top-panels {
  display: flex;
  gap: 0.6rem;
  flex-shrink: 0;
  height: 260px;
}
.table-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.bp-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.bp-col :deep(.student-panel),
.bp-col :deep(.stats-panel) {
  flex: 1;
  overflow: hidden;
}
.checks {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.4rem;
  padding: 0.4rem 0.5rem;
  height: 100%;
  overflow-y: auto;
}
.checks-title { font-size: 0.75rem; color: #67e8f9; font-weight: 700; margin-bottom: 0.2rem; }
.check-item { font-size: 0.72rem; padding: 0.1rem 0; line-height: 1.4; }
.check-item.ok { color: #4ade80; }
.check-item.warn { color: #fbbf24; }
</style>
