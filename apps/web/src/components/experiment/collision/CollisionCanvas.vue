<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { CollisionParams, CollisionState } from '../../../modules/physics/experiments/collision/useCollisionPhysics'

const props = defineProps<{
  params: CollisionParams
  simState: CollisionState
}>()

const emit = defineEmits<{
  (e: 'snapshot', dataUrl: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#f8fafc')
  grad.addColorStop(1, '#e2e8f0')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Track
  const cy = h / 2
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, cy + 40)
  ctx.lineTo(w - 40, cy + 40)
  ctx.stroke()

  // Scale markers
  ctx.fillStyle = '#64748b'
  ctx.font = '11px Segoe UI'
  ctx.textAlign = 'center'
  for (let i = -5; i <= 5; i++) {
    const px = w / 2 + i * 60
    ctx.beginPath()
    ctx.moveTo(px, cy + 38)
    ctx.lineTo(px, cy + 42)
    ctx.stroke()
    ctx.fillText(`${i}m`, px, cy + 55)
  }

  const { x1, x2, v1, v2, v1f, v2f, collided } = props.simState
  const { r1, r2 } = props.params
  const scale = 60 // px per meter
  const cx1 = w / 2 + x1 * scale
  const cx2 = w / 2 + x2 * scale
  const sr1 = Math.max(8, r1 * scale)
  const sr2 = Math.max(8, r2 * scale)

  // Ball 1 (blue)
  ctx.beginPath()
  ctx.arc(cx1, cy, sr1, 0, Math.PI * 2)
  ctx.fillStyle = '#3b82f6'
  ctx.fill()
  ctx.strokeStyle = '#1d4ed8'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px Segoe UI'
  ctx.textAlign = 'center'
  ctx.fillText('m₁', cx1, cy + 4)

  // Ball 2 (red)
  ctx.beginPath()
  ctx.arc(cx2, cy, sr2, 0, Math.PI * 2)
  ctx.fillStyle = '#ef4444'
  ctx.fill()
  ctx.strokeStyle = '#b91c1c'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.fillText('m₂', cx2, cy + 4)

  // Velocity arrows
  const _ctx = ctx
  function drawArrow(c: CanvasRenderingContext2D, x: number, y: number, v: number, color: string, r: number) {
    if (Math.abs(v) < 0.1) return
    const len = Math.min(60, Math.abs(v) * 15)
    const dir = v > 0 ? 1 : -1
    c.strokeStyle = color
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(x, y - r - 15)
    c.lineTo(x + len * dir, y - r - 15)
    c.stroke()
    // Arrow head
    c.beginPath()
    c.moveTo(x + len * dir, y - r - 15)
    c.lineTo(x + len * dir - 6 * dir, y - r - 19)
    c.lineTo(x + len * dir - 6 * dir, y - r - 11)
    c.closePath()
    c.fillStyle = color
    c.fill()
    // Label
    c.fillStyle = color
    c.font = '10px Segoe UI'
    c.textAlign = 'center'
    c.fillText(`${v.toFixed(1)}`, x + (len * dir) / 2, y - r - 22)
  }

  drawArrow(_ctx, cx1, cy, collided ? (v1f ?? 0) : v1, '#059669', sr1)
  drawArrow(_ctx, cx2, cy, collided ? (v2f ?? 0) : v2, '#059669', sr2)

  // Status text
  ctx.fillStyle = '#475569'
  ctx.font = '13px Segoe UI'
  ctx.textAlign = 'center'
  let status = ''
  if (!props.simState.running) status = 'اضغط "بدء" لإطلاق الكرتين'
  else if (props.simState.paused) status = 'متوقف مؤقتاً'
  else if (collided) status = '💥 تصادم!'
  else status = 'الكرتان تتحركان...'
  ctx.fillText(status, w / 2, 24)

  // Data overlay
  if (collided && v1f !== null && v2f !== null) {
    ctx.fillStyle = '#1e293b'
    ctx.font = '11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`v₁f = ${v1f.toFixed(2)} m/s`, 10, h - 40)
    ctx.fillText(`v₂f = ${v2f.toFixed(2)} m/s`, 10, h - 24)
  }
}

function captureSnapshot() {
  const canvas = canvasRef.value
  if (!canvas) return ''
  return canvas.toDataURL('image/png')
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const wrap = canvas.parentElement
  if (!wrap) return
  canvas.width = wrap.clientWidth
  canvas.height = wrap.clientHeight
  draw()
}

watch(() => props.simState, draw, { deep: true })

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})
onUnmounted(() => window.removeEventListener('resize', resize))

defineExpose({ captureSnapshot })
</script>

<template>
  <div class="collision-canvas-wrap">
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.collision-canvas-wrap { flex: 1; min-height: 0; position: relative; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.collision-canvas-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
</style>
