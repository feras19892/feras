<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction, t } = useI18n();
import { computed, ref, watch, onMounted } from 'vue'
import { linearRegression } from '../spring/linearRegression'


interface Trial {
  m1: number; m2: number; v1i: number; v2i: number; e: number
  v1f: number; v2f: number; Pi: number; Pf: number
}

const props = defineProps<{ trials: Trial[] }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Filter inelastic trials with v2i ≈ 0 (report scenario)
const validTrials = computed(() => props.trials.filter(
  tr => tr.e < 0.15 && Math.abs(tr.v2i) < 0.15 && tr.v1f !== undefined
))

const xs = computed(() => validTrials.value.map(tr => tr.v1f))
const ys = computed(() => validTrials.value.map(tr => tr.Pi))

const fit = computed(() => linearRegression(xs.value, ys.value))

const m2Calc = computed(() => {
  if (!fit.value || fit.value.slope <= 0) return null
  // slope = m1 + m2 (for inelastic with v2i=0: Pi = (m1+m2)*vf)
  // But m1 varies across trials, so we use average m1
  const avgM1 = validTrials.value.reduce((s, tr) => s + tr.m1, 0) / validTrials.value.length
  return fit.value.slope - avgM1
})

function draw() {
  const canvas = canvasRef.value; if (!canvas) return
  const ctx = canvas.getContext('2d'); if (!ctx) return
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#fffef7'; ctx.fillRect(0, 0, W, H)
  const padL = 52, padR = 16, padT = 18, padB = 36
  const iW = W - padL - padR, iH = H - padT - padB

  if (validTrials.value.length < 2) {
    ctx.fillStyle = '#64748b'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(t('experiments.recordAtLeastTwoInelastic'), W / 2, H / 2)
    ctx.textAlign = 'start'; return
  }

  const xMin = Math.min(...xs.value), xMax = Math.max(...xs.value)
  const yMin = Math.min(...ys.value), yMax = Math.max(...ys.value)
  const xSpan = Math.max(1e-9, xMax - xMin), ySpan = Math.max(1e-9, yMax - yMin)

  // Grid
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 1
  ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  for (let i = 0; i <= 4; i++) {
    const t = i / 4
    const x = padL + iW * t
    const xVal = xMin + (xMax - xMin) * t
    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, H - padB); ctx.stroke()
    ctx.fillText(xVal.toFixed(2), x, H - padB + 4)
  }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
  for (let i = 0; i <= 4; i++) {
    const t = i / 4
    const y = H - padB - iH * t
    const yVal = yMin + (yMax - yMin) * t
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke()
    ctx.fillText(yVal.toFixed(1), padL - 4, y)
  }

  // Points
  ctx.fillStyle = '#3b82f6'
  for (let i = 0; i < xs.value.length; i++) {
    const px = padL + ((xs.value[i] - xMin) / xSpan) * iW
    const py = padT + iH - ((ys.value[i] - yMin) / ySpan) * iH
    ctx.beginPath(); ctx.arc(px, py, 4, 0, 2 * Math.PI); ctx.fill()
  }

  // Regression line
  if (fit.value) {
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 80; i++) {
      const xFit = xMin + (xMax - xMin) * (i / 80)
      const yFit = fit.value.slope * xFit + fit.value.intercept
      const px = padL + ((xFit - xMin) / xSpan) * iW
      const py = padT + iH - ((yFit - yMin) / ySpan) * iH
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // Axes
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(padL, H - padB); ctx.lineTo(W - padR, H - padB); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, H - padB); ctx.stroke()

  // Labels
  ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText('v_f (m/s)', W / 2, H - 12)
  ctx.save(); ctx.translate(10, H / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('p_i (kg·m/s)', 0, 0); ctx.restore()
}

watch(() => [props.trials.length], draw, { flush: 'post' })
onMounted(draw)
</script>

<template>
  <div class="scatter-panel">
    <div class="card-header">
      <h4>&#x1F4C8; {{ t('experiments.scatterMomentumVsVf') }}</h4>
    </div>
    <canvas ref="canvasRef" width="340" height="160" />
    <div class="scatter-footer">
      <div v-if="fit" class="fit-readout">
        <span>slope = {{ fit.slope.toFixed(4) }}</span>
        <span>b = {{ fit.intercept.toFixed(4) }}</span>
        <span>R² = {{ fit.r2.toFixed(4) }}</span>
      </div>
      <div v-if="m2Calc != null" class="m2-calc">
        m₂ = slope − m̄₁ = <b>{{ fit?.slope.toFixed(3) }}</b> − {{ (validTrials.reduce((s,tr)=>s+tr.m1,0)/validTrials.length).toFixed(2) }} = <b>{{ m2Calc.toFixed(2) }} kg</b>
      </div>
      <div v-else-if="validTrials.length < 2" class="hint">
        {{ t('experiments.needInelasticTrials') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.scatter-panel { background:#1E2530; border-radius:8px; padding:.6rem; border:1px solid #2D3645; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; flex-wrap:wrap; gap:.3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
canvas { width:100%; height:160px; background:#fffef7; border-radius:8px; border:1px solid #2D3645; }
.scatter-footer { display:flex; flex-direction:column; gap:.3rem; margin-top:.4rem; }
.fit-readout { display:flex; gap:.5rem; font-size:.72rem; font-family:monospace; color:#D1D7E0; flex-wrap:wrap; }
.fit-readout span { background:#252D3A; padding:.15rem .3rem; border-radius:4px; border:1px solid #2D3645; }
.m2-calc { font-size:.75rem; color:#22c55e; background:rgba(34,197,94,.08); padding:.25rem .4rem; border-radius:4px; border:1px solid rgba(34,197,94,.2); }
.hint { font-size:.72rem; color:#f59e0b; }
</style>
