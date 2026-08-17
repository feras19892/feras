<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  mode?: 'ripple' | 'young' | 'sources'
  sourceDistance: number
  wavelength: number
  frequency: number
  screenDistance: number
  amplitudeMap: { yMm: number; amplitude: number }[]
  constructive: { m: number; yMm: number }[]
  destructive: { m: number; yMm: number }[]
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const W = 800, H = 400
let time = 0
let animId = 0
let lastTs = 0
let resizeObs: ResizeObserver | null = null

function getCtx() {
  const c = canvasRef.value
  return c ? c.getContext('2d') : null
}

function draw() {
  const ctx = getCtx()
  if (!ctx) return

  ctx.fillStyle = '#0B1220'
  ctx.fillRect(0, 0, W, H)

  const s1x = W / 2 - props.sourceDistance * 500
  const s2x = W / 2 + props.sourceDistance * 500
  const sY = H - 50
  const lambdaPx = Math.max(15, props.wavelength * 1200)

  /* === ANIMATED WAVE RINGS === */
  const numRings = 7
  const spacing = lambdaPx
  const speed = props.frequency * 1.5

  for (let i = 0; i < numRings; i++) {
    const radius = ((i * spacing + time * speed) % (numRings * spacing))
    if (radius < 3) continue
    const alpha = Math.max(0.08, 0.7 - (radius / (numRings * spacing)) * 0.6)

    ctx.strokeStyle = `rgba(91,141,184,${alpha})`
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(s1x, sY, radius, 0, Math.PI * 2); ctx.stroke()

    ctx.strokeStyle = `rgba(103,232,249,${alpha})`
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(s2x, sY, radius, 0, Math.PI * 2); ctx.stroke()
  }

  /* === SCREEN === */
  const screenX = 60
  ctx.fillStyle = '#161B22'; ctx.fillRect(screenX - 4, 30, 8, H - 60)
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 2
  ctx.strokeRect(screenX - 4, 30, 8, H - 60)
  ctx.fillStyle = '#8B95A5'; ctx.font = 'bold 11px sans-serif'
  ctx.fillText(t('experiments.wiScreen'), screenX - 18, 22)

  /* === FRINGE PATTERN === */
  if (props.constructive.length) {
    const centerY = H / 2
    for (const c of props.constructive) {
      const yPx = centerY - c.yMm * 2.5
      if (yPx > 40 && yPx < H - 40) {
        const isCentral = c.m === 0
        ctx.fillStyle = isCentral ? '#fbbf24' : '#5B8DB8'
        ctx.beginPath(); ctx.arc(screenX, yPx, isCentral ? 7 : 4.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#8B95A5'; ctx.font = isCentral ? 'bold 10px sans-serif' : '9px sans-serif'
        ctx.fillText(isCentral ? 'm=0' : `+${c.m}`, screenX + 14, yPx + 3)
      }
    }
    for (const d of props.destructive) {
      const yPx = centerY - d.yMm * 2.5
      if (yPx > 40 && yPx < H - 40) {
        ctx.fillStyle = '#1e2530'
        ctx.beginPath(); ctx.arc(screenX, yPx, 3, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(screenX, yPx, 3, 0, Math.PI * 2); ctx.stroke()
      }
    }
  }

  /* === SOURCE DOTS === */
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(s1x, sY, 9, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(s2x, sY, 9, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'
  ctx.fillText('S₁', s1x - 9, sY + 24); ctx.fillText('S₂', s2x - 9, sY + 24)

  /* === PATH DIFFERENCE LINES === */
  const targetY = H / 2 - 60
  if (targetY > 50 && targetY < H - 50) {
    ctx.strokeStyle = 'rgba(251,191,36,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(s1x, sY); ctx.lineTo(screenX, targetY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(s2x, sY); ctx.lineTo(screenX, targetY); ctx.stroke()
    ctx.setLineDash([])
  }

  /* === LEGEND === */
  ctx.fillStyle = '#8B95A5'; ctx.font = '11px sans-serif'
  ctx.fillText(t('experiments.wiConstructive'), W - 200, 30)
  ctx.fillStyle = '#475569'; ctx.fillText(t('experiments.wiDestructive'), W - 200, 48)

  /* === MODE LABEL === */
  const modeLabel = props.mode === 'ripple' ? t('experiments.wiRippleTank') : props.mode === 'young' ? t('experiments.wiYoungSlits') : t('experiments.wiTwoSources')
  ctx.fillStyle = '#5B8DB8'; ctx.font = 'bold 12px sans-serif'
  ctx.fillText(modeLabel, 15, H - 10)
}

function loop(ts: number) {
  const dt = lastTs ? (ts - lastTs) / 1000 : 0
  lastTs = ts
  if (props.running) time += dt
  draw()
  animId = requestAnimationFrame(loop)
}

watch(() => props.running, (running) => {
  if (!running) { time = 0; lastTs = 0; draw() }
})

watch(() => [props.mode, props.sourceDistance, props.wavelength, props.frequency, props.amplitudeMap.length], draw, { deep: true })

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
  draw(); animId = requestAnimationFrame(loop)
})
onUnmounted(() => { cancelAnimationFrame(animId); if (resizeObs) resizeObs.disconnect() })
</script>

<template>
  <canvas ref="canvasRef" :width="W" :height="H" style="width: 100%; height: 100%;" />
</template>
