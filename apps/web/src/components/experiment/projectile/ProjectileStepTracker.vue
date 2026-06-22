<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  stepIndex: number
}>()
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
.step-tracker { display:flex; gap:1.5rem; background:#1E2530; padding:.5rem 1.2rem; border-radius:8px; border:1px solid #2D3645; flex-shrink:0; }
.step { display:flex; align-items:center; gap:.3rem; font-size:.72rem; opacity:.5; transition:.2s; }
.step.active, .step.done { opacity:1; font-weight:700; }
.step-num { width:24px; height:24px; border-radius:50%; background:#252D3A; border:2px solid #2D3645; display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:700; }
.step.active .step-num { border-color:#5B8DB8; color:#5B8DB8; }
.step.done .step-num { background:#5B8DB8; border-color:#5B8DB8; color:#fff; }
</style>
