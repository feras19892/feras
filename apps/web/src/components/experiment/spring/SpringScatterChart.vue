<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { linearRegression } from './linearRegression'
import { useI18n } from '../../../composables/useI18n'

interface Trial { mass: number; k: number; amplitude: number; T: number; f: number; omega: number; kCalc: number }

const { t } = useI18n()
const props = defineProps<{
  trials: Trial[]
}>()

const scatterXKey = ref<'mass'|'k'|'amplitude'|'T'|'f'|'omega'>('mass')
const scatterYKey = ref<'mass'|'k'|'amplitude'|'T'|'f'|'omega'|'T2'>('T2')
const canvasRef = ref<HTMLCanvasElement | null>(null)

const xLabel = computed(() => scatterXKey.value==='mass'?'m (kg)':scatterXKey.value==='k'?'k (N/m)':scatterXKey.value==='amplitude'?'A (m)':scatterXKey.value==='T'?'T (s)':scatterXKey.value==='f'?'f (Hz)':'ω (rad/s)')
const yLabel = computed(() => scatterYKey.value==='mass'?'m (kg)':scatterYKey.value==='k'?'k (N/m)':scatterYKey.value==='amplitude'?'A (m)':scatterYKey.value==='T'?'T (s)':scatterYKey.value==='T2'?'T² (s²)':scatterYKey.value==='f'?'f (Hz)':'ω (rad/s)')

const xs = computed(() => props.trials.map(t => {
  const key = scatterXKey.value
  if (key==='T') return t.T; if (key==='f') return t.f; if (key==='omega') return t.omega; if (key==='k') return t.k; if (key==='amplitude') return t.amplitude
  return t.mass
}))
const ys = computed(() => props.trials.map(t => {
  const key = scatterYKey.value
  if (key==='T2') return t.T*t.T; if (key==='T') return t.T; if (key==='f') return t.f; if (key==='omega') return t.omega; if (key==='k') return t.k; if (key==='amplitude') return t.amplitude
  return t.mass
}))

const fit = computed(() => linearRegression(xs.value, ys.value))

const emit = defineEmits<{
  (e: 'calcSlope', slope: number, intercept: number, r2: number): void
}>()

function calcSlope() {
  if (fit.value) {
    emit('calcSlope', fit.value.slope, fit.value.intercept, fit.value.r2)
  }
}

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

watch(() => [props.trials.length, scatterXKey.value, scatterYKey.value], draw, { flush:'post' })
onMounted(draw)
</script>

<template>
  <div class="scatter-panel">
    <div class="card-header">
      <h4>&#x1F4C8; Scatter</h4>
      <div class="scatter-axis-controls">
        <select v-model="scatterXKey"><option value="mass">m (kg)</option><option value="k">k (N/m)</option><option value="amplitude">A (m)</option><option value="T">T (s)</option><option value="f">f (Hz)</option><option value="omega">ω (rad/s)</option></select>
        <span class="axis-sep">×</span>
        <select v-model="scatterYKey"><option value="mass">m (kg)</option><option value="k">k (N/m)</option><option value="amplitude">A (m)</option><option value="T">T (s)</option><option value="T2">T² (s²)</option><option value="f">f (Hz)</option><option value="omega">ω (rad/s)</option></select>
      </div>
    </div>
    <canvas ref="canvasRef" width="340" height="160" />
    <div class="scatter-footer">
      <button class="btn-slope" @click="calcSlope" :disabled="!fit">&#x1F4C9; {{ t('experiments.calculateSlope') }}</button>
      <div v-if="fit" class="fit-readout">
        <span>m = {{ fit.slope.toFixed(4) }}</span>
        <span>b = {{ fit.intercept.toFixed(4) }}</span>
        <span>R² = {{ fit.r2.toFixed(4) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scatter-panel { background:#1E2530; border-radius:8px; padding:.6rem; border:1px solid #2D3645; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; flex-wrap:wrap; gap:.3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
.scatter-axis-controls { display:flex; align-items:center; gap:.3rem; }
.scatter-axis-controls select { padding:.2rem .35rem; border-radius:4px; border:1px solid #2D3645; background:#252D3A; color:#8B95A5; font-size:.65rem; cursor:pointer; }
.axis-sep { color:#5B8DB8; font-size:.7rem; font-weight:700; }
canvas { width:100%; height:160px; background:#fffef7; border-radius:8px; border:1px solid #2D3645; }
.scatter-footer { display:flex; align-items:center; gap:.4rem; margin-top:.4rem; flex-wrap:wrap; }
.btn-slope { background:#252D3A; border:1px solid #2D3645; color:#5B8DB8; border-radius:4px; padding:.25rem .5rem; font-size:.72rem; cursor:pointer; transition:.15s; }
.btn-slope:hover:not(:disabled) { background:rgba(91,141,184,.15); }
.btn-slope:disabled { opacity:.5; cursor:not-allowed; }
.fit-readout { display:flex; gap:.5rem; font-size:.72rem; font-family:monospace; color:#D1D7E0; }
.fit-readout span { background:#252D3A; padding:.15rem .3rem; border-radius:4px; border:1px solid #2D3645; }
</style>
