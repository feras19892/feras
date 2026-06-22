<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { ChemistryContainer } from '../../../composables/chemistry/useChemistryExperiment'

interface Props {
  containers: ChemistryContainer[]
  burnerOn: boolean
  running: boolean
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width, H = canvas.height

  // Background
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, W, H)

  // Lab table surface
  const tableY = H * 0.65
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, tableY, W, H - tableY)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, tableY); ctx.lineTo(W, tableY); ctx.stroke()

  // Table grid lines
  ctx.strokeStyle = 'rgba(51,65,85,0.3)'
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, tableY); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = tableY; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // Burner stand
  const burnerX = W * 0.75
  const burnerY = tableY - 8
  ctx.fillStyle = '#475569'
  ctx.fillRect(burnerX - 20, burnerY - 4, 40, 4)
  ctx.fillStyle = '#334155'
  ctx.fillRect(burnerX - 3, burnerY - 18, 6, 14)

  // Burner flame
  if (props.burnerOn) {
    ctx.shadowColor = '#f97316'; ctx.shadowBlur = 12
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.moveTo(burnerX - 6, burnerY - 18)
    ctx.quadraticCurveTo(burnerX, burnerY - 36, burnerX + 6, burnerY - 18)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.moveTo(burnerX - 3, burnerY - 18)
    ctx.quadraticCurveTo(burnerX, burnerY - 28, burnerX + 3, burnerY - 18)
    ctx.fill()
  }

  // Draw containers
  for (const c of props.containers) {
    drawContainer(ctx, c)
  }
}

function drawContainer(ctx: CanvasRenderingContext2D, c: ChemistryContainer) {
  const x = c.x, y = c.y
  ctx.strokeStyle = 'rgba(148,163,184,0.5)'
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1.5

  if (c.type === 'beaker') {
    // Beaker shape
    const w = 50, h = 60
    ctx.beginPath()
    ctx.moveTo(x - w/2, y - h)
    ctx.lineTo(x - w/2, y - 4)
    ctx.quadraticCurveTo(x - w/2, y, x - w/2 + 5, y)
    ctx.lineTo(x + w/2 - 5, y)
    ctx.quadraticCurveTo(x + w/2, y, x + w/2, y - 4)
    ctx.lineTo(x + w/2, y - h)
    ctx.stroke()
    ctx.fill()

    // Lip
    ctx.beginPath(); ctx.moveTo(x - w/2 - 3, y - h); ctx.lineTo(x + w/2 + 3, y - h); ctx.stroke()

    // Volume fill
    if (c.volume > 0) {
      const fillH = Math.min(h - 8, (c.volume / 100) * h)
      ctx.fillStyle = c.color + '88'
      ctx.fillRect(x - w/2 + 2, y - fillH - 4, w - 4, fillH)
      // Volume label
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText(c.volume + ' مل', x, y + 12)
    }
  } else if (c.type === 'erlenmeyer') {
    // Erlenmeyer flask
    const bw = 40, tw = 14, h = 65, neckH = 18
    ctx.beginPath()
    ctx.moveTo(x - tw/2, y - h)
    ctx.lineTo(x + tw/2, y - h)
    ctx.lineTo(x + bw/2, y - neckH)
    ctx.quadraticCurveTo(x + bw/2, y, x + bw/2 - 3, y)
    ctx.lineTo(x - bw/2 + 3, y)
    ctx.quadraticCurveTo(x - bw/2, y, x - bw/2, y - neckH)
    ctx.closePath()
    ctx.stroke(); ctx.fill()

    // Volume fill
    if (c.volume > 0) {
      const fillH = Math.min(h - neckH - 4, (c.volume / 100) * h)
      ctx.fillStyle = c.color + '88'
      ctx.beginPath()
      ctx.moveTo(x - tw/2, y - fillH - neckH)
      ctx.lineTo(x + tw/2, y - fillH - neckH)
      ctx.lineTo(x + bw/2 - 2, y - neckH)
      ctx.lineTo(x - bw/2 + 2, y - neckH)
      ctx.closePath(); ctx.fill()
    }

    // Label
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
    ctx.fillText(c.label, x, y + 12)
  }

  // pH indicator dot
  if (c.ph !== 7) {
    ctx.fillStyle = c.ph < 7 ? '#ef4444' : '#22c55e'
    ctx.beginPath(); ctx.arc(x + 18, y - 8, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'
    ctx.fillText(' pH ' + c.ph.toFixed(1), x + 24, y - 4)
  }
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  canvas.width = parent.clientWidth
  canvas.height = parent.clientHeight
  draw()
}

let ro: ResizeObserver | null = null
onMounted(() => { resize(); window.addEventListener('resize', resize); ro = new ResizeObserver(resize); if (canvasRef.value?.parentElement) ro.observe(canvasRef.value.parentElement) })
onUnmounted(() => { window.removeEventListener('resize', resize); ro?.disconnect() })

watch(() => [props.containers, props.burnerOn], draw, { deep: true })
</script>

<template>
  <div class="canvas-wrap">
    <canvas ref="canvasRef" class="chem-canvas" />
    <div class="canvas-hint">
      <span>&#x2697; مختبر الكيمياء — طاولة العمل</span>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrap { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; }
.chem-canvas { width: 100%; flex: 1; min-height: 0; border-radius: 8px; touch-action: none; display: block; background: #0f172a; }
.canvas-hint { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-size: .66rem; color: rgba(100,116,139,0.55); pointer-events: none; z-index: 5; }
</style>
