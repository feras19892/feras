<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ stepIndex: number }>()
const steps = [t('experiments.setupStep'), t('experiments.measurementStep'), t('experiments.analysisStep')]
</script>

<template>
  <div class="step-tracker">
    <div v-for="(s,i) in steps" :key="i" class="step" :class="{active:props.stepIndex===i,done:props.stepIndex>i}">
      <div class="step-num">{{ props.stepIndex>i?'&#x2713;':i+1 }}</div>
      <span>{{ s }}</span>
    </div>
  </div>
</template>

<style scoped>
.step-tracker { display:flex; gap:1.5rem; background:linear-gradient(145deg,rgba(30,41,59,0.9),rgba(15,23,42,0.85)); padding:.5rem 1.2rem; border-radius:10px; border:1px solid rgba(71,85,105,0.3); flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,.15); }
.step { display:flex; align-items:center; gap:.3rem; font-size:.72rem; opacity:.5; transition:.2s; }
.step.active, .step.done { opacity:1; font-weight:700; }
.step-num { width:24px; height:24px; border-radius:50%; background:rgba(30,41,59,0.6); border:2px solid rgba(71,85,105,0.4); display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:700; }
.step.active .step-num { border-color:#60a5fa; color:#60a5fa; }
.step.done .step-num { background:#60a5fa; border-color:#60a5fa; color:#fff; }
</style>
