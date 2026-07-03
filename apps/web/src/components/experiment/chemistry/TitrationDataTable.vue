<script setup lang="ts">
import type { TitrationReading } from '../../../composables/chemistry/useExperiments';
import { useI18n } from '../../../composables/useI18n';
const { t } = useI18n();

const props = defineProps<{
  readings: TitrationReading[];
}>();

const emit = defineEmits<{
  add: [];
}>();
</script>

<template>
  <div class="data-table-wrapper">
    <div class="data-table-header">
      <span class="data-title">{{ t('chemistryLab.readingsBook') }}</span>
      <button class="add-btn" @click="emit('add')" :title="t('chemistryLab.recordReading')">{{ t('chemistryLab.recordReading') }}</button>
    </div>
    <div v-if="readings.length === 0" class="data-empty">{{ t('chemistryLab.noReadingsYet') }}</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>{{ t('chemistryLab.naohVolume') }}</th>
          <th>pH</th>
          <th>{{ t('chemistry.color') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in readings" :key="r.n">
          <td>{{ r.n }}</td>
          <td>{{ r.volume.toFixed(2) }}</td>
          <td>{{ r.ph !== null ? r.ph.toFixed(2) : '--' }}</td>
          <td>
            <span class="color-dot" :style="{ background: r.color || '#3b82f6' }" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  position: absolute;
  top: 0.5rem;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: fit-content;
  z-index: 20;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.6rem 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-width: 220px;
  max-width: 320px;
  max-height: 280px;
  overflow-y: auto;
}
.data-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}
.data-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1e293b;
}
.add-btn {
  font-size: 0.65rem;
  padding: 0.2rem 0.45rem;
  border: 1px solid #10b981;
  border-radius: 0.35rem;
  background: #ecfdf5;
  color: #059669;
  font-weight: 700;
  cursor: pointer;
}
.add-btn:hover {
  background: #d1fae5;
}
.data-empty {
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: center;
  padding: 0.5rem 0;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
}
.data-table th {
  text-align: center;
  color: #64748b;
  font-weight: 600;
  padding: 0.25rem 0.3rem;
  border-bottom: 1px solid #e2e8f0;
}
.data-table td {
  text-align: center;
  padding: 0.3rem 0.3rem;
  color: #334155;
  font-variant-numeric: tabular-nums;
}
.data-table tbody tr:nth-child(even) {
  background: #f8fafc;
}
.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
