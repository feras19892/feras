<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  mass: number
  phaseType: 'fusion' | 'vaporization'
  heatingPower: number
  currentQ: number
  totalQ: number
  meltedMass: number
  remainingMass: number
  ratio: number
  currentTemp: number
  phase: 'ready' | 'heating' | 'done'
  running: boolean
  paused: boolean
  highlightField?: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let lastTs = 0
let dpr = 1
let cw = 600
let ch = 400

const emit = defineEmits<{ (e: 'updateSim', dt: number): void }>()

function getCtx() { const c = canvasRef.value; return c ? c.getContext('2d') : null }

function resizeCanvas() {
  const c = canvasRef.value
  if (!c) return
  const rect = c.getBoundingClientRect()
  dpr = window.devicePixelRatio || 1
  cw = Math.round(rect.width)
  ch = Math.round(rect.height)
  c.width = Math.round(cw * dpr)
  c.height = Math.round(ch * dpr)
}

function drawBeaker(ctx: CanvasRenderingContext2D, bx: number, by: number, bw: number, bh: number, s: (v: number) => number) {
  ctx.save()
  // Glass body (transparent)
  ctx.fillStyle = 'rgba(200,220,240,0.06)'
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.closePath(); ctx.fill()
  // Glass outline with thickness
  ctx.strokeStyle = 'rgba(100,140,180,0.5)'; ctx.lineWidth = s(1.5)
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke()
  // Rim
  ctx.strokeStyle = 'rgba(120,170,200,0.5)'; ctx.lineWidth = s(2)
  ctx.beginPath(); ctx.moveTo(bx - s(2), by); ctx.lineTo(bx + bw + s(2), by); ctx.stroke()
  // Bottom base shadow
  ctx.fillStyle = 'rgba(20,25,30,0.8)'; ctx.fillRect(bx - s(4), by + bh, bw + s(8), s(4))
  ctx.restore()
}

function drawIceBlocks(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, s: (v: number) => number) {
  if (h < s(2)) return
  ctx.save()
  const cols = 3, rows = Math.max(1, Math.floor(h / s(20)))
  const cw = w / cols, ch = h / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ix = x + c * cw + s(2), iy = y + r * ch + s(2)
      const iw = Math.max(s(2), cw - s(4)), ih = Math.max(s(2), ch - s(4))
      // Ice gradient
      const igrad = ctx.createLinearGradient(ix, iy, ix, iy + ih)
      igrad.addColorStop(0, '#C8E6F5')
      igrad.addColorStop(0.5, '#B0D4E8')
      igrad.addColorStop(1, '#8BBBD4')
      ctx.fillStyle = igrad; ctx.fillRect(ix, iy, iw, ih)
      ctx.strokeStyle = 'rgba(100,160,200,0.5)'; ctx.lineWidth = s(1)
      ctx.strokeRect(ix, iy, iw, ih)
      // Shine on top
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(ix + s(1), iy + s(1), iw * 0.6, s(2))
      // Internal crack line
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = s(0.5)
      ctx.beginPath(); ctx.moveTo(ix + iw*0.3, iy + ih*0.3); ctx.lineTo(ix + iw*0.5, iy + ih*0.7); ctx.stroke()
    }
  }
  ctx.restore()
}

function drawWaterFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, s: (v: number) => number) {
  if (h < s(1)) return
  ctx.save()
  const grad = ctx.createLinearGradient(0, y, 0, y + h)
  grad.addColorStop(0, 'rgba(91,141,184,0.35)')
  grad.addColorStop(0.5, 'rgba(60,120,170,0.5)')
  grad.addColorStop(1, 'rgba(40,90,140,0.65)')
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  // Surface line with wavy
  ctx.strokeStyle = 'rgba(100,180,230,0.5)'; ctx.lineWidth = s(1)
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w/2, y - s(1), x + w, y); ctx.stroke()
  ctx.restore()
}

function drawBurner(ctx: CanvasRenderingContext2D, x: number, y: number, s: (v: number) => number, active: boolean) {
  ctx.save()
  // Burner body
  ctx.fillStyle = '#2A3540'
  ctx.beginPath()
  ctx.moveTo(x - s(10), y); ctx.lineTo(x + s(10), y)
  ctx.lineTo(x + s(7), y - s(22)); ctx.lineTo(x - s(7), y - s(22))
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#3D4A5C'; ctx.lineWidth = s(1); ctx.stroke()
  // Burner head
  ctx.fillStyle = '#1e2530'; ctx.fillRect(x - s(6), y - s(26), s(12), s(4))

  if (active) {
    // Outer glow
    const gGrad = ctx.createRadialGradient(x, y - s(24), 0, x, y - s(24), s(35))
    gGrad.addColorStop(0, 'rgba(255,120,20,0.15)')
    gGrad.addColorStop(1, 'rgba(255,80,0,0)')
    ctx.fillStyle = gGrad
    ctx.fillRect(x - s(35), y - s(60), s(70), s(60))

    const flicker = 3 * Math.sin(Date.now() / 150) + 2 * Math.cos(Date.now() / 230)
    const flameH = s(28 + flicker)
    const fGrad = ctx.createRadialGradient(x, y - s(24), 0, x, y - s(24) - flameH, flameH)
    fGrad.addColorStop(0, 'rgba(255,250,200,0.95)')
    fGrad.addColorStop(0.2, 'rgba(255,180,60,0.8)')
    fGrad.addColorStop(0.5, 'rgba(255,100,30,0.5)')
    fGrad.addColorStop(1, 'rgba(200,40,0,0)')
    ctx.fillStyle = fGrad
    ctx.beginPath()
    ctx.moveTo(x - s(6), y - s(24))
    ctx.quadraticCurveTo(x - s(10), y - s(24) - flameH * 0.5, x, y - s(24) - flameH)
    ctx.quadraticCurveTo(x + s(10), y - s(24) - flameH * 0.5, x + s(6), y - s(24))
    ctx.closePath(); ctx.fill()

    // Heat particles
    drawHeatParticles(ctx, x, y - s(24), s, 8)
  }
  ctx.restore()
}

// Particles from burner going up
function drawHeatParticles(ctx: CanvasRenderingContext2D, x: number, y: number, s: (v: number) => number, count: number) {
  const t = Date.now() / 1000
  ctx.save()
  for (let i = 0; i < count; i++) {
    const seed = i * 137.5
    const px = x + Math.sin(t * 2 + seed) * s(8) + (Math.random() - 0.5) * s(4)
    const py = y - ((t * 30 + i * 15) % 40) * s(1)
    const pa = Math.max(0, 0.6 - ((t * 30 + i * 15) % 40) / 60)
    const sz = s(1.5 + Math.sin(t * 3 + seed) * 0.8)
    ctx.fillStyle = `rgba(255,180,80,${pa})`
    ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

// Thermometer on right side
function drawThermometer(ctx: CanvasRenderingContext2D, x: number, y: number, temp: number, s: (v: number) => number) {
  const stemW = s(5), bulbR = s(7)
  const stemH = s(55), maxT = 120, minT = 0
  const frac = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)))

  ctx.save()
  // Glass tube
  ctx.fillStyle = 'rgba(200,220,240,0.15)'
  ctx.beginPath(); ctx.roundRect(x - stemW/2, y, stemW, stemH, s(2)); ctx.fill()
  ctx.strokeStyle = 'rgba(100,140,180,0.4)'; ctx.lineWidth = s(1); ctx.stroke()
  // Bulb
  ctx.fillStyle = 'rgba(200,220,240,0.2)'
  ctx.beginPath(); ctx.arc(x, y + stemH + bulbR * 0.3, bulbR, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = 'rgba(100,140,180,0.5)'; ctx.lineWidth = s(1); ctx.stroke()
  // Red liquid
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(x - stemW/2 + s(1), y + stemH - frac * stemH, stemW - s(2), frac * stemH + s(1))
  ctx.beginPath(); ctx.arc(x, y + stemH + bulbR * 0.3, bulbR * 0.65, 0, Math.PI * 2); ctx.fill()
  // Scale
  ctx.fillStyle = '#5B8DB8'; ctx.font = `${s(5.5)}px sans-serif`; ctx.textAlign = 'left'
  for (let t_ = 0; t_ <= 120; t_ += 20) {
    const ty = y + stemH - ((t_ - minT) / (maxT - minT)) * stemH
    ctx.strokeStyle = t_ % 40 === 0 ? '#5B8DB8' : '#3D4A5C'
    ctx.lineWidth = s(0.5)
    ctx.beginPath(); ctx.moveTo(x + stemW/2 + s(1), ty); ctx.lineTo(x + stemW/2 + s(4), ty); ctx.stroke()
    if (t_ % 40 === 0) ctx.fillText(`${t_}°`, x + stemW/2 + s(6), ty + s(2))
  }
  // Label
  ctx.fillStyle = temp > 80 ? '#ef4444' : temp > 40 ? '#fbbf24' : '#D1D7E0'
  ctx.font = `bold ${s(9)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${Math.round(temp)}°C`, x, y - s(4))
  ctx.restore()
}

// Bubbles for fusion, steam for vaporization
function drawBubblesSteam(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, s: (v: number) => number, phaseType: 'fusion' | 'vaporization', ratio: number) {
  if (ratio < 0.05) return
  const t = Date.now() / 1000
  ctx.save()
  if (phaseType === 'fusion') {
    // Small bubbles rising from ice-water boundary
    for (let i = 0; i < 5; i++) {
      const seed = i * 73.3
      const bx = x + w * (0.2 + 0.6 * ((Math.sin(t * 1.5 + seed) + 1) / 2))
      const by = y + h * 0.7 - ((t * 15 + i * 10) % (h * 0.8))
      const ba = Math.max(0, 0.4 - ((t * 15 + i * 10) % (h * 0.8)) / (h * 0.8) * 0.4) * ratio
      if (ba > 0.05) {
        ctx.fillStyle = `rgba(255,255,255,${ba})`
        ctx.beginPath(); ctx.arc(bx, by, s(1.5 + Math.sin(t * 4 + seed)), 0, Math.PI * 2); ctx.fill()
      }
    }
  } else {
    // Steam rising from water surface
    for (let i = 0; i < 8; i++) {
      const seed = i * 93.7
      const sx = x + w * (0.15 + 0.7 * ((Math.sin(t * 0.8 + seed) + 1) / 2))
      const sy = y - ((t * 20 + i * 12) % 60) * s(1)
      const sa = Math.max(0, 0.25 - ((t * 20 + i * 12) % 60) / 120) * ratio
      if (sa > 0.02) {
        ctx.fillStyle = `rgba(200,220,240,${sa})`
        ctx.beginPath(); ctx.arc(sx, sy, s(3 + Math.sin(t * 2 + seed) * 1.5), 0, Math.PI * 2); ctx.fill()
      }
    }
  }
  ctx.restore()
}

function draw() {
  const ctx = getCtx()
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const w = cw, h = ch
  ctx.fillStyle = '#0B1220'
  ctx.fillRect(0, 0, w, h)

  const scale = Math.min(w / 560, h / 360)
  const s = (v: number) => v * scale
  const cx = w / 2
  const tableY = h - s(50)

  // Table
  ctx.fillStyle = '#1A232E'
  ctx.fillRect(0, tableY, w, s(45))
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = s(1)
  ctx.beginPath(); ctx.moveTo(0, tableY); ctx.lineTo(w, tableY); ctx.stroke()
  ctx.fillStyle = '#2D3645'; ctx.fillRect(0, tableY, w, s(2))

  // Beaker
  const bw = s(100), bh = s(80)
  const bx = cx - bw / 2, by = tableY - s(10) - bh // beaker sits on table with small gap
  drawBeaker(ctx, bx, by, bw, bh, s)

  const innerX = bx + s(3), innerW = bw - s(6)
  const innerTop = by + s(2), innerBottom = by + bh - s(2), innerH = innerBottom - innerTop

  // Phase proportions
  const meltRatio = props.mass > 0 ? props.meltedMass / props.mass : 0
  const remainRatio = props.mass > 0 ? props.remainingMass / props.mass : 1
  const solidH = innerH * remainRatio
  const liquidH = innerH * meltRatio

  if (props.phaseType === 'fusion') {
    // Fusion: water at bottom (denser), ice floating on top
    if (liquidH > s(1)) {
      drawWaterFill(ctx, innerX, innerBottom - liquidH, innerW, liquidH, s)
    }
    if (solidH > s(1)) {
      // Ice floats on top of water
      drawIceBlocks(ctx, innerX, innerBottom - liquidH - solidH, innerW, solidH, s)
    }
  } else {
    // Vaporization: water at bottom (shrinking), steam rises from surface
    if (solidH > s(1)) {
      drawWaterFill(ctx, innerX, innerBottom - solidH, innerW, solidH, s)
    }
  }

  // Bunsen burner
  drawBurner(ctx, cx, tableY, s, props.phase === 'heating')

  // Thermometer (right side, standing on table)
  const thermX = w - s(40)
  drawThermometer(ctx, thermX, tableY - s(75), props.currentTemp, s)
  // Thermometer label
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(7)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('🌡️ الحرارة', thermX + s(10), tableY + s(12))

  // Bubbles / Steam
  if (props.phaseType === 'fusion' && liquidH > s(1)) {
    // Bubbles at ice-water boundary
    const waterTop = innerBottom - liquidH - solidH
    drawBubblesSteam(ctx, innerX, waterTop, innerW, liquidH, s, props.phaseType, props.ratio)
  } else if (props.phaseType === 'vaporization' && solidH > s(1)) {
    // Steam rising from water surface
    const waterTop = innerBottom - solidH
    drawBubblesSteam(ctx, innerX, waterTop, innerW, solidH, s, props.phaseType, props.ratio)
  }

  // Labels above beaker
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(8)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`m = ${props.mass.toFixed(2)} kg`, cx, by - s(14))
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${s(9)}px sans-serif`
  ctx.fillText(`${Math.round(props.currentTemp)}°C`, cx, by - s(4))

  // Phase label top
  ctx.textAlign = 'center'
  const labels: Record<string, { text: string; color: string }> = {
    ready: { text: '❄️ جاهز — اضغط Start', color: '#64748b' },
    heating: { text: '🔥 جاري التسخين...', color: '#fbbf24' },
    done: { text: '✅ اكتمل التحول', color: '#22c55e' },
  }
  const pl = labels[props.phase]
  ctx.fillStyle = pl.color; ctx.font = `bold ${s(12)}px sans-serif`
  ctx.fillText(pl.text, w / 2, s(18))

  // Energy bar
  const barW = s(200), barH = s(8)
  const barX = cx - barW / 2, barY = h - s(22)
  ctx.fillStyle = '#1A232E'; ctx.fillRect(barX, barY, barW, barH)
  ctx.strokeStyle = '#2D3645'; ctx.strokeRect(barX, barY, barW, barH)
  const progress = props.totalQ > 0 ? Math.min(1, props.currentQ / props.totalQ) : 0
  const pGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0)
  pGrad.addColorStop(0, '#5B8DB8'); pGrad.addColorStop(1, '#22c55e')
  ctx.fillStyle = pGrad; ctx.fillRect(barX, barY, barW * progress, barH)

  // Energy text
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(8)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${(props.currentQ / 1000).toFixed(1)} / ${(props.totalQ / 1000).toFixed(1)} kJ`, cx, barY - s(3))

  // Bottom info
  ctx.textAlign = 'left'
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(7.5)}px sans-serif`
  const phaseAr = props.phaseType === 'fusion' ? 'انصهار' : 'تبخر'
  const solidLabel = props.phaseType === 'fusion' ? 'متبقية' : 'متبقية'
  ctx.fillText(`${phaseAr} | m=${props.mass.toFixed(2)}kg | Q=${(props.currentQ/1000).toFixed(1)}kJ | متحولة=${props.meltedMass.toFixed(3)}kg | ${solidLabel}=${props.remainingMass.toFixed(3)}kg`, s(10), h - s(10))

  // === HIGHLIGHT EFFECTS (linked from ReadingsPanel hover) ===
  const hf = props.highlightField
  const time = Date.now() / 1000
  const flash = 0.5 + Math.sin(time * 5) * 0.3

  if (hf === 'mass') {
    const hg = ctx.createRadialGradient(cx, by + bh/2, 0, cx, by + bh/2, bw/2 + s(15))
    hg.addColorStop(0, `rgba(255,255,255,${flash * 0.15})`)
    hg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = hg
    ctx.fillRect(bx - s(15), by - s(15), bw + s(30), bh + s(30))
  }
  if (hf === 'Q' || hf === 'totalQ') {
    // Glow around energy bar
    const eg = ctx.createRadialGradient(cx, barY + barH/2, 0, cx, barY + barH/2, s(30))
    eg.addColorStop(0, `rgba(91,141,184,${flash * 0.3})`)
    eg.addColorStop(1, 'rgba(91,141,184,0)')
    ctx.fillStyle = eg
    ctx.fillRect(barX - s(10), barY - s(15), barW + s(20), barH + s(30))
  }
  if (hf === 'meltedMass' || hf === 'remainingMass') {
    // Glow inside beaker
    const ig = ctx.createRadialGradient(cx, by + bh/2, 0, cx, by + bh/2, bw/2 + s(10))
    ig.addColorStop(0, `rgba(34,197,94,${flash * 0.15})`)
    ig.addColorStop(1, 'rgba(34,197,94,0)')
    ctx.fillStyle = ig
    ctx.fillRect(bx, by, bw, bh)
  }
  if (hf === 'currentTemp') {
    // Yellow glow around thermometer
    const tg = ctx.createRadialGradient(thermX, tableY - s(40), 0, thermX, tableY - s(40), s(30))
    tg.addColorStop(0, `rgba(251,191,36,${flash * 0.3})`)
    tg.addColorStop(1, 'rgba(251,191,36,0)')
    ctx.fillStyle = tg
    ctx.beginPath(); ctx.arc(thermX, tableY - s(40), s(30), 0, Math.PI * 2); ctx.fill()
  }
}

function loop(ts: number) {
  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
  lastTs = ts
  emit('updateSim', dt)
  draw()
  animId = requestAnimationFrame(loop)
}

function onResize() { resizeCanvas(); draw() }
onMounted(() => { resizeCanvas(); draw(); animId = requestAnimationFrame(loop); window.addEventListener('resize', onResize) })
onUnmounted(() => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) })
</script>
<template>
  <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block;" />
</template>
