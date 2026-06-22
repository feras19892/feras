<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { LeverTrial } from '../../../composables/lever/useLeverTrials'

const { t } = useI18n()
const props = defineProps<{
  trials: LeverTrial[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, w, h)

  if (props.trials.length === 0) {
    ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(t('experiments.recordReadingsToSeeTorque'), w / 2, h / 2)
    return
  }

  const pad = 30
  const maxT = Math.max(...props.trials.map(t => Math.abs(t.netTorque)), 0.1)
  const barW = Math.max(4, (w - pad * 2) / props.trials.length - 4)

  props.trials.forEach((t, i) => {
    const bx = pad + i * (barW + 4)
    const bh = (Math.abs(t.netTorque) / maxT) * (h - pad * 2 - 20)
    const by = h / 2 - (t.netTorque > 0 ? bh : 0)
    ctx.fillStyle = t.netTorque > 0 ? '#3b82f6' : t.netTorque < 0 ? '#ef4444' : '#22c55e'
    ctx.fillRect(bx, by, barW, Math.abs(bh) || 2)
  })

  // Zero line
  ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(pad, h / 2); ctx.lineTo(w - pad, h / 2); ctx.stroke()
}

watch(() => props.trials, draw, { deep: true })

let ro: ResizeObserver | null = null
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const resize = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; draw() }
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(canvas.parentElement!)
})
onUnmounted(() => { if (ro) ro.disconnect() })
</script>

<template>
  <div class="signal-wrap"><canvas ref="canvasRef" /></div>
</template>

<style scoped>
.signal-wrap { height:160px; position:relative; }
.signal-wrap canvas { position:absolute; inset:0; width:100%; height:100%; }
</style>
