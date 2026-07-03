<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  slitDistance: number
  screenDistance: number
  wavelength: number
  slitWidth: number
  intensityPattern: { xMm: number; intensity: number }[]
  orderPositions: number[]
  lightColor: string
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const width = 800
const height = 400

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)
  const midY = height / 2
  const screenX = width - 80
  const slitX = 80
  const scaleY = 5

  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, width, height)

  // Laser source
  ctx.fillStyle = props.lightColor
  ctx.globalAlpha = 0.3
  ctx.fillRect(10, midY - 20, 60, 40)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#8B95A5'
  ctx.font = '10px sans-serif'
  ctx.fillText('Laser (coherent)', 20, midY - 28)

  const slitGapPx = Math.max(10, props.slitDistance * 60)
  ctx.fillStyle = '#161B22'
  ctx.fillRect(slitX - 4, midY - slitGapPx / 2 - 2, 8, 2)
  ctx.fillRect(slitX - 4, midY + slitGapPx / 2, 8, 2)
  ctx.strokeStyle = props.lightColor
  ctx.lineWidth = 2
  ctx.strokeRect(slitX - 4, midY - slitGapPx / 2 - 2, 8, slitGapPx + 4)

  if (props.running) {
    ctx.strokeStyle = props.lightColor
    ctx.globalAlpha = 0.15
    const time = Date.now() / 500
    for (let i = 0; i < 8; i++) {
      const r = ((time + i) % 8) * 25
      ctx.beginPath()
      ctx.arc(slitX, midY - slitGapPx / 2, r, -Math.PI / 3, Math.PI / 3)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(slitX, midY + slitGapPx / 2, r, -Math.PI / 3, Math.PI / 3)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(screenX - 2, 40, 4, height - 80)

  if (props.intensityPattern.length > 0) {
    const maxI = Math.max(...props.intensityPattern.map(p => p.intensity))
    const centerY = height / 2
    for (const p of props.intensityPattern) {
      const yPx = centerY - p.xMm * scaleY
      const brightness = maxI > 0 ? p.intensity / maxI : 0
      const r = 2 + brightness * 3
      ctx.fillStyle = props.lightColor
      ctx.globalAlpha = 0.3 + brightness * 0.7
      ctx.beginPath()
      ctx.arc(screenX, yPx, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.strokeStyle = props.lightColor
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < props.intensityPattern.length; i++) {
      const p = props.intensityPattern[i]
      const yPx = centerY - p.xMm * scaleY
      const xOff = screenX + 10 + p.intensity * 60
      if (i === 0) ctx.moveTo(xOff, yPx)
      else ctx.lineTo(xOff, yPx)
    }
    ctx.stroke()
  }

  ctx.fillStyle = '#8B95A5'
  ctx.font = '12px sans-serif'
  ctx.fillText('Double Slit', slitX - 25, height - 15)
  ctx.fillText('Screen', screenX - 15, height - 15)

  // Order labels (left of screen so they don't get clipped)
  for (let i = 0; i < props.orderPositions.length && i < 7; i++) {
    const pos = props.orderPositions[i]
    const yPx = midY - pos * scaleY
    if (yPx > 30 && yPx < height - 30) {
      const m = i - 3
      const label = `m=${m}`
      // Bright color for central fringe, slightly dimmer for others
      const isCentral = m === 0
      ctx.fillStyle = isCentral ? '#ffffff' : '#8B95A5'
      ctx.font = isCentral ? 'bold 12px sans-serif' : '11px sans-serif'
      // Draw small background pill for readability
      const textX = screenX - 40
      const textWidth = ctx.measureText(label).width
      if (isCentral) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.beginPath()
        ctx.roundRect(textX - 4, yPx - 8, textWidth + 8, 16, 4)
        ctx.fill()
      }
      ctx.fillStyle = isCentral ? '#ffffff' : '#8B95A5'
      ctx.fillText(label, textX, yPx + 3)
    }
  }
}

let animId: number
function animate() {
  draw()
  if (props.running) {
    animId = requestAnimationFrame(animate)
  }
}

watch(() => props.running, (val) => {
  if (val) { cancelAnimationFrame(animId); animate() }
  else { cancelAnimationFrame(animId); draw() }
})

watch(() => [
  props.slitDistance, props.screenDistance, props.wavelength,
  props.slitWidth, props.intensityPattern.length, props.lightColor
], draw, { deep: true })

onMounted(() => { draw() })
onUnmounted(() => { cancelAnimationFrame(animId) })
</script>

<template>
  <canvas ref="canvasRef" :width="width" :height="height" style="width: 100%; height: 100%;" />
</template>
