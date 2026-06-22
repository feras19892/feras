<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const { t } = useI18n()
const calcResult = defineModel<string>({ required: true })

defineEmits<{
  (e: 'calcKfromMT'): void;
  (e: 'calcTfromMK'): void;
  (e: 'calcMfromTK'): void;
}>()
</script>

<template>
  <div class="lab-card equations-card">
    <div class="card-header"><h4>⚗️ {{ t('experiments.calculationsLabel') }}</h4></div>
    <div class="calc-row">
      <button class="btn-calc" @click="$emit('calcKfromMT')">{{ t('experiments.kFromMT') }}</button>
      <button class="btn-calc" @click="$emit('calcTfromMK')">{{ t('experiments.TFromMK') }}</button>
      <button class="btn-calc" @click="$emit('calcMfromTK')">{{ t('experiments.MFromTK') }}</button>
    </div>
    <div class="calc-result">{{ calcResult }}</div>
    <div class="equation-list">
      <div class="eq-item"><span class="eq-label">SHM</span><span>T = 2π√(m/k)</span></div>
      <div class="eq-item"><span class="eq-label">ω₀</span><span>ω₀ = √(k/m)</span></div>
      <div class="eq-item"><span class="eq-label">E</span><span>E = ½kA²</span></div>
    </div>
  </div>
</template>

<style scoped>
.calc-row { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.btn-calc {
  flex: 1; min-width: 60px; padding: 0.35rem 0.5rem; border: none; border-radius: 0.35rem;
  background: rgba(255,255,255,0.08); color: #e2e8f0; cursor: pointer; font-size: 0.75rem;
}
.btn-calc:hover { background: rgba(255,255,255,0.12); }
.calc-result { color: #67e8f9; font-size: 0.8rem; margin-bottom: 0.5rem; min-height: 1.2rem; }
.equation-list { display: flex; flex-direction: column; gap: 0.25rem; }
.eq-item { display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; }
.eq-label { color: #67e8f9; font-weight: 600; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.card-header h4 { margin: 0; font-size: 0.85rem; color: #67e8f9; }
</style>
