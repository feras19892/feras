<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { LeverParams, LeverState } from '../../../modules/physics/experiments/lever/useLeverPhysics'
import { snapPosition } from '../../../composables/lever/leverUtils'

const props = defineProps<{
  params: LeverParams
  simState: LeverState
}>()

const emit = defineEmits<{
  (e: 'addBall', mass: number, x: number): void
  (e: 'addForce', force: number, x: number, direction: 1 | -1): void
  (e: 'removeBall', id: number): void
  (e: 'moveBall', id: number, x: number): void
  (e: 'setBallMass', id: number, mass: number): void
  (e: 'removeForce', id: number): void
  (e: 'moveForce', id: number, x: number): void
  (e: 'toggleForceDirection', id: number): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLDivElement | null>(null)

let draggingId: number | null = null

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2 + 40
  const scale = (w - 80) / props.params.beamLength
  const tilt = props.simState.tiltDeg * Math.PI / 180

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(tilt)

  // Beam
  const halfLen = (props.params.beamLength / 2) * scale
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(-halfLen, 0)
  ctx.lineTo(halfLen, 0)
  ctx.stroke()

  // Snap pegs
  ctx.fillStyle = '#475569'
  const step = props.params.snapStep
  for (let x = -props.params.beamLength / 2; x <= props.params.beamLength / 2 + 1e-6; x += step) {
    const px = x * scale
    ctx.beginPath()
    ctx.arc(px, 0, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.save()
    ctx.translate(px, 8)
    ctx.rotate(-tilt)
    ctx.fillStyle = '#64748b'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(Math.round(x * 10) / 10), 0, 0)
    ctx.restore()
  }

  // Pivot
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-10, 18)
  ctx.lineTo(10, 18)
  ctx.closePath()
  ctx.fill()

  // Balls (Circles)
  for (const b of props.simState.balls) {
    const px = b.x * scale
    const r = 8 + b.mass * 4
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(px, -r - 6, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Ball label
    ctx.save()
    ctx.translate(px, -r - 6)
    ctx.rotate(-tilt)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(b.isUnknown ? '?' : String(b.mass), 0, 0)
    ctx.restore()
  }

  // Forces (Arrows)
  for (const f of props.simState.forces) {
    const px = f.x * scale
    const arrowLen = (f.force / 100) * 60
    const endY = f.direction === 1 ? -arrowLen - 20 : arrowLen + 20

    ctx.strokeStyle = f.color
    ctx.fillStyle = f.color
    ctx.lineWidth = 3

    // Shaft
    ctx.beginPath()
    ctx.moveTo(px, -10)
    ctx.lineTo(px, endY)
    ctx.stroke()

    // Arrowhead
    const headSize = 7
    const headY = f.direction === 1 ? endY + headSize : endY - headSize
    ctx.beginPath()
    ctx.moveTo(px, endY)
    ctx.lineTo(px - headSize / 2, headY)
    ctx.lineTo(px + headSize / 2, headY)
    ctx.closePath()
    ctx.fill()

    // Label
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const labelY = f.direction === 1 ? endY - 10 : endY + 10
    ctx.fillText(f.isUnknown ? '?' : `${f.force}N`, px, labelY)
  }

  ctx.restore()

  // Status text
  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  const status = props.simState.isBalanced
    ? '⚖️ متوازن'
    : `τ = ${props.simState.netTorque.toFixed(2)} N·m`
  ctx.fillText(status, w / 2, 24)
}

function toWorldX(clientX: number): number {
  const canvas = canvasRef.value
  if (!canvas) return 0
  const rect = canvas.getBoundingClientRect()
  const cx = canvas.width / 2
  const scale = (canvas.width - 80) / props.params.beamLength
  return (clientX - rect.left - cx) / scale
}

let dragType: 'ball' | 'force' | null = null

function onPointerDown(e: PointerEvent) {
  const x = toWorldX(e.clientX)
  const snapped = snapPosition(x, props.params.snapStep, props.params.beamLength)
  const hitBall = props.simState.balls.find(b => Math.abs(b.x - snapped) < 0.3)
  const hitForce = props.simState.forces.find(f => Math.abs(f.x - snapped) < 0.3)
  if (hitBall) {
    dragType = 'ball'
    draggingId = hitBall.id
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  } else if (hitForce) {
    dragType = 'force'
    draggingId = hitForce.id
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  } else {
    emit('addBall', 1, snapped)
  }
}

function onPointerMove(e: PointerEvent) {
  if (draggingId === null || dragType === null) return
  const x = toWorldX(e.clientX)
  if (dragType === 'ball') emit('moveBall', draggingId, x)
  else emit('moveForce', draggingId, x)
}

function onPointerUp() {
  draggingId = null
  dragType = null
}

function onDblClick(e: MouseEvent) {
  const x = toWorldX(e.clientX)
  const snapped = snapPosition(x, props.params.snapStep, props.params.beamLength)
  const hitBall = props.simState.balls.find(b => Math.abs(b.x - snapped) < 0.3)
  const hitForce = props.simState.forces.find(f => Math.abs(f.x - snapped) < 0.3)
  if (hitBall) {
    const val = prompt(`تغيير كتلة الكرة (الحالية: ${hitBall.mass} kg):`, String(hitBall.mass))
    if (val !== null) {
      const num = parseFloat(val)
      if (!isNaN(num) && num > 0) emit('setBallMass', hitBall.id, num)
    }
  } else if (hitForce) {
    emit('toggleForceDirection', hitForce.id)
  }
}

watch(() => [props.simState.tiltDeg, props.simState.balls.length, props.simState.forces.length, props.simState.netTorque], draw, { deep: true })

let ro: ResizeObserver | null = null
onMounted(() => {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return
  const resize = () => {
    canvas.width = wrap.clientWidth
    canvas.height = wrap.clientHeight
    draw()
  }
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(wrap)
})
onUnmounted(() => { if (ro) ro.disconnect() })
</script>

<template>
  <div class="lever-wrap" ref="wrapRef">
    <canvas
      ref="canvasRef"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @dblclick="onDblClick"
    />
  </div>
</template>

<style scoped>
.lever-wrap { position:relative; flex:1; min-height:0; overflow:hidden; background:#0f172a; border-radius:8px; border:1px solid #2D3645; }
.lever-wrap canvas { position:absolute; inset:0; width:100%; height:100%; display:block; cursor:pointer; }
</style>
