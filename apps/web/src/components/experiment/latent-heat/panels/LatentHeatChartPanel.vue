<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { LatentHeatTrial } from '../../../../composables/latent-heat/useLatentHeatTrials'
const props = defineProps<{ trials: LatentHeatTrial[] }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  const rect = c.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  c.width = Math.round(rect.width * dpr)
  c.height = Math.round(rect.height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const w = rect.width, h = rect.height
  ctx.fillStyle = '#0B1220'; ctx.fillRect(0, 0, w, h)
  if (props.trials.length < 2) {
    ctx.fillStyle = '#475569'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('سجل تجربتين على الأقل', w / 2, h / 2)
    return
  }
  const pad = 30, pw = w - 2 * pad, ph = h - 2 * pad
  const maxQ = Math.max(...props.trials.map(tr => tr.Q), 1)
  const maxM = Math.max(...props.trials.map(tr => tr.meltedMass), 0.001)
  // Axes
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke()
  // Points
  props.trials.forEach(tr => {
    const x = pad + (tr.Q / maxQ) * pw
    const y = h - pad - (tr.meltedMass / maxM) * ph
    ctx.fillStyle = '#5B8DB8'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
  })
  // Trend line (linear regression: melted = (1/L) * Q)
  if (props.trials.length >= 2) {
    const validTrials = props.trials.filter(tr => tr.Q > 0)
    if (validTrials.length >= 2) {
      const n = validTrials.length
      const sumQ = validTrials.reduce((s, tr) => s + tr.Q, 0)
      const sumM = validTrials.reduce((s, tr) => s + tr.meltedMass, 0)
      const sumQM = validTrials.reduce((s, tr) => s + tr.Q * tr.meltedMass, 0)
      const sumQQ = validTrials.reduce((s, tr) => s + tr.Q * tr.Q, 0)
      const slope = (n * sumQM - sumQ * sumM) / (n * sumQQ - sumQ * sumQ)
      const x1 = 0, y1 = 0
      const x2 = maxQ, y2 = slope * maxQ
      ctx.strokeStyle = 'rgba(245,158,11,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
      ctx.beginPath()
      ctx.moveTo(pad + (x1 / maxQ) * pw, h - pad - (Math.min(y1, maxM) / maxM) * ph)
      ctx.lineTo(pad + (x2 / maxQ) * pw, h - pad - (Math.min(y2, maxM) / maxM) * ph)
      ctx.stroke(); ctx.setLineDash([])
    }
  }
  // Labels
  ctx.fillStyle = '#8B95A5'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('Q (kJ)', w / 2, h - 8)
  ctx.save(); ctx.translate(12, h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('melted (kg)', 0, 0); ctx.restore()
}
onMounted(draw)
watch(() => props.trials.length, draw, { flush: 'post' })
</script>
<template>
  <div style="flex:1; min-height:0; position:relative;">
    <canvas ref="canvasRef" style="width:100%; height:100%; display:block;" />
  </div>
</template>
