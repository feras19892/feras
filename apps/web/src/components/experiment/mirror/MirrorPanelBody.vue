<script setup lang="ts">
import { computed } from 'vue'
import type { MirrorTrial } from '../../../composables/mirror/useMirrorExperiment'

interface Props {
  id: string
  trials: MirrorTrial[]
  params: { mirrorType: 'concave' | 'convex'; focalLength: number; objectDistance: number; objectHeight: number }
  imageDistance: number | null
  imageHeight: number | null
  magnification: number | null
  imageProperties: { type: string; orientation: string; size: string }
  focalFromRegression: number | null
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { mirrorType: 'concave' | 'convex'; focalLength: number; objectDistance: number; objectHeight: number }): void
}>()

const chartPoints = computed(() => props.trials
  .filter(t => t.imageDistance !== 0 && t.mirrorType === props.params.mirrorType && Number.isFinite(t.invDo) && Number.isFinite(t.invDi))
  .map((t) => ({ invDo: t.invDo, invDi: t.invDi })))

const chartBounds = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return { xMin: 0, xMax: 0.12, yMin: -0.12, yMax: 0.05 }
  const invDos = pts.map(p => p.invDo)
  const invDis = pts.map(p => p.invDi)
  const xMin = 0
  const xMax = Math.max(...invDos, 0.001) * 1.1
  const yMin = Math.min(...invDis, 0) * 1.1
  const yMax = Math.max(...invDis, 0.001) * 1.1
  return { xMin, xMax, yMin, yMax }
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

const regLineStart = computed(() => ({
  x: toSvgX(chartBounds.value.xMin),
  y: toSvgY(props.regressionSlope * chartBounds.value.xMin + props.regressionIntercept)
}))

const regLineEnd = computed(() => ({
  x: toSvgX(chartBounds.value.xMax),
  y: toSvgY(props.regressionSlope * chartBounds.value.xMax + props.regressionIntercept)
}))
</script>

<template>
  <div class="panel-body">
    <template v-if="id === 'readings'">
      <div class="reading-row"><span class="reading-label">البعد البؤري f</span><span class="reading-val">{{ params.focalLength.toFixed(1) }} cm</span></div>
      <div class="reading-row"><span class="reading-label">بعد الجسم do</span><span class="reading-val">{{ params.objectDistance.toFixed(1) }} cm</span></div>
      <div class="reading-row"><span class="reading-label">بعد الصورة di</span><span class="reading-val">{{ imageDistance !== null ? imageDistance.toFixed(1) + ' cm' + (imageDistance < 0 ? ' (افتراضي)' : '') : '∞' }}</span></div>
      <div class="reading-row"><span class="reading-label">ارتفاع الجسم ho</span><span class="reading-val">{{ params.objectHeight.toFixed(1) }} cm</span></div>
      <div class="reading-row"><span class="reading-label">ارتفاع الصورة hi</span><span class="reading-val">{{ imageHeight !== null ? imageHeight.toFixed(1) + ' cm' : '—' }}</span></div>
      <div class="reading-row"><span class="reading-label">التكبير m</span><span class="reading-val">{{ magnification !== null ? magnification.toFixed(2) : '—' }}</span></div>
      <div class="reading-row"><span class="reading-label">نوع الصورة</span><span class="reading-val">{{ imageProperties.type }}</span></div>
      <div class="reading-row"><span class="reading-label">اتجاه الصورة</span><span class="reading-val">{{ imageProperties.orientation }}</span></div>
      <div class="reading-row"><span class="reading-label">حجم الصورة</span><span class="reading-val">{{ imageProperties.size }}</span></div>
    </template>

    <template v-if="id === 'chart'">
      <div v-if="trials.length >= 2" class="chart-box">
        <svg viewBox="0 0 300 200" class="reg-chart">
          <!-- X axis -->
          <line :x1="toSvgX(chartBounds.xMin)" :y1="toSvgY(0)" :x2="toSvgX(chartBounds.xMax)" :y2="toSvgY(0)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <!-- Y axis -->
          <line :x1="toSvgX(0)" :y1="toSvgY(chartBounds.yMin)" :x2="toSvgX(0)" :y2="toSvgY(chartBounds.yMax)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <!-- Labels -->
          <text x="150" y="195" fill="#8B95A5" font-size="10" text-anchor="middle">1/do (1/cm)</text>
          <text x="10" y="100" fill="#8B95A5" font-size="10" text-anchor="middle" transform="rotate(-90 10 100)">1/di (1/cm)</text>
          <!-- Points -->
          <g v-for="(p, i) in chartPoints" :key="i">
            <circle :cx="toSvgX(p.invDo)" :cy="toSvgY(p.invDi)" r="4" fill="#22c55e"/>
          </g>
          <!-- Regression line -->
          <line v-if="regressionSlope && chartPoints.length >= 2" :x1="regLineStart.x" :y1="regLineStart.y" :x2="regLineEnd.x" :y2="regLineEnd.y" stroke="#fbbf24" stroke-width="1.5"/>
        </svg>
        <div class="reg-summary">
          <span class="reg-badge">الميل = {{ regressionSlope.toFixed(3) }}</span>
          <span class="reg-badge">R² = {{ rSquared.toFixed(4) }}</span>
        </div>
      </div>
      <div v-else class="empty">سجل قراءتين على الأقل</div>
    </template>

    <template v-if="id === 'trials'">
      <div v-if="trials.length === 0" class="empty">لا توجد قراءات مسجلة</div>
      <div v-else class="trial-table">
        <div class="trial-header"><span>#</span><span>النوع</span><span>do</span><span>di</span><span>m</span></div>
        <div v-for="t in trials" :key="t.id" class="trial-row">
          <span class="trial-num">{{ t.id }}</span>
          <span class="mono" style="font-size:.65rem">{{ t.mirrorType === 'concave' ? '🔭' : '🪞' }}</span>
          <span>{{ t.objectDistance.toFixed(0) }}</span>
          <span>{{ t.imageDistance.toFixed(1) }}</span>
          <span class="mono">{{ t.magnification.toFixed(2) }}</span>
          <button class="trial-del" @click="emit('remove', t.id)">🗑️</button>
        </div>
      </div>
      <button v-if="trials.length" class="btn-clear" @click="emit('clear')">مسح الكل</button>
    </template>

    <template v-if="id === 'params'">
      <div class="param-row">
        <label>نوع المرآة</label>
        <div class="mirror-toggle">
          <button :class="{ active: params.mirrorType === 'concave' }" @click="emit('update:params', { ...params, mirrorType: 'concave' })">مقعرة 🔭</button>
          <button :class="{ active: params.mirrorType === 'convex' }" @click="emit('update:params', { ...params, mirrorType: 'convex' })">محدبة 🪞</button>
        </div>
      </div>
      <div class="param-row">
        <label>البعد البؤري |f|</label>
        <input type="range" min="5" max="30" step="1" :value="params.focalLength" @input="emit('update:params', { ...params, focalLength: Number(($event.target as HTMLInputElement).value) })" />
        <span class="param-val">{{ params.focalLength }} cm ({{ params.mirrorType === 'concave' ? '+' : '-' }})</span>
      </div>
      <div class="param-row">
        <label>بعد الجسم do</label>
        <input type="range" min="10" max="80" step="1" :value="params.objectDistance" @input="emit('update:params', { ...params, objectDistance: Number(($event.target as HTMLInputElement).value) })" />
        <span class="param-val">{{ params.objectDistance }} cm</span>
      </div>
      <div class="param-row">
        <label>ارتفاع الجسم ho</label>
        <input type="range" min="1" max="15" step="0.5" :value="params.objectHeight" @input="emit('update:params', { ...params, objectHeight: Number(($event.target as HTMLInputElement).value) })" />
        <span class="param-val">{{ params.objectHeight }} cm</span>
      </div>
    </template>

    <template v-if="id === 'laws'">
      <div class="law-box">
        <div class="law-title">معادلة المرآة</div>
        <div class="law-formula">1/f = 1/do + 1/di</div>
        <div class="law-calc">
          1/{{ params.mirrorType === 'convex' ? '-' : '' }}{{ params.focalLength.toFixed(1) }} = 1/{{ params.objectDistance.toFixed(1) }} + 1/{{ imageDistance !== null ? imageDistance.toFixed(1) : '∞' }}
        </div>
        <div class="law-calc" v-if="imageDistance !== null && imageDistance !== 0">
          {{ (1/(params.mirrorType === 'convex' ? -params.focalLength : params.focalLength)).toFixed(4) }} = {{ (1/params.objectDistance).toFixed(4) }} + {{ (1/imageDistance).toFixed(4) }} = {{ ((1/params.objectDistance) + (1/imageDistance)).toFixed(4) }} ✓
        </div>
      </div>
      <div class="law-box">
        <div class="law-title">التكبير</div>
        <div class="law-formula">m = -di/do = hi/ho</div>
        <div class="law-calc">
          m = {{ imageDistance !== null && params.objectDistance !== 0 ? (-imageDistance/params.objectDistance).toFixed(2) : '—' }} = {{ imageHeight !== null && params.objectHeight !== 0 ? (imageHeight/params.objectHeight).toFixed(2) : '—' }}
        </div>
      </div>
    </template>

    <template v-if="id === 'results'">
      <div v-if="trials.length < 2" class="empty">سجل قراءتين على الأقل</div>
      <template v-else>
        <div class="result-row"><span class="result-label">عدد القراءات</span><span class="result-val">{{ trials.length }}</span></div>
        <div class="result-row"><span class="result-label">f من الانحدار</span><span class="result-val highlight">{{ focalFromRegression !== null ? focalFromRegression.toFixed(2) + ' cm' : '—' }}</span></div>
        <div class="result-row"><span class="result-label">معامل التحديد R²</span><span class="result-val">{{ rSquared.toFixed(4) }}</span></div>
        <div class="result-row"><span class="result-label">f المتوقع</span><span class="result-val">{{ params.focalLength.toFixed(1) }} cm</span></div>
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
.trial-header { display: grid; grid-template-columns: 24px 28px 38px 38px 38px 20px; gap: .2rem; padding: .15rem .3rem; color: #8B95A5; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); }
.trial-row { display: grid; grid-template-columns: 24px 28px 38px 38px 38px 20px; gap: .2rem; padding: .15rem .3rem; align-items: center; }
.trial-row:nth-child(even) { background: rgba(255,255,255,0.02); }
.mono { font-family: monospace; color: #67e8f9; }
.trial-del { background: none; border: none; cursor: pointer; font-size: .65rem; opacity: .5; }
.trial-del:hover { opacity: 1; }
.btn-clear { padding: .3rem; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; font-size: .75rem; cursor: pointer; font-family: inherit; margin-top: .3rem; }
.param-row { display: flex; flex-direction: column; gap: .25rem; }
.param-row label { font-size: .75rem; color: #8B95A5; }
.param-row input[type='range'] { accent-color: #67e8f9; }
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
.mirror-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: .3rem; }
.mirror-toggle button { padding: .35rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #8B95A5; font-size: .78rem; cursor: pointer; font-family: inherit; transition: all .15s; }
.mirror-toggle button:hover { background: rgba(255,255,255,0.06); }
.mirror-toggle button.active { background: rgba(91,141,184,.15); border-color: #5B8DB8; color: #5B8DB8; font-weight: 700; }
</style>
