<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  p: number
  v: number
  pv: number
  phase: 'ready' | 'compressing' | 'done'
  running: boolean
  paused: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let lastTs = 0
let dpr = 1
let cw = 600
let ch = 400

const emit = defineEmits<{ (e: 'updateSim', dt: number): void }>()

function getCtx() { const c = canvasRef.value; return c ? c.getContext('2d') : null }
function resizeCanvas() {
  const c = canvasRef.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  dpr = window.devicePixelRatio || 1
  cw = Math.round(rect.width)
  ch = Math.round(rect.height)
  c.width = Math.round(cw * dpr)
  c.height = Math.round(ch * dpr)
}

function draw() {
  const ctx = getCtx()
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const w = cw, h = ch
  ctx.fillStyle = '#0B1220'; ctx.fillRect(0, 0, w, h)

  const scale = Math.min(w / 560, h / 360)
  const s = (v: number) => v * scale
  const cx = w / 2
  const tableY = h - s(50)

  // Table
  ctx.fillStyle = '#1A232E'; ctx.fillRect(0, tableY, w, s(45))
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = s(1)
  ctx.beginPath(); ctx.moveTo(0, tableY); ctx.lineTo(w, tableY); ctx.stroke()

  // Cylinder
  const cylW = s(120), cylH = s(100)
  const cylX = cx - cylW / 2, cylY = tableY - cylH
  ctx.strokeStyle = '#4A6572'; ctx.lineWidth = s(2)
  ctx.strokeRect(cylX, cylY, cylW, cylH)

  // Piston
  const pistonH = s(10)
  const pistonY = cylY + cylH * (1 - props.v) // v=1 at top, v=0.3 near bottom
  ctx.fillStyle = '#5B8DB8'
  ctx.fillRect(cylX - s(2), pistonY, cylW + s(4), pistonH)

  // Animated gas particles (confined to cylinder)
  const time = Date.now() / 1000
  const gasTop = pistonY + pistonH + s(4)
  const gasBottom = cylY + cylH - s(4)
  const gasLeft = cylX + s(4)
  const gasRight = cylX + cylW - s(4)
  const gasH = Math.max(s(10), gasBottom - gasTop)
  ctx.fillStyle = 'rgba(100,180,255,0.6)'
  for (let i = 0; i < 20; i++) {
    const speed = 2 + (i % 4)
    const phase = i * 0.7
    const baseX = gasLeft + ((i * 13) % (gasRight - gasLeft))
    const baseY = gasTop + ((i * 19) % gasH)
    const px = baseX + Math.sin(time * speed + phase) * s(5)
    const py = baseY + Math.cos(time * speed * 0.7 + phase) * s(4)
    const clampedX = Math.max(gasLeft, Math.min(gasRight, px))
    const clampedY = Math.max(gasTop, Math.min(gasBottom, py))
    ctx.beginPath(); ctx.arc(clampedX, clampedY, s(2.5), 0, Math.PI * 2); ctx.fill()
  }

  // Pressure arrows
  if (props.phase === 'compressing') {
    ctx.strokeStyle = 'rgba(245,158,11,0.4)'; ctx.lineWidth = s(1.5)
    const arrY = cylY - s(18)
    ctx.beginPath(); ctx.moveTo(cx - s(20), arrY); ctx.lineTo(cx + s(20), arrY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - s(15), arrY - s(3)); ctx.lineTo(cx - s(20), arrY); ctx.lineTo(cx - s(15), arrY + s(3)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + s(15), arrY - s(3)); ctx.lineTo(cx + s(20), arrY); ctx.lineTo(cx + s(15), arrY + s(3)); ctx.stroke()
  }

  // Labels
  ctx.textAlign = 'center'
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(10)}px sans-serif`
  ctx.fillText(`P = ${props.p.toFixed(2)} atm`, cx, cylY - s(26))
  ctx.fillStyle = '#D1D7E0'; ctx.font = `bold ${s(11)}px sans-serif`
  ctx.fillText(`V = ${props.v.toFixed(2)} L`, cx, cylY - s(14))
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${s(11)}px sans-serif`
  ctx.fillText(`P·V = ${props.pv.toFixed(2)} atm·L`, cx, tableY + s(28))

  // Phase label with spinner
  const labels: Record<string, { text: string; color: string }> = {
    ready: { text: t('experiments.blPhaseReady'), color: '#64748b' },
    compressing: { text: t('experiments.blPhaseCompressing'), color: '#fbbf24' },
    done: { text: t('experiments.blPhaseDone'), color: '#22c55e' },
  }
  const pl = labels[props.phase]
  ctx.fillStyle = pl.color; ctx.font = `bold ${s(13)}px sans-serif`
  ctx.fillText(pl.text, w / 2, s(22))

  // Spinner for compressing
  if (props.phase === 'compressing') {
    const spinnerAngle = (Date.now() / 500) % (Math.PI * 2)
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = s(2)
    ctx.beginPath()
    ctx.arc(w / 2 + ctx.measureText(pl.text).width / 2 + s(10), s(22), s(5), spinnerAngle, spinnerAngle + Math.PI * 1.5)
    ctx.stroke()
  }
}

function loop(ts: number) {
  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
  lastTs = ts
  emit('updateSim', dt)
  draw()
  animId = requestAnimationFrame(loop)
}

function onResize() { resizeCanvas(); draw() }
onMounted(() => { resizeCanvas(); draw(); animId = requestAnimationFrame(loop); window.addEventListener('resize', onResize) })
onUnmounted(() => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) })
</script>
<template>
  <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block;" />
</template>
