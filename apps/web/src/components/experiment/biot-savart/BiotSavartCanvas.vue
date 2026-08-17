<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  I: number
  r: number
  R: number
  n: number
  B: number
  shape: 'wire' | 'loop' | 'solenoid'
  phase: 'ready' | 'running' | 'done'
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
  const cy = h / 2

  if (props.shape === 'wire') {
    // Wire (vertical)
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = s(3)
    ctx.beginPath(); ctx.moveTo(cx, cy - s(80)); ctx.lineTo(cx, cy + s(80)); ctx.stroke()
    // Current arrow
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(cx, cy - s(40)); ctx.lineTo(cx - s(5), cy - s(30)); ctx.lineTo(cx + s(5), cy - s(30)); ctx.fill()
    // Field circles
    ctx.strokeStyle = 'rgba(91,141,184,0.4)'; ctx.lineWidth = s(1)
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, s(20 * i), 0, Math.PI * 2); ctx.stroke()
    }
    // Compass needle
    const needleX = cx + s(60)
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = s(2)
    ctx.beginPath(); ctx.moveTo(needleX, cy); ctx.lineTo(needleX + s(20), cy); ctx.stroke()
    ctx.strokeStyle = '#5B8DB8'
    ctx.beginPath(); ctx.moveTo(needleX, cy); ctx.lineTo(needleX - s(20), cy); ctx.stroke()
  } else if (props.shape === 'loop') {
    // Circular loop
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = s(3)
    ctx.beginPath(); ctx.arc(cx, cy, s(50), 0, Math.PI * 2); ctx.stroke()
    // Field lines through loop
    ctx.strokeStyle = 'rgba(91,141,184,0.4)'; ctx.lineWidth = s(1)
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * s(15), cy - s(100)); ctx.lineTo(cx + i * s(15), cy + s(100)); ctx.stroke()
    }
  } else {
    // Solenoid
    const solW = s(100), solH = s(40)
    const solX = cx - solW / 2, solY = cy - solH / 2
    for (let i = 0; i < 8; i++) {
      const lx = solX + i * (solW / 7)
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = s(2)
      ctx.beginPath(); ctx.arc(lx, solY + solH / 2, solH / 2, -Math.PI / 2, Math.PI / 2); ctx.stroke()
    }
    // Field lines inside
    ctx.strokeStyle = 'rgba(91,141,184,0.4)'; ctx.lineWidth = s(1)
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(solX, cy + i * s(10)); ctx.lineTo(solX + solW, cy + i * s(10)); ctx.stroke()
    }
  }

  // B value label
  ctx.fillStyle = '#22c55e'; ctx.font = `bold ${s(10)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`B = ${props.B.toExponential(2)} T`, cx, h - s(20))

  const labels: Record<string, { text: string; color: string }> = {
    ready: { text: t('experiments.phaseReady'), color: '#64748b' },
    running: { text: t('experiments.phaseRunning'), color: '#fbbf24' },
    done: { text: t('experiments.phaseDone'), color: '#22c55e' },
  }
  const pl = labels[props.phase]
  ctx.fillStyle = pl.color; ctx.font = `bold ${s(12)}px sans-serif`
  ctx.fillText(pl.text, w / 2, s(18))
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
