<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { NetForceParams, NetForceState, NetForceMeasured } from '../../../modules/physics/experiments/netforce/useNetForcePhysics'
import { toRad, calcEquilibrium, calcCentripetal } from '../../../composables/netforce/netforceUtils'


const props = defineProps<{
  params: NetForceParams
  simState: NetForceState
  measured: NetForceMeasured
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId: number | null = null
const zoom = ref(1)
const trail: { x: number; y: number }[] = []
let flashAlpha = 0

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.3, Math.min(5, zoom.value * delta))
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (typeof ctx.roundRect !== 'function') {
    const proto = CanvasRenderingContext2D.prototype as any
    proto.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
      this.moveTo(x + r, y)
      this.lineTo(x + w - r, y)
      this.quadraticCurveTo(x + w, y, x + w, y + r)
      this.lineTo(x + w, y + h - r)
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      this.lineTo(x + r, y + h)
      this.quadraticCurveTo(x, y + h, x, y + h - r)
      this.lineTo(x, y + r)
      this.quadraticCurveTo(x, y, x + r, y)
    }
  }

  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
  ctx.scale(devicePixelRatio, devicePixelRatio)
  const cw = canvas.clientWidth
  const ch = canvas.clientHeight

  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, cw, ch)

  ctx.strokeStyle = '#161B22'
  ctx.lineWidth = 0.5
  for (let x = 0; x < cw; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke() }
  for (let y = 0; y < ch; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke() }

  if (props.params.mode === 'equilibrium') drawEquilibrium(ctx, cw, ch)
  else drawCentripetal(ctx, cw, ch)
}

function applyZoom(ctx: CanvasRenderingContext2D, cw: number, ch: number): { cx: number; cy: number } {
  const cx = cw / 2
  const cy = ch / 2
  ctx.translate(cx, cy)
  ctx.scale(zoom.value, zoom.value)
  ctx.translate(-cx, -cy)
  return { cx, cy }
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, color: string, label: string, perpOffset = 0) {
  const ex = x + Math.cos(angle) * length
  const ey = y + Math.sin(angle) * length
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(ex, ey)
  ctx.stroke()
  const headSize = 10
  ctx.beginPath()
  ctx.moveTo(ex, ey)
  ctx.lineTo(ex - Math.cos(angle - 0.4) * headSize, ey - Math.sin(angle - 0.4) * headSize)
  ctx.lineTo(ex - Math.cos(angle + 0.4) * headSize, ey - Math.sin(angle + 0.4) * headSize)
  ctx.closePath()
  ctx.fill()
  // Label beyond the tip with background pill, offset perpendicular to arrow direction
  const labelDist = 14
  const lx = ex + Math.cos(angle) * labelDist - Math.sin(angle) * perpOffset
  const ly = ey + Math.sin(angle) * labelDist + Math.cos(angle) * perpOffset
  ctx.font = 'bold 11px sans-serif'
  const tw = ctx.measureText(label).width
  ctx.fillStyle = 'rgba(13,17,23,0.9)'
  ctx.beginPath()
  ctx.roundRect(lx - 4, ly - 9, tw + 8, 15, 3)
  ctx.fill()
  ctx.fillStyle = color
  ctx.fillText(label, lx, ly + 2)
}

function drawEquilibrium(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const p = props.params
  const { cx, cy } = applyZoom(ctx, cw, ch)
  const baseCy = cy + 40 * zoom.value
  const surfRad = toRad(p.surfaceAngle)
  const boxSize = 30 * zoom.value

  // Surface line
  const surfLen = 200 * zoom.value
  const x1 = cx - Math.cos(surfRad) * surfLen
  const y1 = baseCy + Math.sin(surfRad) * surfLen
  const x2 = cx + Math.cos(surfRad) * surfLen
  const y2 = baseCy - Math.sin(surfRad) * surfLen

  ctx.strokeStyle = '#3a4a5c'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()

  // Hatching
  const hatchLen = 12 * zoom.value
  for (let i = -surfLen; i < surfLen; i += 15 * zoom.value) {
    const px = cx + Math.cos(surfRad) * i
    const py = baseCy - Math.sin(surfRad) * i
    ctx.strokeStyle = '#2a3a4c'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(px, py)
    ctx.lineTo(px + Math.sin(surfRad) * hatchLen, py + Math.cos(surfRad) * hatchLen)
    ctx.stroke()
  }

  // Box position: offset along surface by simState.position
  const posScale = 60 * zoom.value
  const boxOffsetX = Math.cos(surfRad) * props.simState.position * posScale
  const boxOffsetY = -Math.sin(surfRad) * props.simState.position * posScale
  const boxCx = cx + boxOffsetX
  const boxCyOnSurface = baseCy + boxOffsetY

  // Trail behind box when sliding
  if (props.simState.running && !props.simState.paused && props.simState.motionState === 'sliding') {
    trail.push({ x: boxCx, y: boxCyOnSurface })
    if (trail.length > 40) trail.shift()
  } else if (!props.simState.running) {
    trail.length = 0
  }
  for (let i = 0; i < trail.length - 1; i++) {
    const alpha = (i / trail.length) * 0.4
    ctx.strokeStyle = `rgba(74,127,181,${alpha})`
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(trail[i].x, trail[i].y); ctx.lineTo(trail[i + 1].x, trail[i + 1].y); ctx.stroke()
  }

  // Shadow under box
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(boxCx, boxCyOnSurface + 4, boxSize * 0.6, boxSize * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Box rotated to surface
  ctx.save()
  ctx.translate(boxCx, boxCyOnSurface)
  ctx.rotate(-surfRad)
  ctx.translate(0, -boxSize / 2 - 2)
  // Color: green if equilibrium, orange if sliding, blue if rest
  const boxColor = props.simState.motionState === 'equilibrium' ? '#2ecc71'
    : props.simState.motionState === 'sliding' ? '#e67e22' : '#4a7fb5'
  ctx.fillStyle = boxColor
  ctx.fillRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize)
  ctx.restore()

  // Flash effect when equilibrium reached
  if (props.simState.motionState === 'equilibrium' && props.simState.settled) {
    flashAlpha = Math.max(flashAlpha, 0.5)
  }
  if (flashAlpha > 0) {
    ctx.save()
    ctx.strokeStyle = `rgba(46,204,113,${flashAlpha})`
    ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(boxCx, boxCyOnSurface - boxSize / 2, boxSize * 1.5, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
    flashAlpha -= 0.02
  }

  // Arrow origin = box center above surface
  const arrowOriginX = boxCx
  const arrowOriginY = boxCyOnSurface - boxSize / 2 * Math.cos(surfRad) - 2

  const eq = calcEquilibrium(p.mass, p.g, p.appliedForce, p.appliedAngle, p.mu, p.surfaceAngle, p.tension, p.tensionAngle, p.customForces)
  const scale = 3 * zoom.value

  // Weight: straight down in canvas = π/2
  drawArrow(ctx, arrowOriginX, arrowOriginY, Math.PI / 2, Math.max(45, eq.weight * scale), '#e74c3c', `W=${eq.weight.toFixed(1)}`, 18)

  // Normal: perpendicular to surface, pointing up
  const nAngle = Math.atan2(-Math.cos(surfRad), -Math.sin(surfRad))
  if (eq.normalForce > 0.01) {
    drawArrow(ctx, arrowOriginX, arrowOriginY, nAngle, Math.max(45, eq.normalForce * scale), '#3498db', `N=${eq.normalForce.toFixed(1)}`, 18)
  }

  // Applied force
  if (p.appliedForce > 0.01) {
    drawArrow(ctx, arrowOriginX, arrowOriginY, -toRad(p.appliedAngle), Math.max(45, p.appliedForce * scale), '#2ecc71', `F=${p.appliedForce.toFixed(1)}`, -18)
  }

  // Friction: along surface, color depends on static vs kinetic
  if (Math.abs(eq.frictionForce) > 0.01) {
    const fDir = eq.frictionForce > 0 ? -surfRad : -surfRad + Math.PI
    const fColor = eq.isStatic ? '#e67e22' : '#f39c12'
    drawArrow(ctx, arrowOriginX, arrowOriginY, fDir, Math.max(40, Math.abs(eq.frictionForce) * scale), fColor, `f=${Math.abs(eq.frictionForce).toFixed(1)}`, -18)
  }

  // Tension
  if (p.tension > 0.01) {
    drawArrow(ctx, arrowOriginX, arrowOriginY, -toRad(p.tensionAngle), Math.max(45, p.tension * scale), '#9b59b6', `T=${p.tension.toFixed(1)}`, 18)
  }

  // Custom forces
  const customColors = ['#1abc9c', '#e91e63', '#ff9800', '#00bcd4', '#8bc34a']
  p.customForces.forEach((cf, i) => {
    drawArrow(ctx, arrowOriginX, arrowOriginY, -toRad(cf.angle), Math.max(45, cf.magnitude * scale), customColors[i % customColors.length], `${cf.label}=${cf.magnitude.toFixed(1)}`, (i % 2 === 0 ? 18 : -18))
  })

  // Net force
  if (eq.netForce.mag > 0.05) {
    drawArrow(ctx, arrowOriginX, arrowOriginY, -toRad(eq.netForce.dir), Math.max(45, eq.netForce.mag * scale), '#f1c40f', `Fnet=${eq.netForce.mag.toFixed(2)}`, 22)
  }

  // Force breakdown — top-left with background
  const lines = [
    `W = ${eq.weight.toFixed(2)} N`,
    `N = ${eq.normalForce.toFixed(2)} N`,
    `f = ${eq.frictionForce.toFixed(2)} N`,
    `fmax = ${eq.maxStaticFriction.toFixed(2)} N`,
    `Fnet = ${eq.netForce.mag.toFixed(2)} N`,
  ]
  if (props.simState.running) {
    lines.push(`v = ${props.simState.velocity.toFixed(3)} m/s`)
    lines.push(`x = ${props.simState.position.toFixed(3)} m`)
  }
  ctx.font = '11px sans-serif'
  const maxW = Math.max(...lines.map(l => ctx.measureText(l).width))
  ctx.fillStyle = 'rgba(13,17,23,0.7)'
  ctx.fillRect(5, 5, maxW + 12, lines.length * 15 + 8)
  ctx.fillStyle = '#8b9bb5'
  lines.forEach((line, i) => ctx.fillText(line, 10, 20 + i * 15))
}

function drawCentripetal(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const p = props.params
  const { cx, cy } = applyZoom(ctx, cw, ch)
  const r = Math.min(p.radius * 100 * zoom.value, Math.min(cw, ch) / 2 - 60)

  ctx.strokeStyle = '#2a3a4c'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#3a4a5c'
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#4a5a6c'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + Math.cos(props.simState.angle) * r, cy + Math.sin(props.simState.angle) * r)
  ctx.stroke()

  const bx = cx + Math.cos(props.simState.angle) * r
  const by = cy + Math.sin(props.simState.angle) * r

  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.arc(bx, by, 12, 0, Math.PI * 2)
  ctx.fill()

  const c = calcCentripetal(p.mass, p.angularVelocity, p.radius)
  const fcScale = 2

  const fcAngle = Math.atan2(cy - by, cx - bx)
  drawArrow(ctx, bx, by, fcAngle, Math.min(c.fc * fcScale, r - 20), '#e74c3c', `Fc=${c.fc.toFixed(2)}`, 18)

  const vAngle = props.simState.angle + Math.PI / 2
  drawArrow(ctx, bx, by, vAngle, Math.min(c.v * 10, 60), '#2ecc71', `v=${c.v.toFixed(2)}`, -18)

  ctx.fillStyle = '#8b9bb5'
  ctx.font = '12px sans-serif'
  ctx.fillText(`r=${p.radius.toFixed(2)}m`, cx + 10, cy - 10)
  ctx.fillText(`ω=${p.angularVelocity.toFixed(2)}rad/s`, cx + 10, cy + 8)
  ctx.fillText(`T=${c.period.toFixed(2)}s`, cx + 10, cy + 24)
  ctx.fillText(`ac=${c.ac.toFixed(2)}m/s²`, 10, 25)
}

function loop() { draw(); rafId = requestAnimationFrame(loop) }

onMounted(() => { loop() })
onUnmounted(() => { if (rafId) cancelAnimationFrame(rafId) })
watch(() => props.params, () => draw(), { deep: true })
</script>

<template>
  <canvas ref="canvasRef" class="netforce-canvas" @wheel="onWheel" />
</template>

<style scoped>
.netforce-canvas { width: 100%; height: 100%; display: block; border-radius: 8px; }
</style>
