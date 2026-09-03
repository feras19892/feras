<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
interface StudentStat { id: number; name: string; reports: number; avg: number }

interface Props {
  students: StudentStat[]
}
defineProps<Props>()

</script>

<template>
  <div class="section comparison">
    <h3>{{ t('teacher.comparisonTitle') }}</h3>
    <div class="compare-cards">
      <div v-for="s in students" :key="s.id" class="compare-card">
        <div class="compare-name">{{ s.name }}</div>
        <div class="compare-avg">{{ s.avg }}%</div>
        <div class="compare-reports">{{ s.reports }} {{ t('teacher.reportsLabel') }}</div>
        <div class="compare-bar">
          <div class="compare-fill" :style="{ width: s.avg + '%', background: s.avg >= 80 ? '#34d399' : s.avg >= 50 ? '#fbbf24' : '#f87171' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section { margin-bottom: 1.5rem; }
.section h3 { font-size: 1.1rem; color: #e2e8f0; margin: 0 0 0.8rem; }
.comparison { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; }
.compare-cards { display: flex; gap: 1rem; flex-wrap: wrap; }
.compare-card { flex: 1; min-width: 160px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.5rem; padding: 1rem; text-align: center; }
.compare-name { font-weight: 700; color: #f1f5f9; font-size: 0.9rem; }
.compare-avg { font-size: 1.5rem; font-weight: 800; color: #67e8f9; margin: 0.3rem 0; }
.compare-reports { font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem; }
.compare-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.compare-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
</style>