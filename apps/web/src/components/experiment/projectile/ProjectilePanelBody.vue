<script setup lang="ts">
import type { ProjectileTrial } from '../../../composables/projectile/useProjectileTrials'
import type { ProjectileParams } from '../../../modules/physics/experiments/projectile/useProjectilePhysics'
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useI18n } from '../../../composables/useI18n'

interface SimState { t: number; x: number; y: number; vx: number; vy: number; running: boolean; paused: boolean; landed: boolean; trail: {x:number;y:number}[]; signalSeries: {t:number;vx:number;vy:number}[] }
interface MeasuredState { flightTime: number | null; maxHeight: number | null; range: number | null }
interface TrialStats { range_mean: number; range_std: number; flightTime_mean: number; flightTime_std: number }

const { t } = useI18n()
const props = defineProps<{
  id: string
  trials: ProjectileTrial[]
  calcResult: string
  params: ProjectileParams
  sim: SimState
  measured: MeasuredState
  trialStats: TrialStats | null
  tutorType?: string
  tutorMessage?: string
  fitResult?: { slope: number; intercept: number } | null
}>()

const emit = defineEmits<{
  (e: 'update:trials', val: ProjectileTrial[]): void
  (e: 'update:params', val: Partial<ProjectileParams>): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'calcFlightTime'): void
  (e: 'calcMaxHeight'): void
  (e: 'calcRange'): void
  (e: 'calcFitRange'): void
  (e: 'showCalc', html: string): void
}>()

const resultLines = computed(() => {
  if (!props.calcResult) return []
  return props.calcResult.split(/<br\s*\/?>/i).map(l => l.replace(/<\/?b>/gi, '').trim()).filter(Boolean)
})

const signalCanvas = ref<HTMLCanvasElement | null>(null)
const vxCanvas = ref<HTMLCanvasElement | null>(null)
const vyCanvas = ref<HTMLCanvasElement | null>(null)
const scatterCanvas = ref<HTMLCanvasElement | null>(null)

function drawLineChart(canvas: HTMLCanvasElement | null, data: {x:number,y:number}[], color: string, xLabel: string, yLabel: string) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height, pad = 20
  ctx.fillStyle = '#1E2530'; ctx.fillRect(0,0,w,h)
  if (data.length < 2) { ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText(t('experiments.noData'),w/2,h/2); return }
  const xs = data.map(d=>d.x), ys = data.map(d=>d.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const xRange = maxX===minX ? 1 : maxX-minX
  const yRange = maxY===minY ? 1 : maxY-minY
  const rx = (w-pad*2)/xRange, ry = (h-pad*2)/yRange
  const sx = (x:number) => pad + (x-minX)*rx
  const sy = (y:number) => h - pad - (y-minY)*ry
  ctx.strokeStyle='rgba(148,163,184,0.2)'; ctx.lineWidth=1
  for (let i=0;i<5;i++){ const y=pad+(h-pad*2)*i/4; ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke() }
  for (let i=0;i<5;i++){ const x=pad+(w-pad*2)*i/4; ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,h-pad);ctx.stroke() }
  ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath()
  data.forEach((p,i)=>{ if(i===0) ctx.moveTo(sx(p.x),sy(p.y)); else ctx.lineTo(sx(p.x),sy(p.y)) })
  ctx.stroke()
  ctx.fillStyle=color; data.forEach(p=>{ ctx.beginPath();ctx.arc(sx(p.x),sy(p.y),2,0,Math.PI*2);ctx.fill() })
  ctx.strokeStyle='#475569'; ctx.lineWidth=1
  ctx.beginPath();ctx.moveTo(pad,h-pad);ctx.lineTo(w-pad,h-pad);ctx.stroke()
  ctx.beginPath();ctx.moveTo(pad,pad);ctx.lineTo(pad,h-pad);ctx.stroke()
  ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='center'
  ctx.fillText(xLabel,w-pad-10,h-pad+12);ctx.fillText(yLabel,pad-8,pad+8)
}

function drawScatter(canvas: HTMLCanvasElement | null, data: {x:number,y:number}[], color: string, fit?: { slope: number; intercept: number } | null) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height
  const padL = 36, padR = 12, padT = 12, padB = 28
  const plotW = w - padL - padR, plotH = h - padT - padB
  ctx.fillStyle = '#1E2530'; ctx.fillRect(0,0,w,h)
  if (data.length < 1) { ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText(t('experiments.recordReadingsFirst'),w/2,h/2); return }

  const xs = data.map(d=>d.x), ys = data.map(d=>d.y)
  let minX = Math.min(...xs), maxX = Math.max(...xs)
  let minY = Math.min(...ys), maxY = Math.max(...ys)
  if (maxX === minX) { minX -= 10; maxX += 10 }
  if (maxY === minY) { minY -= 5;  maxY += 5 }
  // Add 10% margin so points don't touch edges
  const xMargin = (maxX - minX) * 0.1
  const yMargin = (maxY - minY) * 0.1
  minX -= xMargin; maxX += xMargin
  minY -= yMargin; maxY += yMargin

  const rx = plotW / (maxX - minX)
  const ry = plotH / (maxY - minY)
  const sx = (x:number) => padL + (x - minX) * rx
  const sy = (y:number) => h - padB - (y - minY) * ry

  // Grid + ticks
  ctx.strokeStyle='rgba(148,163,184,0.15)'; ctx.lineWidth=1
  ctx.fillStyle='#94a3b8'; ctx.font='9px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top'
  for (let i=0;i<=4;i++){
    const t = i/4
    const x = padL + plotW*t
    const xVal = minX + (maxX-minX)*t
    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h-padB); ctx.stroke()
    ctx.fillText(xVal.toFixed(2), x, h-padB+4)
  }
  ctx.textAlign='right'; ctx.textBaseline='middle'
  for (let i=0;i<=4;i++){
    const t = i/4
    const y = h - padB - plotH*t
    const yVal = minY + (maxY-minY)*t
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w-padR, y); ctx.stroke()
    ctx.fillText(yVal.toFixed(0), padL-4, y)
  }

  // Points
  ctx.fillStyle=color; data.forEach(p=>{ ctx.beginPath();ctx.arc(sx(p.x),sy(p.y),4,0,Math.PI*2);ctx.fill() })

  // Fit line: R = slope·x + intercept  (where x = sin(2θ))
  if (fit) {
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 80; i++) {
      const xFit = minX + (maxX - minX) * (i / 80)
      const yFit = fit.slope * xFit + fit.intercept
      const px = sx(xFit)
      const py = sy(yFit)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // Axes
  ctx.strokeStyle='#64748b'; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(padL,h-padB); ctx.lineTo(w-padR,h-padB); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL,h-padB); ctx.stroke()

  // Labels
  ctx.fillStyle='#94a3b8'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top'
  ctx.fillText('sin(2θ)', w/2, h-12)
  ctx.save(); ctx.translate(10, h/2); ctx.rotate(-Math.PI/2); ctx.textAlign='center'; ctx.fillText('R (m)', 0, 0); ctx.restore()
}

function drawCharts() {
  nextTick(() => {
    if (signalCanvas.value && props.sim?.trail) drawLineChart(signalCanvas.value, props.sim.trail.map((p: {x:number;y:number})=>({x:p.x,y:p.y})), '#3b82f6', 'x (m)', 'y (m)')
    if (vxCanvas.value && props.sim?.signalSeries) drawLineChart(vxCanvas.value, props.sim.signalSeries.map((s: {t:number;vx:number})=>({x:s.t,y:s.vx})), '#22c55e', 't (s)', 'vx (m/s)')
    if (vyCanvas.value && props.sim?.signalSeries) drawLineChart(vyCanvas.value, props.sim.signalSeries.map((s: {t:number;vy:number})=>({x:s.t,y:s.vy})), '#ef4444', 't (s)', 'vy (m/s)')
    if (scatterCanvas.value && props.trials?.length) drawScatter(scatterCanvas.value, props.trials.map((t: {angleDegrees:number;rangeMeters:number})=>({x:Math.sin(2*t.angleDegrees*Math.PI/180),y:t.rangeMeters})), '#3b82f6', props.fitResult)
  })
}

watch(() => [props.id, props.sim?.trail?.length, props.sim?.signalSeries?.length, props.trials, props.fitResult], drawCharts, { flush: 'post', deep: true })
onMounted(drawCharts)
</script>

<template>
  <div class="panel-body">
    <!-- params panel -->
    <template v-if="id === 'params'">
      <div class="param-row"><label>v₀ (m/s)</label><div class="param-inputs"><input type="range" min="1" max="100" step="0.1" :value="params.v0" @input="emit('update:params', { ...params, v0: +($event.target as HTMLInputElement).value })"><input type="number" step="0.1" :value="params.v0" @input="emit('update:params', { ...params, v0: +($event.target as HTMLInputElement).value })"></div></div>
      <div class="param-row"><label>{{ t('experiments.angle') }} (°)</label><div class="param-inputs"><input type="range" min="0" max="90" step="0.1" :value="params.angleDeg" @input="emit('update:params', { ...params, angleDeg: +($event.target as HTMLInputElement).value })"><input type="number" step="0.1" :value="params.angleDeg" @input="emit('update:params', { ...params, angleDeg: +($event.target as HTMLInputElement).value })"></div></div>
      <div class="param-row"><label>g (m/s²)</label><div class="param-inputs"><input type="range" min="1" max="50" step="0.1" :value="params.g" @input="emit('update:params', { ...params, g: +($event.target as HTMLInputElement).value })"><input type="number" step="0.1" :value="params.g" @input="emit('update:params', { ...params, g: +($event.target as HTMLInputElement).value })"></div></div>
      <div class="param-row"><label>x₀ (m)</label><div class="param-inputs"><input type="range" min="0" max="500" step="0.1" :value="params.x0" @input="emit('update:params', { ...params, x0: +($event.target as HTMLInputElement).value })"><input type="number" step="0.1" :value="params.x0" @input="emit('update:params', { ...params, x0: +($event.target as HTMLInputElement).value })"></div></div>
      <div class="param-row"><label>y₀ (m)</label><div class="param-inputs"><input type="range" min="0" max="200" step="0.1" :value="params.y0" @input="emit('update:params', { ...params, y0: +($event.target as HTMLInputElement).value })"><input type="number" step="0.1" :value="params.y0" @input="emit('update:params', { ...params, y0: +($event.target as HTMLInputElement).value })"></div></div>
      <div class="param-row"><label>{{ t('experiments.airResistanceK') }}</label><div class="param-inputs"><input type="range" min="0" max="2" step="0.01" :value="params.dragCoeff" @input="emit('update:params', { ...params, dragCoeff: +($event.target as HTMLInputElement).value })"><input type="number" step="0.01" :value="params.dragCoeff" @input="emit('update:params', { ...params, dragCoeff: +($event.target as HTMLInputElement).value })"></div></div>
    </template>

    <!-- table panel -->
    <template v-else-if="id === 'table'">
      <div v-if="!trials.length" class="empty">{{ t('experiments.noReadings') }}</div>
      <table v-else>
        <thead><tr><th>#</th><th>{{ t('experiments.angle') }}</th><th>v₀</th><th>{{ t('experiments.time') }}</th><th>{{ t('experiments.height') }}</th><th>{{ t('experiments.rangeLabel') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="trial in trials" :key="trial.id"><td>{{ trial.id }}</td><td>{{ trial.angleDegrees }}°</td><td>{{ trial.initialVelocity }}</td><td>{{ trial.flightTimeSec.toFixed(2) }}</td><td>{{ trial.maxHeightMeters.toFixed(2) }}</td><td>{{ trial.rangeMeters.toFixed(2) }}</td><td><button @click="emit('remove', trial.id)">×</button></td></tr>
        </tbody>
      </table>
      <button class="btn-clear" @click="emit('clear')">{{ t('experiments.clearAll') }}</button>
    </template>

    <!-- equations panel -->
    <template v-else-if="id === 'equations'">
      <div class="calc-btns">
        <button @click="emit('calcFlightTime')">{{ t('experiments.calculateFlightTime') }}</button>
        <button @click="emit('calcMaxHeight')">{{ t('experiments.calculateMaxHeight') }}</button>
        <button @click="emit('calcRange')">{{ t('experiments.calculateRange') }}</button>
        <button @click="emit('calcFitRange')">{{ t('experiments.fitRange') }}</button>
      </div>
      <div class="calc-result">
        <div v-for="(line, i) in resultLines" :key="i">{{ line }}</div>
      </div>
    </template>

    <!-- guide panel -->
    <template v-else-if="id === 'guide'">
      <ol class="guide-list">
        <li>{{ t('experiments.projectileGuideStep1') }}</li>
        <li>{{ t('experiments.projectileGuideStep2') }}</li>
        <li>{{ t('experiments.projectileGuideStep3') }}</li>
        <li>{{ t('experiments.projectileGuideStep4') }}</li>
        <li>{{ t('experiments.projectileGuideStep5') }}</li>
      </ol>
    </template>

    <!-- stats panel -->
    <template v-else-if="id === 'stats'">
      <div class="stats-grid">
        <div class="stat"><span class="label">{{ t('experiments.averageRange') }}</span><span class="val">{{ trialStats?.range_mean?.toFixed(2) ?? '--' }} m</span></div>
        <div class="stat"><span class="label">{{ t('experiments.rangeDeviation') }}</span><span class="val">{{ trialStats?.range_std?.toFixed(2) ?? '--' }} m</span></div>
        <div class="stat"><span class="label">{{ t('experiments.averageTime') }}</span><span class="val">{{ trialStats?.flightTime_mean?.toFixed(2) ?? '--' }} s</span></div>
        <div class="stat"><span class="label">{{ t('experiments.timeDeviation') }}</span><span class="val">{{ trialStats?.flightTime_std?.toFixed(2) ?? '--' }} s</span></div>
      </div>
    </template>

    <!-- tutor panel -->
    <template v-else-if="id === 'tutor'">
      <div class="tutor" :class="tutorType"><span>{{ tutorMessage ?? t('experiments.ready') }}</span></div>
    </template>

    <!-- signal: trajectory y(x) -->
    <template v-else-if="id === 'signal'">
      <canvas ref="signalCanvas" class="chart-canvas" width="300" height="140" />
    </template>
    <!-- vxSignal: vx(t) -->
    <template v-else-if="id === 'vxSignal'">
      <canvas ref="vxCanvas" class="chart-canvas" width="300" height="140" />
    </template>
    <!-- vySignal: vy(t) -->
    <template v-else-if="id === 'vySignal'">
      <canvas ref="vyCanvas" class="chart-canvas" width="300" height="140" />
    </template>
    <!-- scatter: R vs sin(2θ) -->
    <template v-else-if="id === 'scatter'">
      <canvas ref="scatterCanvas" class="chart-canvas" width="300" height="140" />
    </template>
    <template v-else>
      <div class="placeholder">{{ id }}</div>
    </template>
  </div>
</template>

<style scoped>
.panel-body { padding: .4rem; font-size: .78rem; }
.param-row { display: flex; flex-direction: column; gap: .1rem; margin-bottom: .25rem; }
.param-row label { font-size: .68rem; color: #8B95A5; font-weight: 600; }
.param-inputs { display: flex; gap: .3rem; align-items: center; }
.param-inputs input[type="range"] { flex: 1; }
.param-inputs input[type="number"] { width: 60px; padding: .35rem .4rem; border-radius: 4px; border: 1px solid #2D3645; background: #252D3A; color: #D1D7E0; font-size: .75rem; text-align: center; }
.empty { text-align: center; color: #8B95A5; padding: 1rem; }
table { width: 100%; border-collapse: collapse; font-size: .7rem; }
th, td { padding: .25rem .3rem; text-align: center; border-bottom: 1px solid #2D3645; }
th { color: #8B95A5; background: #1E2530; }
.btn-clear { margin-top: .4rem; width: 100%; padding: .3rem; background: #ef4444; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: .72rem; }
.calc-btns { display: flex; flex-direction: column; gap: .25rem; }
.calc-btns button { padding: .3rem .5rem; background: #252D3A; color: #D1D7E0; border: 1px solid #2D3645; border-radius: 6px; cursor: pointer; font-size: .72rem; }
.calc-btns button:hover { background: #2D3645; }
.calc-result { margin-top: .4rem; padding: .4rem; background: #1E2530; border-radius: 6px; font-size: .72rem; line-height: 1.5; }
.guide-list { padding-right: 1.2rem; margin: 0; color: #8B95A5; font-size: .75rem; }
.guide-list li { margin-bottom: .3rem; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .4rem; }
.stat { background: #1E2530; padding: .3rem .5rem; border-radius: 6px; display: flex; flex-direction: column; }
.stat .label { font-size: .65rem; color: #8B95A5; }
.stat .val { font-size: .8rem; color: #5B8DB8; font-family: monospace; }
.tutor { padding: .4rem .6rem; border-radius: 6px; font-size: .75rem; }
.tutor.info { background: rgba(91,141,184,.1); color: #5B8DB8; }
.tutor.warn { background: rgba(245,158,11,.1); color: #f59e0b; }
.tutor.success { background: rgba(34,197,94,.1); color: #22c55e; }
.placeholder { text-align: center; color: #8B95A5; padding: 2rem; }
.chart-canvas { width: 100%; height: 140px; background: #1E2530; border-radius: 6px; border: 1px solid #2D3645; }
</style>
