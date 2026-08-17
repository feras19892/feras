<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  tf: number
  simTime: number
  phase: 'ready' | 'dropping' | 'mixing' | 'done'
  currentWaterTemp: number
  currentMetalTemp: number
  running: boolean
  paused: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let lastTs = 0

const emit = defineEmits<{ (e: 'updateSim', dt: number): void }>()

function getCtx() { const c = canvasRef.value; return c ? c.getContext('2d') : null }
function getSize(): { w: number; h: number; dpr: number } {
  const c = canvasRef.value
  if (!c) return { w: 600, h: 400, dpr: 1 }
  const rect = c.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  c.width = Math.round(rect.width * dpr)
  c.height = Math.round(rect.height * dpr)
  return { w: c.width, h: c.height, dpr }
}
function rectWidth() { return canvasRef.value ? canvasRef.value.getBoundingClientRect().width : 600 }
function rectHeight() { return canvasRef.value ? canvasRef.value.getBoundingClientRect().height : 400 }

function tempColor(t: number): string {
  const r = Math.max(0, Math.min(1, (t - 20) / 100))
  const red = Math.round(60 + r * 195)
  const gr = Math.round(160 - r * 140)
  const bl = Math.round(220 - r * 180)
  return `rgba(${red},${gr},${bl},1)`
}

function draw() {
  const ctx = getCtx()
  if (!ctx) return
  const { dpr } = getSize()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const W = rectWidth(), H = rectHeight()

  ctx.fillStyle = '#0B1220'
  ctx.fillRect(0, 0, W, H)

  const scale = Math.min(W / 520, H / 380)
  const s = (v: number) => v * scale
  const cx = W / 2
  const bottom = H - s(30)

  // === CALORIMETER CUP ===
  const cupW = s(130), cupH = s(170)
  const cupLeft = cx - s(130)
  const cupTop = bottom - cupH

  // cup glass body
  ctx.fillStyle = 'rgba(40,55,75,0.25)'
  ctx.fillRect(cupLeft, cupTop, cupW, cupH)
  // walls
  ctx.strokeStyle = '#4A5D75'; ctx.lineWidth = s(3)
  ctx.beginPath(); ctx.moveTo(cupLeft, cupTop); ctx.lineTo(cupLeft, bottom); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cupLeft + cupW, cupTop); ctx.lineTo(cupLeft + cupW, bottom); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cupLeft, bottom); ctx.lineTo(cupLeft + cupW, bottom); ctx.stroke()
  // rim
  ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = s(2)
  ctx.beginPath(); ctx.ellipse(cupLeft + cupW / 2, cupTop, cupW / 2, s(10), 0, 0, Math.PI * 2); ctx.stroke()
  // lid (closed during mixing/done)
  if (props.phase === 'mixing' || props.phase === 'done') {
    ctx.fillStyle = 'rgba(91,141,184,0.15)'
    ctx.fillRect(cupLeft - s(4), cupTop - s(4), cupW + s(8), s(8))
    ctx.strokeStyle = '#5B8DB8'; ctx.lineWidth = s(1.5)
    ctx.strokeRect(cupLeft - s(4), cupTop - s(4), cupW + s(8), s(8))
  }

  // Use parameter temps directly when ready, otherwise current temps from sim
  const displayWaterTemp = props.phase === 'ready' ? props.tWater : props.currentWaterTemp
  const displayMetalTemp = props.phase === 'ready' ? props.tMetal : props.currentMetalTemp

  // water
  const waterH = (props.mWater / 0.5) * cupH * 0.85
  const waterTop = bottom - waterH
  const wColor = tempColor(displayWaterTemp)
  const wGrad = ctx.createLinearGradient(cupLeft, waterTop, cupLeft + cupW, bottom)
  wGrad.addColorStop(0, wColor.replace('1)', '0.35)'))
  wGrad.addColorStop(1, wColor.replace('1)', '0.65)'))
  ctx.fillStyle = wGrad
  ctx.fillRect(cupLeft + s(4), waterTop, cupW - s(8), waterH - s(4))

  // water motion dots — gently animated (more active when mixing)
  const time = Date.now() / 1000
  const agitation = props.phase === 'mixing' ? 1.5 : 0.3
  const nDots = Math.round(props.mWater * 50)
  for (let i = 0; i < nDots; i++) {
    const baseX = cupLeft + s(8) + ((i * 17 + i * i * 3) % 1000) / 1000 * (cupW - s(16))
    const baseY = waterTop + s(6) + ((i * 23 + i * i * 5) % 1000) / 1000 * (waterH - s(12))
    const animX = baseX + Math.sin(time * 1.5 + i * 0.7) * s(2 * agitation)
    const animY = baseY + Math.cos(time * 1.2 + i * 0.5) * s(1.5 * agitation)
    ctx.fillStyle = wColor.replace('1)', '0.5)')
    ctx.beginPath(); ctx.arc(animX, animY, s(1.8), 0, Math.PI * 2); ctx.fill()
  }

  // thermometer
  const tx = cupLeft + cupW + s(18), ty = cupTop + s(25)
  const th = s(130)
  ctx.strokeStyle = '#3D4A5C'; ctx.lineWidth = s(2)
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + th); ctx.stroke()
  ctx.beginPath(); ctx.arc(tx, ty + th + s(10), s(9), 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = '#0B1220'; ctx.beginPath(); ctx.arc(tx, ty + th + s(10), s(7), 0, Math.PI * 2); ctx.fill()
  const tFrac = Math.max(0, Math.min(1, (displayWaterTemp - 20) / 100))
  const mh = tFrac * th
  ctx.fillStyle = tempColor(displayWaterTemp)
  ctx.fillRect(tx - s(3), ty + th - mh, s(6), mh)
  ctx.beginPath(); ctx.arc(tx, ty + th + s(10), s(5), 0, Math.PI * 2); ctx.fill()
  // ticks
  ctx.fillStyle = '#5A6E82'; ctx.font = `${s(7)}px sans-serif`
  for (let i = 0; i <= 4; i++) {
    const y = ty + th - (i / 4) * th
    ctx.fillRect(tx - s(6), y, s(4), 1)
    ctx.fillText(`${20 + i * 25}°`, tx + s(10), y + s(3))
  }
  ctx.fillStyle = '#D1D7E0'; ctx.font = `bold ${s(10)}px sans-serif`
  ctx.fillText(`${Math.round(displayWaterTemp)}°C`, tx + s(10), ty + th + s(22))

  // === METAL BLOCK with tweezers ===
  const blockW = s(48), blockH = s(36)
  const blockStartY = cupTop - s(80)
  const blockEndY = waterTop + s(10)
  const blockX = cupLeft + cupW / 2 - blockW / 2

  let blockY = blockStartY
  if (props.phase === 'dropping') {
    const dropRatio = Math.min(props.simTime / 2, 1)
    blockY = blockStartY + (blockEndY - blockStartY) * dropRatio
  } else if (props.phase === 'mixing' || props.phase === 'done') {
    blockY = blockEndY
  }

  // tweezers arm
  if (props.phase !== 'done') {
    ctx.strokeStyle = '#8B95A5'; ctx.lineWidth = s(2)
    ctx.beginPath(); ctx.moveTo(blockX + blockW / 2, blockY - s(5)); ctx.lineTo(blockX + blockW / 2, blockY - s(40)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(blockX + blockW / 2 - s(4), blockY - s(8)); ctx.lineTo(blockX + blockW / 2, blockY - s(3)); ctx.lineTo(blockX + blockW / 2 + s(4), blockY - s(8)); ctx.stroke()
  }

  // metal block
  const mColor = tempColor(displayMetalTemp)
  ctx.fillStyle = mColor
  ctx.fillRect(blockX, blockY, blockW, blockH)
  ctx.strokeStyle = '#8B95A5'; ctx.lineWidth = s(1.5)
  ctx.strokeRect(blockX, blockY, blockW, blockH)
  // hatch
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = s(0.5)
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(blockX, blockY + i * blockH / 4); ctx.lineTo(blockX + blockW, blockY + i * blockH / 4); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(blockX + i * blockW / 4, blockY); ctx.lineTo(blockX + i * blockW / 4, blockY + blockH); ctx.stroke()
  }
  // temp label on block
  ctx.fillStyle = '#fff'; ctx.font = `bold ${s(9)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${Math.round(displayMetalTemp)}°C`, blockX + blockW / 2, blockY + blockH / 2 + s(3))
  ctx.textAlign = 'start'

  // === HEAT FLOW PARTICLES (during mixing) — proportional to temp diff ===
  if (props.phase === 'mixing') {
    const tempDiff = Math.max(1, props.tMetal - props.tWater)
    const heatCount = Math.round(5 + tempDiff * 0.2) // more particles when bigger diff
    for (let i = 0; i < heatCount; i++) {
      const t = (props.simTime * (1 + tempDiff * 0.02) + i * 0.7) % 3
      const hx = blockX + ((i * 13 + i * i * 7) % 1000) / 1000 * blockW
      const hy = blockY + blockH - t * (blockY + blockH - waterTop) * 0.6
      const alpha = t < 0.5 ? t * 2 : (3 - t) / 2.5
      ctx.fillStyle = `rgba(255,${Math.round(120 - tempDiff)},${Math.round(60 - tempDiff * 0.3)},${Math.max(0, alpha)})`
      ctx.beginPath(); ctx.arc(hx, hy, s(2 + tempDiff * 0.01), 0, Math.PI * 2); ctx.fill()
    }
  }

  // === PHASE LABEL (top center) ===
  ctx.textAlign = 'center'
  const phaseLabels: Record<string, { text: string; color: string }> = {
    ready: { text: t('experiments.calPhaseReady'), color: '#64748b' },
    dropping: { text: t('experiments.calPhaseDropping'), color: '#fbbf24' },
    mixing: { text: t('experiments.calPhaseMixing'), color: '#22c55e' },
    done: { text: t('experiments.calPhaseDone'), color: '#5B8DB8' },
  }
  const pl = phaseLabels[props.phase]
  ctx.fillStyle = pl.color; ctx.font = `bold ${s(12)}px sans-serif`
  ctx.fillText(pl.text, cx, s(20))
  ctx.textAlign = 'start'

  // bottom info
  ctx.fillStyle = '#8B95A5'; ctx.font = `${s(8)}px sans-serif`
  ctx.fillText(`💧 ${t('experiments.calWaterLabel')} ${props.mWater.toFixed(3)}kg ${props.tWater}°C → ${Math.round(displayWaterTemp)}°C`, s(10), H - s(10))
  ctx.fillText(`🔩 ${t('experiments.calMetalLabel')} ${props.mMetal.toFixed(3)}kg ${props.tMetal}°C → ${Math.round(displayMetalTemp)}°C`, s(200), H - s(10))
  ctx.fillText(`Tf = ${props.tf.toFixed(1)}°C`, s(390), H - s(10))
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
