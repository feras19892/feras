<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

interface Props {
  experiments: { name: string; avg: number; count: number; highest: number; lowest: number }[]
}
defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="section">
    <h3>{{ t('teacher.expPerformance') }}</h3>
    <div class="exp-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('teacher.expName') }}</th>
            <th>{{ t('teacher.reportsCol') }}</th>
            <th>{{ t('teacher.avgCol') }}</th>
            <th>{{ t('teacher.highest') }}</th>
            <th>{{ t('teacher.lowest') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in experiments" :key="e.name">
            <td>{{ e.name }}</td>
            <td>{{ e.count }}</td>
            <td :class="{ low: e.avg < 50, high: e.avg >= 80 }">{{ e.avg }}%</td>
            <td class="high">{{ e.highest }}%</td>
            <td class="low">{{ e.lowest }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.section { margin-bottom: 1.5rem; }
.section h3 { font-size: 1.1rem; color: #e2e8f0; margin: 0 0 0.8rem; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: end; padding: 0.5rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.low { color: #f87171; }
.high { color: #4ade80; }
.exp-table-wrapper { overflow-x: auto; }
</style>
