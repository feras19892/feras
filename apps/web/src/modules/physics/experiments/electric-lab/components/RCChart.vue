<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  running: boolean
  rcHistory?: { t: number; V: number; I: number }[]
}>()

const rcChartRef = ref<HTMLCanvasElement | null>(null)

function drawRCChart() {
  const canvas = rcChartRef.value
  if (!canvas || !props.rcHistory) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#1e2530'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = (h / 4) * i
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  const hist = props.rcHistory
  if (hist.length < 2) return

  const tMax = hist[hist.length - 1].t
  const tMin = hist[0].t
  const vMax = Math.max(...hist.map(p => p.V), 0.1)

  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 2
  ctx.beginPath()
  hist.forEach((p, i) => {
    const x = ((p.t - tMin) / (tMax - tMin || 1)) * w
    const y = h - (p.V / vMax) * (h - 10) - 5
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  const iMax = Math.max(...hist.map(p => Math.abs(p.I)), 0.0001)
  ctx.strokeStyle = '#4ade80'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  hist.forEach((p, i) => {
    const x = ((p.t - tMin) / (tMax - tMin || 1)) * w
    const y = h - (Math.abs(p.I) / iMax) * (h - 10) - 5
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  ctx.fillStyle = '#fbbf24'
  ctx.font = '10px sans-serif'
  ctx.fillText('Vc', 5, 12)
  ctx.fillStyle = '#4ade80'
  ctx.fillText('I', 25, 12)
}

watch(() => props.rcHistory, () => drawRCChart(), { deep: true })
onMounted(() => drawRCChart())
</script>

<template>
  <canvas ref="rcChartRef" class="rc-chart" width="280" height="120"></canvas>
</template>

<style scoped>
.rc-chart { width: 100%; height: 120px; background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; }
</style>
