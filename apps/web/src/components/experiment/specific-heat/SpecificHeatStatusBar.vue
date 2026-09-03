<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue'

import { METAL_CATALOG } from '../../../composables/specific-heat/useSpecificHeatCalculations'





const props = defineProps<{
  running: boolean
  paused: boolean
  metalType: string
  metalMass: number
  waterMass: number
  waterTemp: number
  displayT: number
  phase: string
  cExtracted: number
  unknownMode?: boolean
}>()
const metalNameAr = computed(() => props.unknownMode ? 'مجهول' : (METAL_CATALOG[props.metalType]?.nameAr ?? props.metalType))
const phaseAr = computed(() => {
  const map: Record<string, string> = {
    ready: 'جاهز', heating: 'تسخين', transfer: 'نقل', mixing: 'خلط', done: 'انتهى'
  }
  return map[props.phase] ?? props.phase
})
</script>
<template>
  <div class="status-bar">
    <span class="dot" :class="running ? (paused ? 'paused' : 'run') : 'off'" />
    <span>{{ running ? (paused ? t('experiments.statusPaused') : t('experiments.statusRunning')) : t('experiments.statusIdle') }}</span>
    <span class="sep">|</span>
    <span class="badge" :class="unknownMode ? 'unknown' : ''">{{ metalNameAr }}</span>
    <span class="sep">|</span>
    <span>m_m={{ (metalMass*1000).toFixed(0) }}g</span>
    <span class="sep">|</span>
    <span>m_w={{ (waterMass*1000).toFixed(0) }}g</span>
    <span class="sep">|</span>
    <span>T={{ displayT.toFixed(1) }}°C</span>
    <span class="sep">|</span>
    <span class="phase">{{ phaseAr }}</span>
    <span class="sep">|</span>
    <span>c_m≈{{ cExtracted.toFixed(1) }}</span>
  </div>
</template>
<style scoped>
.status-bar { display:flex; align-items:center; gap:.6rem; padding:.25rem .7rem; background:#0d1117; border-top:1px solid #1e2530; font-size:.72rem; color:#8B95A5; flex-shrink:0; }
.dot { width:7px; height:7px; border-radius:50%; background:#475569; }
.dot.run { background:#22c55e; }
.dot.paused { background:#f59e0b; }
.sep { color:#2D3645; }
.badge { background:rgba(91,141,184,.12); border:1px solid rgba(91,141,184,.25); border-radius:4px; padding:.08rem .35rem; font-weight:600; color:#5B8DB8; }
.badge.unknown { background:rgba(245,158,11,.12); border-color:rgba(245,158,11,.3); color:#fbbf24; }
.phase { color:#D1D7E0; font-weight:600; }
</style>
