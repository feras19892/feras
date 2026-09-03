<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const emit = defineEmits<{

  (e: 'calcFinalVelocity'): void
  (e: 'calcMomentumDiff'): void
  (e: 'calcEnergyLoss'): void
}>()
</script>

<template>
  <div class="equations-panel">
    <div class="formulas">
      <h5>{{ t('experiments.basicEquations') }}:</h5>
      <div class="eq">v₁f = [(m₁ − e·m₂)v₁i + (1+e)m₂·v₂i] / (m₁+m₂)</div>
      <div class="eq">v₂f = [(m₂ − e·m₁)v₂i + (1+e)m₁·v₁i] / (m₁+m₂)</div>
      <div class="eq">P = m·v</div>
      <div class="eq">KE = ½·m·v²</div>
      <div class="eq">Loss% = (KEi − KEf) / KEi × 100</div>
    </div>
    <div class="buttons">
      <button @click="emit('calcFinalVelocity')">{{ t('experiments.calculateFinalVelocities') }}</button>
      <button @click="emit('calcMomentumDiff')">{{ t('experiments.calculateMomentumDiff') }}</button>
      <button @click="emit('calcEnergyLoss')">{{ t('experiments.calculateEnergyLoss') }}</button>
    </div>
  </div>
</template>

<style scoped>
.equations-panel { padding: .5rem; }
.formulas h5 { color: #5B8DB8; font-size: .72rem; margin: 0 0 .3rem; }
.eq { font-size: .7rem; color: #B8C0CC; padding: .2rem 0; border-bottom: 1px dashed #2D3645; font-family: monospace; }
.buttons { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .5rem; }
.buttons button { padding: .3rem .5rem; border: 1px solid #2D3645; border-radius: 4px; background: rgba(91,141,184,.08); color: #5B8DB8; cursor: pointer; font-size: .65rem; transition: all .15s; }
.buttons button:hover { background: rgba(91,141,184,.15); }
</style>