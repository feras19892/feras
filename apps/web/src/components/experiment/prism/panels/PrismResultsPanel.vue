<script setup lang="ts">
import type { PrismTrial } from '../../../../composables/prism/usePrismTrials'
import { useI18n } from '../../../../composables/useI18n'
import { useMaterialName } from '../../../../composables/prism/useMaterialName'

const { t } = useI18n()
const { materialName } = useMaterialName()

interface Props {
  trials: PrismTrial[]
  material: string
  avgN: number | null
  rSquared: number
}

const props = defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length < 2" class="empty">{{ t('prism.emptyResults') }}</div>
    <template v-else>
      <div class="result-row"><span class="result-label">{{ t('prism.readingsCount') }}</span><span class="result-val">{{ trials.length }}</span></div>
      <div class="result-row"><span class="result-label">{{ t('prism.avgN') }}</span><span class="result-val highlight">{{ avgN !== null ? avgN.toFixed(3) : '—' }}</span></div>
      <div class="result-row"><span class="result-label">{{ t('prism.rSquared') }}</span><span class="result-val">{{ rSquared.toFixed(4) }}</span></div>
      <div class="result-row"><span class="result-label">{{ t('prism.expectedN') }}</span><span class="result-val">{{ materialName(props.material) }}</span></div>
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
