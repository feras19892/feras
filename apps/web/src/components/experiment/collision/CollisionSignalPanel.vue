<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { CollisionSignalPoint } from '../../../composables/collision/useCollisionLab'

const { t } = useI18n()
const props = defineProps<{
  series: CollisionSignalPoint[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, w, h)

  const data = props.series
  if (data.length < 2) {
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 12px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(t('experiments.startSimulationToSeeSignal'), w / 2, h / 2)
    return
  }

  const pad = 40
  const tMin = data[0].t
  const tMax = data[data.length - 1].t
  const tRange = Math.max(tMax - tMin, 0.001)

  const allV = data.flatMap(d => [d.v1, d.v2])
  const vMax = Math.max(...allV.map(Math.abs), 0.1) * 1.2

  function tx(t: number) { return pad + ((t - tMin) / tRange) * (w - pad * 2) }
  function vy(v: number) { return h - pad - ((v + vMax) / (vMax * 2)) * (h - pad * 2) }

  // Grid
  ctx.strokeStyle = 'rgba(148,163,184,0.10)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = pad + (i / 4) * (h - pad * 2)
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke()
  }
  for (let i = 1; i < 4; i++) {
    const x = pad + (i / 4) * (w - pad * 2)
    ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, h - pad); ctx.stroke()
  }

  // Zero line
  ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(pad, vy(0)); ctx.lineTo(w - pad, vy(0)); ctx.stroke()

  // v1 line (blue)
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5
  ctx.beginPath()
  data.forEach((d, i) => { if (i === 0) ctx.moveTo(tx(d.t), vy(d.v1)); else ctx.lineTo(tx(d.t), vy(d.v1)) })
  ctx.stroke()

  // v2 line (red)
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5
  ctx.beginPath()
  data.forEach((d, i) => { if (i === 0) ctx.moveTo(tx(d.t), vy(d.v2)); else ctx.lineTo(tx(d.t), vy(d.v2)) })
  ctx.stroke()

  // Ticks + labels
  ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 11px "Segoe UI", sans-serif'; ctx.textAlign = 'center'
  for (let i = 0; i <= 4; i++) {
    const tv = tMin + (i / 4) * tRange
    const px = pad + (i / 4) * (w - pad * 2)
    ctx.fillText(tv.toFixed(2), px, h - pad + 16)
  }
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const vv = -vMax + (i / 4) * (vMax * 2)
    const py = h - pad - (i / 4) * (h - pad * 2)
    ctx.fillText(vv.toFixed(1), pad - 8, py + 4)
  }

  // Axis titles
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 13px "Segoe UI", sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('t (s)', w / 2, h - 4)
  ctx.save(); ctx.translate(14, h / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillText('v (m/s)', 0, 0); ctx.restore()

  // Legend
  ctx.font = 'bold 10px "Segoe UI"'
  ctx.fillStyle = '#3b82f6'; ctx.fillText('v₁', w - 44, 14)
  ctx.fillStyle = '#ef4444'; ctx.fillText('v₂', w - 22, 14)
}

watch(() => props.series, draw, { deep: true })

let ro: ResizeObserver | null = null
onMounted(() => {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return
  const resize = () => {
    canvas.width = wrap.clientWidth
    canvas.height = wrap.clientHeight
    draw()
  }
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(wrap)
})
onUnmounted(() => { if (ro) ro.disconnect() })
</script>

<template>
  <div class="signal-wrap" ref="wrapRef"><canvas ref="canvasRef" /></div>
</template>

<style scoped>
.signal-wrap { height: 180px; min-height: 180px; position: relative; flex-shrink: 0; }
.signal-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; background: #0f172a; border-radius: 8px; border: 1px solid #2D3645; }
</style>
