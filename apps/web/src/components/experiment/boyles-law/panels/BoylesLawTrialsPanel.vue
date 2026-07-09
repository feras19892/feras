<script setup lang="ts">
import type { BoylesLawTrial } from '../../../../composables/boyles-law/useBoylesLawTrials'
const props = defineProps<{ trials: BoylesLawTrial[] }>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>
<template>
  <div class="panel-body">
    <div class="trials-header"><span>#</span><span>P</span><span>V</span><span>P·V</span><span></span></div>
    <div v-for="t in trials" :key="t.id" class="trial-row">
      <span>{{ t.id }}</span><span>{{ t.p.toFixed(2) }}</span><span>{{ t.v.toFixed(2) }}</span><span>{{ t.pv.toFixed(2) }}</span>
      <button class="del-btn" @click="emit('remove', t.id)">x</button>
    </div>
    <div v-if="!trials.length" class="no-trials">
      <div class="no-icon">📝</div>
      <div class="no-title">لا توجد تجارب</div>
      <div class="no-hint">اضغط Start → Record لتسجيل قيم P و V</div>
    </div>
    <div class="trials-actions"><button class="clear-btn" @click="emit('clear')">مسح الكل</button></div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.trials-header { display:grid; grid-template-columns:30px 1fr 1fr 1fr 24px; gap:.3rem; font-size:.68rem; color:#5B8DB8; font-weight:700; padding:0 .2rem; border-bottom:1px solid #1e2530; padding-bottom:.25rem; }
.trial-row { display:grid; grid-template-columns:30px 1fr 1fr 1fr 24px; gap:.3rem; align-items:center; padding:.25rem .2rem; font-size:.7rem; color:#D1D7E0; border-bottom:1px solid rgba(30,37,48,.5); }
.del-btn { width:20px; height:20px; border-radius:50%; border:none; background:transparent; color:#8B95A5; cursor:pointer; font-size:.7rem; display:flex; align-items:center; justify-content:center; }
.del-btn:hover { background:rgba(248,113,113,.15); color:#f87171; }
.no-trials { text-align:center; padding:1rem .5rem; display:flex; flex-direction:column; align-items:center; gap:.3rem; }
.no-icon { font-size:1.4rem; opacity:.5; }
.no-title { color:#8B95A5; font-size:.78rem; font-weight:600; }
.no-hint { color:#475569; font-size:.68rem; max-width:180px; line-height:1.4; }
.trials-actions { display:flex; justify-content:center; padding-top:.3rem; }
.clear-btn { padding:.25rem .6rem; border-radius:5px; border:1px solid rgba(248,113,113,.3); background:rgba(248,113,113,.08); color:#f87171; font-size:.7rem; cursor:pointer; }
</style>
