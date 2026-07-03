<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import { SPECIFIC_HEAT_WATER, SPECIFIC_HEAT_ALUMINUM } from '../../../../composables/calorimetry/useCalorimetryCalculations'
const { t } = useI18n()
const props = defineProps<{
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  tf: number
  cMetal: number
}>()

const qLost = computed(() => props.mMetal * props.cMetal * (props.tMetal - props.tf))
const qGained = computed(() => (props.mWater * SPECIFIC_HEAT_WATER + 0.05 * SPECIFIC_HEAT_ALUMINUM) * (props.tf - props.tWater))
const balance = computed(() => Math.abs(qLost.value - qGained.value))
</script>
<template>
  <div class="laws-panel">
    <div class="law">
      <h4>{{ t('experiments.calorimetryHeatBalance') }}</h4>
      <p class="formula">Q_lost = Q_gained</p>
      <p class="values">Q_lost = {{ mMetal.toFixed(3) }} × {{ cMetal }} × ({{ tMetal }} - {{ tf.toFixed(1) }})</p>
      <p class="values">Q_lost = {{ qLost.toFixed(1) }} J</p>
      <p class="values">Q_gained = {{ qGained.toFixed(1) }} J</p>
      <p class="values" :class="{ ok: balance < 1, bad: balance >= 1 }">ΔQ = {{ balance.toFixed(2) }} J</p>
    </div>
    <div class="law">
      <h4>{{ t('experiments.calorimetryFindC') }}</h4>
      <p class="formula">c = Q / (m · ΔT)</p>
      <p class="values">c = {{ qGained.toFixed(1) }} / ({{ mMetal.toFixed(3) }} × {{ (tMetal - tf).toFixed(1) }})</p>
      <p class="values">c = {{ (qGained / (mMetal * (tMetal - tf))).toFixed(0) }} J/kg·K</p>
    </div>
  </div>
</template>
<style scoped>
.laws-panel { display:flex; flex-direction:column; gap:.6rem; }
.law { background:rgba(255,255,255,.03); border-radius:6px; padding:.5rem; }
.law h4 { margin:0 0 .3rem; color:#5B8DB8; font-size:.8rem; }
.formula { font-family:monospace; color:#fbbf24; font-size:.85rem; margin:.2rem 0; }
.values { color:#8B95A5; font-size:.72rem; margin:.1rem 0; }
.ok { color:#22c55e; }
.bad { color:#ef4444; }
</style>
