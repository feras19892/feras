<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  stringLength: number
  harmonic: number
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const W = 800, H = 400

function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  const topY = 80
  const bottomY = H - 80
  const leftX = 100
  const rightX = W - 100
  const scaleX = (rightX - leftX) / props.stringLength

  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H)

  /* fixed ends */
  ctx.fillStyle = '#8B95A5'; ctx.fillRect(leftX - 8, topY - 15, 16, 30); ctx.fillRect(rightX - 8, topY - 15, 16, 30)
  ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.fillText('Fixed', leftX - 14, topY - 22); ctx.fillText('Fixed', rightX - 14, topY - 22)

  /* baseline string */
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(leftX, topY); ctx.lineTo(rightX, topY); ctx.stroke()

  /* standing wave */
  const amp = 50
  const t = props.running ? Date.now() / 300 : 0
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = 2.5; ctx.beginPath()
  for (let px = leftX; px <= rightX; px++) {
    const x = (px - leftX) / scaleX
    const k = (Math.PI * props.harmonic) / props.stringLength
    const y = topY + amp * Math.sin(k * x) * Math.cos(t)
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
}

let animId = 0
function animate() { draw(); if (props.running) animId = requestAnimationFrame(animate) }

watch(() => props.running, (v) => { cancelAnimationFrame(animId); v ? animate() : draw() })
watch(() => [props.stringLength, props.harmonic], draw, { deep: true })
onMounted(() => draw()); onUnmounted(() => cancelAnimationFrame(animId))
</script>

<template>
  <canvas ref="canvasRef" :width="W" :height="H" style="width: 100%; height: 100%;" />
</template>
