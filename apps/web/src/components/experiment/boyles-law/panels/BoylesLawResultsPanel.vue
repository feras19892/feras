<script setup lang="ts">
import { computed } from 'vue'
import type { BoylesLawTrial } from '../../../../composables/boyles-law/useBoylesLawTrials'

const props = defineProps<{ trials: BoylesLawTrial[] }>()

const avgPv = computed(() => props.trials.length ? (props.trials.reduce((s, t) => s + t.pv, 0) / props.trials.length) : 0)
const stdDev = computed(() => {
  if (props.trials.length < 2) return 0
  const mean = avgPv.value
  const sq = props.trials.reduce((s, t) => s + Math.pow(t.pv - mean, 2), 0)
  return Math.sqrt(sq / (props.trials.length - 1))
})
const cv = computed(() => avgPv.value > 0 ? (stdDev.value / avgPv.value * 100) : 0)
const constancy = computed(() => {
  if (props.trials.length < 2) return { label: '', color: '' }
  if (cv.value < 2) return { label: 'ممتاز ✅', color: 'green' }
  if (cv.value < 5) return { label: 'جيد', color: 'amber' }
  return { label: 'يحتاج مزيداً', color: 'red' }
})
</script>
<template>
  <div class="panel-body">
    <div class="stat-box"><div class="stat-label">عدد التجارب</div><div class="stat-value">{{ trials.length }}</div></div>
    <div v-if="trials.length" class="stat-box">
      <div class="stat-label">متوسط P·V</div>
      <div class="stat-value highlight">{{ avgPv.toFixed(2) }} atm·L</div>
    </div>
    <div v-if="trials.length >= 2" class="stat-box">
      <div class="stat-label">الانحراف المعياري σ</div>
      <div class="stat-value">±{{ stdDev.toFixed(3) }}</div>
    </div>
    <div v-if="trials.length >= 2" class="stat-box">
      <div class="stat-label">معامل التباين CV</div>
      <div class="stat-value" :class="constancy.color">{{ cv.toFixed(1) }}%</div>
    </div>
    <div v-if="trials.length >= 2" class="stat-box">
      <div class="stat-label">ثبات P·V</div>
      <div class="stat-value" :class="constancy.color">{{ constancy.label }}</div>
    </div>
    <div v-if="!trials.length" class="no-results">
      <div class="no-icon">📊</div>
      <div class="no-title">لا توجد تجارب مسجلة</div>
      <div class="no-hint">اضغط Start ثم Record بعد كل ضغط لتسجيل قيم P و V</div>
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
.no-results { text-align:center; padding:1.2rem .5rem; display:flex; flex-direction:column; align-items:center; gap:.3rem; }
.no-icon { font-size:1.5rem; opacity:.6; }
.no-title { color:#8B95A5; font-size:.78rem; font-weight:600; }
.no-hint { color:#475569; font-size:.68rem; max-width:180px; line-height:1.4; }
</style>
