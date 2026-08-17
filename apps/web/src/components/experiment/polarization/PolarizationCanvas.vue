<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  polarizerAngle: number
  analyzerAngle: number
  inputIntensity: number
  outputIntensity: number
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const W = 800, H = 400
let resizeObs: ResizeObserver | null = null

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === 'function') { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, len: number, color: string, label: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(degToRad(angle))
  ctx.strokeStyle = color; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(-len/2, 0); ctx.lineTo(len/2, 0); ctx.stroke()
  ctx.fillStyle = color
  ctx.beginPath(); ctx.moveTo(len/2, 0); ctx.lineTo(len/2 - 10, -5); ctx.lineTo(len/2 - 10, 5); ctx.fill()
  ctx.restore()
  ctx.fillStyle = '#8B95A5'; ctx.font = '11px sans-serif'
  ctx.fillText(label, x - 15, y + 28)
}

function degToRad(d: number) { return d * Math.PI / 180 }

function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const midY = H / 2
  const beamY = midY
  const sourceX = 40
  const polX = 220
  const anaX = 480
  const detX = 720

  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H)

  /* light beam before polarizer */
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3; ctx.globalAlpha = 0.4
  ctx.beginPath(); ctx.moveTo(sourceX + 30, beamY); ctx.lineTo(polX, beamY); ctx.stroke()
  ctx.globalAlpha = 1

  /* source */
  ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(sourceX + 15, beamY, 18, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0d1117'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('I₀', sourceX + 10, beamY + 4)

  /* polarizer disk */
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(polX, beamY, 30, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = 'rgba(91,141,184,.1)'; ctx.beginPath(); ctx.arc(polX, beamY, 30, 0, Math.PI * 2); ctx.fill()
  drawArrow(ctx, polX, beamY, props.polarizerAngle, 44, '#5B8DB8', 'P')

  /* beam between polarizers */
  const br = Math.min(1, props.outputIntensity / Math.max(props.inputIntensity, 1))
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2 + br * 3; ctx.globalAlpha = 0.2 + br * 0.6
  ctx.beginPath(); ctx.moveTo(polX + 30, beamY); ctx.lineTo(anaX - 30, beamY); ctx.stroke()
  ctx.globalAlpha = 1

  /* analyzer disk */
  ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(anaX, beamY, 30, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = 'rgba(103,232,249,.1)'; ctx.beginPath(); ctx.arc(anaX, beamY, 30, 0, Math.PI * 2); ctx.fill()
  drawArrow(ctx, anaX, beamY, props.analyzerAngle, 44, '#67e8f9', 'A')

  /* output beam */
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1 + br * 4; ctx.globalAlpha = 0.15 + br * 0.85
  ctx.beginPath(); ctx.moveTo(anaX + 30, beamY); ctx.lineTo(detX, beamY); ctx.stroke()
  ctx.globalAlpha = 1

  /* detector */
  ctx.fillStyle = '#4ade80'; ctx.beginPath(); roundRect(ctx, detX - 10, beamY - 20, 20, 40, 4); ctx.fill()
  ctx.fillStyle = '#0d1117'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('I', detX - 3, beamY + 4)

  /* wave animation */
  if (props.running) {
    const t = Date.now() / 300
    ctx.strokeStyle = '#e2e8f0'; ctx.globalAlpha = 0.15
    for (let i = 0; i < 6; i++) {
      const phase = (t + i * 0.8) % 4
      const yOff = Math.sin(phase * Math.PI) * 8
      ctx.beginPath(); ctx.moveTo(sourceX + 30, beamY + yOff); ctx.lineTo(polX, beamY + yOff); ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  /* labels */
  ctx.fillStyle = '#8B95A5'; ctx.font = '12px sans-serif'
  ctx.fillText(t('experiments.poSource'), sourceX - 8, H - 12)
  ctx.fillText(t('experiments.poPolarizer'), polX - 22, H - 12)
  ctx.fillText(t('experiments.poAnalyzer'), anaX - 22, H - 12)
  ctx.fillText(t('experiments.poDetector'), detX - 20, H - 12)

  /* value labels */
  ctx.fillStyle = '#5B8DB8'; ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`θ₁ = ${props.polarizerAngle}°`, polX - 28, beamY - 42)
  ctx.fillStyle = '#67e8f9'; ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`θ₂ = ${props.analyzerAngle}°`, anaX - 28, beamY - 42)
  ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`I = ${props.outputIntensity.toFixed(1)}`, detX - 28, beamY - 42)
}

let animId = 0
function animate() { draw(); if (props.running) animId = requestAnimationFrame(animate) }

watch(() => props.running, (v) => { cancelAnimationFrame(animId); v ? animate() : draw() })
watch(() => [props.polarizerAngle, props.analyzerAngle, props.inputIntensity, props.outputIntensity], draw, { deep: true })
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
