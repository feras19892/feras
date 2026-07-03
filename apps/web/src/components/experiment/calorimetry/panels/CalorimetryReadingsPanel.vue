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
  <div class="readings-panel">
    <div class="row"><span class="label">{{ t('experiments.calorimetryWaterMass') }}</span><span class="val">{{ mWater.toFixed(3) }} kg</span></div>
    <div class="row"><span class="label">{{ t('experiments.calorimetryWaterTemp') }}</span><span class="val">{{ tWater }} °C</span></div>
    <div class="row"><span class="label">{{ t('experiments.calorimetryMetalMass') }}</span><span class="val">{{ mMetal.toFixed(3) }} kg</span></div>
    <div class="row"><span class="label">{{ t('experiments.calorimetryMetalTemp') }}</span><span class="val">{{ tMetal }} °C</span></div>
    <div class="row"><span class="label">{{ t('experiments.calorimetryFinalTemp') }}</span><span class="val">{{ tf.toFixed(1) }} °C</span></div>
    <div class="row"><span class="label">{{ t('experiments.calorimetrySpecificHeat') }}</span><span class="val">{{ cMetal.toFixed(0) }} J/kg·K</span></div>
  </div>
</template>
<style scoped>
.readings-panel { display:flex; flex-direction:column; gap:.35rem; }
.row { display:flex; justify-content:space-between; font-size:.78rem; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.03); }
.label { color:#8B95A5; }
.val { color:#D1D7E0; font-weight:600; }
</style>
