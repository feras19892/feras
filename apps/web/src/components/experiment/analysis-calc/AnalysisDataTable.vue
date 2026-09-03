<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue';

import type { AnalysisColumnMeta } from '../../../types/physics';





const props = defineProps<{
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
}>();

const emit = defineEmits<{
  (e: 'update-cell', row: number, key: string, value: number): void;
  (e: 'add-row'): void;
  (e: 'remove-row', index: number): void;
}>();

const rows = computed(() => props.readings);

// Smart outlier detection: highlight values > 2σ from mean
const outlierMap = computed(() => {
  const map: Record<string, boolean[]> = {};
  for (const col of props.columns) {
    const vals = props.readings.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (vals.length < 3) { map[col.key] = props.readings.map(() => false); continue; }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    map[col.key] = props.readings.map(r => std > 1e-9 && Math.abs((r[col.key] ?? 0) - mean) > 2 * std);
  }
  return map;
});

function onInput(row: number, key: string, ev: Event) {
  const val = parseFloat((ev.target as HTMLInputElement).value);
  if (!isNaN(val)) {
    emit('update-cell', row, key, val);
  }
}

</script>

<template>
  <div class="table-panel">
    <div class="panel-header">
      <span>{{ t('analysis.dataTable') }}</span>
      <button class="btn-add" @click="emit('add-row')">{{ t('analysis.addRow') }}</button>
    </div>
    <div class="table-wrap">
      <table v-if="columns.length">
        <thead>
          <tr>
            <th>#</th>
            <th v-for="col in columns" :key="col.key">
              {{ col.label }} <span v-if="col.unit" class="unit">({{ col.unit }})</span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td class="idx">{{ i + 1 }}</td>
            <td v-for="col in columns" :key="col.key" :class="{ outlier: outlierMap[col.key]?.[i] }">
              <input
                type="text"
                inputmode="decimal"
                :value="row[col.key] !== undefined ? (typeof row[col.key] === 'number' ? Number(row[col.key]).toFixed(3) : String(row[col.key])) : ''"
                @input="onInput(i, col.key, $event)"
                :title="outlierMap[col.key]?.[i] ? t('analysis.outlierTooltip') : ''"
              />
            </td>
            <td>
              <button class="btn-del" @click="emit('remove-row', i)">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">{{ t('analysis.noData') }}</p>
    </div>
  </div>
</template>

<style scoped>
.table-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.85rem;
  color: #67e8f9;
  font-weight: 600;
}
.btn-add {
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.3);
  color: #4ade80;
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
}
.table-wrap { overflow: auto; flex: 1; min-height: 0; }
table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
th, td { padding: 0.5rem 0.6rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
th { color: #94a3b8; font-weight: 700; background: rgba(255,255,255,0.06); position: sticky; top: 0; font-size: 0.92rem; letter-spacing: 0.3px; }
tbody tr:nth-child(even) { background: rgba(255,255,255,0.02); }
tbody tr:hover { background: rgba(91,141,184,0.05); }
.idx { color: #64748b; width: 24px; font-size: 0.8rem; }
.unit { color: #64748b; font-size: 0.65rem; }
input {
  width: 100%;
  padding: 0.4rem 0.3rem;
  border-radius: 0.3rem;
  border: 1px solid #334155;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.95rem;
  text-align: center;
  font-weight: 600;
  transition: border-color 0.15s, box-shadow 0.15s;
}
input:focus {
  outline: none;
  border-color: #5B8DB8;
  box-shadow: 0 0 0 2px rgba(91,141,184,0.15);
}
.btn-del {
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0.05rem 0.2rem;
}
.empty { color: #64748b; text-align: center; padding: 2rem; font-size: 0.9rem; }
td.outlier input {
  background: rgba(245,158,11,0.15);
  border-color: rgba(245,158,11,0.5);
  color: #fbbf24;
}
</style>
