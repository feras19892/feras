<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useCanvasDPR } from '../../../composables/experiment/shared/useCanvasDPR'

const props = defineProps<{
  tubeLength: number
  frequency: number
  temperature: number
  harmonic: 1 | 3
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const W = 800, H = 400

useCanvasDPR(canvasRef, W, H, () => draw());

function draw() {
  const c = canvasRef.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  const tubeTop = 60
  const tubeBottom = H - 60
  const tubeLeft = 120
  const tubeRight = tubeLeft + 400
  const waterY = tubeBottom - props.tubeLength * 120

  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H)

  /* tube walls */
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(tubeLeft, tubeTop); ctx.lineTo(tubeLeft, tubeBottom); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(tubeRight, tubeTop); ctx.lineTo(tubeRight, tubeBottom); ctx.stroke()

  /* water (closed end) */
  ctx.fillStyle = 'rgba(59,130,246,.25)'
  ctx.fillRect(tubeLeft + 3, waterY, tubeRight - tubeLeft - 6, tubeBottom - waterY)
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(tubeLeft + 3, waterY); ctx.lineTo(tubeRight - 3, waterY); ctx.stroke()

  /* sound source (tuning fork) at open end */
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(tubeRight + 15, tubeTop + 10); ctx.lineTo(tubeRight + 15, tubeBottom - 10); ctx.stroke()
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(tubeRight + 5, tubeTop + 30); ctx.lineTo(tubeRight + 25, tubeTop + 30); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(tubeRight + 5, tubeTop + 50); ctx.lineTo(tubeRight + 25, tubeTop + 50); ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = '10px sans-serif'
  ctx.fillText('f = ' + props.frequency + ' Hz', tubeRight + 30, tubeTop + 42)

  /* standing wave */
  const airH = tubeBottom - waterY
  const N = 200
  const amp = Math.min(20, airH / 6)
  const t = props.running ? Date.now() / 300 : 0
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = 1.5; ctx.beginPath()
  for (let i = 0; i <= N; i++) {
    const y = waterY + (i / N) * airH
    const k = (Math.PI * props.harmonic) / (2 * props.tubeLength)
    const phase = k * ((i / N) * props.tubeLength) + t
    const xOff = Math.sin(phase) * amp
    const x = (tubeLeft + tubeRight) / 2 + xOff
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()

  /* nodes & antinodes labels */
  ctx.fillStyle = '#8B95A5'; ctx.font = '9px sans-serif'
  ctx.fillText('Closed (Node)', tubeLeft - 70, waterY + 4)
  ctx.fillText('Open (Antinode)', tubeRight + 30, tubeTop + 20)

  /* length label */
  ctx.fillStyle = '#67e8f9'; ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`L = ${props.tubeLength.toFixed(3)} m`, tubeLeft + 10, waterY - 8)

  /* temperature label */
  ctx.fillStyle = '#8B95A5'; ctx.font = '10px sans-serif'
  ctx.fillText(`T = ${props.temperature}°C`, tubeLeft + 10, tubeBottom + 20)

  /* harmonic label */
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 10px sans-serif'
  ctx.fillText(`Harmonic n=${props.harmonic === 1 ? 1 : 3}`, tubeLeft + 10, tubeTop - 10)
}

let animId = 0
function animate() { draw(); if (props.running) animId = requestAnimationFrame(animate) }

watch(() => props.running, (v) => { cancelAnimationFrame(animId); v ? animate() : draw() })
watch(() => [props.tubeLength, props.frequency, props.temperature, props.harmonic], draw, { deep: true })
onMounted(() => draw()); onUnmounted(() => cancelAnimationFrame(animId))
</script>

<template>
  <canvas ref="canvasRef" :width="W" :height="H" style="width: 100%; height: 100%;" />
</template>
