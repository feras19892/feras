<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import { METAL_CATALOG } from '../../../../composables/specific-heat/useSpecificHeatCalculations'


const props = defineProps<{
  metalType: string
  metalMass: number
  waterMass: number
  waterTemp: number
  metalTemp: number
  displayT: number
  unknownMode?: boolean
}>()
const metalNameAr = computed(() => props.unknownMode ? 'مجهول' : (METAL_CATALOG[props.metalType]?.nameAr ?? props.metalType))
</script>
<template>
  <div class="panel-body">
    <div class="read-row"><span class="label">المعدن</span><span class="value">{{ metalNameAr }}</span></div>
    <div class="read-row"><span class="label">m_m (كتلة المعدن)</span><span class="value">{{ (metalMass*1000).toFixed(0) }} g</span></div>
    <div class="read-row"><span class="label">m_w (كتلة الماء)</span><span class="value">{{ (waterMass*1000).toFixed(0) }} g</span></div>
    <div class="read-row"><span class="label">T_w (حرارة الماء الأولية)</span><span class="value">{{ waterTemp }}°C</span></div>
    <div class="read-row"><span class="label">T_m (حرارة المعدن)</span><span class="value">{{ metalTemp.toFixed(0) }}°C</span></div>
    <div class="read-row highlight"><span class="label">T_f (حرارة الاتزان)</span><span class="value green">{{ displayT.toFixed(1) }}°C</span></div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.read-row { display:flex; justify-content:space-between; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,0.02); }
.read-row.highlight { background:rgba(74,222,128,0.06); border:1px solid rgba(74,222,128,0.2); }
.label { color:#8B95A5; font-size:.72rem; }
.value { color:#D1D7E0; font-weight:600; font-size:.72rem; }
.green { color:#4ade80; }
</style>
