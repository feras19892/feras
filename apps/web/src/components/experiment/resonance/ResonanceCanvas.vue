<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  stringLength: { type: Number, required: true },
  harmonic: { type: Number, required: true },
  tension: { type: Number, required: true },
  frequency: { type: Number, required: true },
  wavelength: { type: Number, required: true },
  damping: { type: Number, required: true },
  running: { type: Boolean, required: true },
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const W = 800, H = 400
let elapsed = 0
let lastFrame = 0
let resizeObs: ResizeObserver | null = null

function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  const topY = 80
  const bottomY = H - 80
  const leftX = 100
  const maxLen = 3.0
  const visualWidth = ((W - 200) * props.stringLength / maxLen)
  const rightX = leftX + visualWidth
  const scaleX = visualWidth / props.stringLength

  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H)

  /* fixed ends */
  ctx.fillStyle = '#8B95A5'; ctx.fillRect(leftX - 8, topY - 15, 16, 30); ctx.fillRect(rightX - 8, topY - 15, 16, 30)
  ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.fillText(t('experiments.reFixed'), leftX - 14, topY - 22); ctx.fillText(t('experiments.reFixed'), rightX - 14, topY - 22)

  /* baseline string */
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(leftX, topY); ctx.lineTo(rightX, topY); ctx.stroke()

  /* standing wave */
  const amp = 50
  const omega = 2 * Math.PI * props.frequency
  const timeVal = elapsed
  const dampingFactor = Math.exp(-props.damping * timeVal)
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = 2.5; ctx.beginPath()
  for (let px = leftX; px <= rightX; px++) {
    const x = (px - leftX) / scaleX
    const k = (Math.PI * props.harmonic) / props.stringLength
    const y = topY + amp * dampingFactor * Math.sin(k * x) * Math.cos(omega * timeVal)
    if (px === leftX) ctx.moveTo(px, y); else ctx.lineTo(px, y)
  }
  ctx.stroke()

  /* antinodes (loops) */
  const loopCount = props.harmonic
  for (let i = 1; i <= loopCount; i++) {
    const ax = leftX + (i / loopCount) * (rightX - leftX) - (rightX - leftX) / (loopCount * 2)
    if (ax >= leftX && ax <= rightX) {
      ctx.fillStyle = 'rgba(91,141,184,.15)'; ctx.beginPath(); ctx.arc(ax, topY, 8, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#5B8DB8'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('A', ax - 3, topY - 12)
    }
  }

  /* nodes */
  for (let i = 0; i <= loopCount; i++) {
    const nx = leftX + (i / loopCount) * (rightX - leftX)
    ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(nx, topY, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#f87171'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('N', nx - 3, topY + 18)
  }

  /* labels */
  ctx.fillStyle = '#8B95A5'; ctx.font = '12px sans-serif'; ctx.fillText(`L = ${props.stringLength.toFixed(2)} m`, leftX, bottomY + 20)
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(`n = ${props.harmonic}`, rightX - 40, bottomY + 20)
  ctx.fillStyle = '#67e8f9'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(`f = ${props.frequency.toFixed(1)} Hz`, leftX, bottomY + 40)
  ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(`\u03BB = ${props.wavelength.toFixed(2)} m`, leftX + 120, bottomY + 40)
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(`T = ${props.tension} N`, leftX + 240, bottomY + 40)
  ctx.fillStyle = '#f87171'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(`\u03B3 = ${props.damping.toFixed(2)}`, leftX + 340, bottomY + 40)
}

let animId = 0
function animate() {
  const now = performance.now()
  if (lastFrame > 0) elapsed += (now - lastFrame) / 1000
  lastFrame = now
  draw()
  if (props.running) animId = requestAnimationFrame(animate)
}

watch(() => props.running, (v) => {
  cancelAnimationFrame(animId)
  if (v) { lastFrame = 0; animate() }
  else { lastFrame = 0; elapsed = 0; draw() }
})
watch(() => [props.stringLength, props.harmonic, props.tension, props.frequency, props.wavelength, props.damping], draw, { deep: true })
onMounted(() => {
  const c = canvasRef.value; if (!c) return
  const dpr = window.devicePixelRatio || 1
  c.width = W * dpr; c.height = H * dpr
  const ctx = c.getContext('2d'); if (ctx) ctx.scale(dpr, dpr)
  resizeObs = new ResizeObserver(() => {
    const parent = c.parentElement; if (!parent) return
    const pw = parent.clientWidth, ph = parent.clientHeight
    c.style.width = pw + 'px'; c.style.height = ph + 'px'
  })
  resizeObs.observe(c.parentElement!)
  draw()
}); onUnmounted(() => { cancelAnimationFrame(animId); if (resizeObs) resizeObs.disconnect() })
</script>

<template>
  <canvas ref="canvasRef" :width="W" :height="H" style="width: 100%; height: 100%;" />
</template>