<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed } from 'vue'

const props = defineProps<{ calcResult: string }>()
const emit = defineEmits<{ (e: 'calcG'): void; (e: 'calcT'): void; (e: 'calcV'): void; (e: 'calcFitG'): void }>()

const resultLines = computed(() => {
  if (!props.calcResult) return []
  return props.calcResult.split(/<br\s*\/?>/i).map(l => l.replace(/<\/?b>/gi, '').trim()).filter(Boolean)
})
</script>

<template>
  <div>
    <h5>⚗️ {{ t('experiments.calculations') }}</h5>
    <div class="calc-actions">
      <button @click="emit('calcG')">📐 {{ t('experiments.calculateG') }}</button>
      <button @click="emit('calcT')">⏱️ {{ t('experiments.calculateT') }}</button>
      <button @click="emit('calcV')">⚡ {{ t('experiments.calculateV') }}</button>
      <button @click="emit('calcFitG')">📈 {{ t('experiments.fitG') }}</button>
    </div>
    <div v-if="calcResult" class="calc-result">
      <div v-for="(line, i) in resultLines" :key="i">{{ line }}</div>
    </div>
  </div>
</template>

<style scoped>
h5 { margin: 0 0 .3rem; font-size: .82rem; color: #5B8DB8; }
.calc-actions { display: flex; flex-wrap: wrap; gap: .3rem; margin-bottom: .3rem; }
.calc-actions button { background: #252D3A; border: 1px solid #2D3645; color: #94a3b8; border-radius: 4px; padding: .2rem .5rem; font-size: .72rem; cursor: pointer; }
.calc-actions button:hover { background: #334155; color: #f8fafc; }
.calc-result { background: #111827; border: 1px solid #2D3645; border-radius: 6px; padding: .4rem; font-size: .78rem; color: #D1D7E0; line-height: 1.6; }
</style>
