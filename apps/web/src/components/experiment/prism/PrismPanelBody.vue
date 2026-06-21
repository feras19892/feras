<script setup lang="ts">
import { computed } from 'vue'
import type { PrismTrial } from '../../../composables/prism/usePrismExperiment'
import { getMaterialList } from '../../../composables/prism/usePrismCalculations'

interface Props {
  id: string
  trials: PrismTrial[]
  params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }
  angleRefraction1: number | null
  angleIncidence2: number | null
  angleEmergence: number | null
  deviation: number | null
  totalInternalReflection: boolean
  criticalAngle: number | null
  slope: number
  intercept: number
  rSquared: number
  nFromRegression: number | null
  speedInMedium: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }): void
}>()

const chartPoints = computed(() => props.trials
  .filter(t => t.angleEmergence !== null)
  .map((t) => ({ deviation: t.deviation, n: t.n })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 0, xMax: 60, yMin: 1.0, yMax: 2.5 }
  const xs = pts.map(p => p.deviation)
  const ys = pts.map(p => p.n)
  return { xMin: Math.min(...xs) * 0.9, xMax: Math.max(...xs) * 1.1, yMin: Math.min(...ys) * 0.9, yMax: Math.max(...ys) * 1.1 }
})

const svgPad = { left: 40, right: 15, top: 15, bottom: 35 }
const svgW = 300
const svgH = 200

const plotW = computed(() => svgW - svgPad.left - svgPad.right)
const plotH = computed(() => svgH - svgPad.top - svgPad.bottom)

const xScale = computed(() => {
  const dx = chartBounds.value.xMax - chartBounds.value.xMin
  return dx > 0 ? plotW.value / dx : 1
})

const yScale = computed(() => {
  const dy = chartBounds.value.yMax - chartBounds.value.yMin
  return dy > 0 ? plotH.value / dy : 1
})

function toSvgX(val: number) {
  return svgPad.left + (val - chartBounds.value.xMin) * xScale.value
}

function toSvgY(val: number) {
  return svgH - svgPad.bottom - (val - chartBounds.value.yMin) * yScale.value
}

const materials = getMaterialList()
</script>

<template>
  <div class="panel-body">
    <template v-if="id === 'readings'">
      <div class="reading-row"><span class="reading-label">زاوية رأس المنشور A</span><span class="reading-val">{{ params.prismAngle.toFixed(0) }}°</span></div>
      <div class="reading-row"><span class="reading-label">زاوية السقوط θᵢ</span><span class="reading-val">{{ params.angleIncidence.toFixed(1) }}°</span></div>
      <div class="reading-row"><span class="reading-label">زاوية الانكسار r₁</span><span class="reading-val">{{ angleRefraction1 !== null ? angleRefraction1.toFixed(1) + '°' : '—' }}</span></div>
      <div class="reading-row"><span class="reading-label">زاوية السقوط على الوجه 2</span><span class="reading-val">{{ angleIncidence2 !== null ? angleIncidence2.toFixed(1) + '°' : '—' }}</span></div>
      <div class="reading-row"><span class="reading-label">زاوية الخروج θₑ</span><span class="reading-val">{{ angleEmergence !== null ? angleEmergence.toFixed(1) + '°' : 'TIR' }}</span></div>
      <div class="reading-row"><span class="reading-label">زاوية الانحراف D</span><span class="reading-val">{{ deviation !== null ? deviation.toFixed(1) + '°' : '—' }}</span></div>
      <div class="reading-row"><span class="reading-label">معامل الانكسار n</span><span class="reading-val">{{ nFromRegression !== null ? nFromRegression.toFixed(3) : '—' }}</span></div>
      <div class="reading-row"><span class="reading-label">الطول الموجي λ</span><span class="reading-val">{{ params.wavelength }} nm</span></div>
      <div class="reading-row"><span class="reading-label">سرعة الضوء في الوسط</span><span class="reading-val">{{ speedInMedium !== null ? (speedInMedium / 1e6).toFixed(2) + '×10⁶ m/s' : '—' }}</span></div>
    </template>

    <template v-if="id === 'chart'">
      <div v-if="trials.length >= 2" class="chart-box">
        <svg viewBox="0 0 300 200" class="reg-chart">
          <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(0)" :x2="toSvgX(chartBounds.xMax)" :y2="toSvgY(0)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <line :x1="toSvgX(0)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(0)" :y2="toSvgY(chartBounds.yMax)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <text x="150" y="195" fill="#8B95A5" font-size="10" text-anchor="middle">D (deg)</text>
          <text x="10" y="100" fill="#8B95A5" font-size="10" text-anchor="middle" transform="rotate(-90 10 100)">n</text>
          <g v-for="(p, i) in chartPoints" :key="i">
            <circle :cx="toSvgX(p.deviation)" :cy="toSvgY(p.n)" r="4" fill="#22c55e"/>
          </g>
          <line v-if="slope && chartPoints.length >= 2" :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(slope * chartBounds.xMin + intercept)" :x2="toSvgX(chartBounds.xMax)" :y2="toSvgY(slope * chartBounds.xMax + intercept)" stroke="#fbbf24" stroke-width="1.5"/>
        </svg>
        <div class="reg-summary">
          <span class="reg-badge">الميل = {{ slope.toFixed(3) }}</span>
          <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
        </div>
      </div>
      <div v-else class="empty">سجل قراءتين على الأقل</div>
    </template>

    <template v-if="id === 'trials'">
      <div v-if="trials.length === 0" class="empty">لا توجد قراءات مسجلة</div>
      <div v-else class="trial-table">
        <div class="trial-header"><span>#</span><span>λ</span><span>θᵢ</span><span>θₑ</span><span>D</span><span>n</span></div>
        <div v-for="t in trials" :key="t.id" class="trial-row">
          <span class="trial-num">{{ t.id }}</span>
          <span class="mono" style="font-size:.65rem">{{ t.wavelength }}</span>
          <span>{{ t.angleIncidence.toFixed(0) }}</span>
          <span>{{ t.angleEmergence !== null ? t.angleEmergence.toFixed(1) : 'TIR' }}</span>
          <span>{{ t.deviation.toFixed(1) }}</span>
          <span class="mono">{{ t.n.toFixed(2) }}</span>
          <button class="trial-del" @click="emit('remove', t.id)">&#x1F5D1;</button>
        </div>
      </div>
      <button v-if="trials.length" class="btn-clear" @click="emit('clear')">مسح الكل</button>
    </template>

    <template v-if="id === 'params'">
      <div class="param-row">
        <label>مادة المنشور</label>
        <select :value="params.material" @change="emit('update:params', { ...params, material: ($event.target as HTMLSelectElement).value })">
          <option v-for="m in materials" :key="m.key" :value="m.key">{{ m.nameAr }}</option>
        </select>
      </div>
      <div class="param-row">
        <label>زاوية رأس المنشور A</label>
        <input type="range" min="30" max="90" step="1" :value="params.prismAngle" @input="emit('update:params', { ...params, prismAngle: Number(($event.target as HTMLInputElement).value) })" />
        <span class="param-val">{{ params.prismAngle }}°</span>
      </div>
      <div class="param-row">
        <label>زاوية السقوط θᵢ</label>
        <input type="range" min="0" max="89" step="1" :value="params.angleIncidence" @input="emit('update:params', { ...params, angleIncidence: Number(($event.target as HTMLInputElement).value) })" />
        <span class="param-val">{{ params.angleIncidence }}°</span>
      </div>
      <div class="param-row">
        <label>الطول الموجي λ</label>
        <input type="range" min="380" max="700" step="5" :value="params.wavelength" @input="emit('update:params', { ...params, wavelength: Number(($event.target as HTMLInputElement).value) })" />
        <span class="param-val">{{ params.wavelength }} nm</span>
      </div>
    </template>

    <template v-if="id === 'laws'">
      <div class="law-box">
        <div class="law-title">قانون سنل</div>
        <div class="law-formula">n₁ sin θ₁ = n₂ sin θ₂</div>
        <div class="law-calc">
          1.0 × sin({{ params.angleIncidence.toFixed(1) }}°) = n × sin({{ angleRefraction1 !== null ? angleRefraction1.toFixed(1) : '—' }}°)
        </div>
      </div>
      <div class="law-box">
        <div class="law-title">معادلة المنشور</div>
        <div class="law-formula">n = sin((A+D)/2) / sin(A/2)</div>
        <div class="law-calc" v-if="deviation !== null">
          n = sin(({{ params.prismAngle }}+{{ deviation.toFixed(1) }})/2) / sin({{ params.prismAngle }}/2) = {{ nFromRegression !== null ? nFromRegression.toFixed(3) : '—' }}
        </div>
      </div>
    </template>

    <template v-if="id === 'results'">
      <div v-if="trials.length < 2" class="empty">سجل قراءتين على الأقل</div>
      <template v-else>
        <div class="result-row"><span class="result-label">عدد القراءات</span><span class="result-val">{{ trials.length }}</span></div>
        <div class="result-row"><span class="result-label">n المتوسط</span><span class="result-val highlight">{{ nFromRegression !== null ? nFromRegression.toFixed(3) : '—' }}</span></div>
        <div class="result-row"><span class="result-label">معامل التحديد R²</span><span class="result-val">{{ rSquared.toFixed(4) }}</span></div>
        <div class="result-row"><span class="result-label">n المتوقع</span><span class="result-val">{{ materials.find(m => m.key === params.material)?.nameAr ?? '—' }}</span></div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.reading-row { display: flex; justify-content: space-between; align-items: center; }
.reading-label { color: #8B95A5; }
.reading-val { font-family: monospace; color: #fbbf24; font-weight: 700; }
.empty { text-align: center; color: #475569; font-size: .8rem; padding: .5rem; }
.trial-table { display: flex; flex-direction: column; gap: .2rem; font-size: .7rem; }
.trial-header { display: grid; grid-template-columns: 22px 32px 32px 38px 32px 38px 20px; gap: .2rem; padding: .15rem .3rem; color: #8B95A5; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); }
.trial-row { display: grid; grid-template-columns: 22px 32px 32px 38px 32px 38px 20px; gap: .2rem; padding: .15rem .3rem; align-items: center; }
.trial-row:nth-child(even) { background: rgba(255,255,255,0.02); }
.mono { font-family: monospace; color: #67e8f9; }
.trial-del { background: none; border: none; cursor: pointer; font-size: .65rem; opacity: .5; }
.trial-del:hover { opacity: 1; }
.btn-clear { padding: .3rem; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; font-size: .75rem; cursor: pointer; font-family: inherit; margin-top: .3rem; }
.param-row { display: flex; flex-direction: column; gap: .25rem; }
.param-row label { font-size: .75rem; color: #8B95A5; }
.param-row input[type='range'] { accent-color: #67e8f9; }
.param-row select { background: #161B22; color: #D1D7E0; border: 1px solid #2D3645; border-radius: 4px; padding: .25rem; font-family: inherit; }
.param-val { font-family: monospace; color: #67e8f9; font-size: .8rem; text-align: center; }
.law-box { background: rgba(255,255,255,0.02); border-radius: 6px; padding: .5rem; }
.law-title { font-size: .75rem; color: #8B95A5; margin-bottom: .2rem; }
.law-formula { font-family: monospace; font-size: .9rem; color: #fbbf24; }
.law-calc { font-family: monospace; font-size: .75rem; color: #67e8f9; margin-top: .2rem; }
.result-row { display: flex; justify-content: space-between; align-items: center; }
.result-label { color: #8B95A5; font-size: .78rem; }
.result-val { font-family: monospace; color: #D1D7E0; font-size: .82rem; }
.result-val.highlight { color: #22c55e; font-weight: 700; }
.reg-summary { display: flex; gap: .4rem; margin-top: .4rem; flex-wrap: wrap; }
.reg-badge { padding: .15rem .4rem; border-radius: 999px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; font-size: .7rem; font-weight: 700; font-family: monospace; }
.chart-box { display: flex; flex-direction: column; align-items: center; }
.reg-chart { width: 100%; height: 160px; }
</style>
