<script setup lang="ts">
import type { PrismTrial } from '../../../../composables/prism/usePrismTrials'
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  trials: PrismTrial[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="panel-body">
    <div v-if="trials.length === 0" class="empty">{{ t('prism.emptyTrials') }}</div>
    <div v-else class="trial-table">
      <div class="trial-header"><span>#</span><span>λ</span><span>θᵢ</span><span>θₑ</span><span>D</span><span>n</span></div>
      <div v-for="trial in trials" :key="trial.id" class="trial-row">
        <span class="trial-num">{{ trial.id }}</span>
        <span class="mono" style="font-size:.65rem">{{ trial.wavelength }}</span>
        <span>{{ trial.angleIncidence.toFixed(0) }}</span>
        <span>{{ trial.angleEmergence !== null ? trial.angleEmergence.toFixed(1) : 'TIR' }}</span>
        <span>{{ trial.deviation !== null ? trial.deviation.toFixed(1) : '—' }}</span>
        <span class="mono">{{ trial.n.toFixed(2) }}</span>
        <button class="trial-del" @click="emit('remove', trial.id)">&#x1F5D1;</button>
      </div>
    </div>
    <button v-if="trials.length" class="btn-clear" @click="emit('clear')">{{ t('prism.clearAll') }}</button>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.empty { text-align: center; color: #475569; font-size: .8rem; padding: .5rem; }
.trial-table { display: flex; flex-direction: column; gap: .2rem; font-size: .7rem; }
.trial-header { display: grid; grid-template-columns: 22px 32px 32px 38px 32px 38px 20px; gap: .2rem; padding: .15rem .3rem; color: #8B95A5; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); }
.trial-row { display: grid; grid-template-columns: 22px 32px 32px 38px 32px 38px 20px; gap: .2rem; padding: .15rem .3rem; align-items: center; }
.trial-row:nth-child(even) { background: rgba(255,255,255,0.02); }
.mono { font-family: monospace; color: #67e8f9; }
.trial-del { background: none; border: none; cursor: pointer; font-size: .65rem; opacity: .5; }
.trial-del:hover { opacity: 1; }
.btn-clear { padding: .3rem; border-radius: 4px; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; font-size: .75rem; cursor: pointer; font-family: inherit; margin-top: .3rem; }
</style>
