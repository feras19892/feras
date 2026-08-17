<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  mode: 'single' | 'grating'
  slitWidth: number
  linesPerMm: number
  screenDistance: number
  wavelength: number
  intensityPattern: { yMm: number; intensity: number }[]
  darkFringes: { m: number; yMm: number }[]
  orderPositions: { m: number; yMm: number; intensity: number }[]
  lightColor: string
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let W = 800, H = 400
let resizeObserver: ResizeObserver | null = null

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/* dynamic scale so everything fits */
const scaleY = computed(() => {
  let maxY = 1
  if (props.mode === 'single' && props.intensityPattern.length) {
    maxY = Math.max(...props.intensityPattern.map(p => Math.abs(p.yMm)), 1)
  } else if (props.mode === 'grating' && props.orderPositions.length) {
    maxY = Math.max(...props.orderPositions.map(p => Math.abs(p.yMm)), 1)
  }
  return Math.min(3.5, (H / 2 - 40) / Math.max(maxY, 1))
})

function resize() {
  const c = canvasRef.value; if (!c) return
  const wrap = c.parentElement; if (!wrap) return
  const dpr = window.devicePixelRatio || 1
  W = wrap.clientWidth
  H = wrap.clientHeight
  c.width = W * dpr
  c.height = H * dpr
  c.style.width = W + 'px'
  c.style.height = H + 'px'
  const ctx = c.getContext('2d'); if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw()
}

function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const midY = H / 2
  const screenX = W - 80
  const slitX = 80
  const sy = scaleY.value

  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip()

  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H)

  /* laser */
  ctx.fillStyle = props.lightColor; ctx.globalAlpha = 0.25
  ctx.fillRect(10, midY - 18, 60, 36)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#8B95A5'; ctx.font = '10px sans-serif'
  ctx.fillText(t('experiments.dfLaser'), 24, midY - 28)

  if (props.mode === 'single') {
    const barW = 12
    const gapH = Math.max(6, Math.min(props.slitWidth * 40, H - 60))

    /* single slit: two blocks with gap */
    ctx.fillStyle = '#161B22'
    ctx.fillRect(slitX - barW / 2, 20, barW, midY - gapH / 2 - 20)
    ctx.fillRect(slitX - barW / 2, midY + gapH / 2, barW, midY - gapH / 2 - 20)
    ctx.strokeStyle = props.lightColor; ctx.lineWidth = 2
    ctx.strokeRect(slitX - barW / 2 - 2, 20, barW + 4, H - 40)

    /* animated wavefronts */
    if (props.running) {
      ctx.strokeStyle = props.lightColor; ctx.globalAlpha = 0.12
      const now = Date.now() / 400
      for (let i = 0; i < 10; i++) {
        const r = ((now + i) % 10) * 28
        ctx.beginPath(); ctx.arc(slitX, midY, r, -Math.PI / 3, Math.PI / 3); ctx.stroke()
        ctx.beginPath(); ctx.arc(slitX, midY - gapH / 2, r * 0.5, -0.5, 0.5); ctx.stroke()
        ctx.beginPath(); ctx.arc(slitX, midY + gapH / 2, r * 0.5, -0.5, 0.5); ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  } else {
    /* grating: multiple slits */
    const gratingW = 6
    const nSlits = Math.min(12, Math.max(3, Math.floor(props.linesPerMm / 100)))
    const spacing = 20
    ctx.fillStyle = '#161B22'
    for (let i = 0; i < nSlits; i++) {
      const y = midY - ((nSlits - 1) * spacing) / 2 + i * spacing
      ctx.fillRect(slitX - gratingW / 2, y - 1, gratingW, 2)
    }
    ctx.strokeStyle = props.lightColor; ctx.lineWidth = 1.5
    ctx.strokeRect(slitX - gratingW / 2 - 2, midY - ((nSlits - 1) * spacing) / 2 - 6, gratingW + 4, (nSlits - 1) * spacing + 12)

    if (props.running) {
      ctx.strokeStyle = props.lightColor; ctx.globalAlpha = 0.1
      const now = Date.now() / 400
      for (let i = 0; i < nSlits; i++) {
        const sy_ = midY - ((nSlits - 1) * spacing) / 2 + i * spacing
        for (let j = 0; j < 8; j++) {
          const r = ((now + j) % 10) * 28
          ctx.beginPath(); ctx.arc(slitX, sy_, r, -Math.PI / 4, Math.PI / 4); ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
    }
  }

  /* screen line */
  ctx.fillStyle = '#e2e8f0'; ctx.fillRect(screenX - 2, 30, 4, H - 60)

  if (props.mode === 'single') {
    /* intensity pattern on screen */
    if (props.intensityPattern.length > 0) {
      const maxI = Math.max(...props.intensityPattern.map(p => p.intensity))
      const maxBarH = (H - 80) / 2
      for (const p of props.intensityPattern) {
        const yPx = midY - p.yMm * sy
        if (yPx < 30 || yPx > H - 30) continue
        const br = maxI > 0 ? p.intensity / maxI : 0
        const h = br * maxBarH
        ctx.fillStyle = props.lightColor; ctx.globalAlpha = 0.25 + br * 0.75
        ctx.fillRect(screenX - 1, yPx - h / 2, 3, h)
      }
      ctx.globalAlpha = 1

      /* intensity curve to the right of screen */
      ctx.strokeStyle = props.lightColor; ctx.lineWidth = 1.5; ctx.beginPath()
      for (let i = 0; i < props.intensityPattern.length; i++) {
        const p = props.intensityPattern[i]
        const yPx = midY - p.yMm * sy
        const xOff = Math.min(screenX + 12 + p.intensity * 70, W - 10)
        if (i === 0) ctx.moveTo(xOff, yPx); else ctx.lineTo(xOff, yPx)
      }
      ctx.stroke()
    }

    /* dark fringe labels */
    for (const f of props.darkFringes.slice(0, 8)) {
      const yPx = midY - f.yMm * sy
      if (yPx < 40 || yPx > H - 40) continue
      const lbl = `m=${f.m}`
      const tw = ctx.measureText(lbl).width
      const tx = screenX - 48
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath(); roundRect(ctx, tx - 3, yPx - 7, tw + 6, 14, 4); ctx.fill()
      ctx.fillStyle = f.m === 0 ? '#fff' : '#8B95A5'
      ctx.font = f.m === 0 ? 'bold 11px sans-serif' : '10px sans-serif'
      ctx.fillText(lbl, tx, yPx + 3)
    }
  } else {
    /* grating: sharp peaks on screen */
    if (props.orderPositions.length > 0) {
      for (const p of props.orderPositions) {
        const yPx = midY - p.yMm * sy
        if (yPx < 30 || yPx > H - 30) continue
        const br = p.intensity
        ctx.fillStyle = props.lightColor; ctx.globalAlpha = 0.4 + br * 0.6
        ctx.beginPath(); ctx.arc(screenX, yPx, 3 + br * 5, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = props.lightColor; ctx.globalAlpha = 0.15
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(screenX, yPx); ctx.lineTo(Math.min(screenX + 15, W - 10), yPx); ctx.stroke()
      }
      ctx.globalAlpha = 1

      /* order labels */
      for (const p of props.orderPositions) {
        const yPx = midY - p.yMm * sy
        if (yPx < 30 || yPx > H - 30) continue
        const lbl = `m=${p.m}`
        const tw = ctx.measureText(lbl).width
        const tx = screenX - 40
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.beginPath(); roundRect(ctx, tx - 3, yPx - 7, tw + 6, 14, 4); ctx.fill()
        ctx.fillStyle = p.m === 0 ? '#fff' : '#8B95A5'
        ctx.font = p.m === 0 ? 'bold 11px sans-serif' : '10px sans-serif'
        ctx.fillText(lbl, tx, yPx + 3)
      }
    }
  }

  /* bottom labels */
  ctx.fillStyle = '#8B95A5'; ctx.font = '12px sans-serif'
  const label = props.mode === 'single' ? t('experiments.dfSingleSlit') : `${t('experiments.dfGrating')} (${props.linesPerMm}/mm)`
  ctx.fillText(label, slitX - (props.mode === 'single' ? 28 : 45), H - 10)
  ctx.fillText(t('experiments.dfScreen'), screenX - 18, H - 10)

  ctx.restore()
}

let animId = 0
function animate() { draw(); if (props.running) animId = requestAnimationFrame(animate) }

watch(() => props.running, (v) => { cancelAnimationFrame(animId); v ? animate() : draw() })
watch(() => [props.mode, props.slitWidth, props.linesPerMm, props.screenDistance, props.wavelength, props.intensityPattern.length, props.orderPositions.length, props.lightColor], draw, { deep: true })
onMounted(() => {
  resize()
  resizeObserver = new ResizeObserver(() => resize())
  if (canvasRef.value?.parentElement) resizeObserver.observe(canvasRef.value.parentElement)
})
onUnmounted(() => {
  cancelAnimationFrame(animId)
  resizeObserver?.disconnect()
})
</script>

<template>
  <canvas ref="canvasRef" />
</template>
