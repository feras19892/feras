<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
const props = defineProps<{
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  tf: number
  cMetal: number
  metalType?: string
  metalOptions?: Record<string, { c: number; nameAr: string; nameEn: string }>
}>()

const metalName = computed(() => {
  if (!props.metalType || !props.metalOptions) return ''
  return props.metalOptions[props.metalType]?.nameAr ?? props.metalType
})
</script>
<template>
  <div class="panel-body">
    <div class="read-row"><span class="label"><span class="dot blue"></span>{{ t('experiments.calorimetryWaterMass') }}</span><span class="value">{{ mWater.toFixed(3) }} kg</span></div>
    <div class="read-row"><span class="label"><span class="dot blue"></span>{{ t('experiments.calorimetryWaterTemp') }}</span><span class="value">{{ tWater }} °C</span></div>
    <div class="sep"></div>
    <div class="read-row"><span class="label"><span class="dot amber"></span>{{ t('experiments.calorimetryMetalMass') }}</span><span class="value">{{ mMetal.toFixed(3) }} kg</span></div>
    <div class="read-row"><span class="label"><span class="dot amber"></span>{{ t('experiments.calorimetryMetalTemp') }}</span><span class="value">{{ tMetal }} °C</span></div>
    <div class="read-row"><span class="label"><span class="dot amber"></span>{{ t('experiments.calMetalType') }}</span><span class="value">{{ metalName || '—' }}</span></div>
    <div class="sep"></div>
    <div class="read-row highlight"><span class="label"><span class="dot green"></span>{{ t('experiments.calorimetryFinalTemp') }}</span><span class="value green">{{ tf.toFixed(1) }} °C</span></div>
    <div class="read-row highlight"><span class="label"><span class="dot green"></span>{{ t('experiments.calorimetrySpecificHeat') }}</span><span class="value green">{{ cMetal.toFixed(0) }} J/kg·K</span></div>
  </div>
</template>
<style scoped>
.panel-body { padding:.5rem; display:flex; flex-direction:column; gap:.3rem; }
.read-row { display:flex; justify-content:space-between; align-items:center; padding:.3rem .4rem; border-radius:5px; background:rgba(255,255,255,0.02); transition:background .15s; }
.read-row:hover { background:rgba(255,255,255,0.04); }
.read-row.highlight { background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.22); }
.label { color:#8B95A5; font-size:.74rem; display:flex; align-items:center; gap:.35rem; }
.value { color:#D1D7E0; font-weight:700; font-size:.76rem; }
.green { color:#4ade80; }
.sep { height:1px; background:rgba(30,37,48,.6); margin:.15rem 0; }
.dot { width:6px; height:6px; border-radius:50%; display:inline-block; }
.dot.blue { background:#5B8DB8; }
.dot.amber { background:#fbbf24; }
.dot.green { background:#4ade80; }
</style>
