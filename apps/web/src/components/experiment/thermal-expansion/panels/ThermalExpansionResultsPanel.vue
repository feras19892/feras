<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import { ALPHA } from '../../../../composables/thermal-expansion/useThermalExpansionCalculations'
import type { ThermalExpansionTrial } from '../../../../composables/thermal-expansion/useThermalExpansionTrials'

const props = defineProps<{ trials: ThermalExpansionTrial[] }>()

const avgAlpha = computed(() => props.trials.length ? props.trials.reduce((s, tr) => s + tr.alphaMeasured, 0) / props.trials.length : 0)
const avgDL = computed(() => props.trials.length ? props.trials.reduce((s, tr) => s + tr.deltaL, 0) / props.trials.length : 0)
const trueAlpha = computed(() => props.trials.length ? ALPHA[props.trials[0].material] ?? 0 : 0)
const stdAlpha = computed(() => {
  if (props.trials.length < 2) return 0
  const mean = avgAlpha.value
  return Math.sqrt(props.trials.reduce((s, tr) => s + Math.pow(tr.alphaMeasured - mean, 2), 0) / (props.trials.length - 1))
})
const cvAlpha = computed(() => avgAlpha.value > 0 ? (stdAlpha.value / avgAlpha.value * 100) : 0)
const errPercent = computed(() => trueAlpha.value > 0 ? (Math.abs(avgAlpha.value - trueAlpha.value) / trueAlpha.value * 100) : 0)
</script>
<template>
  <div class="results-panel">
    <div v-if="!trials.length" class="empty">
      <div class="empty-icon">📊</div>
      <div class="empty-title">لا توجد نتائج</div>
      <div class="empty-hint">سجل تجارب لعرض الإحصائيات</div>
    </div>
    <template v-else>
      <div class="stat"><span class="label">عدد التجارب</span><span class="val">{{ trials.length }}</span></div>
      <div class="stat"><span class="label">متوسط ΔL</span><span class="val">{{ (avgDL * 1000).toFixed(2) }} mm</span></div>
      <div class="stat"><span class="label">ᾱ (مقاس)</span><span class="val highlight">{{ avgAlpha.toFixed(1) }} × 10⁻⁶/K</span></div>
      <div v-if="trials.length >= 2" class="stat"><span class="label">σ(α)</span><span class="val">±{{ stdAlpha.toFixed(2) }}</span></div>
      <div v-if="trials.length >= 2" class="stat"><span class="label">CV</span><span class="val" :class="cvAlpha < 5 ? 'green' : 'amber'">{{ cvAlpha.toFixed(1) }}%</span></div>
      <div class="stat"><span class="label">α (حقيقي)</span><span class="val green">{{ trueAlpha.toFixed(1) }} × 10⁻⁶/K</span></div>
      <div class="stat"><span class="label">خطأ %</span><span class="val" :class="errPercent < 10 ? 'green' : 'amber'">{{ errPercent.toFixed(1) }}%</span></div>
      <div class="stat"><span class="label">التقييم</span><span class="val" :class="errPercent < 10 ? 'green' : errPercent < 20 ? 'amber' : 'red'">{{ errPercent < 10 ? 'ممتاز ✅' : errPercent < 20 ? 'مقبول ⚠️' : 'ضعيف ❌' }}</span></div>
    </template>
  </div>
</template>
<style scoped>
.results-panel { display:flex; flex-direction:column; gap:.35rem; }
.stat { display:flex; justify-content:space-between; align-items:center; font-size:.76rem; padding:.3rem .4rem; border-radius:5px; background:rgba(255,255,255,.03); }
.stat:hover { background:rgba(255,255,255,.05); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:700; }
.val.highlight { color:#fbbf24; }
.val.green { color:#4ade80; }
.val.amber { color:#fbbf24; }
.val.red { color:#f87171; }
.empty { text-align:center; padding:1rem .5rem; display:flex; flex-direction:column; align-items:center; gap:.3rem; }
.empty-icon { font-size:1.4rem; opacity:.5; }
.empty-title { color:#8B95A5; font-size:.78rem; font-weight:600; }
.empty-hint { color:#475569; font-size:.68rem; max-width:180px; line-height:1.4; }
</style>
