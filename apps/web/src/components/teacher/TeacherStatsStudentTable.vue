<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
interface StudentStat { id: number; name: string; reports: number; avg: number; lastSubmitted?: string }

interface Props {
  students: StudentStat[]
  comparisonIds: number[]
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggleCompare', id: number): void
}>()

function isChecked(id: number) {
  return props.comparisonIds.includes(id)
}
</script>

<template>
  <div class="section">
    <h3>{{ t('teacher.studentRanking') }}</h3>
    <div class="student-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t('teacher.studentCol') }}</th>
            <th>{{ t('teacher.reportsCol') }}</th>
            <th>{{ t('teacher.avgCol') }}</th>
            <th>{{ t('teacher.lastSubmit') }}</th>
            <th>{{ t('teacher.compare') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in students" :key="s.id" :class="{ top3: i < 3 }">
            <td>{{ i + 1 }}</td>
            <td>{{ s.name }}</td>
            <td>{{ s.reports }}</td>
            <td :class="{ low: s.avg < 50, high: s.avg >= 80 }">{{ s.avg }}%</td>
            <td>{{ s.lastSubmitted?.slice(0, 10) || '—' }}</td>
            <td>
              <input
                type="checkbox"
                :checked="isChecked(s.id)"
                @change="emit('toggleCompare', s.id)"
              />
            </td>
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
.data-table tr.top3 td:first-child { color: #fbbf24; font-weight: 800; }
.low { color: #f87171; }
.high { color: #4ade80; }
.student-table-wrapper { overflow-x: auto; }
</style>