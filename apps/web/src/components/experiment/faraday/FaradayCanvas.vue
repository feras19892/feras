<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  N: number
  B: number
  A: number
  theta: number
  flux: number
  emf: number
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

  // Magnet (N-S)
  const magW = s(80), magH = s(30)
  const magX = cx - magW / 2, magY = cy - s(100)
  ctx.fillStyle = '#f87171'; ctx.fillRect(magX, magY, magW / 2, magH)
  ctx.fillStyle = '#5B8DB8'; ctx.fillRect(magX + magW / 2, magY, magW / 2, magH)
  ctx.strokeStyle = '#D1D7E0'; ctx.lineWidth = s(1); ctx.strokeRect(magX, magY, magW, magH)
  ctx.fillStyle = '#fff'; ctx.font = `bold ${s(8)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('N', magX + magW / 4, magY + magH / 2 + s(3))
  ctx.fillText('S', magX + magW * 3 / 4, magY + magH / 2 + s(3))

  // Field lines
  ctx.strokeStyle = 'rgba(91,141,184,0.3)'; ctx.lineWidth = s(1)
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(cx + i * s(15), magY + magH); ctx.lineTo(cx + i * s(15), cy + s(60)); ctx.stroke()
  }

  // Rotating coil
  const coilW = s(60), coilH = s(40)
  const rad = (props.theta * Math.PI) / 180
  ctx.save()
  ctx.translate(cx, cy + s(30))
  ctx.rotate(rad)
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = s(2)
  ctx.strokeRect(-coilW / 2, -coilH / 2, coilW, coilH)
  ctx.fillStyle = 'rgba(251,191,36,0.1)'; ctx.fillRect(-coilW / 2, -coilH / 2, coilW, coilH)
  // Turns
  ctx.fillStyle = '#fbbf24'; ctx.font = `${s(7)}px sans-serif`
  ctx.fillText(`${props.N} turns`, 0, 0)
  ctx.restore()

  // Labels
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(8)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`Φ = ${props.flux.toFixed(4)} Wb`, cx, cy + s(60) + s(14))
  ctx.fillStyle = '#22c55e'; ctx.font = `bold ${s(9)}px sans-serif`
  ctx.fillText(`EMF = ${props.emf.toFixed(2)} V`, cx, cy + s(60) + s(26))

  const labels: Record<string, { text: string; color: string }> = {
    ready: { text: '⚡ جاهز — اضغط Start', color: '#64748b' },
    running: { text: '🔄 جاري الدوران...', color: '#fbbf24' },
    done: { text: '✅ اكتمل', color: '#22c55e' },
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
