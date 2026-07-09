<script setup lang="ts">
import { computed } from 'vue'
import type { LatentHeatTrial } from '../../../../composables/latent-heat/useLatentHeatTrials'
const props = defineProps<{ trials: LatentHeatTrial[] }>()
const avgL = computed(() => {
  if (!props.trials.length) return 0
  return props.trials.reduce((s, t) => s + t.L, 0) / props.trials.length
})
const _avgMelted = computed(() => {
  if (!props.trials.length) return 0
  return props.trials.reduce((s, t) => s + t.meltedMass, 0) / props.trials.length
})
const totalQ = computed(() => props.trials.reduce((s, t) => s + t.Q, 0))
const cv = computed(() => {
  if (props.trials.length < 2) return 0
  const mean = avgL.value
  const variance = props.trials.reduce((s, t) => s + Math.pow(t.L - mean, 2), 0) / (props.trials.length - 1)
  return Math.sqrt(variance) / mean * 100
})
const trueL = computed(() => props.trials.length > 0 ? props.trials[0].L : 0)
const errorPct = computed(() => trueL.value > 0 ? Math.abs(avgL.value - trueL.value) / trueL.value * 100 : 0)
</script>
<template>
  <div class="panel-body">
    <div v-if="!trials.length" class="no-results">
      <div class="empty-icon">📊</div>
      <div>لا توجد نتائج</div>
      <div class="empty-hint">سجل تجارب لتحليل النتائج</div>
    </div>
    <template v-else>
      <div class="stat-box">
        <div class="stat-label">عدد التجارب</div>
        <div class="stat-value">{{ trials.length }}</div>
      </div>
      <div class="stat-box highlight">
        <div class="stat-label">متوسط L</div>
        <div class="stat-value green">{{ (avgL/1000).toFixed(0) }} kJ/kg</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">L الحقيقي</div>
        <div class="stat-value">{{ (trueL/1000).toFixed(0) }} kJ/kg</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">معامل التباين</div>
        <div class="stat-value">{{ cv.toFixed(1) }}%</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">خطأ النسبة</div>
        <div :class="errorPct < 5 ? 'stat-value green' : 'stat-value yellow'">{{ errorPct.toFixed(1) }}%</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">الحرارة الكلية</div>
        <div class="stat-value">{{ (totalQ/1000).toFixed(1) }} kJ</div>
      </div>
    </template>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.4rem; }
.stat-box { background:rgba(255,255,255,0.02); border:1px solid #1e2530; border-radius:6px; padding:.45rem .55rem; display:flex; justify-content:space-between; align-items:center; }
.stat-box.highlight { background:rgba(74,222,128,.06); border-color:rgba(74,222,128,.2); }
.stat-label { color:#8B95A5; font-size:.72rem; }
.stat-value { color:#D1D7E0; font-weight:700; font-size:.85rem; }
.stat-value.green { color:#4ade80; }
.stat-value.yellow { color:#fbbf24; }
.no-results { text-align:center; color:#475569; font-size:.75rem; padding:.8rem; }
.empty-icon { font-size:1.5rem; margin-bottom:.3rem; }
.empty-hint { font-size:.65rem; color:#3D4A5C; margin-top:.2rem; }
</style>
