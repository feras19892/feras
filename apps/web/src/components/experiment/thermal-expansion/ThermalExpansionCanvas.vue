<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ALPHA } from '../../../composables/thermal-expansion/useThermalExpansionCalculations'
import {
  materialColor, adjustBrightness,
  drawClampStand, drawBurner, drawRuler, drawThermometer,
} from '../../../composables/thermal-expansion/thermalExpansionCanvas.utils'

const props = defineProps<{
  material: string
  L0: number
  t0: number
  t1: number
  currentT: number
  phase: 'ready' | 'heating' | 'done'
  running: boolean
  paused: boolean
  highlightField?: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let lastTs = 0

const emit = defineEmits<{ (e: 'updateSim', dt: number): void }>()

function getCtx() { const c = canvasRef.value; return c ? c.getContext('2d') : null }
function getSize(): { dpr: number } {
  const c = canvasRef.value
  if (!c) return { dpr: 1 }
  const rect = c.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  c.width = Math.round(rect.width * dpr)
  c.height = Math.round(rect.height * dpr)
  return { dpr }
}
function W() { return canvasRef.value ? canvasRef.value.getBoundingClientRect().width : 600 }
function H() { return canvasRef.value ? canvasRef.value.getBoundingClientRect().height : 400 }

function draw() {
  const ctx = getCtx()
  if (!ctx) return
  const { dpr } = getSize()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const w = W(), h = H()
  ctx.fillStyle = '#0B1220'
  ctx.fillRect(0, 0, w, h)

  const scale = Math.min(w / 560, h / 360)
  const s = (v: number) => v * scale
  const leftMargin = s(40)
  const tableY = h - s(45)
  const rightPad = s(30)

  // === TABLE TOP ===
  ctx.fillStyle = '#1A232E'
  ctx.fillRect(0, tableY, w, s(45))
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = s(1)
  ctx.beginPath(); ctx.moveTo(0, tableY); ctx.lineTo(w, tableY); ctx.stroke()
  ctx.fillStyle = '#2D3645'; ctx.fillRect(0, tableY, w, s(2))

  // === CLAMP STAND ===
  const clampX = leftMargin + s(15)
  drawClampStand(ctx, clampX, tableY, s)

  // === SETUP POSITIONS ===
  const rodY = tableY - s(72)
  const rodH = s(10)
  const rodL0px = s(220)
  const rodX = clampX + s(33)
  const maxRodEnd = w - rightPad
  const burnerX = rodX + rodL0px * 0.5

  // Real ΔL for physics, visual ΔL magnified ×80
  const realAlpha = (ALPHA[props.material] ?? 16.5)
  const realDL = (props.currentT - props.t0) * props.L0 * realAlpha * 1e-6
  const VISUAL_MAG = 80
  const expansionPx = props.phase === 'ready' ? 0 : realDL * s(220) * VISUAL_MAG / props.L0
  const rodL = Math.min(rodL0px + expansionPx, maxRodEnd - rodX)
  const tipX = rodX + rodL

  const rodColor = materialColor(props.currentT, props.material)
  const rGrad = ctx.createLinearGradient(0, rodY, 0, rodY + rodH)
  rGrad.addColorStop(0, rodColor)
  rGrad.addColorStop(0.5, adjustBrightness(rodColor, 20))
  rGrad.addColorStop(1, adjustBrightness(rodColor, -20))
  ctx.fillStyle = rGrad
  ctx.fillRect(rodX, rodY, rodL, rodH)
  ctx.strokeStyle = '#1e2530'; ctx.lineWidth = s(0.8)
  ctx.strokeRect(rodX, rodY, rodL, rodH)

  // Rod glow proportional to temperature (even in ready, shows t0 glow)
  const tempRatio = Math.max(0, Math.min(1, (props.currentT - 20) / 100))
  if (tempRatio > 0.1) {
    const glowAlpha = tempRatio * 0.25
    const glowR = s(8 + tempRatio * 6)
    const glowGrad = ctx.createRadialGradient(rodX + rodL/2, rodY + rodH/2, 0, rodX + rodL/2, rodY + rodH/2, glowR + rodL/2)
    glowGrad.addColorStop(0, `rgba(255,${Math.round(100 - tempRatio * 40)},${Math.round(50 - tempRatio * 30)},${glowAlpha})`)
    glowGrad.addColorStop(1, 'rgba(255,100,50,0)')
    ctx.fillStyle = glowGrad
    ctx.fillRect(rodX - glowR, rodY - glowR, rodL + glowR*2, rodH + glowR*2)
  }

  // Heat haze during heating
  if (props.phase === 'heating') {
    const time = Date.now() / 1000
    const g = ctx.createLinearGradient(0, rodY - s(10), 0, rodY + rodH + s(5))
    g.addColorStop(0, 'rgba(255,100,30,0)')
    g.addColorStop(0.5, `rgba(255,${120 + Math.sin(time * 3) * 20},40,${0.1 + Math.sin(time * 2) * 0.04})`)
    g.addColorStop(1, 'rgba(255,100,30,0)')
    ctx.fillStyle = g
    ctx.fillRect(rodX - s(3), rodY - s(10), rodL + s(6), rodH + s(15))

    // Rising heat particles from burner
    const nHeat = 6
    for (let i = 0; i < nHeat; i++) {
      const ht = (time * 0.8 + i * 0.7) % 2
      const hx = burnerX + Math.sin(time * 2 + i * 1.3) * s(8)
      const hy = tableY - s(20) - ht * s(30)
      const hAlpha = ht < 0.3 ? ht / 0.3 : (2 - ht) / 1.7
      ctx.fillStyle = `rgba(255,${160 + Math.sin(i * 3) * 40},${60 + Math.cos(i * 2) * 30},${hAlpha * 0.5})`
      ctx.beginPath(); ctx.arc(hx, hy, s(1 + ht), 0, Math.PI * 2); ctx.fill()
    }
  }

  // === MOVING POINTER (green arrow + delta label BELOW ruler) ===
  if (expansionPx > s(0.5)) {
    const arrowTipY = rodY + rodH + s(20)
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = s(1.5)
    ctx.beginPath(); ctx.moveTo(tipX, rodY + rodH); ctx.lineTo(tipX, arrowTipY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(tipX, arrowTipY); ctx.lineTo(tipX - s(3), arrowTipY - s(4)); ctx.lineTo(tipX + s(3), arrowTipY - s(4)); ctx.closePath(); ctx.fillStyle = '#22c55e'; ctx.fill()

    const dlText = `+${(realDL * 1000).toFixed(2)} mm`
    ctx.fillStyle = '#22c55e'; ctx.font = `bold ${s(9)}px sans-serif`
    const labelY = arrowTipY + s(10)
    if (tipX > w - s(50)) {
      ctx.textAlign = 'right'
      ctx.fillText(dlText, tipX - s(4), labelY)
    } else {
      ctx.textAlign = 'left'
      ctx.fillText(dlText, tipX + s(4), labelY)
    }
  }

  // === GHOST TARGET POINTER in ready phase (shows expected expansion at t1) ===
  if (props.phase === 'ready') {
    const targetDL = (props.t1 - props.t0) * props.L0 * realAlpha * 1e-6
    const targetPx = targetDL * s(220) * VISUAL_MAG / props.L0
    if (targetPx > s(1)) {
      const ghostX = rodX + Math.min(targetPx + rodL0px, maxRodEnd - rodX)
      ctx.strokeStyle = 'rgba(34,197,94,0.3)'; ctx.lineWidth = s(1); ctx.setLineDash([s(3), s(3)])
      ctx.beginPath(); ctx.moveTo(ghostX, rodY - s(2)); ctx.lineTo(ghostX, rodY + rodH + s(2)); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(34,197,94,0.5)'; ctx.font = `${s(7)}px sans-serif`; ctx.textAlign = 'center'
      ctx.fillText(`الهدف: +${(targetDL * 1000).toFixed(2)}mm`, ghostX, rodY - s(4))
    }
  }

  // === BUNSEN BURNER (centered under rod) ===
  drawBurner(ctx, burnerX, tableY, s, props.phase === 'heating')

  // === RULER (under rod, from clamp to fixed L0 mark) ===
  const rulerY = rodY + rodH + s(10)
  drawRuler(ctx, rodX, rulerY, rodL0px, s, expansionPx)

  // === THERMOMETER (right side, standing on table) ===
  const thermX = w - s(45)
  drawThermometer(ctx, thermX, tableY - s(85), props.currentT, s)
  // thermometer label
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(7)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('🌡️ الحرارة', thermX + s(10), tableY + s(12))

  // === L0 LABEL + TEMP (above rod) ===
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(8)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`L₀ = ${props.L0.toFixed(2)} m`, rodX + rodL0px * 0.5, rodY - s(16))
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${s(9)}px sans-serif`
  ctx.fillText(`${Math.round(props.currentT)}°C`, burnerX, rodY - s(6))

  // === PHASE LABEL (top center) — no numbers to avoid RTL issues ===
  ctx.textAlign = 'center'
  const labels: Record<string, { text: string; color: string }> = {
    ready: { text: '🔥 جاهز — اضغط Start', color: '#64748b' },
    heating: { text: '🔥 جاري التسخين...', color: '#fbbf24' },
    done: { text: '✅ توازن حراري', color: '#22c55e' },
  }
  const pl = labels[props.phase]
  ctx.fillStyle = pl.color; ctx.font = `bold ${s(12)}px sans-serif`
  ctx.fillText(pl.text, w / 2, s(18))

  // === BOTTOM INFO BAR ===
  ctx.textAlign = 'left'
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(7.5)}px sans-serif`
  const matAr: Record<string, string> = { copper: 'نحاس', aluminum: 'ألمنيوم', iron: 'حديد', steel: 'فولاذ', brass: 'سبائك نحاس', glass: 'زجاج' }
  const matName = matAr[props.material] || props.material
  ctx.fillText(`${matName}  α=${realAlpha.toFixed(1)}×10⁻⁶/K  |  L₀=${props.L0.toFixed(2)}m  ΔL=${(realDL*1000).toFixed(2)}mm  L₁=${(props.L0+realDL).toFixed(4)}m`, s(10), h - s(10))
  ctx.textAlign = 'right'
  ctx.fillStyle = props.currentT > props.t0 ? '#fbbf24' : '#8B95A5'
  ctx.fillText(`t = ${props.currentT.toFixed(1)}°C`, w - s(10), h - s(10))
  ctx.textAlign = 'start'

  // === HIGHLIGHT EFFECTS (linked from ReadingsPanel hover) ===
  const hf = props.highlightField
  const time = Date.now() / 1000
  const flash = 0.5 + Math.sin(time * 5) * 0.3 // pulsing 0.2-0.8

  if (hf === 'material' || hf === 'alpha') {
    // Glow around the entire rod
    const hg = ctx.createRadialGradient(rodX + rodL/2, rodY + rodH/2, 0, rodX + rodL/2, rodY + rodH/2, rodL/2 + s(20))
    hg.addColorStop(0, `rgba(255,255,255,${flash * 0.15})`)
    hg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = hg
    ctx.fillRect(rodX - s(20), rodY - s(20), rodL + s(40), rodH + s(40))
  }
  if (hf === 'L0') {
    // Vertical green line at rod start
    ctx.strokeStyle = `rgba(34,197,94,${flash})`; ctx.lineWidth = s(2)
    ctx.beginPath(); ctx.moveTo(rodX, rodY - s(8)); ctx.lineTo(rodX, rodY + rodH + s(8)); ctx.stroke()
  }
  if (hf === 't0' || hf === 't1' || hf === 't') {
    // Yellow glow around thermometer
    const tg = ctx.createRadialGradient(thermX, tableY - s(40), 0, thermX, tableY - s(40), s(30))
    tg.addColorStop(0, `rgba(251,191,36,${flash * 0.3})`)
    tg.addColorStop(1, 'rgba(251,191,36,0)')
    ctx.fillStyle = tg
    ctx.beginPath(); ctx.arc(thermX, tableY - s(40), s(30), 0, Math.PI * 2); ctx.fill()
  }
  if (hf === 'dL' || hf === 'L1') {
    // Green glow around rod tip / arrow
    const ag = ctx.createRadialGradient(tipX, rodY + rodH/2, 0, tipX, rodY + rodH/2, s(20))
    ag.addColorStop(0, `rgba(34,197,94,${flash * 0.3})`)
    ag.addColorStop(1, 'rgba(34,197,94,0)')
    ctx.fillStyle = ag
    ctx.beginPath(); ctx.arc(tipX, rodY + rodH/2, s(20), 0, Math.PI * 2); ctx.fill()
  }
}

function loop(ts: number) {
  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
  lastTs = ts
  emit('updateSim', dt)
  draw()
  animId = requestAnimationFrame(loop)
}

onMounted(() => { draw(); animId = requestAnimationFrame(loop) })
onUnmounted(() => cancelAnimationFrame(animId))
</script>
<template>
  <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block;" />
</template>
