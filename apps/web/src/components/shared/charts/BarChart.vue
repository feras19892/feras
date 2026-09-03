<template>
  <div class="chart-wrapper">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

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
    backgroundColor: props.color || '#3b82f6',
    borderRadius: 6,
    maxBarThickness: 50,
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
