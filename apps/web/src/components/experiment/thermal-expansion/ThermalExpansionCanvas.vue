<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ALPHA } from '../../../composables/thermal-expansion/useThermalExpansionCalculations'

const props = defineProps<{
  material: string
  L0: number
  t0: number
  t1: number
  currentT: number
  phase: 'ready' | 'heating' | 'done'
  running: boolean
  paused: boolean
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

function materialColor(t: number, mat: string): string {
  const base: Record<string, number[]> = {
    copper: [184, 115, 51], aluminum: [206, 206, 206], iron: [80, 80, 80],
    steel: [120, 120, 120], brass: [181, 166, 66], glass: [200, 220, 230],
  }
  const c = base[mat] || base.copper
  const r = Math.max(0, Math.min(1, (t - 20) / 100))
  return `rgb(${Math.min(255, c[0] + r * 60)},${Math.max(40, c[1] - r * 40)},${Math.max(40, c[2] - r * 60)})`
}

function drawClampStand(ctx: CanvasRenderingContext2D, x: number, y: number, s: (v: number) => number) {
  // Heavy iron base
  ctx.fillStyle = '#2A3540'
  ctx.fillRect(x - s(30), y - s(8), s(60), s(8))
  ctx.strokeStyle = '#1e2530'; ctx.lineWidth = s(1)
  ctx.strokeRect(x - s(30), y - s(8), s(60), s(8))
  // Base edge highlight
  ctx.fillStyle = '#3D4A5C'; ctx.fillRect(x - s(30), y - s(8), s(60), s(2))

  // Vertical rod (hollow tube look)
  const tubeW = s(6)
  const grad = ctx.createLinearGradient(x - tubeW / 2, 0, x + tubeW / 2, 0)
  grad.addColorStop(0, '#1A232E')
  grad.addColorStop(0.3, '#3D4A5C')
  grad.addColorStop(0.7, '#2A3540')
  grad.addColorStop(1, '#141A22')
  ctx.fillStyle = grad
  ctx.fillRect(x - tubeW / 2, y - s(90), tubeW, s(90))
  ctx.strokeStyle = '#1e2530'; ctx.lineWidth = s(0.5)
  ctx.strokeRect(x - tubeW / 2, y - s(90), tubeW, s(90))

  // Clamp arm (horizontal)
  const armY = y - s(72)
  ctx.fillStyle = '#2A3540'
  ctx.fillRect(x, armY - s(4), s(35), s(8))
  ctx.strokeStyle = '#1e2530'; ctx.strokeRect(x, armY - s(4), s(35), s(8))

  // Clamp jaws (U-shape gripping rod)
  const jawX = x + s(35)
  ctx.fillStyle = '#3D4A5C'
  ctx.fillRect(jawX - s(2), armY - s(10), s(4), s(20))
  ctx.strokeStyle = '#1e2530'; ctx.strokeRect(jawX - s(2), armY - s(10), s(4), s(20))
  // Jaw screws
  ctx.fillStyle = '#8B95A5'
  ctx.beginPath(); ctx.arc(jawX, armY - s(6), s(1.5), 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(jawX, armY + s(6), s(1.5), 0, Math.PI * 2); ctx.fill()
}

function drawBurner(ctx: CanvasRenderingContext2D, x: number, y: number, s: (v: number) => number, active: boolean) {
  // Burner body (metal)
  ctx.fillStyle = '#2A3540'
  ctx.beginPath()
  ctx.moveTo(x - s(8), y)
  ctx.lineTo(x + s(8), y)
  ctx.lineTo(x + s(6), y - s(20))
  ctx.lineTo(x - s(6), y - s(20))
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1e2530'; ctx.lineWidth = s(1); ctx.stroke()

  // Gas tube
  ctx.strokeStyle = '#2A3540'; ctx.lineWidth = s(3)
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s(15), y + s(5)); ctx.stroke()

  // Flame
  if (active) {
    const flicker = 3 * Math.sin(Date.now() / 150) + 2 * Math.cos(Date.now() / 230)
    const flameH = s(28 + flicker)
    const fGrad = ctx.createRadialGradient(x, y - s(20), 0, x, y - s(20) - flameH, flameH)
    fGrad.addColorStop(0, 'rgba(255,240,150,0.95)')
    fGrad.addColorStop(0.25, 'rgba(255,160,40,0.7)')
    fGrad.addColorStop(0.6, 'rgba(255,80,20,0.4)')
    fGrad.addColorStop(1, 'rgba(200,30,0,0)')
    ctx.fillStyle = fGrad
    ctx.beginPath()
    ctx.moveTo(x - s(5), y - s(20))
    ctx.quadraticCurveTo(x - s(8), y - s(20) - flameH * 0.5, x, y - s(20) - flameH)
    ctx.quadraticCurveTo(x + s(8), y - s(20) - flameH * 0.5, x + s(5), y - s(20))
    ctx.closePath(); ctx.fill()

    // Inner blue core
    const bGrad = ctx.createRadialGradient(x, y - s(20) - flameH * 0.3, 0, x, y - s(20) - flameH * 0.3, s(4))
    bGrad.addColorStop(0, 'rgba(100,180,255,0.8)')
    bGrad.addColorStop(1, 'rgba(100,180,255,0)')
    ctx.fillStyle = bGrad
    ctx.beginPath(); ctx.ellipse(x, y - s(20) - flameH * 0.3, s(3), s(6), 0, 0, Math.PI * 2); ctx.fill()
  }
}

function drawRuler(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, s: (v: number) => number, expansionPx: number) {
  // Ruler body
  ctx.fillStyle = '#1A232E'
  ctx.fillRect(x, y - s(6), len + s(40), s(14))
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = s(1)
  ctx.strokeRect(x, y - s(6), len + s(40), s(14))

  // Tick marks (mm scale, every 2mm)
  const pxPerMm = s(2)
  const maxMm = Math.ceil((len + s(40)) / pxPerMm)
  ctx.fillStyle = '#5B8DB8'; ctx.font = `${s(6)}px sans-serif`; ctx.textAlign = 'center'
  for (let mm = 0; mm <= maxMm; mm += 5) {
    const tx = x + mm * pxPerMm
    const h = mm % 10 === 0 ? s(5) : s(2)
    ctx.strokeStyle = mm % 10 === 0 ? '#5B8DB8' : '#3D4A5C'
    ctx.lineWidth = s(0.5)
    ctx.beginPath(); ctx.moveTo(tx, y - s(1)); ctx.lineTo(tx, y - s(1) - h); ctx.stroke()
    if (mm % 10 === 0 && mm > 0) {
      ctx.fillText(`${mm}`, tx, y - s(7))
    }
  }

  // Zero mark (L0 start)
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = s(1.5)
  ctx.beginPath(); ctx.moveTo(x, y - s(6)); ctx.lineTo(x, y + s(6)); ctx.stroke()

  // Expansion indicator arrow (visual only — real value shown on pointer above)
  if (expansionPx > s(2)) {
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = s(1.5)
    const arrowX = x + expansionPx
    ctx.beginPath(); ctx.moveTo(x, y + s(4)); ctx.lineTo(arrowX, y + s(4)); ctx.stroke()
    // Arrow head
    ctx.beginPath(); ctx.moveTo(arrowX, y + s(4)); ctx.lineTo(arrowX - s(4), y + s(2)); ctx.lineTo(arrowX - s(4), y + s(6)); ctx.closePath(); ctx.fillStyle = '#22c55e'; ctx.fill()
  }
}

function drawThermometer(ctx: CanvasRenderingContext2D, x: number, y: number, temp: number, s: (v: number) => number) {
  // Glass tube
  ctx.strokeStyle = '#4A6572'; ctx.lineWidth = s(2)
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + s(70)); ctx.stroke()
  // Bulb
  ctx.fillStyle = '#0B1220'; ctx.beginPath(); ctx.arc(x, y + s(76), s(6), 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#4A6572'; ctx.lineWidth = s(1.5)
  ctx.beginPath(); ctx.arc(x, y + s(76), s(6), 0, Math.PI * 2); ctx.stroke()

  // Mercury / alcohol column
  const maxT = 120, minT = 0
  const frac = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)))
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(x - s(1.5), y + s(70) - frac * s(70), s(3), frac * s(70))
  ctx.beginPath(); ctx.arc(x, y + s(76), s(3.5), 0, Math.PI * 2); ctx.fill()

  // Ticks
  ctx.fillStyle = '#5B8DB8'; ctx.font = `${s(6)}px sans-serif`; ctx.textAlign = 'left'
  for (let t = 0; t <= 100; t += 20) {
    const ty = y + s(70) - ((t - minT) / (maxT - minT)) * s(70)
    ctx.strokeStyle = '#3D4A5C'; ctx.lineWidth = s(0.5)
    ctx.beginPath(); ctx.moveTo(x + s(3), ty); ctx.lineTo(x + s(8), ty); ctx.stroke()
    ctx.fillText(`${t}°`, x + s(10), ty + s(2))
  }
  ctx.fillStyle = '#D1D7E0'; ctx.font = `bold ${s(9)}px sans-serif`
  ctx.fillText(`${Math.round(temp)}°C`, x + s(12), y + s(88))
}

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

  // === METAL ROD ===
  // Fixed visual length regardless of L0 parameter (L0 is just physics parameter)
  const rodY = tableY - s(72)
  const rodH = s(10)
  const rodL0px = s(220) // fixed 220px visual rod
  const rodX = clampX + s(33) // starts at clamp jaws
  const maxRodEnd = w - rightPad // don't go past here

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

  // Heat haze
  if (props.phase === 'heating') {
    const g = ctx.createLinearGradient(0, rodY - s(10), 0, rodY + rodH + s(5))
    g.addColorStop(0, 'rgba(255,100,30,0)')
    g.addColorStop(0.5, 'rgba(255,120,40,0.12)')
    g.addColorStop(1, 'rgba(255,100,30,0)')
    ctx.fillStyle = g
    ctx.fillRect(rodX - s(3), rodY - s(10), rodL + s(6), rodH + s(15))
  }

  // === MOVING POINTER (green arrow + label at free end) ===
  if (expansionPx > s(0.5)) {
    const label = `+${(realDL * 1000).toFixed(2)} mm`
    const labelW = s(60)
    // If tip is too close to right edge, draw label to the left
    const labelX = (tipX + s(10) + labelW > w) ? tipX - s(8) : tipX + s(8)
    const labelAlign: CanvasTextAlign = (tipX + s(10) + labelW > w) ? 'right' : 'left'

    // Pointer line down
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = s(1.5)
    ctx.beginPath(); ctx.moveTo(tipX, rodY + rodH); ctx.lineTo(tipX, rodY + rodH + s(18)); ctx.stroke()
    // Arrow head
    ctx.beginPath(); ctx.moveTo(tipX, rodY + rodH + s(18)); ctx.lineTo(tipX - s(3), rodY + rodH + s(14)); ctx.lineTo(tipX + s(3), rodY + rodH + s(14)); ctx.closePath(); ctx.fillStyle = '#22c55e'; ctx.fill()

    // Label
    ctx.fillStyle = '#22c55e'; ctx.font = `bold ${s(9)}px sans-serif`; ctx.textAlign = labelAlign
    ctx.fillText(label, labelX, rodY + rodH + s(24))
  }

  // === BUNSEN BURNER (centered under rod) ===
  const burnerX = rodX + rodL0px * 0.5
  drawBurner(ctx, burnerX, tableY, s, props.phase === 'heating')

  // === RULER (under rod, from clamp to fixed L0 mark) ===
  const rulerY = rodY + rodH + s(10)
  drawRuler(ctx, rodX, rulerY, rodL0px, s, expansionPx)

  // === THERMOMETER (left side, below ruler, small) ===
  const thermX = clampX - s(5)
  drawThermometer(ctx, thermX, rulerY + s(16), props.currentT, s)

  // === L0 LABEL (above rod) ===
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(8)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`L₀ = ${props.L0.toFixed(2)} m`, rodX + rodL0px * 0.5, rodY - s(12))

  // === PHASE LABEL (top center) ===
  ctx.textAlign = 'center'
  const labels: Record<string, { text: string; color: string }> = {
    ready: { text: '🔥 جاهز — اضغط Start', color: '#64748b' },
    heating: { text: '🔥 جاري التسخين...', color: '#fbbf24' },
    done: { text: '✅ توازن حراري', color: '#22c55e' },
  }
  const pl = labels[props.phase]
  ctx.fillStyle = pl.color; ctx.font = `bold ${s(12)}px sans-serif`
  ctx.fillText(pl.text, w / 2, s(18))

  // === BOTTOM INFO BAR (single line, compact) ===
  ctx.textAlign = 'left'
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(7.5)}px sans-serif`
  const info = `${props.material}  α=${realAlpha.toFixed(1)}×10⁻⁶/K  |  L₀=${props.L0.toFixed(2)}m  ΔL=${(realDL*1000).toFixed(2)}mm  L₁=${(props.L0+realDL).toFixed(4)}m  |  t=${props.currentT.toFixed(1)}°C`
  ctx.fillText(info, s(10), h - s(10))
}

function adjustBrightness(rgbStr: string, amount: number): string {
  const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return rgbStr
  const r = Math.min(255, Math.max(0, parseInt(match[1]) + amount))
  const g = Math.min(255, Math.max(0, parseInt(match[2]) + amount))
  const b = Math.min(255, Math.max(0, parseInt(match[3]) + amount))
  return `rgb(${r},${g},${b})`
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
