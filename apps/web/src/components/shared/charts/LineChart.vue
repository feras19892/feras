<template>
  <div class="chart-wrapper">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps<{
  labels: string[]
  data: number[]
  label?: string
  color?: string
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    label: props.label || '',
    data: props.data,
    borderColor: props.color || '#3b82f6',
    backgroundColor: (props.color || '#3b82f6') + '20',
    fill: true,
    tension: 0.3,
    pointRadius: 4,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f3f4' } },
    x: { grid: { display: false } },
  },
}
</script>

<style scoped>
.chart-wrapper { position: relative; height: 240px; }
</style>
