<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
interface Props { stringLength: number; tension: number; harmonic: number; frequency: number; wavelength: number; waveSpeed: number }

defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="reading-group">
      <div class="reading-row"><span class="reading-label">{{ t('experiments.reStringLength') }}</span><span class="reading-val cyan">{{ stringLength.toFixed(2) }} m</span></div>
      <div class="reading-row"><span class="reading-label">{{ t('experiments.reTension') }}</span><span class="reading-val amber">{{ tension }} N</span></div>
    </div>
    <div class="reading-row highlight-row"><span class="reading-label bold">{{ t('experiments.reFrequency') }}</span><span class="reading-val green bold">{{ frequency.toFixed(1) }} Hz</span></div>
    <div class="reading-group">
      <div class="reading-row"><span class="reading-label">{{ t('experiments.reWavelength') }}</span><span class="reading-val">{{ wavelength.toFixed(3) }} m</span></div>
      <div class="reading-row"><span class="reading-label">{{ t('experiments.reWaveSpeed') }}</span><span class="reading-val green">{{ waveSpeed.toFixed(1) }} m/s</span></div>
    </div>
    <div class="reading-group">
      <div class="reading-row"><span class="reading-label">{{ t('experiments.reHarmonic') }}</span><span class="reading-val">{{ harmonic }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .35rem; font-size: .8rem; }
.reading-group { display: flex; flex-direction: column; gap: .28rem; padding: .3rem .35rem; background: rgba(255,255,255,0.025); border-radius: 5px; border: 1px solid rgba(45,54,69,0.5); }
.reading-row { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
.highlight-row { padding: .3rem .4rem; background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.2); border-radius: 5px; }
.reading-label { color: #64748b; font-size: .76rem; flex: 1; }
.reading-label.bold { color: #94a3b8; font-weight: 600; }
.reading-val { font-family: monospace; font-size: .8rem; font-weight: 600; flex-shrink: 0; }
.cyan { color: #67e8f9; }
.green { color: #4ade80; }
.amber { color: #fbbf24; }
</style>