<template>
  <div class="chart-wrapper">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
  colors?: string[]
}>()

const defaultColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: props.colors || defaultColors.slice(0, props.labels.length),
    borderWidth: 2,
    borderColor: '#fff',
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { font: { size: 13 } } },
  },
}
</script>

<style scoped>
.chart-wrapper { position: relative; height: 240px; }
</style>
