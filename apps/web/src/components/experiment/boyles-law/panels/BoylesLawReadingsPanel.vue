<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{

  p: number
  v: number
  pv: number
  n: number
  T: number
}>()
</script>
<template>
  <div class="panel-body">
    <div class="read-row"><span class="label"><span class="dot blue"></span>{{ t('experiments.blPressure') }}</span><span class="value">{{ props.p.toFixed(2) }} atm</span></div>
    <div class="read-row"><span class="label"><span class="dot amber"></span>{{ t('experiments.blVolume') }}</span><span class="value">{{ props.v.toFixed(2) }} L</span></div>
    <div class="read-row highlight"><span class="label"><span class="dot green"></span>P·V</span><span class="value green">{{ props.pv.toFixed(2) }} atm·L</span></div>
    <div class="sep"></div>
    <div class="read-row"><span class="label"><span class="dot purple"></span>n</span><span class="value">{{ props.n }} mol</span></div>
    <div class="read-row"><span class="label"><span class="dot red"></span>T</span><span class="value">{{ props.T }} K</span></div>
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
.dot.purple { background:#a78bfa; }
.dot.red { background:#f87171; }
</style>