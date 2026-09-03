<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { PrismTrial } from '../../../../composables/prism/usePrismTrials'

import { useMaterialName } from '../../../../composables/prism/useMaterialName'





const { materialName } = useMaterialName()

interface Props {
  trials: PrismTrial[]
  material: string
  avgN: number | null
  rSquared: number
  slope: number
  intercept: number
}

const props = defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length < 2" class="empty">{{ t('prism.emptyResults') }}</div>
    <template v-else>
      <div class="result-row"><span class="result-label">{{ t('prism.readingsCount') }}</span><span class="result-val">{{ trials.length }}</span></div>
      <div class="result-row"><span class="result-label">A (Y-intercept)</span><span class="result-val highlight">{{ intercept.toFixed(4) }}</span></div>
      <div class="result-row"><span class="result-label">B (Slope)</span><span class="result-val highlight">{{ slope.toExponential(3) }}</span></div>
      <div class="result-row"><span class="result-label">R²</span><span class="result-val">{{ rSquared.toFixed(4) }}</span></div>
      <div class="result-row"><span class="result-label">n = A + B/λ²</span><span class="result-val">{{ intercept.toFixed(3) }} + {{ slope.toExponential(2) }}/λ²</span></div>
      <div class="result-row"><span class="result-label">{{ t('prism.material') }}</span><span class="result-val">{{ materialName(props.material) }}</span></div>
    </template>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.empty { text-align: center; color: #475569; font-size: .8rem; padding: .5rem; }
.result-row { display: flex; justify-content: space-between; align-items: center; }
.result-label { color: #8B95A5; font-size: .78rem; }
.result-val { font-family: monospace; color: #D1D7E0; font-size: .82rem; }
.result-val.highlight { color: #22c55e; font-weight: 700; }
</style>
