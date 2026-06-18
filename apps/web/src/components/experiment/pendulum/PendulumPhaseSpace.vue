<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  theta: number
  omega: number
  running: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const history = ref<{ theta: number; omega: number }[]>([])

watch(() => [props.theta, props.omega, props.running], () => {
  if (props.running) {
    history.value.push({ theta: props.theta, omega: props.omega })
    if (history.value.length > 600) history.value.shift()
  }
  draw()
}, { flush: 'post' })

function draw() {
  const canvas = canvasRef.value; if (!canvas) return
  const ctx = canvas.getContext('2d'); if (!ctx) return
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#f8fafc')
  grad.addColorStop(1, '#e2e8f0')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

  const pad = 30
  const iW = W - 2 * pad, iH = H - 2 * pad
  const data = history.value

  if (data.length < 2) {
    ctx.fillStyle = '#64748b'; ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'; ctx.fillText('انتظر بدء المحاكاة...', W / 2, H / 2)
    return
  }

  const tVals = data.map(p => p.theta), oVals = data.map(p => p.omega)
  const tMin = Math.min(...tVals), tMax = Math.max(...tVals)
  const oMin = Math.min(...oVals), oMax = Math.max(...oVals)
  const tSpan = Math.max(1e-9, tMax - tMin), oSpan = Math.max(1e-9, oMax - oMin)

  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + iH); ctx.lineTo(pad + iW, pad + iH); ctx.stroke()

  const ox = pad + ((0 - tMin) / tSpan) * iW
  const oy = pad + iH - ((0 - oMin) / oSpan) * iH
  ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.moveTo(ox, pad); ctx.lineTo(ox, pad + iH); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(pad, oy); ctx.lineTo(pad + iW, oy); ctx.stroke()
  ctx.setLineDash([])

  for (let i = 1; i < data.length; i++) {
    const alpha = 0.15 + 0.85 * (i / data.length)
    const px1 = pad + ((data[i - 1].theta - tMin) / tSpan) * iW
    const py1 = pad + iH - ((data[i - 1].omega - oMin) / oSpan) * iH
    const px2 = pad + ((data[i].theta - tMin) / tSpan) * iW
    const py2 = pad + iH - ((data[i].omega - oMin) / oSpan) * iH
    ctx.strokeStyle = `rgba(59,130,246,${alpha})`
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke()
  }

  const last = data[data.length - 1]
  const lx = pad + ((last.theta - tMin) / tSpan) * iW
  const ly = pad + iH - ((last.omega - oMin) / oSpan) * iH
  ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('θ (rad)', pad + iW / 2, H - 4)
  ctx.save(); ctx.translate(10, pad + iH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('ω (rad/s)', 0, 0); ctx.restore()
}

onMounted(draw)
</script>

<template>
  <div class="phase-panel">
    <div class="card-header"><h4>&#x1F500; فضاء الطور (Phase Space)</h4></div>
    <canvas ref="canvasRef" width="340" height="200" />
    <div class="phase-legend">
      <span class="legend-dot" style="background:#3b82f6" /> المسار
      <span class="legend-dot" style="background:#dc2626" /> النقطة الحالية
    </div>
  </div>
</template>

<style scoped>
.phase-panel { background: linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.85)); border-radius: 10px; padding: .6rem; border: 1px solid rgba(71,85,105,0.3); box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 .3rem; }
.card-header h4 { margin: 0; font-size: .82rem; color: #e2e8f0; font-weight: 800; }
canvas { width: 100%; height: 200px; background: #fffef7; border-radius: 8px; border: 1px solid rgba(71,85,105,0.3); }
.phase-legend { display: flex; gap: .6rem; font-size: .65rem; color: #94a3b8; margin-top: .3rem; align-items: center; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
</style>
