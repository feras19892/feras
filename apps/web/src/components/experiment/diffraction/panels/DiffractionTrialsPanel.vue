<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import type { DiffractionTrial } from '../../../../composables/diffraction/useDiffractionTrials'

const { t } = useI18n()

interface Props {
  trials: DiffractionTrial[]
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="panel-body">
    <table class="trial-table" v-if="trials.length">
      <thead>
        <tr>
          <th>#</th>
          <th>{{ t('experiments.dfMode') }}</th>
          <th>a (mm)</th>
          <th>1/a</th>
          <th>D</th>
          <th>λ</th>
          <th>y₁</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tr in trials" :key="tr.id">
          <td>{{ tr.id }}</td>
          <td>{{ tr.mode }}</td>
          <td>{{ tr.mode === 'grating' ? '—' : tr.slitWidth.toFixed(2) }}</td>
          <td>{{ tr.mode === 'grating' ? '—' : (1 / tr.slitWidth).toFixed(1) }}</td>
          <td>{{ tr.screenDistance }}</td>
          <td>{{ tr.wavelength }}</td>
          <td>{{ tr.mode === 'grating' ? tr.firstOrderY.toFixed(3) : tr.darkFringe1.toFixed(3) }}</td>
          <td><button class="rm" @click="emit('remove', tr.id)">&#x00D7;</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">{{ t('experiments.noTrialsYet') }}</p>
    <button v-if="trials.length" class="clear-btn" @click="emit('clear')">{{ t('experiments.clearData') }}</button>
  </div>
</template>

<style scoped>
.panel-body { font-size: .8rem; }
.trial-table { width: 100%; border-collapse: collapse; }
.trial-table th, .trial-table td { padding: 4px 6px; text-align: center; border-bottom: 1px solid #2D3645; font-size: .75rem; }
.trial-table th { color: #8B95A5; font-weight: 600; }
.rm { background: none; border: none; color: #f87171; cursor: pointer; font-size: .8rem; }
.empty { color: #64748b; text-align: center; padding: 1rem; }
.clear-btn { margin-top: .5rem; width: 100%; padding: .3rem; background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.3); color: #f87171; border-radius: 4px; cursor: pointer; font-size: .75rem; }
</style>
