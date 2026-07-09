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
  const maxQ = Math.max(...props.trials.map(t => t.Q), 1)
  const maxM = Math.max(...props.trials.map(t => t.meltedMass), 0.001)
  // Axes
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke()
  // Points
  props.trials.forEach(t => {
    const x = pad + (t.Q / maxQ) * pw
    const y = h - pad - (t.meltedMass / maxM) * ph
    ctx.fillStyle = '#5B8DB8'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
  })
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
