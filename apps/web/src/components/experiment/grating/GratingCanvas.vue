<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  linesPerMm: number
  screenDistance: number
  wavelength: number
  orderPositions: { m: number; yMm: number; intensity: number }[]
  lightColor: string
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const W = 800, H = 400

function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const midY = H / 2
  const screenX = W - 80
  const gratingX = 80
  const gratingW = 6
  const nSlits = Math.min(12, Math.max(3, Math.floor(props.linesPerMm / 100)))
  const spacing = 20

  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H)

  /* laser */
  ctx.fillStyle = props.lightColor; ctx.globalAlpha = 0.25
  ctx.fillRect(10, midY - 18, 60, 36)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#8B95A5'; ctx.font = '10px sans-serif'
  ctx.fillText('Laser', 24, midY - 28)

  /* grating: multiple slits */
  ctx.fillStyle = '#161B22'
  for (let i = 0; i < nSlits; i++) {
    const y = midY - ((nSlits - 1) * spacing) / 2 + i * spacing
    ctx.fillRect(gratingX - gratingW / 2, y - 1, gratingW, 2)
  }
  ctx.strokeStyle = props.lightColor; ctx.lineWidth = 1.5
  ctx.strokeRect(gratingX - gratingW / 2 - 2, midY - ((nSlits - 1) * spacing) / 2 - 6, gratingW + 4, (nSlits - 1) * spacing + 12)

  /* animated wavefronts */
  if (props.running) {
    ctx.strokeStyle = props.lightColor; ctx.globalAlpha = 0.1
    const t = Date.now() / 400
    for (let i = 0; i < nSlits; i++) {
      const sy = midY - ((nSlits - 1) * spacing) / 2 + i * spacing
      for (let j = 0; j < 8; j++) {
        const r = ((t + j) % 10) * 28
        ctx.beginPath(); ctx.arc(gratingX, sy, r, -Math.PI / 4, Math.PI / 4); ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
  }

  /* screen line */
  ctx.fillStyle = '#e2e8f0'; ctx.fillRect(screenX - 2, 30, 4, H - 60)

  /* sharp peaks on screen */
  if (props.orderPositions.length > 0) {
    const maxI = Math.max(...props.orderPositions.map(p => p.intensity))
    const scaleY = 2.5
    for (const p of props.orderPositions) {
      const yPx = midY - p.yMm * scaleY
      const br = maxI > 0 ? p.intensity / maxI : 0
      ctx.fillStyle = props.lightColor; ctx.globalAlpha = 0.4 + br * 0.6
      ctx.beginPath(); ctx.arc(screenX, yPx, 3 + br * 5, 0, Math.PI * 2); ctx.fill()
      /* vertical line for peak */
      ctx.strokeStyle = props.lightColor; ctx.globalAlpha = 0.15
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(screenX, yPx); ctx.lineTo(screenX + 15, yPx); ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  /* labels */
  ctx.fillStyle = '#8B95A5'; ctx.font = '12px sans-serif'
  ctx.fillText('Grating (' + props.linesPerMm + '/mm)', gratingX - 50, H - 10)
  ctx.fillText('Screen', screenX - 18, H - 10)

  /* order labels */
  for (const p of props.orderPositions) {
    const yPx = midY - p.yMm * 2.5
    if (yPx < 30 || yPx > H - 30) continue
    const lbl = `m=${p.m}`
    const tw = ctx.measureText(lbl).width
    const tx = screenX - 40
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath(); ctx.roundRect(tx - 3, yPx - 7, tw + 6, 14, 4); ctx.fill()
    ctx.fillStyle = p.m === 0 ? '#fff' : '#8B95A5'
    ctx.font = p.m === 0 ? 'bold 11px sans-serif' : '10px sans-serif'
    ctx.fillText(lbl, tx, yPx + 3)
  }
}

let animId = 0
function animate() { draw(); if (props.running) animId = requestAnimationFrame(animate) }

watch(() => props.running, (v) => { cancelAnimationFrame(animId); v ? animate() : draw() })
watch(() => [props.linesPerMm, props.screenDistance, props.wavelength, props.orderPositions.length, props.lightColor], draw, { deep: true })
onMounted(() => draw()); onUnmounted(() => cancelAnimationFrame(animId))
</script>

<template>
  <canvas ref="canvasRef" :width="W" :height="H" style="width: 100%; height: 100%;" />
</template>
