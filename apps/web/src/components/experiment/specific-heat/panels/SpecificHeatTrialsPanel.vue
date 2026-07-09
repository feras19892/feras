<script setup lang="ts">
import type { SpecificHeatTrial } from '../../../../composables/specific-heat/useSpecificHeatTrials'
import { METAL_CATALOG } from '../../../../composables/specific-heat/useSpecificHeatCalculations'

const props = defineProps<{ trials: SpecificHeatTrial[]; unknownMode?: boolean }>()
function metalName(key: string) { return props.unknownMode ? '❓' : (METAL_CATALOG[key]?.nameAr ?? key) }
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>
<template>
  <div class="panel-body">
    <div class="trials-header"><span>#</span><span>Metal</span><span>m_m</span><span>m_w</span><span>T_f</span><span>c_m</span><span></span></div>
    <div v-for="t in trials" :key="t.id" class="trial-row">
      <span>{{ t.id }}</span><span>{{ metalName(t.metalType) }}</span><span>{{ (t.metalMass*1000).toFixed(0) }}g</span>
      <span>{{ (t.waterMass*1000).toFixed(0) }}g</span><span>{{ t.finalTemp.toFixed(1) }}</span>
      <span>{{ t.cExtracted.toFixed(1) }}</span>
      <button class="del-btn" @click="emit('remove', t.id)">x</button>
    </div>
    <div v-if="!trials.length" class="no-trials">لا توجد تجارب</div>
    <div class="trials-actions"><button class="clear-btn" @click="emit('clear')">مسح الكل</button></div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.trials-header { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 1fr 24px; gap:.3rem; font-size:.65rem; color:#5B8DB8; font-weight:700; padding:0 .2rem; border-bottom:1px solid #1e2530; padding-bottom:.25rem; }
.trial-row { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 1fr 24px; gap:.3rem; align-items:center; padding:.25rem .2rem; font-size:.68rem; color:#D1D7E0; border-bottom:1px solid rgba(30,37,48,.5); }
.del-btn { width:20px; height:20px; border-radius:50%; border:none; background:transparent; color:#8B95A5; cursor:pointer; font-size:.7rem; display:flex; align-items:center; justify-content:center; }
.del-btn:hover { background:rgba(248,113,113,.15); color:#f87171; }
.no-trials { text-align:center; color:#475569; font-size:.75rem; padding:.5rem; }
.trials-actions { display:flex; justify-content:center; padding-top:.3rem; }
.clear-btn { padding:.25rem .6rem; border-radius:5px; border:1px solid rgba(248,113,113,.3); background:rgba(248,113,113,.08); color:#f87171; font-size:.7rem; cursor:pointer; }
</style>
