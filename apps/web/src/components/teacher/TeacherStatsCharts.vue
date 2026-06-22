<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTeacherStatsCharts } from '../../composables/teacher/useTeacherStatsCharts'
import { useI18n } from '../../composables/useI18n'

interface Props {
  stats: { distribution?: Record<string, number>; total?: number } | null
}
const props = defineProps<Props>()

const { t } = useI18n()
const statsRef = ref(props.stats)
watch(() => props.stats, (v) => { statsRef.value = v })
const { barCanvas, pieCanvas } = useTeacherStatsCharts(statsRef, t('teacher.reportsLabel'))
</script>

<template>
  <div class="charts-row">
    <div class="chart-box">
      <h4>{{ t('teacher.distribution') }}</h4>
      <canvas ref="barCanvas" class="chart-canvas"></canvas>
    </div>
    <div class="chart-box">
      <h4>{{ t('teacher.reportRatio') }}</h4>
      <canvas ref="pieCanvas" class="chart-canvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.chart-box { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; }
.chart-box h4 { margin: 0 0 0.8rem; color: #e2e8f0; font-size: 0.95rem; }
.chart-canvas { display: block; width: 100%; max-width: 500px; }
</style>
