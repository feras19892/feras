<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { fft, applyHannWindow } from '../../../modules/physics/experiments/spring/fft'

interface FftResult { freqs: number[]; amplitudes: number[]; dominantFreq: number }

const props = defineProps<{
  signalSeries: { t: number; x: number }[]
  params: { mass: number; k: number }
}>()

const fftWindow = ref<'hann' | 'rect'>('hann')
const fftSampleRate = ref(200)
const fftResult = defineModel<FftResult | null>({ required: true })
const fftCanvasRef = ref<HTMLCanvasElement | null>(null)
const fftWrapRef = ref<HTMLDivElement | null>(null)

function resizeCanvas() {
  const canvas = fftCanvasRef.value
  const wrap = fftWrapRef.value
  if (!canvas || !wrap) return
  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
}

function run() {
  const series = props.signalSeries
  if (series.length < 32) { fftResult.value = null; return }
  const n = Math.min(2048, 1 << (32 - Math.clz32(series.length - 1)))
  const samples = series.slice(-n)
  let xs = samples.map(s => s.x)
  if (fftWindow.value === 'hann') xs = applyHannWindow(xs)
  const result = fft(xs, fftSampleRate.value)
  if (!result) { fftResult.value = null; return }
  fftResult.value = result
  draw()
}

function draw() {
  const canvas = fftCanvasRef.value
  if (!canvas) return
  resizeCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#fffef7'
  ctx.fillRect(0, 0, W, H)
  const r = fftResult.value
  if (!r) {
    ctx.fillStyle = '#94a3b8'; ctx.font = '13px Segoe UI'; ctx.textAlign = 'center'
    ctx.fillText(t('experiments.pressRunFft'), W/2, H/2)
    ctx.textAlign = 'start'; return
  }
  const padL=52, padR=16, padT=18, padB=36
  const iW=W-padL-padR, iH=H-padT-padB
  const maxFreq = Math.min(r.freqs[r.freqs.length-1], 30)
  const maxAmp = Math.max(...r.amplitudes)
  if (maxAmp < 1e-9) return
  // axes
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL,padT+iH); ctx.lineTo(padL+iW,padT+iH); ctx.stroke()
  // grid & labels
  for (let i=0;i<=6;i++) { const f=(maxFreq*i)/6; const px=padL+(f/maxFreq)*iW; ctx.fillStyle='#64748b'; ctx.font='10px Segoe UI'; ctx.textAlign='center'; ctx.fillText(f.toFixed(1),px,padT+iH+14); ctx.strokeStyle='rgba(148,163,184,0.2)'; ctx.beginPath(); ctx.moveTo(px,padT); ctx.lineTo(px,padT+iH); ctx.stroke() }
  ctx.textAlign='right'
  for (let i=0;i<=4;i++) { const a=(maxAmp*i)/4; const py=padT+iH-(a/maxAmp)*iH; ctx.fillStyle='#64748b'; ctx.fillText(a.toFixed(3),padL-4,py+4); ctx.strokeStyle='rgba(148,163,184,0.2)'; ctx.beginPath(); ctx.moveTo(padL,py); ctx.lineTo(padL+iW,py); ctx.stroke() }
  ctx.textAlign='center'; ctx.fillStyle='#475569'; ctx.font='11px Segoe UI'; ctx.fillText('f (Hz)', padL+iW/2, H-4)
  ctx.save(); ctx.translate(12,padT+iH/2); ctx.rotate(-Math.PI/2); ctx.fillText('Amplitude',0,0); ctx.restore()
  // bars
  ctx.fillStyle='rgba(59,130,246,0.7)'
  for (let k=1;k<r.freqs.length;k++) { const f=r.freqs[k]; if(f>maxFreq) break; const px=padL+(f/maxFreq)*iW; const amp=r.amplitudes[k]; const barH=(amp/maxAmp)*iH; const barW=Math.max(1.5, iW/r.freqs.length*0.8); ctx.fillRect(px-barW/2, padT+iH-barH, barW, barH) }
  // dominant marker
  const df=r.dominantFreq
  if (df<=maxFreq) { const px=padL+(df/maxFreq)*iW; ctx.strokeStyle='#dc2626'; ctx.lineWidth=2; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(px,padT); ctx.lineTo(px,padT+iH); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle='#dc2626'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center'; ctx.fillText(`f=${df.toFixed(3)} Hz`, px, padT+12) }
  // theoretical marker
  const theoreticalF = props.params.mass>0&&props.params.k>0 ? (1/(2*Math.PI))*Math.sqrt(props.params.k/props.params.mass) : null
  if (theoreticalF && theoreticalF<=maxFreq) { const px=padL+(theoreticalF/maxFreq)*iW; ctx.strokeStyle='#059669'; ctx.lineWidth=2; ctx.setLineDash([6,3]); ctx.beginPath(); ctx.moveTo(px,padT); ctx.lineTo(px,padT+iH); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle='#059669'; ctx.font='bold 11px Segoe UI'; ctx.textAlign='center'; ctx.fillText(`f₀=${theoreticalF.toFixed(3)}`, px, padT+iH-8) }
}

function clear() { fftResult.value = null; draw() }

watch(() => props.signalSeries, () => { if (!fftResult.value) draw() }, { deep: true })

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (fftWrapRef.value) {
    resizeObs = new ResizeObserver(() => { resizeCanvas(); draw() })
    resizeObs.observe(fftWrapRef.value)
  }
  draw()
})
onUnmounted(() => { if (resizeObs) resizeObs.disconnect() })
</script>

<template>
  <div class="fft-panel">
    <div class="fft-controls">
      <select v-model="fftWindow"><option value="hann">Hann</option><option value="rect">Rect</option></select>
      <select v-model.number="fftSampleRate"><option :value="100">100 Hz</option><option :value="200">200 Hz</option><option :value="500">500 Hz</option></select>
      <button class="btn-fft" @click="run">Run</button>
      <button class="btn-fft-clear" @click="clear">Clear</button>
    </div>
    <div class="fft-canvas-wrap" ref="fftWrapRef">
      <canvas ref="fftCanvasRef" class="fft-canvas" />
    </div>
    <div v-if="fftResult" class="fft-result-row">
      <span class="fft-badge dom">f<sub>dom</sub> = {{ fftResult.dominantFreq.toFixed(4) }} Hz</span>
      <span class="fft-badge theo">f₀ = {{ ((1/(2*Math.PI))*Math.sqrt(params.k/params.mass)).toFixed(4) }} Hz</span>
      <span class="fft-badge err">Δf = {{ (Math.abs(fftResult.dominantFreq - (1/(2*Math.PI))*Math.sqrt(params.k/params.mass)) / ((1/(2*Math.PI))*Math.sqrt(params.k/params.mass)) * 100).toFixed(2) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.fft-panel { display:flex; flex-direction:column; flex:1; min-height:0; }
.fft-controls { display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; margin-bottom:.3rem; font-size:.75rem; flex-shrink:0; }
.fft-controls select { padding:.25rem .4rem; border-radius:5px; border:1px solid #2D3645; background:#252D3A; color:#D1D7E0; font-size:.72rem; }
.btn-fft { padding:.35rem .7rem; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border:none; border-radius:999px; cursor:pointer; font-weight:700; font-size:.72rem; }
.btn-fft-clear { padding:.35rem .6rem; background:#e2e8f0; color:#475569; border:none; border-radius:999px; cursor:pointer; font-size:.7rem; font-weight:600; }
.fft-canvas-wrap { flex:1; min-height:0; position:relative; }
.fft-canvas-wrap canvas { position:absolute; inset:0; width:100%; height:100%; background:#fffef7 !important; border:1px solid #ddd !important; border-radius:8px; }
.fft-result-row { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.4rem; flex-shrink:0; }
.fft-badge { padding:3px 10px; border-radius:999px; font-family:monospace; font-size:.72rem; font-weight:600; }
.fft-badge.dom { background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; }
.fft-badge.theo { background:#dcfce7; color:#059669; border:1px solid #86efac; }
.fft-badge.err { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin:0 0 .3rem; }
.card-header h4 { margin:0; font-size:.82rem; color:#D1D7E0; font-weight:700; }
</style>
