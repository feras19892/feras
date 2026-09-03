<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed, ref } from 'vue'
import type { SpecificHeatTrial } from '../../../../composables/specific-heat/useSpecificHeatTrials'
import { METAL_CATALOG } from '../../../../composables/specific-heat/useSpecificHeatCalculations'


const props = defineProps<{
  trials: SpecificHeatTrial[]
  regressionSlope: number
  rSquared: number
  cFromSlope: number
  unknownMode?: boolean
}>()

const lastTrial = computed(() => props.trials.length ? props.trials[props.trials.length - 1] : null)
const errorPercent = computed(() => {
  if (!lastTrial.value || lastTrial.value.cTrue === 0) return null
  return Math.abs(lastTrial.value.cExtracted - lastTrial.value.cTrue) / lastTrial.value.cTrue * 100
})

const revealed = ref(false)
function guessMetal(cGuess: number) {
  let bestKey = ''
  let bestDiff = Infinity
  for (const [key, info] of Object.entries(METAL_CATALOG)) {
    const diff = Math.abs(info.c - cGuess)
    if (diff < bestDiff) { bestDiff = diff; bestKey = key }
  }
  return { key: bestKey, info: METAL_CATALOG[bestKey], diff: bestDiff }
}
const guess = computed(() => lastTrial.value ? guessMetal(lastTrial.value.cExtracted) : null)
</script>
<template>
  <div class="panel-body">
    <div class="stat-box"><div class="stat-label">عدد التجارب</div><div class="stat-value">{{ trials.length }}</div></div>
    <div v-if="trials.length >= 2" class="stat-box">
      <div class="stat-label">c_m (من الميل)</div>
      <div class="stat-value highlight">{{ cFromSlope.toFixed(1) }} J/kg·°C</div>
    </div>
    <div v-if="trials.length >= 2" class="formula-badge">
      c_m = c_w·avg(T_f−T_w) / (m_m·Slope)
    </div>
    <div v-if="trials.length >= 2" class="stat-box">
      <div class="stat-label">R²</div>
      <div class="stat-value">{{ rSquared.toFixed(4) }}</div>
    </div>
    <div v-if="lastTrial" class="stat-box">
      <div class="stat-label">c_m (آخر تجربة)</div>
      <div class="stat-value green">{{ lastTrial.cExtracted.toFixed(1) }}</div>
    </div>
    <div v-if="lastTrial" class="stat-box">
      <div class="stat-label">c_m (الحقيقي)</div>
      <div class="stat-value">{{ lastTrial.cTrue.toFixed(1) }}</div>
    </div>
    <div v-if="errorPercent !== null" class="stat-box">
      <div class="stat-label">نسبة الخطأ</div>
      <div class="stat-value" :class="errorPercent < 5 ? 'green' : errorPercent < 15 ? 'amber' : 'red'">
        {{ errorPercent.toFixed(1) }}%
      </div>
    </div>
    <div v-if="lastTrial" class="stat-box">
      <div class="stat-label">نوع المعدن (تخمين)</div>
      <div class="stat-value blue">{{ lastTrial.cExtracted < 500 ? 'نحاس/حديد' : lastTrial.cExtracted < 1000 ? 'ألومنيوم' : 'غير معروف' }}</div>
    </div>
    <div v-if="unknownMode && guess && lastTrial" class="guess-box">
      <button v-if="!revealed" class="guess-btn" @click="revealed = true">🔍 كشف النوع</button>
      <template v-else>
        <div class="stat-box">
          <div class="stat-label">التخمين</div>
          <div class="stat-value">{{ guess.info.nameAr }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">النوع الحقيقي</div>
          <div class="stat-value green">{{ METAL_CATALOG[lastTrial.metalType]?.nameAr ?? lastTrial.metalType }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">دقة التخمين</div>
          <div class="stat-value" :class="guess.diff < 50 ? 'green' : guess.diff < 200 ? 'amber' : 'red'">
            {{ guess.diff < 50 ? 'ممتاز' : guess.diff < 200 ? 'جيد' : 'ضعيف' }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.stat-box { background:rgba(255,255,255,0.02); border:1px solid #1e2530; border-radius:6px; padding:.45rem .55rem; display:flex; justify-content:space-between; align-items:center; }
.stat-label { color:#8B95A5; font-size:.72rem; }
.stat-value { color:#D1D7E0; font-weight:700; font-size:.85rem; }
.stat-value.highlight { color:#fbbf24; }
.stat-value.green { color:#4ade80; }
.stat-value.amber { color:#fbbf24; }
.stat-value.red { color:#f87171; }
.stat-value.blue { color:#5B8DB8; }
.formula-badge { background:rgba(91,141,184,.08); border:1px solid rgba(91,141,184,.2); border-radius:5px; padding:.35rem .5rem; font-size:.7rem; color:#5B8DB8; font-family:monospace; text-align:center; }
.guess-box { display:flex; flex-direction:column; gap:.35rem; }
.guess-btn { width:100%; padding:.4rem; border-radius:6px; border:1px solid rgba(245,158,11,.4); background:rgba(245,158,11,.12); color:#fbbf24; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .15s; }
.guess-btn:hover { background:rgba(245,158,11,.2); }
</style>
