<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { linearRegression } from './linearRegression'
import { useI18n } from '../../../composables/useI18n'

interface Trial { mass: number; k: number; amplitude: number; T: number; f: number; omega: number; kCalc: number }

const { t } = useI18n()
const props = defineProps<{
  trials: Trial[]
}>()

// Lock axes to T² vs m as required by the experiment report
const _scatterXKey = ref<'mass'|'k'|'amplitude'|'T'|'f'|'omega'>('mass')
const _scatterYKey = ref<'mass'|'k'|'amplitude'|'T'|'f'|'omega'|'T2'>('T2')
const canvasRef = ref<HTMLCanvasElement | null>(null)

const xLabel = computed(() => 'm (kg)')
const yLabel = computed(() => 'T² (s²)')

const xs = computed(() => props.trials.map(tr => tr.mass))
const ys = computed(() => props.trials.map(tr => tr.T * tr.T))

const fit = computed(() => linearRegression(xs.value, ys.value))

// From T² = (4π²/k) · m  →  slope = 4π²/k  →  k = 4π²/slope
const kFromSlope = computed(() => {
  if (!fit.value || Math.abs(fit.value.slope) < 1e-12) return null
  return (4 * Math.PI * Math.PI) / fit.value.slope
})

function draw() {
  const canvas = canvasRef.value; if (!canvas) return
  const ctx = canvas.getContext('2d'); if (!ctx) return
  const W=canvas.width, H=canvas.height
  ctx.clearRect(0,0,W,H)
  ctx.fillStyle='#fffef7'; ctx.fillRect(0,0,W,H)
  const padL=52, padR=16, padT=18, padB=36
  const iW=W-padL-padR, iH=H-padT-padB
  if (props.trials.length<2) { ctx.fillStyle='#64748b'; ctx.font='13px Segoe UI'; ctx.textAlign='center'; ctx.fillText(t('experiments.recordAtLeastTwo'),W/2,H/2); ctx.textAlign='start'; return }
  const xMin=Math.min(...xs.value), xMax=Math.max(...xs.value)
  const yMin=Math.min(...ys.value), yMax=Math.max(...ys.value)
  const xSpan=Math.max(1e-9,xMax-xMin), ySpan=Math.max(1e-9,yMax-yMin)
  // axes
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL,padT+iH); ctx.lineTo(padL+iW,padT+iH); ctx.stroke()
  // points
  ctx.fillStyle='#2563eb'
  for (let i=0;i<xs.value.length;i++) { const px=padL+((xs.value[i]-xMin)/xSpan)*iW; const py=padT+iH-((ys.value[i]-yMin)/ySpan)*iH; ctx.beginPath(); ctx.arc(px,py,3,0,2*Math.PI); ctx.fill() }
  // regression line
  if (fit.value) { const f=fit.value; ctx.strokeStyle='#dc2626'; ctx.lineWidth=2; ctx.beginPath(); const y0=f.slope*xMin+f.intercept, y1=f.slope*xMax+f.intercept; ctx.moveTo(padL,padT+iH-((y0-yMin)/ySpan)*iH); ctx.lineTo(padL+iW,padT+iH-((y1-yMin)/ySpan)*iH); ctx.stroke() }
  // labels
  ctx.fillStyle='#475569'; ctx.font='11px Segoe UI'; ctx.textAlign='center'; ctx.fillText(xLabel.value, padL+iW/2, H-4)
  ctx.save(); ctx.translate(12, padT+iH/2); ctx.rotate(-Math.PI/2); ctx.fillText(yLabel.value,0,0); ctx.restore()
}

watch(() => props.trials, draw, { flush:'post', deep: true })
onMounted(draw)
</script>

<template>
  <div class="scatter-panel">
    <div class="card-header">
      <h4>&#x1F4C8; T² vs m</h4>
    </div>
    <canvas ref="canvasRef" width="340" height="160" />
    <div class="scatter-footer">
      <div v-if="fit" class="fit-readout">
        <span>Slope = {{ fit.slope.toFixed(5) }}</span>
        <span>R² = {{ fit.r2.toFixed(4) }}</span>
      </div>
    </div>
    <div v-if="kFromSlope !== null" class="k-result">
      <div class="k-formula">k = 4π² / Slope = <b>{{ kFromSlope.toFixed(2) }}</b> N/m</div>
      <div class="k-compare" v-if="trials.length > 0">
        k (theoretical) = {{ trials[0].k.toFixed(2) }} N/m
      </div>
    </div>
  </div>
</template>

<style scoped>
.scatter-panel { background:#1E2530; border-radius:8px; padding:.6rem; border:1px solid #2D3645; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; flex-wrap:wrap; gap:.3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
canvas { width:100%; height:160px; background:#fffef7; border-radius:8px; border:1px solid #2D3645; }
.scatter-footer { display:flex; align-items:center; gap:.4rem; margin-top:.4rem; flex-wrap:wrap; }
.fit-readout { display:flex; gap:.5rem; font-size:.72rem; font-family:monospace; color:#D1D7E0; }
.fit-readout span { background:#252D3A; padding:.15rem .3rem; border-radius:4px; border:1px solid #2D3645; }
.k-result { margin-top:.4rem; padding:.4rem; background:rgba(91,141,184,.08); border:1px solid rgba(91,141,184,.2); border-radius:6px; text-align:center; }
.k-formula { font-size:.78rem; color:#5B8DB8; direction:ltr; }
.k-formula b { color:#22c55e; font-size:.9rem; }
.k-compare { font-size:.7rem; color:#8B95A5; margin-top:.2rem; direction:ltr; }
</style>
